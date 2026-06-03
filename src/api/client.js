import axios from 'axios'
import { tokens } from './tokens'

const baseURL = import.meta.env.VITE_API_URL || ''

export const client = axios.create({
  baseURL,
  timeout: 30000,
  headers: { 'Content-Type': 'application/json' },
})

// ===== Request: Bearer 토큰 + admin 전용 X-User-Id 헤더 자동 부착 =====
client.interceptors.request.use((config) => {
  const access = tokens.getAccess()
  if (access && !config.headers.Authorization) {
    config.headers.Authorization = `Bearer ${access}`
  }
  // /api/admin/* 호출에는 백엔드 정책에 따라 X-User-Id 헤더 필수
  const url = config.url ?? ''
  if (url.includes('/api/admin/')) {
    const user = tokens.getUser()
    if (user?.user_id != null && !config.headers['X-User-Id']) {
      config.headers['X-User-Id'] = String(user.user_id)
    }
  }
  return config
})

// ===== Response: 401 → refresh 시도 → 실패 시 강제 로그아웃 =====
let isRefreshing = false
let queue = []

function processQueue(error, accessToken = null) {
  queue.forEach(({ resolve, reject, config }) => {
    if (error) {
      reject(error)
    } else {
      config.headers.Authorization = `Bearer ${accessToken}`
      resolve(client(config))
    }
  })
  queue = []
}

function forceLogout() {
  tokens.clear()
  // 현재 페이지가 로그인이 아니면 리로드 (App.jsx가 user state로 LoginPage 렌더링)
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('dermalens:logout'))
  }
}

client.interceptors.response.use(
  (res) => res,
  async (error) => {
    const { config, response } = error
    if (!response || response.status !== 401 || config?._retry) {
      return Promise.reject(error)
    }
    // refresh 자체 호출이 401인 경우는 즉시 로그아웃
    if (config?.url?.includes('/api/users/token/refresh/')) {
      forceLogout()
      return Promise.reject(error)
    }

    config._retry = true

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        queue.push({ resolve, reject, config })
      })
    }

    isRefreshing = true
    try {
      const refresh = tokens.getRefresh()
      if (!refresh) throw new Error('No refresh token')

      const { data } = await axios.post(
        `${baseURL}/api/users/token/refresh/`,
        { refresh },
        { headers: { 'Content-Type': 'application/json' } }
      )
      tokens.updateTokens({ access: data.access, refresh: data.refresh })
      processQueue(null, data.access)
      config.headers.Authorization = `Bearer ${data.access}`
      return client(config)
    } catch (refreshErr) {
      processQueue(refreshErr, null)
      forceLogout()
      return Promise.reject(refreshErr)
    } finally {
      isRefreshing = false
    }
  }
)

// 백엔드 공통 응답 { success, message } 처리 헬퍼
export function unwrap(response) {
  const data = response?.data
  if (data && data.success === false) {
    const err = new Error(data.message || '요청에 실패했습니다.')
    err.response = response
    throw err
  }
  return data
}

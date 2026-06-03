import { client, unwrap } from './client'
import { tokens } from './tokens'

export async function login({ email, password }, { remember = true } = {}) {
  const res = await client.post('/api/users/login/', { email, password })
  const data = unwrap(res)
  // data: { success, message, user, tokens: { access, refresh } }
  tokens.setAll(
    {
      access: data.tokens.access,
      refresh: data.tokens.refresh,
      user: data.user,
    },
    remember
  )
  return data
}

export async function logout() {
  const refresh = tokens.getRefresh()
  try {
    if (refresh) {
      await client.post('/api/users/logout/', { refresh })
    }
  } catch {
    // 서버 에러여도 로컬은 비움
  } finally {
    tokens.clear()
  }
}

export async function refreshToken() {
  const refresh = tokens.getRefresh()
  if (!refresh) throw new Error('No refresh token')
  const res = await client.post('/api/users/token/refresh/', { refresh })
  const data = res.data
  tokens.updateTokens({ access: data.access, refresh: data.refresh })
  return data
}

export async function checkEmail(email) {
  const res = await client.get('/api/users/check-email/', { params: { email } })
  return unwrap(res)
}

export async function signup({ email, password, nickname }) {
  const res = await client.post('/api/users/signup/', { email, password, nickname })
  return unwrap(res)
}

// 토큰·사용자 정보 저장소
// remember=true → localStorage(영구), false → sessionStorage(탭 한정)

const ACCESS = 'dermalens.token.access'
const REFRESH = 'dermalens.token.refresh'
const USER = 'dermalens.user'
const REMEMBER = 'dermalens.remember'

const stores = [localStorage, sessionStorage]

function readFromStorage(key) {
  return localStorage.getItem(key) ?? sessionStorage.getItem(key) ?? null
}

export const tokens = {
  getAccess: () => readFromStorage(ACCESS),
  getRefresh: () => readFromStorage(REFRESH),
  getUser: () => {
    const raw = readFromStorage(USER)
    if (!raw) return null
    try {
      return JSON.parse(raw)
    } catch {
      return null
    }
  },
  isRemembered: () => readFromStorage(REMEMBER) === '1',

  setAll: ({ access, refresh, user }, remember = true) => {
    const target = remember ? localStorage : sessionStorage
    const other = remember ? sessionStorage : localStorage
    target.setItem(ACCESS, access)
    target.setItem(REFRESH, refresh)
    if (user) target.setItem(USER, JSON.stringify(user))
    target.setItem(REMEMBER, remember ? '1' : '0')
    other.removeItem(ACCESS)
    other.removeItem(REFRESH)
    other.removeItem(USER)
    other.removeItem(REMEMBER)
  },

  updateTokens: ({ access, refresh }) => {
    const target = tokens.isRemembered() ? localStorage : sessionStorage
    target.setItem(ACCESS, access)
    if (refresh) target.setItem(REFRESH, refresh)
  },

  clear: () => {
    stores.forEach((s) => {
      s.removeItem(ACCESS)
      s.removeItem(REFRESH)
      s.removeItem(USER)
      s.removeItem(REMEMBER)
    })
  },
}

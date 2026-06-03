import { useState, useEffect } from 'react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import { tokens } from './api/tokens'
import { logout as apiLogout } from './api/auth'
import { queryClient } from './api/queryClient'

function App() {
  const [user, setUser] = useState(null)

  // 첫 로드 시 저장된 사용자 복원
  useEffect(() => {
    const saved = tokens.getUser()
    if (saved) setUser(saved)
  }, [])

  // 토큰 만료 등으로 강제 로그아웃 이벤트 수신
  useEffect(() => {
    const handle = () => {
      setUser(null)
      queryClient.clear()
    }
    window.addEventListener('dermalens:logout', handle)
    return () => window.removeEventListener('dermalens:logout', handle)
  }, [])

  const handleLogin = (userData) => {
    // LoginPage 내부에서 이미 tokens.setAll() 호출됨
    setUser(userData)
  }

  const handleLogout = async () => {
    await apiLogout()
    queryClient.clear()
    setUser(null)
  }

  if (!user) {
    return <LoginPage onLogin={handleLogin} />
  }

  return <DashboardPage user={user} onLogout={handleLogout} />
}

export default App

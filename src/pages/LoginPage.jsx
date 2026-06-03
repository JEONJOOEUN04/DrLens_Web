import { useState } from 'react'
import { Mail, Lock, Eye, EyeOff, AlertCircle } from 'lucide-react'
import { login as apiLogin } from '../api/auth'

function LoginPage({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [remember, setRemember] = useState(true)
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setSubmitting(true)

    try {
      const data = await apiLogin(
        { email: email.trim(), password },
        { remember }
      )
      onLogin(data.user)
    } catch (err) {
      const status = err?.response?.status
      const msg =
        err?.response?.data?.message ||
        (status === 401
          ? '아이디 또는 비밀번호가 올바르지 않습니다.'
          : status === 0 || !status
          ? '서버에 연결할 수 없습니다. 네트워크를 확인하세요.'
          : `로그인 실패 (${status})`)
      setError(msg)
      setPassword('')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen flex bg-white overflow-hidden">
      {/* ============ LEFT: BLUE PANEL with WAVY RIGHT EDGE ============ */}
      <svg
        className="hidden lg:block absolute top-0 left-0 h-full w-[52%] z-0"
        viewBox="0 0 500 1000"
        preserveAspectRatio="none"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="bluePanel" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1F4FA8" />
            <stop offset="60%" stopColor="#306EC7" />
            <stop offset="100%" stopColor="#5B9BFF" />
          </linearGradient>
        </defs>
        <path
          fill="url(#bluePanel)"
          d="M0,0 L455,0
             C520,130 410,250 470,370
             C530,490 410,600 475,720
             C535,840 430,930 460,1000
             L0,1000 Z"
        />
      </svg>

      {/* LEFT content overlay */}
      <div className="hidden lg:flex relative z-10 w-[48%] flex-col items-center justify-center p-12 text-white">
        <div className="relative inline-flex items-center justify-center mb-4">
          <div
            aria-hidden="true"
            className="absolute inset-0 -m-1 bg-white/100 rounded-full blur-xl"
          />
          <img
            src="/DrLens.png"
            alt="DLens"
            className="relative block h-16 w-auto"
          />
        </div>

        <p className="mt-3 text-[13px] text-white/70 tracking-[0.2em] uppercase">
          Admin Console
        </p>

        <div className="absolute bottom-10 text-[11px] text-white/40 tracking-wider">
          © 2026 DERMALENS
        </div>
      </div>

      {/* ============ RIGHT: FORM ============ */}
      <div className="flex-1 flex items-center justify-center px-6 py-10 relative z-10">
        {/* mobile-only brand strip */}
        <img
          src="/DrLens.png"
          alt="DLens"
          className="lg:hidden absolute top-6 left-6 h-10 w-auto"
        />

        <div className="w-full max-w-[380px]">
          <img
            src="/Dr_pb.svg"
            alt=""
            className="block h-12 w-12 -ml-0.5 mb-3"
          />
          <h1 className="text-[26px] font-extrabold text-primary-dark tracking-tight">
            로그인
          </h1>
          <p className="text-[13px] text-text-sub mt-2 mb-8">
            개발자 콘솔에 접속하려면 로그인하세요.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-[12px] font-bold text-primary-dark mb-1.5">
                이메일
              </label>
              <div className="relative">
                <Mail
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-sub"
                />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="your@email.com"
                  autoComplete="email"
                  required
                  className="w-full h-12 pl-10 pr-4 rounded-xl bg-bg border border-line text-[14px] placeholder:text-text-sub focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
                />
              </div>
            </div>

            <div>
              <label className="block text-[12px] font-bold text-primary-dark mb-1.5">
                비밀번호
              </label>
              <div className="relative">
                <Lock
                  size={16}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-sub"
                />
                <input
                  type={showPw ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="비밀번호 입력"
                  autoComplete="current-password"
                  required
                  className="w-full h-12 pl-10 pr-11 rounded-xl bg-bg border border-line text-[14px] placeholder:text-text-sub focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPw((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-sub hover:text-primary p-1"
                  tabIndex={-1}
                >
                  {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-danger/8 border border-danger/20">
                <AlertCircle size={15} className="text-danger mt-0.5 shrink-0" />
                <p className="text-[12px] font-semibold text-danger leading-snug">
                  {error}
                </p>
              </div>
            )}

            <label className="flex items-center gap-2 text-[12px] text-text-sub select-none cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 rounded border-line accent-primary"
              />
              로그인 상태 유지
            </label>

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-12 rounded-xl bg-primary text-white font-bold text-[14px] shadow-[0_10px_24px_-10px_rgba(48,110,199,0.6)] hover:brightness-110 active:scale-[0.99] disabled:opacity-60 disabled:cursor-not-allowed transition"
            >
              {submitting ? '로그인 중...' : '로그인'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default LoginPage

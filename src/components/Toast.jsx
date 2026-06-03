import { createContext, useContext, useState, useCallback, useEffect } from 'react'
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react'

const ToastContext = createContext(null)

const toneStyle = {
  success: { icon: CheckCircle2, bg: 'bg-safe', border: 'border-safe' },
  error: { icon: AlertCircle, bg: 'bg-danger', border: 'border-danger' },
  info: { icon: Info, bg: 'bg-primary', border: 'border-primary' },
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const remove = useCallback((id) => {
    setToasts((cur) => cur.filter((t) => t.id !== id))
  }, [])

  const toast = useCallback(
    (message, opts = {}) => {
      const id = Math.random().toString(36).slice(2)
      const tone = opts.tone ?? 'success'
      const duration = opts.duration ?? 3000
      setToasts((cur) => [...cur, { id, message, tone }])
      setTimeout(() => remove(id), duration)
    },
    [remove]
  )

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => {
          const tone = toneStyle[t.tone] ?? toneStyle.info
          const Icon = tone.icon
          return (
            <div
              key={t.id}
              className="pointer-events-auto bg-card border border-line rounded-xl shadow-[0_12px_32px_-12px_rgba(48,110,199,0.35)] px-4 py-3 flex items-center gap-3 min-w-[260px] max-w-md animate-[fadeIn_0.2s_ease-out]"
            >
              <div className={`w-7 h-7 rounded-lg grid place-items-center ${tone.bg} text-white shrink-0`}>
                <Icon size={15} />
              </div>
              <p className="text-[13px] font-semibold text-text-main flex-1">{t.message}</p>
              <button
                onClick={() => remove(t.id)}
                className="text-text-sub hover:text-text-main shrink-0"
              >
                <X size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside ToastProvider')
  return ctx.toast
}

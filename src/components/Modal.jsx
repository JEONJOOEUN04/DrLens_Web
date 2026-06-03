import { useEffect } from 'react'
import { X } from 'lucide-react'

function Modal({ open, onClose, title, subtitle, children, footer, maxWidth = 'max-w-md' }) {
  useEffect(() => {
    if (!open) return
    const handleKey = (e) => e.key === 'Escape' && onClose?.()
    document.addEventListener('keydown', handleKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handleKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black/40 backdrop-blur-sm animate-[fadeIn_0.15s_ease-out]"
      onMouseDown={(e) => e.target === e.currentTarget && onClose?.()}
    >
      <div className={`bg-card border border-line rounded-2xl shadow-[0_24px_60px_-20px_rgba(0,0,0,0.4)] w-full ${maxWidth} max-h-[90vh] flex flex-col`}>
        <div className="flex items-start justify-between px-6 pt-5 pb-4 border-b border-line">
          <div>
            <h2 className="text-[17px] font-extrabold text-primary-dark">{title}</h2>
            {subtitle && <p className="text-[12px] text-text-sub mt-1">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="text-text-sub hover:text-text-main p-1 rounded-md hover:bg-bg shrink-0"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="px-6 py-4 border-t border-line flex items-center justify-end gap-2">
            {footer}
          </div>
        )}
      </div>
    </div>
  )
}

export default Modal

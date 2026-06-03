import {
  LayoutDashboard,
  Users,
  FlaskConical,
  Package,
  MessageSquareText,
  ScrollText,
  Settings,
  LogOut,
} from 'lucide-react'

export const navItems = [
  { id: 'dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { id: 'users', icon: Users, label: 'Users' },
  { id: 'ingredients', icon: FlaskConical, label: 'Ingredients' },
  { id: 'products', icon: Package, label: 'Products' },
  { id: 'reviews', icon: MessageSquareText, label: 'Reviews' },
  { id: 'logs', icon: ScrollText, label: 'Logs' },
  { id: 'settings', icon: Settings, label: 'Settings' },
]

function Sidebar({ activePage = 'dashboard', onNavigate, onLogout }) {
  return (
    <aside className="w-60 shrink-0 bg-card border-r border-line flex flex-col">
      <div className="px-6 pt-7 pb-8 flex flex-col items-start gap-1.5">
        <img src="/DrLens.png" alt="DLens" className="h-8 w-auto" />
        <p className="text-[11px] text-text-sub pl-2">Admin Console</p>
      </div>

      <nav className="flex-1 px-3 space-y-1">
        {navItems.map(({ id, icon: Icon, label }) => {
          const active = id === activePage
          return (
            <button
              key={id}
              onClick={() => onNavigate?.(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                active
                  ? 'bg-primary-light text-primary'
                  : 'text-text-sub hover:bg-primary-light/60 hover:text-primary-dark'
              }`}
            >
              <Icon size={18} strokeWidth={2} />
              <span>{label}</span>
            </button>
          )
        })}
      </nav>

      <button
        onClick={() => {
          if (window.confirm('로그아웃 하시겠습니까?')) onLogout?.()
        }}
        className="flex items-center gap-3 px-6 py-4 text-sm text-text-sub hover:text-danger transition border-t border-line"
      >
        <LogOut size={18} />
        <span className="font-semibold">Logout</span>
      </button>
    </aside>
  )
}

export default Sidebar

import { useState, useEffect, useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Bell,
  HelpCircle,
  ChevronDown,
  LogOut,
  UserCircle2,
  FlaskConical,
  Package,
  Keyboard,
  BookOpen,
  Mail,
  Sparkles,
  AlertCircle,
  MessageSquareText,
  CheckCheck,
  Loader2,
} from 'lucide-react'
import { searchProducts } from '../api/products'
import { searchIngredients } from '../api/ingredients'

const kindMeta = {
  ingredient: { icon: FlaskConical, label: '성분' },
  product: { icon: Package, label: '제품' },
}

// 알림 더미 데이터 (page 속성으로 클릭 시 이동할 페이지 지정)
const initialNotifs = [
  { id: 1, type: 'analysis', icon: Sparkles, title: '새로운 성분 분석 요청', detail: '레티놀 0.3 크림 — Olive Young', time: '방금 전', read: false, page: 'ingredients' },
  { id: 2, type: 'warn', icon: AlertCircle, title: 'OCR 인식 신뢰도 낮음', detail: '신뢰도 0.62 — 재확인 필요', time: '5분 전', read: false, page: 'logs' },
  { id: 3, type: 'review', icon: MessageSquareText, title: '신규 리뷰 (별점 2)', detail: '레티놀 0.3 크림 — 검토 필요', time: '12분 전', read: false, page: 'reviews' },
  { id: 4, type: 'system', icon: CheckCheck, title: '일일 통계 집계 완료', detail: '14:20 KST · 1.4초 소요', time: '1시간 전', read: true, page: 'logs' },
]

function TopBar({
  user,
  onLogout,
  onNavigate,
  title = 'Dashboard',
  subtitle = '더마렌즈 사용자 활동 및 성분 분석 데이터 실시간 모니터링',
}) {
  const displayName = user?.email?.split('@')[0] ?? 'Admin'
  const initial = displayName[0]?.toUpperCase() ?? 'A'

  // 한 번에 하나의 메뉴만 열림: null | 'search' | 'help' | 'notif' | 'profile'
  const [openMenu, setOpenMenu] = useState(null)
  const [query, setQuery] = useState('')
  const [notifs, setNotifs] = useState(initialNotifs)
  const containerRef = useRef(null)

  useEffect(() => {
    if (!openMenu) return
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpenMenu(null)
      }
    }
    const handleKey = (e) => e.key === 'Escape' && setOpenMenu(null)
    document.addEventListener('mousedown', handleClick)
    document.addEventListener('keydown', handleKey)
    return () => {
      document.removeEventListener('mousedown', handleClick)
      document.removeEventListener('keydown', handleKey)
    }
  }, [openMenu])

  const toggle = (name) => setOpenMenu((cur) => (cur === name ? null : name))

  // 디바운스된 검색어
  const [debouncedQ, setDebouncedQ] = useState('')
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(query.trim()), 300)
    return () => clearTimeout(t)
  }, [query])

  // 제품 검색 + 성분 검색 병렬 실행
  const productsQuery = useQuery({
    queryKey: ['search', 'products', debouncedQ],
    queryFn: () => searchProducts({ q: debouncedQ, page: 1, size: 5 }),
    enabled: !!debouncedQ,
    staleTime: 1000 * 30,
  })

  const ingredientsQuery = useQuery({
    queryKey: ['search', 'ingredients', debouncedQ],
    queryFn: () => searchIngredients(debouncedQ),
    enabled: !!debouncedQ,
    staleTime: 1000 * 30,
  })

  const searching = productsQuery.isFetching || ingredientsQuery.isFetching

  const results = (() => {
    if (!debouncedQ) return []
    const out = []
    ;(ingredientsQuery.data?.results ?? []).slice(0, 4).forEach((ing) =>
      out.push({
        kind: 'ingredient',
        label: ing.ingredient_name_kr,
        meta: ing.ingredient_name_en || `Risk Lv ${ing.risk_level ?? '-'}`,
        page: 'ingredients',
      })
    )
    ;(productsQuery.data?.products ?? []).slice(0, 4).forEach((p) =>
      out.push({
        kind: 'product',
        label: p.product_name,
        meta: `${p.brand_name ?? '-'}${p.price ? ` · ${p.price.toLocaleString()}원` : ''}`,
        page: 'products',
      })
    )
    return out
  })()

  const unreadCount = notifs.filter((n) => !n.read).length

  const handleResultClick = (item) => {
    setOpenMenu(null)
    setQuery('')
    onNavigate?.(item.page)
  }

  const handleNotifClick = (notif) => {
    setNotifs((cur) =>
      cur.map((n) => (n.id === notif.id ? { ...n, read: true } : n))
    )
    setOpenMenu(null)
    if (notif.page) onNavigate?.(notif.page)
  }

  const markAllRead = () =>
    setNotifs((cur) => cur.map((n) => ({ ...n, read: true })))

  const handleLogoutClick = () => {
    if (window.confirm('로그아웃 하시겠습니까?')) {
      setOpenMenu(null)
      onLogout?.()
    }
  }

  return (
    <header className="flex items-center justify-between px-8 py-5 bg-bg">
      <div>
        <h1 className="text-[22px] font-extrabold text-primary-dark tracking-tight">
          {title}
        </h1>
        <p className="text-[13px] text-text-sub mt-0.5">{subtitle}</p>
      </div>

      <div ref={containerRef} className="flex items-center gap-3">
        {/* ========== SEARCH ========== */}
        <div className="relative">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-sub"
          />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (e.target.value.trim()) setOpenMenu('search')
              else setOpenMenu(null)
            }}
            onFocus={() => query.trim() && setOpenMenu('search')}
            placeholder="사용자, 성분, 제품 검색..."
            className="w-72 h-10 pl-9 pr-4 rounded-xl bg-card border border-line text-sm placeholder:text-text-sub focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          />

          {openMenu === 'search' && (
            <div className="absolute left-0 top-12 w-[360px] bg-card border border-line rounded-xl shadow-[0_12px_32px_-12px_rgba(48,110,199,0.25)] py-2 z-30 max-h-[420px] overflow-y-auto">
              {searching && results.length === 0 ? (
                <p className="px-4 py-6 text-center text-[12px] text-text-sub flex items-center justify-center gap-2">
                  <Loader2 size={13} className="animate-spin" /> 검색 중...
                </p>
              ) : results.length === 0 ? (
                <p className="px-4 py-6 text-center text-[12px] text-text-sub">
                  '{debouncedQ || query}' 검색 결과가 없습니다.
                </p>
              ) : (
                <>
                  <p className="px-4 py-1.5 text-[10px] uppercase tracking-wider text-text-sub font-bold">
                    {results.length}건 발견
                  </p>
                  {results.map((item, idx) => {
                    const m = kindMeta[item.kind]
                    const Icon = m.icon
                    return (
                      <button
                        key={`${item.kind}-${item.label}-${idx}`}
                        onClick={() => handleResultClick(item)}
                        className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-primary-light/50 transition text-left"
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary-light grid place-items-center text-primary shrink-0">
                          <Icon size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-[13px] font-bold text-text-main truncate">
                            {item.label}
                          </p>
                          <p className="text-[11px] text-text-sub truncate">
                            {item.meta}
                          </p>
                        </div>
                        <span className="text-[10px] font-bold text-text-sub uppercase tracking-wider shrink-0">
                          {m.label}
                        </span>
                      </button>
                    )
                  })}
                </>
              )}
            </div>
          )}
        </div>

        {/* ========== HELP ========== */}
        <div className="relative">
          <button
            onClick={() => toggle('help')}
            className={`w-10 h-10 grid place-items-center rounded-xl bg-card border transition ${
              openMenu === 'help'
                ? 'border-primary ring-2 ring-primary-light text-primary'
                : 'border-line text-text-sub hover:text-primary'
            }`}
            aria-label="도움말"
          >
            <HelpCircle size={18} />
          </button>

          {openMenu === 'help' && (
            <div className="absolute right-0 top-12 w-72 bg-card border border-line rounded-xl shadow-[0_12px_32px_-12px_rgba(48,110,199,0.25)] py-2 z-30">
              <div className="px-4 py-2.5 border-b border-line">
                <p className="text-[13px] font-bold text-primary-dark">도움말</p>
                <p className="text-[11px] text-text-sub mt-0.5">
                  콘솔 사용법과 빠른 안내
                </p>
              </div>
              {[
                { icon: BookOpen, label: '사용 가이드', desc: '대시보드 위젯 설명', page: 'guide' },
                { icon: Keyboard, label: '단축키', desc: '⌘K 검색 · ESC 닫기', page: 'guide' },
                { icon: Mail, label: '문의 / 지원', desc: 'dermalens2026@gmail.com', href: 'mailto:dermalens2026@gmail.com' },
              ].map(({ icon: Icon, label, desc, page, href }) => {
                const handleClick = () => {
                  setOpenMenu(null)
                  if (href) {
                    window.location.href = href
                  } else if (page) {
                    onNavigate?.(page)
                  }
                }
                return (
                  <button
                    key={label}
                    onClick={handleClick}
                    className="w-full flex items-start gap-3 px-4 py-2.5 hover:bg-primary-light/50 transition text-left"
                  >
                    <div className="w-8 h-8 rounded-lg bg-primary-light grid place-items-center text-primary shrink-0 mt-0.5">
                      <Icon size={15} />
                    </div>
                    <div>
                      <p className="text-[13px] font-bold text-text-main">{label}</p>
                      <p className="text-[11px] text-text-sub">{desc}</p>
                    </div>
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ========== NOTIFICATIONS ========== */}
        <div className="relative">
          <button
            onClick={() => toggle('notif')}
            className={`relative w-10 h-10 grid place-items-center rounded-xl bg-card border transition ${
              openMenu === 'notif'
                ? 'border-primary ring-2 ring-primary-light text-primary'
                : 'border-line text-text-sub hover:text-primary'
            }`}
            aria-label="알림"
          >
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-danger" />
            )}
          </button>

          {openMenu === 'notif' && (
            <div className="absolute right-0 top-12 w-[360px] bg-card border border-line rounded-xl shadow-[0_12px_32px_-12px_rgba(48,110,199,0.25)] z-30 overflow-hidden">
              <div className="flex items-center justify-between px-4 py-3 border-b border-line">
                <div>
                  <p className="text-[13px] font-bold text-primary-dark">알림</p>
                  <p className="text-[11px] text-text-sub mt-0.5">
                    안 읽음 {unreadCount}건
                  </p>
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllRead}
                    className="text-[11px] font-bold text-primary hover:underline"
                  >
                    모두 읽음
                  </button>
                )}
              </div>

              <ul className="max-h-[400px] overflow-y-auto divide-y divide-line">
                {notifs.map((n) => {
                  const Icon = n.icon
                  return (
                    <li key={n.id}>
                      <button
                        onClick={() => handleNotifClick(n)}
                        className={`w-full flex items-start gap-3 px-4 py-3 text-left transition ${
                          n.read ? 'opacity-70' : 'bg-primary-light/20'
                        } hover:bg-primary-light/50`}
                      >
                        <div className="w-8 h-8 rounded-lg bg-primary-light grid place-items-center text-primary shrink-0">
                          <Icon size={15} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <p className="text-[13px] font-bold text-text-main truncate">
                              {n.title}
                            </p>
                            {!n.read && (
                              <span className="w-1.5 h-1.5 rounded-full bg-danger shrink-0" />
                            )}
                          </div>
                          <p className="text-[11px] text-text-sub truncate mt-0.5">
                            {n.detail}
                          </p>
                          <p className="text-[10px] text-text-sub/70 mt-1">
                            {n.time}
                          </p>
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          )}
        </div>

        {/* ========== PROFILE ========== */}
        <div className="relative">
          <button
            onClick={() => toggle('profile')}
            className={`flex items-center gap-2 pl-2 pr-3 h-10 rounded-xl bg-card border transition ${
              openMenu === 'profile'
                ? 'border-primary ring-2 ring-primary-light'
                : 'border-line hover:border-primary/40'
            }`}
          >
            <div className="w-7 h-7 rounded-full bg-primary text-white grid place-items-center text-xs font-bold">
              {initial}
            </div>
            <div className="leading-tight text-left">
              <p className="text-[12px] font-bold text-primary-dark">{displayName}</p>
              <p className="text-[10px] text-text-sub">Admin</p>
            </div>
            <ChevronDown
              size={14}
              className={`text-text-sub transition-transform ${openMenu === 'profile' ? 'rotate-180' : ''}`}
            />
          </button>

          {openMenu === 'profile' && (
            <div className="absolute right-0 top-12 w-60 bg-card border border-line rounded-xl shadow-[0_12px_32px_-12px_rgba(48,110,199,0.25)] py-2 z-30 origin-top-right">
              <div className="px-4 py-2.5 border-b border-line">
                <p className="text-[13px] font-bold text-primary-dark truncate">
                  {displayName}
                </p>
                <p className="text-[11px] text-text-sub truncate">
                  {user?.email ?? '-'}
                </p>
              </div>

              <button
                onClick={() => {
                  setOpenMenu(null)
                  onNavigate?.('settings')
                }}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-text-main hover:bg-primary-light/60 hover:text-primary transition"
              >
                <UserCircle2 size={16} />
                내 프로필
              </button>

              <div className="my-1 border-t border-line" />

              <button
                onClick={handleLogoutClick}
                className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[13px] font-semibold text-danger hover:bg-danger/8 transition"
              >
                <LogOut size={16} />
                로그아웃
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default TopBar

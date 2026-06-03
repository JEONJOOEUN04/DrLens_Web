import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  User,
  Heart,
  Star,
  FlaskConical,
  Sparkles,
  Loader2,
  Package,
  Mail,
  Calendar,
  AlertCircle,
} from 'lucide-react'
import {
  getMyPage,
  getMyLikes,
  getMyReviews,
  getMyAnalysis,
  getMyRecommendations,
  getSkinProfile,
} from '../../api/users'

const TABS = [
  { id: 'likes', label: '좋아요한 제품', icon: Heart },
  { id: 'reviews', label: '내 리뷰', icon: Star },
  { id: 'analysis', label: '분석 기록', icon: FlaskConical },
  { id: 'recommendations', label: '추천 제품', icon: Sparkles },
]

function statusFromRisk(risk) {
  if (risk == null) return { style: 'bg-line/40 text-text-sub', label: '-' }
  if (risk <= 3) return { style: 'bg-safe/10 text-safe', label: '안전' }
  if (risk <= 6) return { style: 'bg-warning/15 text-[#B58900]', label: '주의' }
  return { style: 'bg-danger/10 text-danger', label: '위험' }
}

function Stars({ count = 0 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star key={n} size={11} className={n <= count ? 'fill-warning text-warning' : 'text-line'} />
      ))}
    </div>
  )
}

function UsersView({ user }) {
  const userId = user?.user_id
  const [tab, setTab] = useState('likes')

  const { data: mypage } = useQuery({
    queryKey: ['mypage', userId],
    queryFn: () => getMyPage(userId),
    enabled: !!userId,
  })

  const { data: skinProfile } = useQuery({
    queryKey: ['skin-profile', userId],
    queryFn: () => getSkinProfile(userId),
    enabled: !!userId,
    retry: false,
  })

  const tabQuery = useQuery({
    queryKey: ['mypage-tab', userId, tab],
    queryFn: () => {
      if (tab === 'likes') return getMyLikes(userId, { page: 1, size: 20 })
      if (tab === 'reviews') return getMyReviews(userId, { page: 1, size: 20 })
      if (tab === 'analysis') return getMyAnalysis(userId, { page: 1, size: 20 })
      if (tab === 'recommendations') return getMyRecommendations(userId, { page: 1, size: 20 })
    },
    enabled: !!userId,
  })

  const summary = mypage?.activity_summary ?? {}
  const profile = mypage?.user ?? user ?? {}
  const skin = skinProfile?.profile

  return (
    <div className="space-y-5">
      {/* 프로필 헤더 */}
      <section className="bg-card border border-line rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-5">
        <div className="w-16 h-16 rounded-full bg-primary text-white grid place-items-center text-2xl font-extrabold shrink-0">
          {(profile.nickname?.[0] ?? profile.email?.[0] ?? 'U').toUpperCase()}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-[20px] font-extrabold text-primary-dark">
            {profile.nickname ?? profile.email?.split('@')[0] ?? 'User'}
          </h2>
          <div className="flex flex-wrap items-center gap-3 mt-1.5 text-[12px] text-text-sub">
            <span className="flex items-center gap-1">
              <Mail size={12} /> {profile.email ?? '-'}
            </span>
            {profile.created_at && (
              <span className="flex items-center gap-1">
                <Calendar size={12} /> 가입 {profile.created_at}
              </span>
            )}
          </div>
          {skin && (
            <div className="flex flex-wrap gap-1.5 mt-3">
              {skin.skin_type?.name_kr && (
                <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-primary-light text-primary">
                  {skin.skin_type.name_kr}
                </span>
              )}
              {(skin.skin_concerns ?? []).map((c) => (
                <span key={c} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-bg border border-line text-text-sub">
                  #{c}
                </span>
              ))}
              {(skin.allergies ?? []).map((a) => (
                <span key={a} className="text-[11px] font-semibold px-2.5 py-1 rounded-full bg-danger/8 text-danger">
                  알러지: {a}
                </span>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* KPI */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: '좋아요', value: summary.like_count ?? 0, icon: Heart },
          { label: '내 리뷰', value: summary.review_count ?? 0, icon: Star },
          { label: '분석 횟수', value: summary.analysis_count ?? 0, icon: FlaskConical },
          { label: '추천 받은 제품', value: '-', icon: Sparkles, note: '하단 탭에서 확인' },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-line rounded-2xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary-light grid place-items-center text-primary">
                <s.icon size={15} />
              </div>
              <p className="text-[11px] text-text-sub font-semibold">{s.label}</p>
            </div>
            <p className="text-[22px] font-extrabold text-primary-dark">{s.value}</p>
            {s.note && <p className="text-[10px] text-text-sub mt-0.5">{s.note}</p>}
          </div>
        ))}
      </section>

      {/* 탭 */}
      <section className="bg-card border border-line rounded-2xl">
        <div className="border-b border-line px-3 flex gap-1 overflow-x-auto">
          {TABS.map((t) => {
            const Icon = t.icon
            const active = tab === t.id
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`flex items-center gap-1.5 px-4 py-3.5 text-[13px] font-bold border-b-2 transition whitespace-nowrap ${
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-text-sub hover:text-primary-dark'
                }`}
              >
                <Icon size={14} /> {t.label}
              </button>
            )
          })}
        </div>

        <div className="p-5">
          {tabQuery.isLoading ? (
            <div className="py-12 text-center">
              <Loader2 size={22} className="text-primary animate-spin mx-auto mb-2" />
              <p className="text-[12px] text-text-sub">불러오는 중...</p>
            </div>
          ) : tabQuery.isError ? (
            <div className="py-12 text-center">
              <AlertCircle size={22} className="text-danger mx-auto mb-2" />
              <p className="text-[12px] font-bold text-danger">
                {tabQuery.error?.message ?? '불러오기 실패'}
              </p>
            </div>
          ) : (
            <TabContent tab={tab} data={tabQuery.data} />
          )}
        </div>
      </section>
    </div>
  )
}

function TabContent({ tab, data }) {
  if (tab === 'likes') {
    const items = data?.liked_products ?? []
    if (items.length === 0) return <Empty msg="좋아요한 제품이 없습니다." />
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {items.map((p) => (
          <ProductCard key={p.product_id} product={p} subtitle={p.created_at} />
        ))}
      </div>
    )
  }
  if (tab === 'reviews') {
    const items = data?.reviews ?? []
    if (items.length === 0) return <Empty msg="작성한 리뷰가 없습니다." />
    return (
      <ul className="divide-y divide-line">
        {items.map((r) => (
          <li key={r.review_id} className="py-4 first:pt-0 last:pb-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <p className="text-[13px] font-bold text-text-main">{r.product_name}</p>
              <Stars count={r.rating} />
            </div>
            <p className="text-[13px] text-text-main leading-relaxed">{r.review_text}</p>
            <p className="text-[11px] text-text-sub mt-1.5">{r.created_at}</p>
          </li>
        ))}
      </ul>
    )
  }
  if (tab === 'analysis') {
    const items = data?.history ?? []
    if (items.length === 0) return <Empty msg="분석 기록이 없습니다." />
    return (
      <table className="w-full text-left">
        <thead>
          <tr className="text-[11px] text-text-sub uppercase tracking-wider border-b border-line">
            <th className="font-semibold py-3">제품</th>
            <th className="font-semibold py-3">유형</th>
            <th className="font-semibold py-3">결과</th>
            <th className="font-semibold py-3">위험도</th>
            <th className="font-semibold py-3 text-right">시간</th>
          </tr>
        </thead>
        <tbody>
          {items.map((row) => {
            const s = statusFromRisk(row.risk_score)
            return (
              <tr key={row.analysis_id} className="border-b border-line text-[13px] hover:bg-primary-light/30">
                <td className="py-3 font-bold text-text-main">{row.product_name ?? `#${row.product_id}`}</td>
                <td className="py-3 text-text-sub">
                  {row.analysis_type === 'OCR_ANALYSIS' ? 'OCR' : '제품검색'}
                </td>
                <td className="py-3">
                  <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${s.style}`}>
                    {s.label}
                  </span>
                </td>
                <td className="py-3 font-semibold text-text-main">{row.risk_score ?? '-'}</td>
                <td className="py-3 text-right text-text-sub font-medium text-[12px]">{row.created_at}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    )
  }
  if (tab === 'recommendations') {
    const items = data?.recommendations ?? []
    if (items.length === 0) return <Empty msg="추천 받은 제품이 없습니다. 추천을 생성하려면 앱에서 설문을 완료해주세요." />
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {items.map((r) => (
          <div key={r.recommendation_id} className="border border-line rounded-2xl p-4 hover:border-primary/30 transition">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-7 h-7 rounded-full bg-primary text-white grid place-items-center text-xs font-bold">
                {r.rank_order}
              </div>
              <p className="text-[11px] text-text-sub">추천 #{r.rank_order}</p>
              {r.score != null && (
                <span className="ml-auto text-[10px] font-bold px-2 py-0.5 rounded bg-primary-light text-primary">
                  점수 {Number(r.score).toFixed(1)}
                </span>
              )}
            </div>
            <p className="text-[14px] font-bold text-text-main truncate">{r.product_name}</p>
            <p className="text-[12px] text-text-sub mt-1.5 line-clamp-2">{r.reason}</p>
          </div>
        ))}
      </div>
    )
  }
  return null
}

function ProductCard({ product, subtitle }) {
  return (
    <div className="border border-line rounded-2xl p-3 hover:shadow-[0_8px_20px_-12px_rgba(48,110,199,0.3)] transition">
      <div className="aspect-square rounded-xl bg-white border border-line/60 flex items-center justify-center mb-2 overflow-hidden p-2.5">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt=""
            className="max-w-full max-h-full object-contain"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        ) : (
          <Package size={28} className="text-primary" />
        )}
      </div>
      <p className="text-[13px] font-bold text-text-main truncate">{product.product_name}</p>
      <div className="flex items-center justify-between mt-1">
        <p className="text-[12px] font-extrabold text-primary-dark">
          {product.price ? `${product.price.toLocaleString()}원` : '-'}
        </p>
        {subtitle && <p className="text-[10px] text-text-sub">{subtitle}</p>}
      </div>
    </div>
  )
}

function Empty({ msg }) {
  return (
    <div className="py-12 text-center">
      <User size={28} className="text-text-sub mx-auto mb-2" />
      <p className="text-[13px] text-text-sub">{msg}</p>
    </div>
  )
}

export default UsersView

import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  Search,
  Download,
  FlaskConical,
  Eye,
  Search as SearchIcon,
  Loader2,
  AlertCircle,
  CheckCircle2,
  XCircle,
  ChevronDown,
} from 'lucide-react'
import { getAnalysisHistory } from '../../api/analysis'
import { getSearchHistory, getRecentlyViewed } from '../../api/reviews'

const KIND_META = {
  analysis: { icon: FlaskConical, label: '분석', color: 'text-primary', bg: 'bg-primary-light' },
  search: { icon: SearchIcon, label: '검색', color: 'text-[#B58900]', bg: 'bg-warning/15' },
  view: { icon: Eye, label: '제품 조회', color: 'text-safe', bg: 'bg-safe/10' },
}

const FILTERS = [
  { id: 'all', label: 'ALL' },
  { id: 'analysis', label: 'ANALYSIS' },
  { id: 'search', label: 'SEARCH' },
  { id: 'view', label: 'VIEW' },
]

function trafficStyle(light) {
  if (light === 'GREEN') return { bg: 'bg-safe/10', text: 'text-safe', label: '안전' }
  if (light === 'YELLOW') return { bg: 'bg-warning/15', text: 'text-[#B58900]', label: '주의' }
  if (light === 'RED') return { bg: 'bg-danger/10', text: 'text-danger', label: '위험' }
  return null
}

function downloadCSV(rows, filename) {
  const header = ['time', 'kind', 'title', 'detail']
  const lines = [
    header.join(','),
    ...rows.map((r) =>
      header.map((k) => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(',')
    ),
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function LogsView({ user }) {
  const userId = user?.user_id
  const [filter, setFilter] = useState('all')
  const [query, setQuery] = useState('')
  const [debugOpen, setDebugOpen] = useState(false)

  const analysisQuery = useQuery({
    queryKey: ['analysis-history', userId, 50],
    queryFn: () => getAnalysisHistory(userId, { page: 1, size: 50 }),
    enabled: !!userId,
  })

  const searchQuery = useQuery({
    queryKey: ['search-history', userId],
    queryFn: () => getSearchHistory(userId),
    enabled: !!userId,
  })

  const viewQuery = useQuery({
    queryKey: ['recently-viewed', userId],
    queryFn: () => getRecentlyViewed(userId),
    enabled: !!userId,
  })

  const isLoading =
    analysisQuery.isLoading || searchQuery.isLoading || viewQuery.isLoading

  const allErrors = [analysisQuery.error, searchQuery.error, viewQuery.error].filter(Boolean)

  // 세 가지 활동을 통합해서 시간순 정렬
  const activities = useMemo(() => {
    const items = []
    ;(analysisQuery.data?.history ?? []).forEach((a) =>
      items.push({
        id: `a-${a.analysis_id}`,
        kind: 'analysis',
        time: a.created_at,
        title: a.product_name ?? `Product #${a.product_id}`,
        detail: a.summary ?? (a.analysis_type === 'OCR_ANALYSIS' ? 'OCR 분석' : '제품 검색 분석'),
        meta: {
          traffic_light: a.traffic_light,
          risk_score: a.risk_score,
          analysis_type: a.analysis_type,
        },
      })
    )
    ;(searchQuery.data?.search_history ?? []).forEach((s, i) =>
      items.push({
        id: `s-${i}-${s.created_at}`,
        kind: 'search',
        time: s.created_at,
        title: s.keyword,
        detail: '검색어',
      })
    )
    ;(viewQuery.data?.products ?? []).forEach((p) =>
      items.push({
        id: `v-${p.product_id}-${p.viewed_at}`,
        kind: 'view',
        time: p.viewed_at,
        title: p.product_name,
        detail: `${p.brand_name ?? ''}${p.price ? ` · ${p.price.toLocaleString()}원` : ''}`,
      })
    )
    items.sort((a, b) => String(b.time ?? '').localeCompare(String(a.time ?? '')))
    return items
  }, [analysisQuery.data, searchQuery.data, viewQuery.data])

  const counts = {
    all: activities.length,
    analysis: activities.filter((a) => a.kind === 'analysis').length,
    search: activities.filter((a) => a.kind === 'search').length,
    view: activities.filter((a) => a.kind === 'view').length,
  }

  const filtered = useMemo(() => {
    let arr = filter === 'all' ? activities : activities.filter((a) => a.kind === filter)
    const q = query.trim().toLowerCase()
    if (q) {
      arr = arr.filter(
        (a) =>
          a.title?.toLowerCase().includes(q) || a.detail?.toLowerCase().includes(q)
      )
    }
    return arr
  }, [activities, filter, query])

  // 각 API 상태 (디버깅용)
  const apiStatus = [
    {
      label: 'analysis/history',
      endpoint: `/api/analysis/history/${userId}/`,
      query: analysisQuery,
      count: analysisQuery.data?.history?.length ?? 0,
    },
    {
      label: 'review/search-history',
      endpoint: `/api/review/search-history/${userId}/`,
      query: searchQuery,
      count: searchQuery.data?.search_history?.length ?? 0,
    },
    {
      label: 'review/recently-viewed',
      endpoint: `/api/review/recently-viewed/${userId}/`,
      query: viewQuery,
      count: viewQuery.data?.products?.length ?? 0,
    },
  ]

  return (
    <div className="space-y-5">
      {/* API 상태 디버그 패널 */}
      <section className="bg-card border border-line rounded-2xl overflow-hidden">
        <button
          onClick={() => setDebugOpen((v) => !v)}
          className="w-full flex items-center justify-between px-5 py-3 hover:bg-bg transition"
        >
          <div className="flex items-center gap-2">
            <span className="text-[12px] font-bold text-primary-dark">API 연결 상태</span>
            <span className="text-[11px] text-text-sub">
              user_id: <code className="font-mono">{userId ?? '없음'}</code>
            </span>
          </div>
          <ChevronDown
            size={16}
            className={`text-text-sub transition-transform ${debugOpen ? 'rotate-180' : ''}`}
          />
        </button>
        {debugOpen && (
          <div className="border-t border-line px-5 py-3 space-y-2">
            {apiStatus.map((s) => {
              const ok = !s.query.isError && !s.query.isLoading
              const Icon = s.query.isLoading
                ? Loader2
                : s.query.isError
                ? XCircle
                : CheckCircle2
              return (
                <div key={s.label} className="flex items-center gap-3 text-[12px]">
                  <Icon
                    size={14}
                    className={`shrink-0 ${
                      s.query.isLoading
                        ? 'text-text-sub animate-spin'
                        : s.query.isError
                        ? 'text-danger'
                        : 'text-safe'
                    }`}
                  />
                  <code className="font-mono text-[11px] text-text-sub flex-1 truncate">
                    GET {s.endpoint}
                  </code>
                  {ok && (
                    <span className="text-[11px] font-bold text-safe">
                      {s.count}건
                    </span>
                  )}
                  {s.query.isError && (
                    <span className="text-[11px] font-bold text-danger">
                      {s.query.error?.response?.status ?? 'ERR'}{' '}
                      {s.query.error?.message?.slice(0, 30) ?? ''}
                    </span>
                  )}
                </div>
              )
            })}
            <p className="text-[10px] text-text-sub pt-2 border-t border-line/50 mt-2">
              ⓘ 모든 API가 정상(초록 체크)인데 0건이면, 해당 사용자가 아직 활동한 적이 없는 것입니다.
              브라우저 개발자도구 Network 탭에서 실제 응답을 확인해보세요.
            </p>
          </div>
        )}
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        {[
          { label: '전체 활동', value: counts.all, sub: '누적' },
          { label: '분석', value: counts.analysis, sub: 'OCR + 제품검색' },
          { label: '검색', value: counts.search, sub: '키워드 검색' },
          { label: '제품 조회', value: counts.view, sub: '최근 본 제품' },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-line rounded-2xl p-5">
            <p className="text-[12px] text-text-sub font-medium">{s.label}</p>
            <p className="mt-1 text-[24px] font-extrabold text-primary-dark">{s.value}</p>
            <p className="text-[11px] text-text-sub mt-0.5">{s.sub}</p>
          </div>
        ))}
      </section>

      <section className="bg-card border border-line rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-sub" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="활동 내용 검색..."
              className="w-full h-10 pl-9 pr-3 rounded-xl bg-bg border border-line text-[13px] placeholder:text-text-sub focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {FILTERS.map((f) => (
              <button
                key={f.id}
                onClick={() => setFilter(f.id)}
                className={`h-10 px-3 rounded-xl text-[12px] font-bold transition ${
                  filter === f.id
                    ? 'bg-primary text-white'
                    : 'bg-bg border border-line text-text-sub hover:text-primary'
                }`}
              >
                {f.label}
              </button>
            ))}
            <button
              onClick={() =>
                downloadCSV(
                  filtered,
                  `dermalens-activity-${new Date().toISOString().slice(0, 10)}.csv`
                )
              }
              disabled={filtered.length === 0}
              className="h-10 px-3 rounded-xl bg-bg border border-line text-[12px] font-semibold text-text-sub hover:text-primary flex items-center gap-1.5 disabled:opacity-40"
            >
              <Download size={13} /> Export
            </button>
          </div>
        </div>

        {isLoading ? (
          <div className="py-16 text-center">
            <Loader2 size={24} className="text-primary animate-spin mx-auto mb-2" />
            <p className="text-[13px] text-text-sub">활동 기록 불러오는 중...</p>
          </div>
        ) : filtered.length === 0 && allErrors.length === 3 ? (
          <div className="py-16 text-center">
            <AlertCircle size={24} className="text-danger mx-auto mb-2" />
            <p className="text-[13px] font-bold text-danger">활동 기록을 불러올 수 없습니다</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            {query ? (
              <p className="text-[13px] text-text-sub">
                '{query}' 검색 결과가 없습니다.
              </p>
            ) : (
              <>
                <p className="text-[13px] font-bold text-text-main mb-1">
                  아직 활동 기록이 없습니다
                </p>
                <p className="text-[12px] text-text-sub max-w-md mx-auto leading-relaxed">
                  현재 로그인한 계정으로
                  <br />
                  <strong>① 모바일 앱에서 성분 분석</strong>을 하거나
                  <br />
                  <strong>② 제품을 검색·조회</strong>해야 여기에 기록이 표시됩니다.
                </p>
                <p className="text-[11px] text-text-sub mt-3">
                  위의 "API 연결 상태"를 열어보면 각 엔드포인트가 정상인지 확인할 수 있습니다.
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-text-sub uppercase tracking-wider border-b border-line">
                  <th className="font-semibold py-2.5 w-40">시각</th>
                  <th className="font-semibold py-2.5 w-24">유형</th>
                  <th className="font-semibold py-2.5">내용</th>
                  <th className="font-semibold py-2.5 w-24">결과</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((row) => {
                  const km = KIND_META[row.kind]
                  const Icon = km.icon
                  const traffic = trafficStyle(row.meta?.traffic_light)
                  return (
                    <tr
                      key={row.id}
                      className="border-b border-line text-[13px] hover:bg-primary-light/40"
                    >
                      <td className="py-3 text-text-sub font-mono text-[11px]">{row.time}</td>
                      <td className="py-3">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-1 rounded ${km.bg} ${km.color}`}
                        >
                          <Icon size={11} />
                          {km.label}
                        </span>
                      </td>
                      <td className="py-3">
                        <div className="leading-tight">
                          <p className="font-bold text-text-main truncate max-w-md">
                            {row.title}
                          </p>
                          {row.detail && (
                            <p className="text-[11px] text-text-sub truncate max-w-md">
                              {row.detail}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="py-3">
                        {traffic ? (
                          <span
                            className={`text-[10px] font-bold px-2 py-1 rounded-full ${traffic.bg} ${traffic.text}`}
                          >
                            {traffic.label}
                          </span>
                        ) : row.meta?.risk_score != null ? (
                          <span className="text-[11px] text-text-sub">
                            risk {row.meta.risk_score}
                          </span>
                        ) : (
                          <span className="text-text-sub">-</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
        <p className="mt-3 text-[11px] text-text-sub">
          전체 {activities.length}건 중 {filtered.length}건 표시 · 본인 활동만 표시됩니다
        </p>
      </section>
    </div>
  )
}

export default LogsView

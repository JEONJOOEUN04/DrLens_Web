import { useState, useMemo, useEffect } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { Search, Plus, FlaskConical, AlertCircle, Loader2, AlertTriangle, Droplet, Heart } from 'lucide-react'
import Modal from '../../components/Modal'
import Pagination from '../../components/Pagination'
import { listIngredients, searchIngredients } from '../../api/ingredients'

const PAGE_SIZE = 50

// risk_level → 안전도 등급 매핑 (1-3: safe, 4-6: warning, 7-10: danger)
function riskToSafety(level) {
  if (level == null) return 'unknown'
  if (level <= 3) return 'safe'
  if (level <= 6) return 'warning'
  return 'danger'
}

const safetyStyle = {
  safe: { bg: 'bg-safe/10', text: 'text-safe', label: '안전' },
  warning: { bg: 'bg-warning/15', text: 'text-[#B58900]', label: '주의' },
  danger: { bg: 'bg-danger/10', text: 'text-danger', label: '위험' },
  unknown: { bg: 'bg-line/40', text: 'text-text-sub', label: '미분류' },
}

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function IngredientsView() {
  const [query, setQuery] = useState('')
  const [safetyFilter, setSafetyFilter] = useState('all')
  const [page, setPage] = useState(1)
  const [addOpen, setAddOpen] = useState(false)
  const debouncedQuery = useDebounce(query)

  useEffect(() => {
    setPage(1)
  }, [debouncedQuery])

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['ingredients', { q: debouncedQuery, page }],
    queryFn: async () => {
      if (debouncedQuery) {
        const res = await searchIngredients(debouncedQuery)
        return { ingredients: res.results ?? [], count: res.count ?? 0 }
      }
      const res = await listIngredients({ page, size: PAGE_SIZE })
      return { ingredients: res.ingredients ?? [], count: res.count ?? 0 }
    },
    placeholderData: keepPreviousData,
  })

  const all = data?.ingredients ?? []

  // 전체 등록 성분 수 — 30분 캐싱
  const { data: totalItems, isLoading: totalLoading } = useQuery({
    queryKey: ['ingredients-total-count'],
    queryFn: async () => {
      const SCAN_SIZE = 500
      let p = 1
      let total = 0
      while (p <= 100) {
        const res = await listIngredients({ page: p, size: SCAN_SIZE })
        const cnt = res?.ingredients?.length ?? 0
        total += cnt
        if (cnt < SCAN_SIZE) break
        p += 1
      }
      return total
    },
    staleTime: 1000 * 60 * 30,
  })

  const totalPages =
    !debouncedQuery && totalItems
      ? Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
      : null

  // 끝 페이지 탐색 (검색 시 fallback)
  const findLastPage = async () => {
    const SCAN_SIZE = 500
    let p = 1
    while (p <= 200) {
      const res = await listIngredients({ page: p, size: SCAN_SIZE })
      const cnt = res?.ingredients?.length ?? 0
      if (cnt < SCAN_SIZE) {
        const t = (p - 1) * SCAN_SIZE + cnt
        return Math.max(1, Math.ceil(t / PAGE_SIZE))
      }
      p += 1
    }
    return Math.ceil((200 * SCAN_SIZE) / PAGE_SIZE)
  }

  // 클라이언트 사이드 안전도 필터 (API는 risk 필터 미지원)
  const filtered = useMemo(() => {
    if (safetyFilter === 'all') return all
    return all.filter((ing) => riskToSafety(ing.risk_level) === safetyFilter)
  }, [all, safetyFilter])

  // 현재 페이지 내 등급별 카운트
  const counts = useMemo(() => {
    const c = { safe: 0, warning: 0, danger: 0 }
    all.forEach((ing) => {
      const s = riskToSafety(ing.risk_level)
      if (s in c) c[s] += 1
    })
    return c
  }, [all])

  return (
    <div className="space-y-5">
      <section className="flex items-center gap-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-line">
          <FlaskConical size={15} className="text-primary" />
          <span className="text-[13px]">
            {totalLoading ? (
              <span className="inline-flex items-center gap-1.5 text-text-sub">
                <Loader2 size={12} className="animate-spin" /> 집계 중...
              </span>
            ) : (
              <>
                <strong className="text-primary-dark font-extrabold">
                  {(totalItems ?? 0).toLocaleString()}
                </strong>
                <span className="text-text-sub"> ingredients saved</span>
              </>
            )}
          </span>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { key: 'safe', label: '안전 등급', tone: { bg: 'bg-safe/10', text: 'text-safe' } },
          { key: 'warning', label: '주의 등급', tone: { bg: 'bg-warning/15', text: 'text-[#B58900]' } },
          { key: 'danger', label: '위험 등급', tone: { bg: 'bg-danger/10', text: 'text-danger' } },
        ].map((s) => {
          const active = safetyFilter === s.key
          const cnt = counts[s.key]
          return (
            <button
              key={s.key}
              onClick={() => setSafetyFilter(active ? 'all' : s.key)}
              className={`bg-card border rounded-2xl p-5 text-left transition ${
                active ? 'border-primary ring-2 ring-primary-light' : 'border-line hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-2 mb-2">
                <div className={`w-8 h-8 rounded-lg grid place-items-center ${s.tone.bg} ${s.tone.text}`}>
                  <FlaskConical size={16} />
                </div>
                <p className="text-[12px] text-text-sub font-semibold">{s.label}</p>
              </div>
              <p className="text-[24px] font-extrabold text-primary-dark">{cnt}</p>
              <p className="text-[11px] text-text-sub mt-0.5">현재 페이지 내</p>
              {active && (
                <p className="text-[10px] text-primary font-bold mt-2">필터 적용 중</p>
              )}
            </button>
          )
        })}
      </section>

      <section className="bg-card border border-line rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[240px] max-w-md">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-sub" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="성분명 검색 (예: 나이아신아마이드)..."
              className="w-full h-10 pl-9 pr-9 rounded-xl bg-bg border border-line text-[13px] placeholder:text-text-sub focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
            />
            {isFetching && (
              <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin" />
            )}
          </div>
          <button
            onClick={() => setAddOpen(true)}
            className="h-10 px-4 rounded-xl bg-primary text-white text-[13px] font-bold flex items-center gap-1.5 hover:brightness-110 transition"
          >
            <Plus size={14} /> 성분 등록
          </button>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 size={24} className="text-primary animate-spin mx-auto mb-2" />
            <p className="text-[13px] text-text-sub">성분 불러오는 중...</p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center">
            <AlertCircle size={24} className="text-danger mx-auto mb-2" />
            <p className="text-[13px] font-bold text-danger">{error?.message ?? '불러오기 실패'}</p>
          </div>
        ) : (
          <>
            <table className="w-full text-left">
              <thead>
                <tr className="text-[11px] text-text-sub uppercase tracking-wider border-b border-line">
                  <th className="font-semibold py-3">성분명 (한글)</th>
                  <th className="font-semibold py-3">영문</th>
                  <th className="font-semibold py-3">안전도</th>
                  <th className="font-semibold py-3">Risk Lv</th>
                  <th className="font-semibold py-3">속성</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-[13px] text-text-sub">
                      조건에 맞는 성분이 없습니다.
                    </td>
                  </tr>
                ) : (
                  filtered.map((ing) => {
                    const s = safetyStyle[riskToSafety(ing.risk_level)]
                    return (
                      <tr key={ing.ingredient_id} className="border-b border-line text-[13px] hover:bg-primary-light/40">
                        <td className="py-3 font-bold text-text-main">{ing.ingredient_name_kr}</td>
                        <td className="py-3 text-text-sub">{ing.ingredient_name_en || '-'}</td>
                        <td className="py-3">
                          <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${s.bg} ${s.text}`}>
                            {s.label}
                          </span>
                        </td>
                        <td className="py-3 text-text-main font-semibold">{ing.risk_level ?? '-'}</td>
                        <td className="py-3">
                          <div className="flex items-center gap-1 flex-wrap">
                            {ing.allergy_flag && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-danger/10 text-danger" title="알레르기 유발 가능">
                                <AlertTriangle size={10} /> 알러지
                              </span>
                            )}
                            {ing.irritant_flag && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-warning/15 text-[#B58900]" title="자극성">
                                <AlertTriangle size={10} /> 자극
                              </span>
                            )}
                            {ing.moisturizing_flag && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-primary-light text-primary" title="보습">
                                <Droplet size={10} /> 보습
                              </span>
                            )}
                            {ing.soothing_flag && (
                              <span className="inline-flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded bg-safe/10 text-safe" title="진정">
                                <Heart size={10} /> 진정
                              </span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>

            {!debouncedQuery && (
              <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
                <p className="text-[12px] text-text-sub">
                  {page}페이지 · {all.length}건 표시
                </p>
                <Pagination
                  page={page}
                  onPageChange={setPage}
                  hasMore={all.length >= PAGE_SIZE}
                  totalPages={totalPages}
                  onFindLast={findLastPage}
                  disabled={isFetching}
                />
              </div>
            )}
          </>
        )}
      </section>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="성분 등록"
        subtitle="현재 API에 admin 성분 등록 엔드포인트가 없어 비활성화 상태입니다"
        footer={
          <button
            onClick={() => setAddOpen(false)}
            className="h-10 px-4 rounded-xl bg-primary text-white text-[13px] font-bold"
          >
            확인
          </button>
        }
      >
        <p className="text-[13px] text-text-sub leading-relaxed">
          백엔드에 <code className="font-mono text-primary bg-primary-light px-1.5 py-0.5 rounded">POST /api/products/ingredients/</code> 엔드포인트가 추가되면 사용 가능합니다.
        </p>
      </Modal>
    </div>
  )
}

export default IngredientsView

import { useQuery } from '@tanstack/react-query'
import { TrendingUp, Loader2 } from 'lucide-react'
import { trendingKeywords } from '../api/reviews'

function TopIngredientsCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['trending-keywords-top'],
    queryFn: trendingKeywords,
    staleTime: 1000 * 60 * 5,
  })

  const items = (data?.trending ?? []).slice(0, 6)

  return (
    <div className="bg-card border border-line rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[16px] font-extrabold text-primary-dark">
            인기 검색어 TOP
          </h3>
          <p className="text-[12px] text-text-sub mt-0.5">
            전체 사용자 급상승 검색어
          </p>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full">
          <TrendingUp size={12} /> Live
        </span>
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <Loader2 size={20} className="text-primary animate-spin mx-auto" />
        </div>
      ) : isError ? (
        <p className="py-8 text-center text-[12px] text-danger">
          데이터를 불러올 수 없습니다.
        </p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-[12px] text-text-sub">
          아직 검색 데이터가 없습니다.
        </p>
      ) : (
        <ul className="space-y-3">
          {items.map((item, idx) => (
            <li key={`${item.keyword}-${idx}`} className="flex items-center gap-3 py-1.5">
              <span className="w-6 text-[13px] font-extrabold text-primary">{idx + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-[14px] font-bold text-text-main truncate">{item.keyword}</p>
                <p className="text-[11px] text-text-sub">
                  {item.count.toLocaleString()} 회 검색
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TopIngredientsCard

import { useQuery } from '@tanstack/react-query'
import { Star, Loader2, Package } from 'lucide-react'
import { getTopRatedProducts } from '../api/admin'

function TopRatedProductsCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-top-rated-products'],
    queryFn: () => getTopRatedProducts({ limit: 10, minReviews: 5 }),
    staleTime: 1000 * 60 * 10,
  })

  const items = data?.products ?? []

  return (
    <div className="bg-card border border-line rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[16px] font-extrabold text-primary-dark">평점 높은 제품 TOP 10</h3>
          <p className="text-[12px] text-text-sub mt-0.5">최소 리뷰 5건 이상 기준</p>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-bold text-[#B58900] bg-warning/15 px-2.5 py-1 rounded-full">
          <Star size={11} className="fill-warning" /> Top
        </span>
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <Loader2 size={20} className="text-primary animate-spin mx-auto" />
        </div>
      ) : isError ? (
        <p className="py-8 text-center text-[12px] text-danger">데이터를 불러올 수 없습니다.</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-[12px] text-text-sub">평점 데이터가 없습니다.</p>
      ) : (
        <ul className="space-y-2.5">
          {items.map((p, idx) => (
            <li key={p.product_id} className="flex items-center gap-3 py-1.5 rounded-lg hover:bg-primary-light/30 px-2 -mx-2 transition">
              <span className={`w-7 text-center text-[13px] font-extrabold shrink-0 ${idx < 3 ? 'text-warning' : 'text-text-sub'}`}>
                {idx + 1}
              </span>
              <div className="w-10 h-10 rounded-lg bg-white border border-line/60 grid place-items-center overflow-hidden shrink-0">
                {p.image_url ? (
                  <img src={p.image_url} alt="" className="max-w-full max-h-full object-contain" onError={(e) => (e.currentTarget.style.display = 'none')} />
                ) : (
                  <Package size={16} className="text-primary" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-text-sub truncate">{p.brand_name ?? '-'}</p>
                <p className="text-[13px] font-bold text-text-main truncate">{p.product_name}</p>
              </div>
              <div className="text-right shrink-0">
                <span className="flex items-center gap-1 text-[12px] font-extrabold text-[#B58900] justify-end">
                  <Star size={11} className="fill-warning text-warning" />
                  {Number(p.avg_rating ?? 0).toFixed(1)}
                </span>
                <p className="text-[10px] text-text-sub mt-0.5">{p.review_count}건</p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default TopRatedProductsCard

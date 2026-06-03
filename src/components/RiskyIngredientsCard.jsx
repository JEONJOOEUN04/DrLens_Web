import { useQuery } from '@tanstack/react-query'
import { AlertTriangle, Loader2 } from 'lucide-react'
import { getTopRiskIngredients } from '../api/admin'

function RiskyIngredientsCard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-top-risk-ingredients'],
    queryFn: () => getTopRiskIngredients({ limit: 10, minRiskLevel: 7 }),
    staleTime: 1000 * 60 * 10,
  })

  const items = data?.ingredients ?? []

  return (
    <div className="bg-card border border-line rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[16px] font-extrabold text-primary-dark">위험 성분 TOP 10</h3>
          <p className="text-[12px] text-text-sub mt-0.5">분석 중 검출된 위험 성분 (risk ≥ 7)</p>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-bold text-danger bg-danger/10 px-2.5 py-1 rounded-full">
          <AlertTriangle size={11} /> Risk
        </span>
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <Loader2 size={20} className="text-primary animate-spin mx-auto" />
        </div>
      ) : isError ? (
        <p className="py-8 text-center text-[12px] text-danger">데이터를 불러올 수 없습니다.</p>
      ) : items.length === 0 ? (
        <p className="py-8 text-center text-[12px] text-text-sub">위험 등급 검출 기록이 없습니다.</p>
      ) : (
        <ul className="space-y-2">
          {items.map((ing, idx) => (
            <li key={ing.ingredient_id} className="flex items-center gap-3 py-1.5 rounded-lg hover:bg-primary-light/30 px-2 -mx-2 transition">
              <span className={`w-6 text-center text-[13px] font-extrabold shrink-0 ${idx < 3 ? 'text-danger' : 'text-text-sub'}`}>
                {idx + 1}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[13px] font-bold text-text-main truncate">{ing.ingredient_name_kr}</p>
                <p className="text-[11px] text-text-sub truncate">{ing.ingredient_name_en ?? '-'}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                {ing.allergy_flag && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-danger/10 text-danger">알러지</span>
                )}
                {ing.irritant_flag && (
                  <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-warning/15 text-[#B58900]">자극</span>
                )}
              </div>
              <div className="text-right shrink-0">
                <span className="text-[12px] font-extrabold text-danger">Lv {ing.risk_level}</span>
                {ing.detection_count != null && (
                  <p className="text-[10px] text-text-sub mt-0.5">{ing.detection_count.toLocaleString()}회</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default RiskyIngredientsCard

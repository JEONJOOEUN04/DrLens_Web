import { useQuery } from '@tanstack/react-query'
import { Camera, ChevronRight, Loader2 } from 'lucide-react'
import { getAnalysisHistory } from '../api/analysis'

const trafficStyle = {
  GREEN: 'bg-safe/10 text-safe',
  YELLOW: 'bg-warning/15 text-[#B58900]',
  RED: 'bg-danger/10 text-danger',
}
const trafficLabel = { GREEN: '안전', YELLOW: '주의', RED: '위험' }

function statusFromRisk(risk) {
  if (risk == null) return { style: 'bg-line/40 text-text-sub', label: '-' }
  if (risk <= 3) return { style: trafficStyle.GREEN, label: '안전' }
  if (risk <= 6) return { style: trafficStyle.YELLOW, label: '주의' }
  return { style: trafficStyle.RED, label: '위험' }
}

function RecentAnalysesCard({ user, onViewAll }) {
  const userId = user?.user_id
  const { data, isLoading, isError } = useQuery({
    queryKey: ['my-analysis-history', userId],
    queryFn: () => getAnalysisHistory(userId, { page: 1, size: 5 }),
    enabled: !!userId,
    staleTime: 1000 * 60,
  })

  const rows = data?.history ?? []

  return (
    <div className="bg-card border border-line rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-[16px] font-extrabold text-primary-dark">
            최근 성분 분석 요청
          </h3>
          <p className="text-[12px] text-text-sub mt-0.5">
            로그인한 사용자의 최근 분석 기록
          </p>
        </div>
        <button
          onClick={onViewAll}
          className="text-[12px] font-bold text-primary hover:underline flex items-center gap-0.5"
        >
          전체 보기 <ChevronRight size={14} />
        </button>
      </div>

      {isLoading ? (
        <div className="py-12 text-center">
          <Loader2 size={20} className="text-primary animate-spin mx-auto" />
        </div>
      ) : isError ? (
        <p className="py-8 text-center text-[12px] text-danger">
          분석 기록을 불러올 수 없습니다.
        </p>
      ) : rows.length === 0 ? (
        <p className="py-8 text-center text-[12px] text-text-sub">
          아직 분석 기록이 없습니다.
        </p>
      ) : (
        <table className="w-full text-left">
          <thead>
            <tr className="text-[11px] text-text-sub uppercase tracking-wider">
              <th className="font-semibold pb-3">제품</th>
              <th className="font-semibold pb-3">유형</th>
              <th className="font-semibold pb-3">결과</th>
              <th className="font-semibold pb-3 text-right">시간</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const s = row.traffic_light
                ? { style: trafficStyle[row.traffic_light], label: trafficLabel[row.traffic_light] }
                : statusFromRisk(row.risk_score)
              return (
                <tr
                  key={row.analysis_id}
                  className="border-t border-line text-[13px] hover:bg-primary-light/40 transition"
                >
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-primary-light grid place-items-center text-primary">
                        <Camera size={14} />
                      </div>
                      <div className="leading-tight">
                        <p className="font-bold text-text-main truncate max-w-[260px]">
                          {row.product_name ?? `Product #${row.product_id}`}
                        </p>
                        <p className="text-[11px] text-text-sub truncate max-w-[260px]">
                          {row.summary ?? ''}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-text-sub text-[12px]">
                    {row.analysis_type === 'OCR_ANALYSIS' ? 'OCR' : '제품검색'}
                  </td>
                  <td className="py-3">
                    <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full ${s.style}`}>
                      {s.label}
                    </span>
                  </td>
                  <td className="py-3 text-right text-text-sub font-medium text-[12px]">
                    {row.created_at}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      )}
    </div>
  )
}

export default RecentAnalysesCard

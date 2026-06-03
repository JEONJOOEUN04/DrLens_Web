import { useQuery } from '@tanstack/react-query'
import { ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Loader2, AlertCircle } from 'lucide-react'
import { getAnalysisTraffic } from '../../api/admin'

const COLORS = { GREEN: '#34C759', YELLOW: '#FFCC00', RED: '#FF3B30' }
const LABELS = { GREEN: '안전', YELLOW: '주의', RED: '위험' }

function SafetyDistribution() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-analysis-traffic'],
    queryFn: () => getAnalysisTraffic(),
    staleTime: 1000 * 60 * 5,
  })

  const distribution = data?.distribution ?? []
  const total = data?.total ?? distribution.reduce((s, d) => s + (d.count ?? 0), 0)

  const pieData = distribution.map((d) => ({
    name: LABELS[d.level] ?? d.level,
    key: d.level,
    value: d.count ?? 0,
    color: COLORS[d.level] ?? '#67707B',
    ratio: d.ratio,
  }))

  const greenItem = distribution.find((d) => d.level === 'GREEN')
  const safePct = greenItem
    ? Math.round((greenItem.ratio ?? greenItem.count / Math.max(total, 1)) * 100)
    : 0

  return (
    <div className="bg-card border border-line rounded-2xl p-5">
      <div className="mb-2">
        <h3 className="text-[16px] font-extrabold text-primary-dark">성분 안전도 분포</h3>
        <p className="text-[12px] text-text-sub mt-0.5">
          전체 분석 결과 신호등 기준
        </p>
      </div>

      {isLoading ? (
        <div className="h-48 grid place-items-center">
          <Loader2 size={22} className="text-primary animate-spin" />
        </div>
      ) : isError || total === 0 ? (
        <div className="h-48 grid place-items-center text-center">
          <div>
            <AlertCircle size={20} className="text-text-sub mx-auto mb-1" />
            <p className="text-[12px] text-text-sub">데이터를 불러올 수 없습니다.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="relative h-48 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData.filter((d) => d.value > 0)}
                  dataKey="value"
                  innerRadius={56}
                  outerRadius={80}
                  startAngle={90}
                  endAngle={-270}
                  paddingAngle={2}
                  stroke="none"
                >
                  {pieData.filter((d) => d.value > 0).map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 grid place-items-center pointer-events-none">
              <div className="text-center">
                <p className="text-[11px] text-text-sub">안전 비율</p>
                <p className="text-2xl font-extrabold text-primary-dark">{safePct}%</p>
              </div>
            </div>
          </div>

          <div className="space-y-2.5 mt-2">
            {pieData.map((d) => {
              const pct = Math.round((d.ratio ?? d.value / Math.max(total, 1)) * 100)
              return (
                <div key={d.key} className="flex items-center text-[13px]">
                  <span className="w-2.5 h-2.5 rounded-full mr-2" style={{ background: d.color }} />
                  <span className="text-text-main font-semibold">{d.name}</span>
                  <div className="flex-1 mx-3 h-1.5 rounded-full bg-line/70 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: d.color }} />
                  </div>
                  <span className="text-text-sub font-semibold w-9 text-right">{pct}%</span>
                </div>
              )
            })}
          </div>
        </>
      )}
    </div>
  )
}

export default SafetyDistribution

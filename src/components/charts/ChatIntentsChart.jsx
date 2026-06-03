import { useQuery } from '@tanstack/react-query'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { Loader2, MessageSquareText } from 'lucide-react'
import { getChatIntents } from '../../api/admin'

const PALETTE = ['#306EC7', '#5B9BFF', '#2F374C', '#7BB1FF', '#475569', '#BFD7FF']

const INTENT_LABELS = {
  PRODUCT_RECOMMEND: '제품 추천',
  INGREDIENT_ANALYSIS: '성분 분석',
  SKIN_CARE_TIP: '스킨케어 팁',
  GENERAL_QA: '일반 Q&A',
  ROUTINE: '루틴',
  UNKNOWN: '미분류',
}

function ChatIntentsChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-chat-intents'],
    queryFn: getChatIntents,
    staleTime: 1000 * 60 * 10,
  })

  const distribution = data?.distribution ?? []
  const total = data?.total ?? distribution.reduce((s, d) => s + (d.count ?? 0), 0)

  const pieData = distribution.map((d, idx) => ({
    name: INTENT_LABELS[d.intent] ?? d.intent,
    key: d.intent,
    value: d.count ?? 0,
    ratio: d.ratio,
    color: PALETTE[idx % PALETTE.length],
  }))

  return (
    <div className="bg-card border border-line rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[15px] font-extrabold text-primary-dark">챗봇 인텐트 분포</h3>
          <p className="text-[11px] text-text-sub mt-0.5">{total.toLocaleString()}건 분류</p>
        </div>
        <MessageSquareText size={15} className="text-primary" />
      </div>

      {isLoading ? (
        <div className="h-40 grid place-items-center">
          <Loader2 size={20} className="text-primary animate-spin" />
        </div>
      ) : total === 0 ? (
        <div className="h-40 grid place-items-center text-[12px] text-text-sub">
          데이터 없음
        </div>
      ) : (
        <>
          <div className="h-40">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData.filter((d) => d.value > 0)} dataKey="value" innerRadius={42} outerRadius={68} paddingAngle={1.5} stroke="none">
                  {pieData.filter((d) => d.value > 0).map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E1E1E1', fontSize: 12, fontFamily: 'inherit' }}
                  formatter={(value) => [`${value.toLocaleString()}건`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1 max-h-32 overflow-y-auto">
            {pieData.map((d) => {
              const pct = Math.round((d.ratio ?? d.value / Math.max(total, 1)) * 100)
              return (
                <li key={d.key} className="flex items-center gap-2 text-[11px]">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="font-bold text-text-main flex-1 truncate">{d.name}</span>
                  <span className="text-text-sub shrink-0">{d.value.toLocaleString()}</span>
                  <span className="text-primary font-bold w-9 text-right shrink-0">{pct}%</span>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

export default ChatIntentsChart

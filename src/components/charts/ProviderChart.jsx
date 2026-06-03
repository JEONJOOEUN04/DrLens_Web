import { useQuery } from '@tanstack/react-query'
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts'
import { Loader2, UserCircle2 } from 'lucide-react'
import { getUsersByProvider } from '../../api/admin'

const COLORS = {
  email: '#306EC7',
  kakao: '#FEE500',
  google: '#EA4335',
  apple: '#1B1B1B',
}
const LABELS = {
  email: '이메일',
  kakao: '카카오',
  google: '구글',
  apple: '애플',
}

function ProviderChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-users-by-provider'],
    queryFn: getUsersByProvider,
    staleTime: 1000 * 60 * 10,
  })

  const providers = data?.providers ?? []
  const total = data?.total ?? providers.reduce((s, p) => s + (p.count ?? 0), 0)

  const pieData = providers.map((p) => ({
    name: LABELS[p.provider] ?? p.provider,
    key: p.provider,
    value: p.count ?? 0,
    ratio: p.ratio,
    color: COLORS[p.provider] ?? '#67707B',
  }))

  return (
    <div className="bg-card border border-line rounded-2xl p-5">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-[15px] font-extrabold text-primary-dark">로그인 방식</h3>
          <p className="text-[11px] text-text-sub mt-0.5">{total.toLocaleString()}명 기준</p>
        </div>
        <UserCircle2 size={15} className="text-primary" />
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
                <Pie data={pieData.filter((d) => d.value > 0)} dataKey="value" innerRadius={42} outerRadius={68} paddingAngle={2} stroke="none">
                  {pieData.filter((d) => d.value > 0).map((entry) => (
                    <Cell key={entry.key} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ borderRadius: 12, border: '1px solid #E1E1E1', fontSize: 12, fontFamily: 'inherit' }}
                  formatter={(value) => [`${value.toLocaleString()}명`]}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <ul className="mt-2 space-y-1.5">
            {pieData.map((d) => {
              const pct = Math.round((d.ratio ?? d.value / Math.max(total, 1)) * 100)
              return (
                <li key={d.key} className="flex items-center gap-2 text-[12px]">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ background: d.color }} />
                  <span className="font-bold text-text-main">{d.name}</span>
                  <span className="text-text-sub flex-1 text-right">{d.value.toLocaleString()}명</span>
                  <span className="text-primary font-bold w-10 text-right">{pct}%</span>
                </li>
              )
            })}
          </ul>
        </>
      )}
    </div>
  )
}

export default ProviderChart

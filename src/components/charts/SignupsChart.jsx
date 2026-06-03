import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts'
import { Loader2 } from 'lucide-react'
import { getUsersSignups } from '../../api/admin'

const PERIOD_OPTIONS = [
  { id: 'daily', label: '일별' },
  { id: 'weekly', label: '주별' },
  { id: 'monthly', label: '월별' },
]

function SignupsChart() {
  const [period, setPeriod] = useState('daily')

  const { data, isLoading } = useQuery({
    queryKey: ['admin-signups', period],
    queryFn: () => getUsersSignups({ period }),
    staleTime: 1000 * 60 * 5,
  })

  const chartData = (data?.series ?? []).map((d) => ({
    ...d,
    label: d.date?.slice(5).replace('-', '/') ?? '-',
  }))
  const total = data?.total ?? 0

  return (
    <div className="bg-card border border-line rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-[16px] font-extrabold text-primary-dark">신규 가입 추이</h3>
          <p className="text-[12px] text-text-sub mt-0.5">
            기간 내 신규 가입 {total.toLocaleString()}명
          </p>
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          className="text-[12px] font-semibold text-text-sub bg-bg border border-line rounded-lg px-3 py-1.5 focus:outline-none focus:border-primary cursor-pointer"
        >
          {PERIOD_OPTIONS.map((opt) => (
            <option key={opt.id} value={opt.id}>{opt.label}</option>
          ))}
        </select>
      </div>

      {isLoading ? (
        <div className="h-56 grid place-items-center">
          <Loader2 size={22} className="text-primary animate-spin" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-56 grid place-items-center text-[12px] text-text-sub">
          데이터가 없습니다.
        </div>
      ) : (
        <div className="h-56 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="signupsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#306EC7" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="#306EC7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#E1E1E1" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#67707B', fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#67707B', fontSize: 11 }} width={36} allowDecimals={false} />
              <Tooltip
                cursor={{ stroke: '#306EC7', strokeWidth: 1, strokeDasharray: '4 4' }}
                contentStyle={{ borderRadius: 12, border: '1px solid #E1E1E1', fontSize: 12, fontFamily: 'inherit' }}
                labelStyle={{ color: '#2F374C', fontWeight: 700 }}
              />
              <Area type="monotone" dataKey="count" name="신규 가입" stroke="#306EC7" strokeWidth={2.4} fill="url(#signupsFill)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default SignupsChart

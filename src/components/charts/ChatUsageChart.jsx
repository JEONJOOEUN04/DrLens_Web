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
import { Loader2, MessageSquareText } from 'lucide-react'
import { getChatUsage } from '../../api/admin'

function ChatUsageChart() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-chat-usage'],
    queryFn: () => getChatUsage(),
    staleTime: 1000 * 60 * 5,
  })

  const chartData = (data?.series ?? []).map((d) => ({
    ...d,
    label: d.date?.slice(5).replace('-', '/') ?? '-',
  }))

  const totalSessions = data?.total_sessions ?? 0
  const totalMessages = data?.total_messages ?? 0
  const avgPerSession = data?.avg_messages_per_session ?? 0

  return (
    <div className="bg-card border border-line rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-[16px] font-extrabold text-primary-dark">챗봇 이용 추이</h3>
          <p className="text-[12px] text-text-sub mt-0.5">
            세션 {totalSessions.toLocaleString()} · 메시지 {totalMessages.toLocaleString()} · 세션당 평균 {avgPerSession.toFixed?.(1) ?? avgPerSession}건
          </p>
        </div>
        <span className="flex items-center gap-1 text-[11px] font-bold text-primary bg-primary-light px-2.5 py-1 rounded-full">
          <MessageSquareText size={11} /> Chat
        </span>
      </div>

      {isLoading ? (
        <div className="h-56 grid place-items-center">
          <Loader2 size={22} className="text-primary animate-spin" />
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-56 grid place-items-center text-[12px] text-text-sub">
          챗봇 이용 데이터가 없습니다.
        </div>
      ) : (
        <div className="h-56 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="sessionsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#306EC7" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#306EC7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="msgsFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2F374C" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#2F374C" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke="#E1E1E1" strokeDasharray="3 6" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fill: '#67707B', fontSize: 11 }} />
              <YAxis tickLine={false} axisLine={false} tick={{ fill: '#67707B', fontSize: 11 }} width={36} allowDecimals={false} />
              <Tooltip
                contentStyle={{ borderRadius: 12, border: '1px solid #E1E1E1', fontSize: 12, fontFamily: 'inherit' }}
                labelStyle={{ color: '#2F374C', fontWeight: 700 }}
              />
              <Area type="monotone" dataKey="messages" name="메시지" stroke="#2F374C" strokeWidth={2} fill="url(#msgsFill)" dot={false} />
              <Area type="monotone" dataKey="sessions" name="세션" stroke="#306EC7" strokeWidth={2.4} fill="url(#sessionsFill)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default ChatUsageChart

import { useMemo } from 'react'
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
import { Loader2, AlertCircle } from 'lucide-react'
import { getAnalysisDaily } from '../../api/admin'

function DauChart() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['admin-analysis-daily'],
    queryFn: () => getAnalysisDaily(),
    staleTime: 1000 * 60 * 2,
  })

  const chartData = useMemo(() => {
    const series = data?.series ?? []
    return series.map((d) => ({
      date: d.date,
      label: d.date?.slice(5).replace('-', '/') ?? '-',
      total: d.total ?? (d.ocr ?? 0) + (d.product_search ?? 0),
      ocr: d.ocr ?? 0,
      product_search: d.product_search ?? 0,
    }))
  }, [data])

  const total = chartData.reduce((s, b) => s + b.total, 0)

  return (
    <div className="bg-card border border-line rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-[16px] font-extrabold text-primary-dark">
            일별 분석 추이
          </h3>
          <p className="text-[12px] text-text-sub mt-0.5">
            전체 사용자 OCR + 제품검색 분석 (최근 30일)
          </p>
        </div>
        <div className="flex items-center gap-3 text-[11px] font-semibold">
          <span className="flex items-center gap-1.5 text-text-sub">
            <span className="w-2 h-2 rounded-full bg-primary" />
            전체
          </span>
          <span className="flex items-center gap-1.5 text-text-sub">
            <span className="w-2 h-2 rounded-full bg-primary-dark" />
            OCR
          </span>
        </div>
      </div>

      {isLoading ? (
        <div className="h-72 grid place-items-center">
          <Loader2 size={22} className="text-primary animate-spin" />
        </div>
      ) : isError ? (
        <div className="h-72 grid place-items-center text-center">
          <div>
            <AlertCircle size={22} className="text-danger mx-auto mb-2" />
            <p className="text-[13px] font-bold text-danger">데이터 로딩 실패</p>
            <p className="text-[11px] text-text-sub mt-1">{error?.message}</p>
          </div>
        </div>
      ) : total === 0 ? (
        <div className="h-72 grid place-items-center text-[12px] text-text-sub">
          분석 데이터가 없습니다.
        </div>
      ) : (
        <div className="h-72 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="dauFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#306EC7" stopOpacity={0.28} />
                  <stop offset="100%" stopColor="#306EC7" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="ocrFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#2F374C" stopOpacity={0.18} />
                  <stop offset="100%" stopColor="#2F374C" stopOpacity={0} />
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
              <Area type="monotone" dataKey="total" name="전체 분석" stroke="#306EC7" strokeWidth={2.4} fill="url(#dauFill)" dot={false} activeDot={{ r: 5 }} />
              <Area type="monotone" dataKey="ocr" name="OCR" stroke="#2F374C" strokeWidth={2} fill="url(#ocrFill)" dot={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default DauChart

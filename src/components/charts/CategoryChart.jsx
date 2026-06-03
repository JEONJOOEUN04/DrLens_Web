import { useQuery } from '@tanstack/react-query'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts'
import { Loader2 } from 'lucide-react'
import { getProductsByCategory } from '../../api/admin'

function CategoryChart() {
  // 카테고리별 제품 수 (admin API에서 전체 집계)
  const { data: byCategory, isLoading: fetching } = useQuery({
    queryKey: ['products-by-category'],
    queryFn: () => getProductsByCategory({ limit: 6 }),
    staleTime: 1000 * 60 * 10,
  })

  const data = (byCategory?.distribution ?? []).map((d) => ({
    category: d.category_name,
    count: d.count,
  }))
  const max = data.length ? Math.max(...data.map((d) => d.count)) : 0

  return (
    <div className="bg-card border border-line rounded-2xl p-5">
      <div className="flex items-center justify-between mb-2">
        <div>
          <h3 className="text-[16px] font-extrabold text-primary-dark">
            카테고리별 제품 수
          </h3>
          <p className="text-[12px] text-text-sub mt-0.5">
            DB 등록 제품 기준 (소분류 상위 6개)
          </p>
        </div>
      </div>

      {fetching ? (
        <div className="h-64 grid place-items-center">
          <Loader2 size={22} className="text-primary animate-spin" />
        </div>
      ) : data.length === 0 ? (
        <div className="h-64 grid place-items-center text-[12px] text-text-sub">
          카테고리가 없습니다.
        </div>
      ) : (
        <div className="h-64 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 16, right: 8, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#E1E1E1" strokeDasharray="3 6" vertical={false} />
              <XAxis
                dataKey="category"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#67707B', fontSize: 11 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#67707B', fontSize: 11 }}
                width={40}
              />
              <Tooltip
                cursor={{ fill: '#E6F0FF', opacity: 0.5 }}
                contentStyle={{
                  borderRadius: 12,
                  border: '1px solid #E1E1E1',
                  fontSize: 12,
                  fontFamily: 'inherit',
                }}
                labelStyle={{ color: '#2F374C', fontWeight: 700 }}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                {data.map((d) => (
                  <Cell
                    key={d.category}
                    fill={d.count === max && max > 0 ? '#306EC7' : '#E6F0FF'}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  )
}

export default CategoryChart

import { useState, useEffect } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { Users, Search, Loader2, AlertCircle, Shield, Coins } from 'lucide-react'
import Pagination from '../../components/Pagination'
import SkinTypeChart from '../../components/charts/SkinTypeChart'
import ProviderChart from '../../components/charts/ProviderChart'
import { getUsersList, getUsersCount } from '../../api/admin'

const PAGE_SIZE = 20

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function UsersView() {
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)
  const debouncedQuery = useDebounce(query)

  useEffect(() => { setPage(1) }, [debouncedQuery])

  // 가입자 KPI
  const { data: countData } = useQuery({
    queryKey: ['admin-users-count'],
    queryFn: getUsersCount,
    staleTime: 1000 * 60 * 5,
  })
  const stats = countData?.stats ?? {}

  // 회원 목록
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['admin-users-list', { q: debouncedQuery, page }],
    queryFn: () => getUsersList({ q: debouncedQuery, page, size: PAGE_SIZE }),
    placeholderData: keepPreviousData,
  })
  const users = data?.users ?? []
  const totalPages = data?.total_pages ?? null

  const fmt = (n) => (n != null ? n.toLocaleString() : '-')

  return (
    <div className="space-y-5">
      {/* KPI */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: '전체 가입자', value: fmt(stats.total), sub: '누적' },
          { label: '활성 사용자', value: fmt(stats.active_last_30d), sub: '최근 30일' },
          { label: '휴면', value: fmt(stats.dormant), sub: '30일 미접속' },
          { label: '정지', value: fmt(stats.banned), sub: '비활성 계정' },
        ].map((s) => (
          <div key={s.label} className="bg-card border border-line rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-8 h-8 rounded-lg bg-primary-light grid place-items-center text-primary">
                <Users size={15} />
              </div>
              <p className="text-[12px] text-text-sub font-semibold">{s.label}</p>
            </div>
            <p className="text-[24px] font-extrabold text-primary-dark">{s.value}</p>
            <p className="text-[11px] text-text-sub mt-0.5">{s.sub}</p>
          </div>
        ))}
      </section>

      {/* 분포 차트 */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <SkinTypeChart />
        <ProviderChart />
      </section>

      {/* 회원 목록 */}
      <section className="bg-card border border-line rounded-2xl p-5">
        <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
          <h3 className="text-[15px] font-extrabold text-primary-dark">회원 목록</h3>
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-sub" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="이메일, 닉네임 검색..."
              className="w-full h-10 pl-9 pr-9 rounded-xl bg-bg border border-line text-[13px] placeholder:text-text-sub focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
            />
            {isFetching && (
              <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin" />
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 size={22} className="text-primary animate-spin mx-auto mb-2" />
            <p className="text-[12px] text-text-sub">불러오는 중...</p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center">
            <AlertCircle size={22} className="text-danger mx-auto mb-2" />
            <p className="text-[12px] font-bold text-danger">{error?.message ?? '불러오기 실패'}</p>
          </div>
        ) : users.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-text-sub">회원이 없습니다.</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[11px] text-text-sub uppercase tracking-wider border-b border-line">
                    <th className="font-semibold py-3">회원</th>
                    <th className="font-semibold py-3">피부타입</th>
                    <th className="font-semibold py-3">가입</th>
                    <th className="font-semibold py-3 text-center">리뷰</th>
                    <th className="font-semibold py-3 text-center">좋아요</th>
                    <th className="font-semibold py-3 text-right">포인트</th>
                    <th className="font-semibold py-3 text-right">가입일</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.user_id} className="border-b border-line text-[13px] hover:bg-primary-light/30">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-primary text-white grid place-items-center text-[11px] font-bold shrink-0">
                            {(u.nickname?.[0] ?? u.email?.[0] ?? 'U').toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="font-bold text-text-main truncate flex items-center gap-1">
                              {u.nickname}
                              {u.is_staff && (
                                <Shield size={11} className="text-primary" title="관리자" />
                              )}
                            </p>
                            <p className="text-[11px] text-text-sub truncate">{u.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3">
                        {u.skin_type ? (
                          <span className="text-[11px] font-bold px-2 py-1 rounded-full bg-primary-light text-primary">
                            {u.skin_type_code}
                          </span>
                        ) : (
                          <span className="text-[11px] text-text-sub">미설정</span>
                        )}
                      </td>
                      <td className="py-3">
                        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                          u.provider === 'kakao' ? 'bg-warning/15 text-[#B58900]' : 'bg-bg text-text-sub'
                        }`}>
                          {u.provider === 'kakao' ? '카카오' : '이메일'}
                        </span>
                      </td>
                      <td className="py-3 text-center text-text-main font-semibold">{u.review_count}</td>
                      <td className="py-3 text-center text-text-main font-semibold">{u.like_count}</td>
                      <td className="py-3 text-right">
                        <span className="inline-flex items-center gap-1 font-bold text-primary-dark">
                          <Coins size={12} className="text-warning" />{u.points}
                        </span>
                      </td>
                      <td className="py-3 text-right text-text-sub text-[12px]">
                        {String(u.created_at).slice(0, 10)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex items-center justify-between mt-4 flex-wrap gap-3">
              <p className="text-[12px] text-text-sub">
                전체 {fmt(data?.total_count)}명 · {page}페이지
              </p>
              <Pagination
                page={page}
                onPageChange={setPage}
                hasMore={users.length >= PAGE_SIZE}
                totalPages={totalPages}
                disabled={isFetching}
              />
            </div>
          </>
        )}
      </section>
    </div>
  )
}

export default UsersView

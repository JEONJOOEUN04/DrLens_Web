import { useState, useRef, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import {
  Star,
  MessageSquareText,
  MoreVertical,
  Filter,
  Check,
  Trash2,
  AlertOctagon,
  Loader2,
  AlertCircle,
  Image as ImageIcon,
  Flag,
} from 'lucide-react'
import Pagination from '../../components/Pagination'
import { useToast } from '../../components/Toast'
import { listAdminReviews, moderateReview } from '../../api/admin'

const PAGE_SIZE = 20

const statusBadge = {
  approved: 'bg-safe/10 text-safe',
  pending: 'bg-warning/15 text-[#B58900]',
  rejected: 'bg-danger/10 text-danger',
  reported: 'bg-danger/15 text-danger',
}
const statusLabel = {
  approved: '승인',
  pending: '대기',
  rejected: '반려',
  reported: '신고됨',
}

const statusFilters = [
  { id: 'all', label: '전체' },
  { id: 'approved', label: '승인' },
  { id: 'pending', label: '대기' },
  { id: 'rejected', label: '반려' },
  { id: 'reported', label: '신고' },
]

const sortFilters = [
  { id: 'recent', label: '최신순' },
  { id: 'rating_desc', label: '평점 높은순' },
  { id: 'rating_asc', label: '평점 낮은순' },
  { id: 'reported', label: '신고 많은순' },
]

function Stars({ count = 0 }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={13}
          className={n <= count ? 'fill-warning text-warning' : 'text-line'}
        />
      ))}
    </div>
  )
}

function ReviewsView() {
  const toast = useToast()
  const qc = useQueryClient()
  const [statusFilter, setStatusFilter] = useState('all')
  const [sort, setSort] = useState('recent')
  const [page, setPage] = useState(1)
  const [filterOpen, setFilterOpen] = useState(false)
  const [openMenuId, setOpenMenuId] = useState(null)

  const filterRef = useRef(null)
  const menuRef = useRef(null)

  useEffect(() => {
    setPage(1)
  }, [statusFilter, sort])

  useEffect(() => {
    const handle = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target)) setFilterOpen(false)
      if (menuRef.current && !menuRef.current.contains(e.target)) setOpenMenuId(null)
    }
    document.addEventListener('mousedown', handle)
    return () => document.removeEventListener('mousedown', handle)
  }, [])

  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['admin-reviews', { page, sort, status: statusFilter }],
    queryFn: () =>
      listAdminReviews({ page, size: PAGE_SIZE, sort, status: statusFilter }),
    placeholderData: keepPreviousData,
  })

  const reviews = data?.reviews ?? []
  const totalCount = data?.total_count ?? null
  const totalPages = data?.total_pages ?? null

  const moderate = useMutation({
    mutationFn: ({ id, action, reason }) => moderateReview(id, action, reason),
    onSuccess: (_, { action }) => {
      const label = action === 'approve' ? '승인' : action === 'reject' ? '반려' : '삭제'
      toast(`리뷰 ${label} 완료`)
      qc.invalidateQueries({ queryKey: ['admin-reviews'] })
    },
    onError: (err) => toast(err?.message ?? '처리 실패', { tone: 'error' }),
  })

  const handleAction = (review, action) => {
    setOpenMenuId(null)
    if (action === 'delete') {
      if (!window.confirm('이 리뷰를 삭제하시겠습니까?')) return
    }
    moderate.mutate({ id: review.review_id, action })
  }

  // KPI 계산 (현재 페이지 기준)
  const pendingCount = reviews.filter((r) => r.status === 'pending').length
  const reportedCount = reviews.reduce((s, r) => s + (r.report_count ?? 0), 0)
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + (r.rating ?? 0), 0) / reviews.length).toFixed(1)
    : '-'

  return (
    <div className="space-y-5">
      <section className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Kpi label="전체 리뷰" value={totalCount != null ? totalCount.toLocaleString() : '-'} sub="DB 누적" />
        <Kpi label="평균 별점 (현재 페이지)" value={avgRating} sub="5점 만점" />
        <Kpi label="승인 대기 (현재 페이지)" value={pendingCount} sub="검토 필요" />
        <Kpi label="신고 누적 (현재 페이지)" value={reportedCount} sub="report_count 합계" />
      </section>

      <section className="bg-card border border-line rounded-2xl p-5">
        <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
          <h3 className="text-[16px] font-extrabold text-primary-dark">
            전체 리뷰 모더레이션
          </h3>
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="h-9 px-3 rounded-lg bg-bg border border-line text-[12px] font-semibold text-text-sub focus:outline-none focus:border-primary cursor-pointer"
            >
              {sortFilters.map((s) => (
                <option key={s.id} value={s.id}>{s.label}</option>
              ))}
            </select>
            <div ref={filterRef} className="relative">
              <button
                onClick={() => setFilterOpen((v) => !v)}
                className={`h-9 px-3 rounded-lg border text-[12px] font-semibold flex items-center gap-1.5 transition ${
                  statusFilter !== 'all' || filterOpen
                    ? 'bg-primary-light border-primary text-primary'
                    : 'bg-bg border-line text-text-sub hover:text-primary'
                }`}
              >
                <Filter size={13} /> {statusFilter === 'all' ? '필터' : statusLabel[statusFilter]}
              </button>
              {filterOpen && (
                <div className="absolute right-0 top-11 w-40 bg-card border border-line rounded-xl shadow-lg py-1 z-20">
                  {statusFilters.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => { setStatusFilter(opt.id); setFilterOpen(false) }}
                      className="w-full flex items-center justify-between px-3 py-2 text-[13px] hover:bg-primary-light/50 transition"
                    >
                      <span className={statusFilter === opt.id ? 'font-bold text-primary' : 'text-text-main'}>
                        {opt.label}
                      </span>
                      {statusFilter === opt.id && <Check size={14} className="text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className="py-12 text-center">
            <Loader2 size={22} className="text-primary animate-spin mx-auto mb-2" />
            <p className="text-[13px] text-text-sub">리뷰 불러오는 중...</p>
          </div>
        ) : isError ? (
          <div className="py-12 text-center">
            <AlertCircle size={22} className="text-danger mx-auto mb-2" />
            <p className="text-[13px] font-bold text-danger">
              {error?.response?.status === 403
                ? '관리자 권한이 필요합니다.'
                : error?.message ?? '불러오기 실패'}
            </p>
          </div>
        ) : reviews.length === 0 ? (
          <p className="text-center py-12 text-[13px] text-text-sub">
            표시할 리뷰가 없습니다.
          </p>
        ) : (
          <>
            <ul className="divide-y divide-line">
              {reviews.map((r) => (
                <li key={r.review_id} className="py-4 first:pt-0">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary-light grid place-items-center text-primary text-sm font-bold shrink-0">
                      {(r.nickname?.[0] ?? '?').toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="text-[13px] font-bold text-text-main">
                            {r.nickname || `user#${r.user_id}`}
                          </p>
                          <Stars count={r.rating} />
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${statusBadge[r.status] ?? 'bg-line/40 text-text-sub'}`}>
                            {statusLabel[r.status] ?? r.status}
                          </span>
                          {r.report_count > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded bg-danger/10 text-danger">
                              <Flag size={9} /> {r.report_count}
                            </span>
                          )}
                          {r.image_count > 0 && (
                            <span className="inline-flex items-center gap-0.5 text-[10px] text-text-sub">
                              <ImageIcon size={10} /> {r.image_count}
                            </span>
                          )}
                        </div>
                        <div ref={openMenuId === r.review_id ? menuRef : null} className="relative">
                          <button
                            onClick={() => setOpenMenuId(openMenuId === r.review_id ? null : r.review_id)}
                            disabled={moderate.isPending}
                            className="p-1 rounded-md text-text-sub hover:bg-bg disabled:opacity-50"
                          >
                            <MoreVertical size={14} />
                          </button>
                          {openMenuId === r.review_id && (
                            <div className="absolute right-0 top-7 w-36 bg-card border border-line rounded-xl shadow-lg py-1 z-20">
                              {r.status !== 'approved' && (
                                <button
                                  onClick={() => handleAction(r, 'approve')}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-safe hover:bg-safe/5 text-left"
                                >
                                  <Check size={13} /> 승인
                                </button>
                              )}
                              {r.status !== 'rejected' && (
                                <button
                                  onClick={() => handleAction(r, 'reject')}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-[#B58900] hover:bg-warning/10 text-left"
                                >
                                  <AlertOctagon size={13} /> 반려
                                </button>
                              )}
                              <button
                                onClick={() => handleAction(r, 'delete')}
                                className="w-full flex items-center gap-2 px-3 py-2 text-[12px] font-semibold text-danger hover:bg-danger/5 text-left"
                              >
                                <Trash2 size={13} /> 삭제
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-text-sub mb-1.5 truncate">
                        {r.product_name} · user_id {r.user_id}
                      </p>
                      <p className="text-[13px] text-text-main leading-relaxed">{r.review_text}</p>
                      <div className="flex items-center gap-3 mt-2 text-[11px] text-text-sub">
                        <span className="flex items-center gap-1">
                          <MessageSquareText size={11} /> 리뷰 #{r.review_id}
                        </span>
                        <span>{r.created_at}</span>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>

            <div className="flex items-center justify-between mt-4 flex-wrap gap-3 pt-4 border-t border-line">
              <p className="text-[12px] text-text-sub">
                {page}페이지{totalCount != null && ` · 전체 ${totalCount.toLocaleString()}건`}
              </p>
              <Pagination
                page={page}
                onPageChange={setPage}
                hasMore={reviews.length >= PAGE_SIZE}
                totalPages={totalPages}
                disabled={isFetching || moderate.isPending}
              />
            </div>
          </>
        )}
      </section>
    </div>
  )
}

function Kpi({ label, value, sub }) {
  return (
    <div className="bg-card border border-line rounded-2xl p-5">
      <p className="text-[12px] text-text-sub font-medium">{label}</p>
      <p className="mt-1 text-[24px] font-extrabold text-primary-dark">{value}</p>
      <p className="text-[11px] text-text-sub mt-0.5">{sub}</p>
    </div>
  )
}

export default ReviewsView

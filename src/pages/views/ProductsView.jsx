import { useState, useMemo, useEffect } from 'react'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { Search, Plus, Package, Star, AlertCircle, Loader2 } from 'lucide-react'
import Modal from '../../components/Modal'
import Pagination from '../../components/Pagination'
import { useToast } from '../../components/Toast'
import { listProducts, searchProducts, listCategories, listByCategory } from '../../api/products'

const PAGE_SIZE = 20

// 디바운스 훅
function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function ProductsView() {
  const toast = useToast()
  const [query, setQuery] = useState('')
  const [activeCategoryId, setActiveCategoryId] = useState(null) // null = 전체
  const [page, setPage] = useState(1)
  const [addOpen, setAddOpen] = useState(false)
  const debouncedQuery = useDebounce(query)

  // 검색어/카테고리 변경 시 1페이지로 리셋
  useEffect(() => {
    setPage(1)
  }, [debouncedQuery, activeCategoryId])

  // 카테고리 목록
  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: listCategories,
    staleTime: 1000 * 60 * 30,
  })

  // 카테고리 flatten (대분류 + 소분류)
  const allCategories = useMemo(() => {
    const list = categoriesData?.categories ?? []
    const flat = []
    list.forEach((c) => {
      flat.push({ id: c.category_id, name: c.category_name })
      ;(c.subcategories ?? []).forEach((s) =>
        flat.push({ id: s.category_id, name: s.category_name })
      )
    })
    return flat
  }, [categoriesData])

  // 제품 목록 (검색 / 카테고리 / 전체 분기)
  const { data, isLoading, isError, error, isFetching } = useQuery({
    queryKey: ['products', { q: debouncedQuery, categoryId: activeCategoryId, page }],
    queryFn: async () => {
      if (debouncedQuery) {
        return searchProducts({ q: debouncedQuery, page, size: PAGE_SIZE })
      }
      if (activeCategoryId) {
        return listByCategory(activeCategoryId, { page, size: PAGE_SIZE })
      }
      return listProducts({ page, size: PAGE_SIZE })
    },
    placeholderData: keepPreviousData,
  })

  const products = data?.products ?? []
  const count = data?.count ?? products.length

  // 전체 등록 상품 수 (필터 무관) — 30분 캐싱
  const { data: totalItems, isLoading: totalLoading } = useQuery({
    queryKey: ['products-total-count'],
    queryFn: async () => {
      const SCAN_SIZE = 500
      let p = 1
      let total = 0
      while (p <= 100) {
        const res = await listProducts({ page: p, size: SCAN_SIZE })
        const cnt = res?.products?.length ?? 0
        total += cnt
        if (cnt < SCAN_SIZE) break
        p += 1
      }
      return total
    },
    staleTime: 1000 * 60 * 30,
  })

  // 필터 없을 때만 totalPages를 알 수 있음
  const isFiltered = !!(debouncedQuery || activeCategoryId)
  const totalPages =
    !isFiltered && totalItems
      ? Math.max(1, Math.ceil(totalItems / PAGE_SIZE))
      : null

  // 끝 페이지 탐색: SCAN_SIZE=200으로 빠르게 스캔 (필터 적용 중일 때만 사용됨)
  const findLastPage = async () => {
    const SCAN_SIZE = 200
    const fetchPage = (p) => {
      if (debouncedQuery)
        return searchProducts({ q: debouncedQuery, page: p, size: SCAN_SIZE })
      if (activeCategoryId)
        return listByCategory(activeCategoryId, { page: p, size: SCAN_SIZE })
      return listProducts({ page: p, size: SCAN_SIZE })
    }
    let p = 1
    while (p <= 200) {
      const res = await fetchPage(p)
      const cnt = res?.products?.length ?? 0
      if (cnt < SCAN_SIZE) {
        const total = (p - 1) * SCAN_SIZE + cnt
        return Math.max(1, Math.ceil(total / PAGE_SIZE))
      }
      p += 1
    }
    return Math.ceil((200 * SCAN_SIZE) / PAGE_SIZE)
  }

  return (
    <div className="space-y-5">
      <section className="flex items-center gap-2">
        <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-card border border-line">
          <Package size={15} className="text-primary" />
          <span className="text-[13px]">
            {totalLoading ? (
              <span className="inline-flex items-center gap-1.5 text-text-sub">
                <Loader2 size={12} className="animate-spin" /> 집계 중...
              </span>
            ) : (
              <>
                <strong className="text-primary-dark font-extrabold">
                  {(totalItems ?? 0).toLocaleString()}
                </strong>
                <span className="text-text-sub"> items saved</span>
              </>
            )}
          </span>
        </div>
        {isFiltered && !totalLoading && (
          <div className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary-light text-primary text-[12px] font-bold">
            필터 적용 · 현재 페이지 {count}건
          </div>
        )}
      </section>

      <section className="flex items-center justify-between gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-sub" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="제품명, 브랜드 검색..."
            className="w-full h-10 pl-9 pr-3 rounded-xl bg-card border border-line text-[13px] placeholder:text-text-sub focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
          />
          {isFetching && (
            <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin" />
          )}
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setActiveCategoryId(null)}
            className={`h-9 px-3 rounded-lg text-[12px] font-bold transition ${
              activeCategoryId === null
                ? 'bg-primary text-white'
                : 'bg-card border border-line text-text-sub hover:text-primary'
            }`}
          >
            전체
          </button>
          {allCategories.slice(0, 6).map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategoryId(c.id)}
              className={`h-9 px-3 rounded-lg text-[12px] font-bold transition ${
                activeCategoryId === c.id
                  ? 'bg-primary text-white'
                  : 'bg-card border border-line text-text-sub hover:text-primary'
              }`}
            >
              {c.name}
            </button>
          ))}
          <button
            onClick={() => setAddOpen(true)}
            className="h-9 px-3 rounded-lg bg-primary text-white text-[12px] font-bold flex items-center gap-1 hover:brightness-110"
          >
            <Plus size={14} /> 추가
          </button>
        </div>
      </section>

      {isLoading ? (
        <div className="bg-card border border-line rounded-2xl p-12 text-center">
          <Loader2 size={28} className="text-primary animate-spin mx-auto mb-3" />
          <p className="text-[13px] text-text-sub">제품 불러오는 중...</p>
        </div>
      ) : isError ? (
        <div className="bg-card border border-danger/30 rounded-2xl p-8 text-center">
          <AlertCircle size={28} className="text-danger mx-auto mb-3" />
          <p className="text-[13px] font-bold text-danger mb-1">제품을 불러오지 못했습니다</p>
          <p className="text-[12px] text-text-sub">{error?.message ?? '알 수 없는 오류'}</p>
        </div>
      ) : products.length === 0 ? (
        <div className="bg-card border border-line rounded-2xl p-12 text-center text-[13px] text-text-sub">
          조건에 맞는 제품이 없습니다.
        </div>
      ) : (
        <>
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
            {products.map((p) => (
              <div
                key={p.product_id}
                className="bg-card border border-line rounded-2xl p-4 hover:shadow-[0_12px_28px_-16px_rgba(48,110,199,0.3)] transition"
              >
                <div className="aspect-square rounded-xl bg-white border border-line/60 flex items-center justify-center mb-3 overflow-hidden p-3">
                  {p.image_url ? (
                    <img
                      src={p.image_url}
                      alt={p.product_name}
                      className="max-w-full max-h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none'
                      }}
                    />
                  ) : (
                    <Package size={36} className="text-primary" />
                  )}
                </div>
                <p className="text-[11px] text-text-sub font-semibold mb-1">{p.brand_name}</p>
                <p className="text-[14px] font-bold text-text-main leading-tight line-clamp-2 mb-2 min-h-[34px]">
                  {p.product_name}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-[14px] font-extrabold text-primary-dark">
                    {p.price ? `${p.price.toLocaleString()}원` : '-'}
                  </span>
                  {p.like_count != null && (
                    <span className="flex items-center gap-1 text-[12px] text-text-sub font-semibold">
                      <Star size={12} className="fill-warning text-warning" />
                      {p.like_count}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </section>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <p className="text-[12px] text-text-sub">
              {page}페이지 · {count}건 표시
            </p>
            <Pagination
              page={page}
              onPageChange={setPage}
              hasMore={count >= PAGE_SIZE}
              totalPages={totalPages}
              onFindLast={findLastPage}
              disabled={isFetching}
            />
          </div>
        </>
      )}

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="제품 등록"
        subtitle="현재 API에 admin 제품 등록 엔드포인트가 없어 비활성화 상태입니다"
        footer={
          <button
            onClick={() => setAddOpen(false)}
            className="h-10 px-4 rounded-xl bg-primary text-white text-[13px] font-bold"
          >
            확인
          </button>
        }
      >
        <p className="text-[13px] text-text-sub leading-relaxed">
          백엔드에 <code className="font-mono text-primary bg-primary-light px-1.5 py-0.5 rounded">POST /api/products/</code> 엔드포인트가 추가되면 사용 가능합니다.
        </p>
      </Modal>
    </div>
  )
}

export default ProductsView

import { useState } from 'react'
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Loader2,
} from 'lucide-react'

/**
 * 윈도우(기본 5) 페이지네이션 + 처음/이전/다음/끝 버튼
 *
 * @param {number} page
 * @param {(n:number)=>void} onPageChange
 * @param {boolean} hasMore
 * @param {number} [totalPages]   알면 '끝' 버튼이 즉시 작동
 * @param {() => Promise<number>} [onFindLast]  '끝' 클릭 시 마지막 페이지를 비동기로 탐색하는 콜백 (선택)
 * @param {number} windowSize     기본 5
 * @param {boolean} disabled
 */
function Pagination({
  page,
  onPageChange,
  hasMore,
  totalPages,
  onFindLast,
  windowSize = 5,
  disabled = false,
}) {
  const [findingLast, setFindingLast] = useState(false)

  const windowStart = Math.floor((page - 1) / windowSize) * windowSize + 1
  const fullWindowEnd = windowStart + windowSize - 1

  let windowEnd
  if (totalPages != null) {
    windowEnd = Math.min(fullWindowEnd, totalPages)
  } else {
    windowEnd = hasMore ? fullWindowEnd : page
  }

  const pages = []
  for (let p = windowStart; p <= windowEnd; p++) pages.push(p)

  const canGoFirst = page > 1
  const canGoPrev = windowStart > 1
  const canGoNext =
    totalPages != null ? fullWindowEnd < totalPages : hasMore
  // 끝 버튼: totalPages 있거나 onFindLast 콜백이 있으면 활성
  const canGoLast =
    (totalPages != null && page < totalPages) || (onFindLast && hasMore)

  const handleLast = async () => {
    if (totalPages != null) {
      onPageChange(totalPages)
      return
    }
    if (!onFindLast) return
    setFindingLast(true)
    try {
      const last = await onFindLast()
      if (last && last > 0) onPageChange(last)
    } finally {
      setFindingLast(false)
    }
  }

  const btnBase =
    'h-9 rounded-lg bg-card border border-line text-[12px] font-semibold text-text-sub hover:text-primary hover:border-primary/30 disabled:opacity-40 disabled:cursor-not-allowed transition flex items-center justify-center gap-1'

  return (
    <nav className="flex items-center gap-1.5 flex-wrap" aria-label="페이지네이션">
      <button
        type="button"
        onClick={() => canGoFirst && onPageChange(1)}
        disabled={!canGoFirst || disabled || findingLast}
        className={`${btnBase} px-2.5`}
        title="처음 페이지로"
      >
        <ChevronsLeft size={14} />
        처음
      </button>

      <button
        type="button"
        onClick={() => canGoPrev && onPageChange(windowStart - 1)}
        disabled={!canGoPrev || disabled || findingLast}
        className={`${btnBase} px-2.5`}
        title="이전 윈도우"
      >
        <ChevronLeft size={14} />
        이전
      </button>

      {pages.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => onPageChange(p)}
          disabled={disabled || findingLast}
          aria-current={p === page ? 'page' : undefined}
          className={`w-9 h-9 rounded-lg text-[13px] font-bold transition ${
            p === page
              ? 'bg-primary text-white shadow-[0_4px_12px_-4px_rgba(48,110,199,0.4)]'
              : 'bg-card border border-line text-text-sub hover:text-primary hover:border-primary/30'
          } disabled:opacity-40 disabled:cursor-not-allowed`}
        >
          {p}
        </button>
      ))}

      <button
        type="button"
        onClick={() => canGoNext && onPageChange(windowStart + windowSize)}
        disabled={!canGoNext || disabled || findingLast}
        className={`${btnBase} px-2.5`}
        title="다음 윈도우"
      >
        다음
        <ChevronRight size={14} />
      </button>

      <button
        type="button"
        onClick={handleLast}
        disabled={!canGoLast || disabled || findingLast}
        className={`${btnBase} px-2.5`}
        title={
          totalPages != null
            ? `마지막 페이지(${totalPages})로`
            : onFindLast
            ? '마지막 페이지 찾기'
            : '마지막 페이지를 알 수 없습니다'
        }
      >
        {findingLast ? (
          <>
            <Loader2 size={13} className="animate-spin" />
            검색
          </>
        ) : (
          <>
            끝
            <ChevronsRight size={14} />
          </>
        )}
      </button>
    </nav>
  )
}

export default Pagination

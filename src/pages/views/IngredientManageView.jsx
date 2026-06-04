import { useState, useEffect } from 'react'
import { useQuery, keepPreviousData, useQueryClient } from '@tanstack/react-query'
import {
  Search, Package, Camera, Image as ImageIcon, FlaskConical,
  CheckCircle2, Loader2, AlertCircle, ChevronRight,
} from 'lucide-react'
import { useToast } from '../../components/Toast'
import { searchProducts, listProducts, scanIngredient, getProductIngredients } from '../../api/products'

function useDebounce(value, delay = 350) {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay)
    return () => clearTimeout(t)
  }, [value, delay])
  return debounced
}

function IngredientManageView() {
  const toast = useToast()
  const queryClient = useQueryClient()

  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query)
  const [selected, setSelected] = useState(null) // 선택된 제품

  // 사진/등록 상태
  const [preview, setPreview] = useState(null)
  const [file, setFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)

  // 제품 검색
  const { data, isFetching } = useQuery({
    queryKey: ['ing-manage-products', debouncedQuery],
    queryFn: () =>
      debouncedQuery
        ? searchProducts({ q: debouncedQuery, page: 1, size: 20 })
        : listProducts({ page: 1, size: 20 }),
    placeholderData: keepPreviousData,
  })
  const products = data?.products ?? []

  // 선택된 제품의 현재 확정 성분
  const { data: ingData, isLoading: ingLoading } = useQuery({
    queryKey: ['product-ingredients', selected?.product_id],
    queryFn: () => getProductIngredients(selected.product_id),
    enabled: !!selected,
  })
  const ingredients = ingData?.ingredients ?? []

  const selectProduct = (p) => {
    setSelected(p)
    setFile(null)
    setPreview(null)
    setResult(null)
  }

  const pickFile = (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    setFile(f)
    setResult(null)
    setPreview(URL.createObjectURL(f))
  }

  const submit = async () => {
    if (!selected) {
      toast('먼저 제품을 선택해주세요.', { tone: 'error' })
      return
    }
    if (!file) {
      toast('성분표 사진을 선택해주세요.', { tone: 'error' })
      return
    }
    setLoading(true)
    try {
      const res = await scanIngredient(selected.product_id, { file, isAdmin: true })
      setResult(res)
      toast(`성분 ${res.detected_count}개 인식 · ${res.newly_confirmed}개 확정`)
      queryClient.invalidateQueries({ queryKey: ['product-ingredients', selected.product_id] })
    } catch (err) {
      toast(err?.message ?? '등록에 실패했습니다.', { tone: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-5">
      {/* 안내 */}
      <section className="bg-primary-light/40 border border-primary/20 rounded-2xl p-4">
        <p className="text-[13px] font-bold text-primary-dark mb-1">성분 등록 안내</p>
        <p className="text-[12px] text-text-sub leading-relaxed">
          제품을 선택한 뒤 성분표 사진을 촬영하거나 업로드하면, OCR이 성분을 추출해 제품에 연결합니다.
          2명 이상이 등록한 성분만 제품 성분으로 확정됩니다. (관리자 등록은 즉시 반영)
        </p>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* ===== 왼쪽: 제품 검색/선택 ===== */}
        <section className="bg-card border border-line rounded-2xl p-5">
          <h3 className="text-[15px] font-extrabold text-primary-dark mb-3">1. 제품 선택</h3>
          <div className="relative mb-3">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-sub" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="제품명, 브랜드 검색..."
              className="w-full h-10 pl-9 pr-9 rounded-xl bg-bg border border-line text-[13px] placeholder:text-text-sub focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary-light"
            />
            {isFetching && (
              <Loader2 size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary animate-spin" />
            )}
          </div>

          <div className="max-h-[420px] overflow-y-auto divide-y divide-line">
            {products.length === 0 ? (
              <p className="py-8 text-center text-[13px] text-text-sub">제품이 없습니다.</p>
            ) : (
              products.map((p) => {
                const active = selected?.product_id === p.product_id
                return (
                  <button
                    key={p.product_id}
                    onClick={() => selectProduct(p)}
                    className={`w-full flex items-center gap-3 px-2 py-2.5 text-left transition rounded-lg ${
                      active ? 'bg-primary-light' : 'hover:bg-bg'
                    }`}
                  >
                    <div className="w-11 h-11 rounded-lg bg-white border border-line/60 grid place-items-center overflow-hidden shrink-0 p-1">
                      {p.image_url ? (
                        <img src={p.image_url} alt="" className="max-w-full max-h-full object-contain"
                          onError={(e) => { e.currentTarget.style.display = 'none' }} />
                      ) : (
                        <Package size={18} className="text-primary" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-[11px] text-text-sub font-semibold">{p.brand_name}</p>
                      <p className="text-[13px] font-bold text-text-main truncate">{p.product_name}</p>
                    </div>
                    <ChevronRight size={16} className={active ? 'text-primary' : 'text-text-sub'} />
                  </button>
                )
              })
            )}
          </div>
        </section>

        {/* ===== 오른쪽: 사진 등록 + 현재 성분 ===== */}
        <section className="bg-card border border-line rounded-2xl p-5">
          <h3 className="text-[15px] font-extrabold text-primary-dark mb-3">2. 성분표 사진 등록</h3>

          {!selected ? (
            <div className="py-16 text-center text-text-sub">
              <FlaskConical size={28} className="mx-auto mb-2 opacity-40" />
              <p className="text-[13px]">왼쪽에서 제품을 먼저 선택해주세요.</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-bg border border-line">
                <Package size={15} className="text-primary shrink-0" />
                <p className="text-[13px] font-bold text-text-main truncate">{selected.product_name}</p>
              </div>

              {/* 미리보기 */}
              <div className="aspect-video rounded-xl bg-bg border border-line/60 grid place-items-center overflow-hidden">
                {preview ? (
                  <img src={preview} alt="미리보기" className="max-w-full max-h-full object-contain" />
                ) : (
                  <div className="text-center text-text-sub">
                    <ImageIcon size={26} className="mx-auto mb-2 opacity-50" />
                    <p className="text-[12px]">성분표가 잘 보이는 사진을 등록해주세요</p>
                  </div>
                )}
              </div>

              {/* 촬영 / 갤러리 */}
              <div className="grid grid-cols-2 gap-3">
                <label className="h-11 rounded-xl bg-primary-light text-primary text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:brightness-105">
                  <Camera size={16} /> 사진 촬영
                  <input type="file" accept="image/*" capture="environment" className="hidden" onChange={pickFile} />
                </label>
                <label className="h-11 rounded-xl bg-bg border border-line text-text-main text-[13px] font-bold flex items-center justify-center gap-1.5 cursor-pointer hover:border-primary/40">
                  <ImageIcon size={16} /> 갤러리 선택
                  <input type="file" accept="image/*" className="hidden" onChange={pickFile} />
                </label>
              </div>

              <button
                onClick={submit}
                disabled={loading || !file}
                className="w-full h-11 rounded-xl bg-primary text-white text-[13px] font-bold flex items-center justify-center gap-1.5 disabled:opacity-40 hover:brightness-110"
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <FlaskConical size={15} />}
                OCR 성분 분석 등록
              </button>

              {result && (
                <div className="rounded-xl bg-safe/10 border border-safe/30 p-3.5">
                  <p className="flex items-center gap-1.5 text-[13px] font-bold text-safe mb-1">
                    <CheckCircle2 size={15} /> 등록 완료
                  </p>
                  <p className="text-[12px] text-text-sub">
                    인식 {result.detected_count}개 · 확정 {result.newly_confirmed}개
                  </p>
                </div>
              )}

              {/* 현재 확정 성분 */}
              <div className="pt-3 border-t border-line">
                <p className="text-[12px] font-bold text-text-main mb-2">
                  현재 등록된 성분 {ingLoading ? '' : `(${ingredients.length})`}
                </p>
                {ingLoading ? (
                  <Loader2 size={16} className="animate-spin text-primary" />
                ) : ingredients.length === 0 ? (
                  <p className="text-[12px] text-text-sub">아직 확정된 성분이 없습니다.</p>
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {ingredients.map((ing) => (
                      <span key={ing.ingredient_id}
                        className="text-[11px] font-semibold px-2 py-1 rounded-lg bg-bg border border-line text-text-main">
                        {ing.ingredient_name_kr}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  )
}

export default IngredientManageView

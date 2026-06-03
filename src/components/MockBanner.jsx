import { Info } from 'lucide-react'

function MockBanner({ endpoint, note }) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-warning/10 border border-warning/30">
      <Info size={16} className="text-[#B58900] shrink-0 mt-0.5" />
      <div className="flex-1">
        <p className="text-[12px] font-bold text-[#B58900]">
          이 페이지는 현재 더미 데이터로 동작합니다
        </p>
        <p className="text-[11px] text-[#B58900]/90 mt-0.5 leading-relaxed">
          백엔드에 <code className="font-mono bg-warning/15 px-1.5 py-0.5 rounded text-[10px]">{endpoint}</code> 같은
          admin 전용 엔드포인트가 추가되면 실제 데이터로 교체됩니다.
          {note && <span className="block mt-1">{note}</span>}
        </p>
      </div>
    </div>
  )
}

export default MockBanner

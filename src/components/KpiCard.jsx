import { ArrowUpRight, ArrowDownRight } from 'lucide-react'

function KpiCard({ icon: Icon, label, value, delta, deltaType = 'up', caption }) {
  const positive = deltaType === 'up'

  return (
    <div className="bg-card border border-line rounded-2xl p-5 shadow-[0_8px_16px_-12px_rgba(48,110,199,0.15)]">
      <div className="flex items-start justify-between">
        <div className="w-10 h-10 rounded-xl bg-primary-light grid place-items-center text-primary">
          <Icon size={20} strokeWidth={2.2} />
        </div>
        {delta && (
          <span
            className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-1 rounded-full ${
              positive
                ? 'bg-safe/10 text-safe'
                : 'bg-danger/10 text-danger'
            }`}
          >
            {positive ? <ArrowUpRight size={12} /> : <ArrowDownRight size={12} />}
            {delta}
          </span>
        )}
      </div>

      <p className="mt-5 text-[13px] text-text-sub font-medium">{label}</p>
      <p className="mt-1 text-[28px] font-extrabold text-primary-dark tracking-tight">
        {value}
      </p>
      {caption && (
        <p className="mt-1 text-[11px] text-text-sub">{caption}</p>
      )}
    </div>
  )
}

export default KpiCard

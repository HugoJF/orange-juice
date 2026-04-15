interface ResultCardProps {
  label: string
  sublabel?: string
  value: string
  unit: string
  variant?: 'good' | 'warning' | 'danger' | 'neutral'
}

const valueColors = {
  good: 'text-emerald-600',
  warning: 'text-amber-500',
  danger: 'text-red-500',
  neutral: 'text-gray-800',
}

export default function ResultCard({ label, sublabel, value, unit, variant = 'neutral' }: ResultCardProps) {
  return (
    <div className="rounded-xl bg-gray-50 px-3 py-4 flex flex-col items-center text-center gap-0.5">
      <span className={`text-2xl font-bold tabular-nums leading-none ${valueColors[variant]}`}>
        {value}
      </span>
      <span className="text-xs text-gray-400 font-medium">{unit}</span>
      <span className="mt-1.5 text-xs font-semibold text-gray-600 leading-tight">{label}</span>
      {sublabel && <span className="text-xs text-gray-400 leading-tight">{sublabel}</span>}
    </div>
  )
}

interface BreakevenSectionProps {
  currency: string
  machineCost: number
  rawBreakevenWeeks: number | null
  rawBreakevenLitres: number | null
  rawBreakevenKg: number | null
  trueBreakevenWeeks: number | null
  trueBreakevenLitres: number | null
  trueBreakevenKg: number | null
}

interface RowProps {
  label: string
  sublabel: string
  weeks: number | null
  litres: number | null
  kg: number | null
}

function BreakevenRow({ label, sublabel, weeks, litres, kg }: RowProps) {
  const neverPaysOff = weeks === null

  return (
    <div className="flex gap-3.5">
      <div
        className={`mt-0.5 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
          neverPaysOff ? 'bg-amber-100 text-amber-500' : 'bg-emerald-100 text-emerald-600'
        }`}
      >
        {neverPaysOff ? '–' : '✓'}
      </div>
      <div>
        <p className="text-sm font-semibold text-gray-800">{label}</p>
        <p className="text-xs text-gray-400">{sublabel}</p>
        {neverPaysOff ? (
          <p className="mt-1 text-sm text-amber-500">
            Não se paga — seu tempo custa mais do que a economia.
          </p>
        ) : (
          <p className="mt-1 text-sm text-gray-700">
            Após{' '}
            <span className="font-semibold tabular-nums text-gray-900">{weeks!.toFixed(1)} semanas</span>
            <span className="text-gray-300 mx-1.5">·</span>
            <span className="tabular-nums">{litres!.toFixed(1)} L</span>
            <span className="text-gray-300 mx-1.5">·</span>
            <span className="tabular-nums">{kg!.toFixed(1)} kg</span>
          </p>
        )}
      </div>
    </div>
  )
}

export default function BreakevenSection({
  currency,
  machineCost,
  rawBreakevenWeeks,
  rawBreakevenLitres,
  rawBreakevenKg,
  trueBreakevenWeeks,
  trueBreakevenLitres,
  trueBreakevenKg,
}: BreakevenSectionProps) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-100 flex items-center gap-2">
        <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Retorno da máquina</h2>
        <span className="text-xs text-gray-300">—</span>
        <span className="text-xs text-gray-400">
          {currency}
          {machineCost.toFixed(0)} espremedor
        </span>
      </div>
      <div className="px-6 py-5 space-y-5">
        <BreakevenRow
          label="Só o custo da fruta"
          sublabel="Sem contar seu tempo — fruta vs. industrializado"
          weeks={rawBreakevenWeeks}
          litres={rawBreakevenLitres}
          kg={rawBreakevenKg}
        />
        <div className="border-t border-gray-100" />
        <BreakevenRow
          label="Custo real"
          sublabel="Contando seu tempo pelo valor da hora"
          weeks={trueBreakevenWeeks}
          litres={trueBreakevenLitres}
          kg={trueBreakevenKg}
        />
      </div>
    </div>
  )
}

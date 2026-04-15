import { useState } from 'react'
import NumberInput from './components/NumberInput'
import BreakevenSection from './components/BreakevenSection'

interface Inputs {
  currency: string
  batchCost: number
  kgPerBatch: number
  efficiencyLPerKg: number
  storePricePerL: number
  timeMins: number
  hourlyRate: number
  machineCost: number
  batchesPerWeek: number
}

// Defaults from real-world data: 3kg oranges @ R$8.65 → 1.74L per saco
const DEFAULT_NUMBERS: Omit<Inputs, 'currency'> = {
  batchCost: 8.65,
  kgPerBatch: 3,
  efficiencyLPerKg: 0.58,
  storePricePerL: 17.76,
  timeMins: 14,
  hourlyRate: 50,
  machineCost: 189,
  batchesPerWeek: 1,
}

function detectCurrencySymbol(): string {
  try {
    const locale = navigator.language
    const countryCode = locale.split('-')[1]?.toUpperCase()
    const map: Record<string, string> = {
      US: 'USD', GB: 'GBP', AU: 'AUD', CA: 'CAD', NZ: 'NZD',
      DE: 'EUR', FR: 'EUR', IT: 'EUR', ES: 'EUR', PT: 'EUR', NL: 'EUR',
      BR: 'BRL', MX: 'MXN', AR: 'ARS', CL: 'CLP', CO: 'COP', PE: 'PEN',
      JP: 'JPY', CN: 'CNY', KR: 'KRW', IN: 'INR', SG: 'SGD', HK: 'HKD',
      CH: 'CHF', SE: 'SEK', NO: 'NOK', DK: 'DKK', PL: 'PLN',
      ZA: 'ZAR', NG: 'NGN', KE: 'KES',
    }
    const currency = map[countryCode ?? ''] ?? 'USD'
    const parts = new Intl.NumberFormat(locale, { style: 'currency', currency }).formatToParts(1)
    return parts.find((p) => p.type === 'currency')?.value ?? '$'
  } catch {
    return '$'
  }
}

function calc(i: Inputs) {
  const litresPerBatch = i.kgPerBatch * i.efficiencyLPerKg
  const rawCostPerL = litresPerBatch > 0 ? i.batchCost / litresPerBatch : 0
  const labourPerBatch = (i.timeMins / 60) * i.hourlyRate
  const labourPerL = litresPerBatch > 0 ? labourPerBatch / litresPerBatch : 0
  const trueCostPerL = rawCostPerL + labourPerL

  const rawSavingsPct = i.storePricePerL > 0 ? ((i.storePricePerL - rawCostPerL) / i.storePricePerL) * 100 : 0
  const trueSavingsPct = i.storePricePerL > 0 ? ((i.storePricePerL - trueCostPerL) / i.storePricePerL) * 100 : 0

  const weeklyLitres = i.batchesPerWeek * litresPerBatch
  const weeklyRawSaving = (i.storePricePerL - rawCostPerL) * weeklyLitres
  const weeklyTrueSaving = (i.storePricePerL - trueCostPerL) * weeklyLitres

  const rawBreakevenWeeks = weeklyRawSaving > 0 ? i.machineCost / weeklyRawSaving : null
  const trueBreakevenWeeks = weeklyTrueSaving > 0 ? i.machineCost / weeklyTrueSaving : null

  return {
    rawCostPerL,
    trueCostPerL,
    litresPerBatch,
    rawSavingsPct,
    trueSavingsPct,
    weeklyLitres,
    rawBreakevenWeeks,
    rawBreakevenLitres: rawBreakevenWeeks !== null ? rawBreakevenWeeks * weeklyLitres : null,
    rawBreakevenKg: rawBreakevenWeeks !== null ? rawBreakevenWeeks * i.batchesPerWeek * i.kgPerBatch : null,
    trueBreakevenWeeks,
    trueBreakevenLitres: trueBreakevenWeeks !== null ? trueBreakevenWeeks * weeklyLitres : null,
    trueBreakevenKg: trueBreakevenWeeks !== null ? trueBreakevenWeeks * i.batchesPerWeek * i.kgPerBatch : null,
  }
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{children}</p>
  )
}

interface ResultRowProps {
  label: string
  sublabel?: string
  value: string
  badge?: string
  badgeVariant?: 'good' | 'warning' | 'neutral'
}

function ResultRow({ label, sublabel, value, badge, badgeVariant = 'neutral' }: ResultRowProps) {
  const badgeColors = {
    good: 'text-emerald-600',
    warning: 'text-amber-500',
    neutral: 'text-gray-400',
  }
  return (
    <div className="flex items-center justify-between py-3">
      <div>
        <p className="text-sm font-medium text-gray-800">{label}</p>
        {sublabel && <p className="text-xs text-gray-400">{sublabel}</p>}
      </div>
      <div className="text-right">
        <p className="text-base font-bold tabular-nums text-gray-900">{value}</p>
        {badge && <p className={`text-xs font-medium ${badgeColors[badgeVariant]}`}>{badge}</p>}
      </div>
    </div>
  )
}

export default function App() {
  const [inputs, setInputs] = useState<Inputs>({
    currency: detectCurrencySymbol(),
    ...DEFAULT_NUMBERS,
  })
  const results = calc(inputs)
  const { currency } = inputs

  function setNum(key: Exclude<keyof Inputs, 'currency'>) {
    return (val: number) => setInputs((prev) => ({ ...prev, [key]: val }))
  }

  function savingsBadge(pct: number): string {
    if (pct > 0) return `${pct.toFixed(0)}% mais barato`
    if (pct < 0) return `${Math.abs(pct).toFixed(0)}% mais caro`
    return 'igual'
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-2xl mx-auto px-4 py-10 space-y-5">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">🍊 Calculadora de Suco</h1>
          <p className="mt-1 text-gray-500 text-sm">Vale a pena espremer seu próprio suco?</p>
        </div>

        {/* Inputs */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Configuração</h2>
            <input
              type="text"
              value={currency}
              onChange={(e) => setInputs((prev) => ({ ...prev, currency: e.target.value }))}
              title="Símbolo da moeda"
              className="w-14 h-7 border border-gray-200 rounded-md px-2 text-sm text-gray-700 text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="px-6 py-5 space-y-6">

            {/* Laranjas */}
            <div>
              <SectionLabel>Laranjas</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <NumberInput
                  label="Custo do saco"
                  value={inputs.batchCost}
                  onChange={setNum('batchCost')}
                  prefix={currency}
                  step={0.01}
                />
                <NumberInput
                  label="Kg por saco"
                  value={inputs.kgPerBatch}
                  onChange={setNum('kgPerBatch')}
                  suffix="kg"
                  step={0.5}
                />
                <NumberInput
                  label="Rendimento"
                  value={inputs.efficiencyLPerKg}
                  onChange={setNum('efficiencyLPerKg')}
                  suffix="L / kg"
                  step={0.01}
                />
              </div>
            </div>

            <div className="border-t border-gray-100 -mx-6" />

            {/* Suco industrializado */}
            <div>
              <SectionLabel>Suco industrializado</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberInput
                  label="Preço por litro"
                  value={inputs.storePricePerL}
                  onChange={setNum('storePricePerL')}
                  prefix={currency}
                  suffix="/ L"
                  step={0.01}
                />
              </div>
            </div>

            <div className="border-t border-gray-100 -mx-6" />

            {/* Seu tempo */}
            <div>
              <SectionLabel>Seu tempo</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberInput
                  label="Tempo por saco"
                  value={inputs.timeMins}
                  onChange={setNum('timeMins')}
                  suffix="min"
                  step={1}
                />
                <NumberInput
                  label="Valor da hora"
                  value={inputs.hourlyRate}
                  onChange={setNum('hourlyRate')}
                  prefix={currency}
                  suffix="/ h"
                  step={1}
                />
              </div>
            </div>

            <div className="border-t border-gray-100 -mx-6" />

            {/* Máquina */}
            <div>
              <SectionLabel>Máquina</SectionLabel>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <NumberInput
                  label="Custo do espremedor"
                  value={inputs.machineCost}
                  onChange={setNum('machineCost')}
                  prefix={currency}
                  step={1}
                />
                <NumberInput
                  label="Sacos por semana"
                  value={inputs.batchesPerWeek}
                  onChange={setNum('batchesPerWeek')}
                  suffix="× / sem"
                  step={1}
                  min={0.1}
                />
              </div>
            </div>

          </div>
        </div>

        {/* Resultado */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-widest">Resultado</h2>
          </div>
          <div className="px-6 divide-y divide-gray-100">
            <ResultRow
              label="Custo bruto"
              sublabel="só fruta"
              value={`${currency} ${results.rawCostPerL.toFixed(2)}/L`}
              badge={savingsBadge(results.rawSavingsPct)}
              badgeVariant={results.rawSavingsPct > 0 ? 'good' : 'warning'}
            />
            <ResultRow
              label="Custo real"
              sublabel="incluindo mão de obra"
              value={`${currency} ${results.trueCostPerL.toFixed(2)}/L`}
              badge={savingsBadge(results.trueSavingsPct)}
              badgeVariant={results.trueSavingsPct > 0 ? 'good' : 'warning'}
            />
            <ResultRow
              label="Industrializado"
              value={`${currency} ${inputs.storePricePerL.toFixed(2)}/L`}
              badgeVariant="neutral"
            />
            <ResultRow
              label="Produção semanal"
              value={`${results.weeklyLitres.toFixed(2)} L`}
              badgeVariant="neutral"
            />
          </div>
        </div>

        {/* Retorno */}
        <BreakevenSection
          currency={currency}
          machineCost={inputs.machineCost}
          rawBreakevenWeeks={results.rawBreakevenWeeks}
          rawBreakevenLitres={results.rawBreakevenLitres}
          rawBreakevenKg={results.rawBreakevenKg}
          trueBreakevenWeeks={results.trueBreakevenWeeks}
          trueBreakevenLitres={results.trueBreakevenLitres}
          trueBreakevenKg={results.trueBreakevenKg}
        />

        <p className="text-center text-xs text-gray-400 pb-4">
          Todos os cálculos rodam no seu navegador — nenhum dado é enviado a lugar nenhum.
        </p>
      </div>
    </div>
  )
}

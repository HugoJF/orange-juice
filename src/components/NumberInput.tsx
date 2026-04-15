interface NumberInputProps {
  label: string
  value: number
  onChange: (val: number) => void
  prefix?: string
  suffix?: string
  step?: number
  min?: number
}

export default function NumberInput({
  label,
  value,
  onChange,
  prefix,
  suffix,
  step = 0.01,
  min = 0,
}: NumberInputProps) {
  const hasPrefix = Boolean(prefix)
  const hasSuffix = Boolean(suffix)

  return (
    <div>
      <label className="block text-sm font-medium text-gray-600 mb-1.5">{label}</label>
      <div className="flex">
        {hasPrefix && (
          <span className="inline-flex items-center px-3 border border-gray-200 rounded-l-lg bg-gray-50 text-gray-500 text-sm select-none shrink-0">
            {prefix}
          </span>
        )}
        <input
          type="number"
          value={value}
          onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
          step={step}
          min={min}
          className={[
            'block w-full border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:z-10',
            !hasPrefix && !hasSuffix ? 'rounded-lg' : '',
            hasPrefix && !hasSuffix ? '-ml-px rounded-r-lg' : '',
            !hasPrefix && hasSuffix ? 'rounded-l-lg' : '',
            hasPrefix && hasSuffix ? '-ml-px rounded-none' : '',
          ]
            .filter(Boolean)
            .join(' ')}
        />
        {hasSuffix && (
          <span className="-ml-px inline-flex items-center px-3 border border-gray-200 rounded-r-lg bg-gray-50 text-gray-500 text-sm select-none whitespace-nowrap shrink-0">
            {suffix}
          </span>
        )}
      </div>
    </div>
  )
}

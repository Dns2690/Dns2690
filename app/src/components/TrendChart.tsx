import { useRef, useState } from 'react'

interface Point {
  date: string
  value: number
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

export default function TrendChart({
  series,
  unit,
  accent = '#22d3ee',
}: {
  series: Point[]
  unit: string
  /** Color del módulo dueño del gráfico. Por defecto el cyan de Medidas. */
  accent?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [activeIndex, setActiveIndex] = useState(series.length - 1)

  if (series.length === 0) {
    return <p className="py-10 text-center text-sm text-gray-500">Todavía no hay datos suficientes.</p>
  }

  if (series.length === 1) {
    return (
      <div className="py-6 text-center">
        <p className="text-3xl font-bold text-gray-100">
          {series[0].value}
          <span className="ml-1 text-base font-normal text-gray-500">{unit}</span>
        </p>
        <p className="mt-1 text-xs text-gray-500">{formatDate(series[0].date)} · una sola medición por ahora</p>
      </div>
    )
  }

  const W = 300
  const H = 140
  const padTop = 12
  const padBottom = 12

  const values = series.map((p) => p.value)
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = series.map((p, i) => ({
    x: (i / (series.length - 1)) * W,
    y: padTop + (H - padTop - padBottom) * (1 - (p.value - min) / range),
  }))

  const linePoints = points.map((p) => `${p.x},${p.y}`).join(' ')
  const areaPoints = `0,${H} ${linePoints} ${W},${H}`
  const active = points[activeIndex]
  const activePoint = series[activeIndex]

  function handlePick(clientX: number) {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    setActiveIndex(Math.round(fraction * (series.length - 1)))
  }

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <p className="text-3xl font-bold text-gray-100">
          {activePoint.value}
          <span className="ml-1 text-base font-normal text-gray-500">{unit}</span>
        </p>
        <p className="text-xs text-gray-500">{formatDate(activePoint.date)}</p>
      </div>

      <div
        ref={containerRef}
        className="relative mt-4 h-[140px] w-full"
        onClick={(e) => handlePick(e.clientX)}
        onTouchStart={(e) => handlePick(e.touches[0].clientX)}
      >
        <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full" preserveAspectRatio="none">
          <line x1={0} y1={padTop} x2={W} y2={padTop} stroke="#ffffff" strokeOpacity={0.08} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <line x1={0} y1={H - padBottom} x2={W} y2={H - padBottom} stroke="#ffffff" strokeOpacity={0.08} strokeWidth={1} vectorEffect="non-scaling-stroke" />
          <line
            x1={active.x}
            y1={0}
            x2={active.x}
            y2={H}
            stroke="#ffffff"
            strokeOpacity={0.15}
            strokeWidth={1}
            vectorEffect="non-scaling-stroke"
          />
          <polygon points={areaPoints} fill={accent} fillOpacity={0.1} stroke="none" />
          <polyline
            points={linePoints}
            fill="none"
            stroke={accent}
            strokeWidth={2}
            strokeLinejoin="round"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>
        {points.map((p, i) => (
          <span
            key={i}
            className={`absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${
              i === activeIndex ? 'h-3 w-3 ring-2 ring-[#0b0d12]' : 'h-1.5 w-1.5'
            }`}
            style={{
              left: `${(p.x / W) * 100}%`,
              top: `${(p.y / H) * 100}%`,
              background: accent,
              opacity: i === activeIndex ? 1 : 0.5,
            }}
          />
        ))}
      </div>

      <div className="mt-1 flex justify-between text-[11px] text-gray-500">
        <span>{formatDate(series[0].date)}</span>
        <span>{formatDate(series[series.length - 1].date)}</span>
      </div>
    </div>
  )
}

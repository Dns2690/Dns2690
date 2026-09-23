import { useId, useRef, useState } from 'react'

interface Point {
  date: string
  value: number
}

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatShort(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' })
}

/**
 * Evolución de una sola medida, al estilo de la app Salud.
 *
 * Una sola serie, así que no lleva leyenda: el título de la pantalla dice qué
 * se mide. La cifra grande de arriba es la lectura del punto elegido; se elige
 * tocando o arrastrando el dedo por el gráfico. Las guías son casi invisibles a
 * propósito: el dato es la línea.
 */
export default function TrendChart({
  series,
  unit,
  color = '#3cff73',
}: {
  series: Point[]
  unit: string
  /** Acento del módulo dueño del gráfico. */
  color?: string
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const gradientId = useId()
  const [activeIndex, setActiveIndex] = useState(series.length - 1)

  if (series.length === 0) {
    return <p className="py-10 text-center text-[15px] text-label-2">Todavía no hay datos suficientes.</p>
  }

  if (series.length === 1) {
    return (
      <div className="py-6 text-center">
        <p className="text-[34px] font-bold leading-none tabular-nums text-label">
          {series[0].value}
          <span className="ml-1 text-[17px] font-semibold text-label-2">{unit}</span>
        </p>
        <p className="mt-2 text-[13px] text-label-2">{formatDate(series[0].date)} · una sola medición por ahora</p>
      </div>
    )
  }

  const W = 300
  const H = 160
  const padTop = 14
  const padBottom = 14

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
  const index = Math.min(activeIndex, series.length - 1)
  const active = points[index]
  const activePoint = series[index]

  function pick(clientX: number) {
    const rect = containerRef.current?.getBoundingClientRect()
    if (!rect) return
    const fraction = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width))
    setActiveIndex(Math.round(fraction * (series.length - 1)))
  }

  return (
    <div>
      <p className="text-[13px] font-semibold uppercase tracking-wide text-label-2">
        {index === series.length - 1 ? 'Última' : 'Medición'}
      </p>
      <p className="text-[34px] font-bold leading-tight tabular-nums text-label">
        {activePoint.value}
        <span className="ml-1 text-[17px] font-semibold text-label-2">{unit}</span>
      </p>
      <p className="text-[15px] text-label-2">{formatDate(activePoint.date)}</p>

      <div className="mt-4 flex gap-2">
        <div
          ref={containerRef}
          className="relative h-[160px] flex-1 touch-none"
          onPointerDown={(e) => {
            ;(e.target as Element).setPointerCapture?.(e.pointerId)
            pick(e.clientX)
          }}
          onPointerMove={(e) => e.buttons > 0 && pick(e.clientX)}
          role="img"
          aria-label={`Evolución de ${series[0].value} a ${series[series.length - 1].value} ${unit}`}
        >
          <svg viewBox={`0 0 ${W} ${H}`} className="h-full w-full overflow-visible" preserveAspectRatio="none">
            <defs>
              <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.28} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            {[padTop, (H - padBottom + padTop) / 2, H - padBottom].map((y) => (
              <line key={y} x1={0} y1={y} x2={W} y2={y} stroke="#38383a" strokeWidth={1} strokeDasharray="2 4" vectorEffect="non-scaling-stroke" />
            ))}
            <line x1={active.x} y1={0} x2={active.x} y2={H} stroke="#5a5a5f" strokeWidth={1} vectorEffect="non-scaling-stroke" />
            <polygon points={areaPoints} fill={`url(#${gradientId})`} stroke="none" />
            <polyline
              points={linePoints}
              fill="none"
              stroke={color}
              strokeWidth={2}
              strokeLinejoin="round"
              strokeLinecap="round"
              vectorEffect="non-scaling-stroke"
            />
          </svg>
          {points.map((p, i) => (
            <span
              key={i}
              className={`pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 rounded-full ${
                i === index ? 'h-3 w-3 ring-2 ring-black' : 'h-2 w-2 ring-2 ring-black'
              }`}
              style={{ left: `${(p.x / W) * 100}%`, top: `${(p.y / H) * 100}%`, background: i === index ? '#ffffff' : color }}
            />
          ))}
        </div>
        {/* Escala mínima y máxima a la derecha, como en Salud. */}
        <div className="flex w-9 flex-col justify-between py-[6px] text-right text-[11px] tabular-nums text-label-2">
          <span>{max}</span>
          <span>{min}</span>
        </div>
      </div>

      <div className="mt-1.5 flex justify-between pr-11 text-[11px] text-label-2">
        <span>{formatShort(series[0].date)}</span>
        <span>{formatShort(series[series.length - 1].date)}</span>
      </div>
    </div>
  )
}

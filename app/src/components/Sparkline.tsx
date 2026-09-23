import { useId } from 'react'

/** Mini gráfico de tendencia para una fila de lista. Solo muestra la forma. */
export default function Sparkline({ values, color = '#3cff73' }: { values: number[]; color?: string }) {
  const gradientId = useId()
  if (values.length < 2) {
    return <div className="h-8 w-full" />
  }

  const w = 100
  const h = 32
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = values.map((v, i) => ({
    x: (i / (values.length - 1)) * w,
    y: 3 + (h - 6) * (1 - (v - min) / range),
  }))

  const linePoints = points.map((p) => `${p.x},${p.y}`).join(' ')
  const areaPoints = `0,${h} ${linePoints} ${w},${h}`
  const last = points[points.length - 1]

  return (
    <div className="relative h-8 w-full" aria-hidden>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full overflow-visible" preserveAspectRatio="none">
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
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
      <span
        className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-2 ring-cell"
        style={{ left: `${(last.x / w) * 100}%`, top: `${(last.y / h) * 100}%`, background: color }}
      />
    </div>
  )
}

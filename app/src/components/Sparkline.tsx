export default function Sparkline({ values }: { values: number[] }) {
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
    y: h - ((v - min) / range) * h,
  }))

  const linePoints = points.map((p) => `${p.x},${p.y}`).join(' ')
  const areaPoints = `0,${h} ${linePoints} ${w},${h}`
  const last = points[points.length - 1]

  return (
    <div className="relative h-8 w-full">
      <svg viewBox={`0 0 ${w} ${h}`} className="h-full w-full" preserveAspectRatio="none">
        <polygon points={areaPoints} fill="#22d3ee" fillOpacity={0.1} stroke="none" />
        <polyline
          points={linePoints}
          fill="none"
          stroke="#22d3ee"
          strokeWidth={2}
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
      </svg>
      <span
        className="absolute h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-cyan-400 ring-2 ring-[#0b0d12]"
        style={{ left: `${(last.x / w) * 100}%`, top: `${(last.y / h) * 100}%` }}
      />
    </div>
  )
}

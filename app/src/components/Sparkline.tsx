export default function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) {
    return <div className="h-8 w-full" />
  }

  const w = 100
  const h = 32
  const min = Math.min(...values)
  const max = Math.max(...values)
  const range = max - min || 1

  const points = values.map((v, i) => {
    const x = (i / (values.length - 1)) * w
    const y = h - ((v - min) / range) * h
    return `${x},${y}`
  })

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-8 w-full" preserveAspectRatio="none">
      <polyline points={points.join(' ')} fill="none" stroke="#22d3ee" strokeWidth={2} vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

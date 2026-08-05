/**
 * Comparación de dos mediciones: la anterior contra la actual.
 *
 * Las barras se escalan contra el mayor de los dos valores y arrancan en cero,
 * así la diferencia de altura es proporcional a la diferencia real. Una sola
 * serie no lleva leyenda: el título ya dice qué se mide, y cada barra tiene su
 * etiqueta al pie.
 */
export default function CompareBars({
  previous,
  current,
  unit,
  previousLabel = 'Antes',
  currentLabel = 'Ahora',
}: {
  previous: number
  current: number
  unit: string
  previousLabel?: string
  currentLabel?: string
}) {
  const max = Math.max(previous, current, 1)
  const MIN_HEIGHT = 12
  const prevHeight = Math.max(MIN_HEIGHT, (previous / max) * 100)
  const currHeight = Math.max(MIN_HEIGHT, (current / max) * 100)

  const change = previous > 0 ? Math.round(((current - previous) / previous) * 100) : null
  const improved = current >= previous

  return (
    <div className="rounded-2xl bg-white/5 p-4">
      {change != null && (
        <p className={`text-xl font-bold ${improved ? 'text-cyan-400' : 'text-amber-400'}`}>
          {improved ? 'Subió' : 'Bajó'} {change > 0 ? '+' : ''}
          {change}%
        </p>
      )}

      <div className="mt-4 flex gap-4">
        <div className="flex-1">
          {/* La altura de la barra es un porcentaje, así que su contenedor
              necesita altura definida para que resuelva. */}
          <div className="flex h-[130px] items-end">
            <div
              className="w-full rounded-t-lg bg-white/15"
              style={{ height: `${prevHeight}%` }}
              role="img"
              aria-label={`${previousLabel}: ${previous} ${unit}`}
            />
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-500">{previousLabel}</p>
            <p className="text-lg font-bold text-gray-300">
              {previous}
              <span className="ml-0.5 text-sm font-normal text-gray-500">{unit}</span>
            </p>
          </div>
        </div>

        <div className="flex-1">
          <div className="flex h-[130px] items-end">
            <div
              className="w-full rounded-t-lg"
              style={{
                height: `${currHeight}%`,
                background: 'linear-gradient(to bottom, #67e8f9, #06b6d4)',
              }}
              role="img"
              aria-label={`${currentLabel}: ${current} ${unit}`}
            />
          </div>
          <div className="mt-2 text-center">
            <p className="text-sm text-gray-500">{currentLabel}</p>
            <p className="text-lg font-bold text-white">
              {current}
              <span className="ml-0.5 text-sm font-normal text-gray-500">{unit}</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

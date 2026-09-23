import Icon from './Icon'

/**
 * Comparación de dos mediciones: la anterior contra la actual.
 *
 * Las barras se escalan contra el mayor de los dos valores y arrancan en cero,
 * así la diferencia de altura es proporcional a la diferencia real. Una sola
 * serie no lleva leyenda: el título ya dice qué se mide, y cada barra tiene su
 * etiqueta al pie. El texto va en tinta, no en el color de la barra; el cambio
 * lleva flecha además de color, para que no dependa solo de él.
 */
export default function CompareBars({
  previous,
  current,
  unit,
  previousLabel = 'Antes',
  currentLabel = 'Ahora',
  color = '#3cff73',
}: {
  previous: number
  current: number
  unit: string
  previousLabel?: string
  currentLabel?: string
  /** Acento del módulo dueño del gráfico. */
  color?: string
}) {
  const max = Math.max(previous, current, 1)
  const MIN_HEIGHT = 6
  const prevHeight = Math.max(MIN_HEIGHT, (previous / max) * 100)
  const currHeight = Math.max(MIN_HEIGHT, (current / max) * 100)

  const change = previous > 0 ? Math.round(((current - previous) / previous) * 100) : null
  const improved = current >= previous

  return (
    <div>
      {change != null && (
        <p className="flex items-center gap-1.5 text-[22px] font-bold text-label">
          <Icon
            name="arrow-up"
            size={22}
            strokeWidth={2.6}
            className={improved ? '' : 'rotate-180 text-warn-400'}
            label={improved ? 'Subió' : 'Bajó'}
          />
          {change > 0 ? '+' : ''}
          {change}%
          <span className="text-[15px] font-medium text-label-2">respecto al anterior</span>
        </p>
      )}

      <div className="mt-4 flex gap-4">
        {[
          { label: previousLabel, value: previous, height: prevHeight, fill: '#3a3a3c' },
          { label: currentLabel, value: current, height: currHeight, fill: color },
        ].map((b) => (
          <div key={b.label} className="flex-1">
            {/* La altura de la barra es un porcentaje, así que su contenedor
                necesita altura definida para que resuelva. */}
            <div className="flex h-[130px] items-end">
              <div
                className="w-full rounded-t-[4px]"
                style={{ height: `${b.height}%`, background: b.fill }}
                role="img"
                aria-label={`${b.label}: ${b.value} ${unit}`}
              />
            </div>
            <div className="mt-2">
              <p className="text-[13px] text-label-2">{b.label}</p>
              <p className="text-[20px] font-bold tabular-nums text-label">
                {b.value}
                <span className="ml-0.5 text-[15px] font-medium text-label-2">{unit}</span>
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

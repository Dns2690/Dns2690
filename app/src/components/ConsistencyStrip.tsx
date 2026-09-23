import type { ActivityByDate } from '../lib/activity'
import { MODULE_THEMES, type ModuleId } from '../lib/theme'

const ORDER: { key: 'workout' | 'kegel' | 'mindfulness'; module: ModuleId; label: string }[] = [
  { key: 'workout', module: 'fitness', label: 'Ejercicios' },
  { key: 'kegel', module: 'kegel', label: 'Kegel' },
  { key: 'mindfulness', module: 'mindfulness', label: 'Meditación' },
]

function dayLabel(date: string, parts: string[]): string {
  const d = new Date(date + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short' })
  return parts.length ? `${d}: ${parts.join(', ')}` : `${d}: sin actividad`
}

/**
 * Tira de los últimos días, una columna por día.
 *
 * Cada módulo que hiciste ese día es un segmento de su color de datos, apilados
 * siempre en el mismo orden y separados por 2 px de fondo, para que dos
 * módulos juntos no se fundan en un solo bloque. Los colores son los escalones
 * validados para daltonismo, no los acentos; la leyenda va siempre, porque
 * con tres series el color solo no alcanza.
 */
export default function ConsistencyStrip({ activity, days }: { activity: ActivityByDate; days: string[] }) {
  return (
    <div>
      <div className="flex h-9 gap-[3px]" role="img" aria-label="Actividad de los últimos días">
        {days.map((date) => {
          const day = activity[date]
          const done = ORDER.filter((o) => (day?.[o.key] ?? 0) > 0)
          return (
            <div
              key={date}
              title={dayLabel(date, done.map((o) => o.label))}
              className="flex flex-1 flex-col gap-[2px] overflow-hidden rounded-[3px]"
            >
              {done.length === 0 ? (
                <div className="flex-1 bg-cell-2" />
              ) : (
                done.map((o) => (
                  <div key={o.key} className="flex-1" style={{ background: MODULE_THEMES[o.module].dataHex }} />
                ))
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-2.5 flex flex-wrap gap-x-4 gap-y-1">
        {ORDER.map((o) => (
          <span key={o.key} className="flex items-center gap-1.5 text-[13px] text-label-2">
            <span className="h-2.5 w-2.5 rounded-[3px]" style={{ background: MODULE_THEMES[o.module].dataHex }} />
            {o.label}
          </span>
        ))}
      </div>
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar, { BarButton } from '../components/TopBar'
import Sparkline from '../components/Sparkline'
import Icon, { IconTile, type IconName } from '../components/Icon'
import { Button, Placeholder, Row, Section } from '../components/ui'
import { listMeasurements } from '../lib/store'
import { DERIVED_METRICS, derivedSeries, METRICS, metricSeries } from '../lib/measurements'
import type { MeasurementEntry } from '../lib/types'

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

/**
 * Fila de resumen de una medida, al estilo de Salud: valor actual grande,
 * cambio desde la primera medición y la forma de la curva a la derecha.
 */
function MetricRow({
  to,
  icon,
  label,
  value,
  unit,
  delta,
  extra,
  values,
}: {
  to: string
  icon: IconName
  label: string
  value: number
  unit: string
  delta: number | null
  extra?: string
  values: number[]
}) {
  return (
    <Link to={to} className="flex items-center gap-3 px-4 py-3 active:bg-press" style={{ ['--sep-inset' as string]: '58px' }}>
      <IconTile name={icon} />
      <div className="min-w-0 flex-1">
        <p className="text-[15px] text-label-2">{label}</p>
        <p className="text-[22px] font-semibold leading-tight tabular-nums text-label">
          {value}
          {unit && <span className="ml-1 text-[15px] font-medium text-label-2">{unit}</span>}
        </p>
        {delta != null && delta !== 0 && (
          <p className="text-[13px] tabular-nums text-label-2">
            {delta > 0 ? '+' : ''}
            {delta} {unit} desde el inicio
          </p>
        )}
        {extra && <p className="text-[13px] text-label-2">{extra}</p>}
      </div>
      <div className="w-20 shrink-0">
        <Sparkline values={values} />
      </div>
      <Icon name="chevron-right" size={18} strokeWidth={2.4} className="-mr-1 shrink-0 text-label-3" />
    </Link>
  )
}

export default function Measurements() {
  const [entries, setEntries] = useState<MeasurementEntry[] | null>(null)

  useEffect(() => {
    listMeasurements().then(setEntries)
  }, [])

  const latestWithFatMass = entries?.find((e) => e.computed?.fatMassKg != null)?.computed
  const hasDerived = !!entries && DERIVED_METRICS.some((m) => derivedSeries(entries, m.key).length > 0)

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar title="Medidas" back="Ajustes" large right={<BarButton icon="plus" label="Nueva medición" to="/medidas/nueva" />} />

      {entries === null && <Placeholder>Cargando…</Placeholder>}

      {entries?.length === 0 && (
        <div className="flex flex-col items-center px-8 pt-12 text-center">
          <IconTile name="tape" size="xl" />
          <p className="mt-5 text-[22px] font-bold text-label">Sin mediciones todavía</p>
          <p className="mt-2 text-[15px] leading-snug text-label-2">
            Anotá peso, pecho, cintura, glúteos, brazo, pierna y cuello una vez por mes para ver tu evolución.
          </p>
          <div className="mt-6 w-full max-w-xs">
            <Button to="/medidas/nueva" icon="plus">
              Nueva medición
            </Button>
          </div>
        </div>
      )}

      {entries && entries.length > 0 && (
        <div className="flex flex-col gap-7">
          {hasDerived && (
            <Section header="Cálculos">
              {DERIVED_METRICS.map((m) => {
                const series = derivedSeries(entries, m.key)
                if (series.length === 0) return null
                const latest = series[series.length - 1].value
                const factor = 10 ** m.precision
                const delta = series.length > 1 ? Math.round((latest - series[0].value) * factor) / factor : null
                return (
                  <MetricRow
                    key={m.key}
                    to={`/medidas/grafico/${m.key}`}
                    icon={m.icon}
                    label={m.label}
                    value={latest}
                    unit={m.unit}
                    delta={delta}
                    extra={
                      m.key === 'bodyFatPercent' && latestWithFatMass?.fatMassKg != null
                        ? `${latestWithFatMass.fatMassKg} kg grasa · ${latestWithFatMass.leanMassKg} kg magra`
                        : undefined
                    }
                    values={series.map((s) => s.value)}
                  />
                )
              })}
            </Section>
          )}

          <Section header="Mediciones">
            {METRICS.map((m) => {
              const series = metricSeries(entries, m.key)
              if (series.length === 0) return null
              const latest = series[series.length - 1].value
              const delta = series.length > 1 ? Math.round((latest - series[0].value) * 10) / 10 : null
              return (
                <MetricRow
                  key={m.key}
                  to={`/medidas/grafico/${m.key}`}
                  icon={m.icon}
                  label={m.label}
                  value={latest}
                  unit={m.unit}
                  delta={delta}
                  values={series.map((s) => s.value)}
                />
              )
            })}
          </Section>

          <Section header="Historial">
            {entries.map((e) => (
              <Row
                key={e.id}
                to={`/medidas/${e.id}`}
                title={formatDate(e.date)}
                subtitle={
                  METRICS.filter((m) => e[m.key] != null)
                    .map((m) => `${m.label.toLowerCase()} ${e[m.key]} ${m.unit}`)
                    .join(' · ') || 'Sin datos'
                }
              />
            ))}
          </Section>
        </div>
      )}
    </div>
  )
}

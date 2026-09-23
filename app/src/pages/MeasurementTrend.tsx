import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { Placeholder, Row, Section } from '../components/ui'
import TrendChart from '../components/TrendChart'
import { listMeasurements } from '../lib/store'
import { DERIVED_METRICS, derivedSeries, METRICS, metricSeries } from '../lib/measurements'
import type { MeasurementEntry } from '../lib/types'

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function MeasurementTrend() {
  const { key = '' } = useParams()
  const [entries, setEntries] = useState<MeasurementEntry[] | null>(null)

  useEffect(() => {
    listMeasurements().then(setEntries)
  }, [])

  const raw = METRICS.find((m) => m.key === key)
  const derived = DERIVED_METRICS.find((m) => m.key === key)
  const config = raw ?? derived

  if (!config) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Medidas" back />
        <Placeholder>Métrica no encontrada.</Placeholder>
      </div>
    )
  }

  if (entries === null) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title={config.label} back="Medidas" large />
        <Placeholder>Cargando…</Placeholder>
      </div>
    )
  }

  const series = raw ? metricSeries(entries, raw.key) : derivedSeries(entries, derived!.key)
  const chronological = [...series].reverse()

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar title={config.label} back="Medidas" large />

      <div className="flex flex-col gap-7">
        <Section>
          <div className="p-4">
            <TrendChart series={series} unit={config.unit} />
          </div>
        </Section>

        {series.length > 0 && (
          <Section header="Todos los valores">
            {chronological.map((p, i) => (
              <Row
                key={i}
                title={formatDate(p.date)}
                detail={
                  <span className="tabular-nums text-label">
                    {p.value} {config.unit}
                  </span>
                }
              />
            ))}
          </Section>
        )}
      </div>
    </div>
  )
}

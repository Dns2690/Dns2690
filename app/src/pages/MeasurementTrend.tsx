import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
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
        <p className="p-6 text-center text-sm text-gray-500">Métrica no encontrada.</p>
      </div>
    )
  }

  if (entries === null) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title={config.label} back />
        <p className="p-6 text-center text-sm text-gray-500">Cargando…</p>
      </div>
    )
  }

  const series = raw
    ? metricSeries(entries, raw.key)
    : derivedSeries(entries, derived!.key)
  const chronological = [...series].reverse()

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar title={`${config.icon} ${config.label}`} back />

      <div className="flex flex-col gap-4 p-4">
        <div className="rounded-2xl bg-white/5 p-4">
          <TrendChart series={series} unit={config.unit} />
        </div>

        {series.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="px-1 text-xs text-gray-500">Todos los valores</p>
            {chronological.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                <span className="text-gray-400">{formatDate(p.date)}</span>
                <span className="text-gray-100">
                  {p.value} {config.unit}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

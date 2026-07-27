import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import Sparkline from '../components/Sparkline'
import { deleteMeasurement, listMeasurements } from '../lib/store'
import { METRICS, metricSeries } from '../lib/measurements'
import type { MeasurementEntry } from '../lib/types'

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function Measurements() {
  const [entries, setEntries] = useState<MeasurementEntry[] | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    listMeasurements().then(setEntries)
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta medición?')) return
    await deleteMeasurement(id)
    setEntries((await listMeasurements()) ?? [])
  }

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar title="Medidas" />
      <div className="flex flex-col gap-3 p-4">
        <button
          onClick={() => navigate('/medidas/nueva')}
          className="rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-[#0b0d12] active:bg-cyan-400"
        >
          + Nueva medición
        </button>

        {entries === null && <p className="py-10 text-center text-sm text-gray-500">Cargando…</p>}

        {entries?.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-500">
            Todavía no registraste mediciones. Anotá peso, pecho, cintura, glúteos, brazo y pierna cada mes para ver tu evolución.
          </p>
        )}

        {entries && entries.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {METRICS.map((m) => {
              const series = metricSeries(entries, m.key)
              if (series.length === 0) return null
              const latest = series[series.length - 1].value
              const first = series[0].value
              const delta = series.length > 1 ? latest - first : null
              return (
                <div key={m.key} className="rounded-xl bg-white/5 p-3">
                  <p className="text-xs text-gray-400">{m.icon} {m.label}</p>
                  <p className="mt-1 text-lg font-semibold text-gray-100">
                    {latest}
                    <span className="ml-1 text-xs font-normal text-gray-500">{m.unit}</span>
                  </p>
                  {delta != null && delta !== 0 && (
                    <p className={`text-xs ${delta < 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
                      {delta > 0 ? '+' : ''}
                      {Math.round(delta * 10) / 10} {m.unit} desde el inicio
                    </p>
                  )}
                  <div className="mt-1">
                    <Sparkline values={series.map((s) => s.value)} />
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {entries && entries.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="px-1 text-xs text-gray-500">Historial</p>
            {entries.map((e) => (
              <div key={e.id} className="flex items-center gap-2 rounded-xl bg-white/5 p-3">
                <Link to={`/medidas/${e.id}`} className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-100">{formatDate(e.date)}</p>
                  <p className="truncate text-xs text-gray-500">
                    {METRICS.filter((m) => e[m.key] != null)
                      .map((m) => `${m.label.toLowerCase()} ${e[m.key]}${m.unit}`)
                      .join(' · ') || 'Sin datos'}
                  </p>
                </Link>
                <button
                  onClick={() => handleDelete(e.id)}
                  className="rounded-lg px-2 py-1.5 text-xs text-red-400 active:bg-white/10"
                  aria-label="Eliminar medición"
                >
                  🗑
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

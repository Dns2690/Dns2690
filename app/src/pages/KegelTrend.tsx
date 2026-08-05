import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import TrendChart from '../components/TrendChart'
import CompareBars from '../components/CompareBars'
import { deleteKegelTest, listKegelTests } from '../lib/store'
import type { KegelTest } from '../lib/types'

function formatDate(iso: string): string {
  return new Date(iso + 'T00:00:00').toLocaleDateString('es', { day: 'numeric', month: 'short', year: 'numeric' })
}

export default function KegelTrend() {
  const [tests, setTests] = useState<KegelTest[] | null>(null)

  useEffect(() => {
    listKegelTests().then(setTests)
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar este test?')) return
    await deleteKegelTest(id)
    setTests(await listKegelTests())
  }

  if (tests === null) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Progreso Kegel" back />
        <p className="p-6 text-center text-sm text-gray-500">Cargando…</p>
      </div>
    )
  }

  // `listKegelTests` viene del más nuevo al más viejo; el gráfico necesita
  // orden cronológico.
  const series = [...tests].reverse().map((t) => ({ date: t.date, value: t.seconds }))

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar title="🏔️ Contracción máxima" back />

      <div className="flex flex-col gap-4 p-4">
        {tests.length >= 2 && (
          <div className="flex flex-col gap-2">
            <p className="px-1 text-sm text-gray-500">Fuerza del piso pélvico</p>
            <CompareBars
              previous={tests[1].seconds}
              current={tests[0].seconds}
              unit="s"
              previousLabel="Test anterior"
              currentLabel="Último test"
            />
          </div>
        )}

        <div className="rounded-2xl bg-white/5 p-4">
          {series.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-gray-500">Todavía no hiciste ningún test.</p>
              <Link
                to="/kegel/test"
                className="mt-4 inline-block rounded-lg bg-cyan-500 px-4 py-2 text-sm font-medium text-[#0b0d12] active:bg-cyan-400"
              >
                Hacer el primero
              </Link>
            </div>
          ) : (
            <TrendChart series={series} unit="s" />
          )}
        </div>

        {tests.length > 0 && (
          <div className="flex flex-col gap-2">
            <p className="px-1 text-sm text-gray-500">Todos los tests</p>
            {tests.map((t) => (
              <div key={t.id} className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-2 text-sm">
                <span className="flex-1 text-gray-400">{formatDate(t.date)}</span>
                <span className="text-gray-100">{t.seconds} s</span>
                <button
                  onClick={() => handleDelete(t.id)}
                  className="rounded-lg px-2 py-1 text-sm text-red-400 active:bg-white/10"
                  aria-label="Eliminar test"
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

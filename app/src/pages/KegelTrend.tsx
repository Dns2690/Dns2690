import { useEffect, useState } from 'react'
import TopBar from '../components/TopBar'
import TrendChart from '../components/TrendChart'
import CompareBars from '../components/CompareBars'
import { IconTile } from '../components/Icon'
import { Button, Placeholder, Row, Section } from '../components/ui'
import { MODULE_THEMES } from '../lib/theme'
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
        <TopBar title="Contracción máxima" back="Kegel" large />
        <Placeholder>Cargando…</Placeholder>
      </div>
    )
  }

  // `listKegelTests` viene del más nuevo al más viejo; el gráfico necesita
  // orden cronológico.
  const series = [...tests].reverse().map((t) => ({ date: t.date, value: t.seconds }))
  const color = MODULE_THEMES.kegel.textHex

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar title="Contracción máxima" back="Kegel" large />

      {series.length === 0 ? (
        <div className="flex flex-col items-center px-8 pt-12 text-center">
          <IconTile name="mountain" tone="kegel" size="xl" />
          <p className="mt-5 text-[22px] font-bold text-label">Sin tests todavía</p>
          <p className="mt-2 text-[15px] leading-snug text-label-2">
            Medí cuánto aguantás una contracción máxima. Es tu punto de partida.
          </p>
          <div className="mt-6 w-full max-w-xs">
            <Button tone="kegel" to="/kegel/test">
              Hacer el primero
            </Button>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-7">
          <Section>
            <div className="p-4">
              <TrendChart series={series} unit="s" color={color} />
            </div>
          </Section>

          {tests.length >= 2 && (
            <Section header="Último contra anterior">
              <div className="p-4">
                <CompareBars
                  previous={tests[1].seconds}
                  current={tests[0].seconds}
                  unit="s"
                  previousLabel="Test anterior"
                  currentLabel="Último test"
                  color={color}
                />
              </div>
            </Section>
          )}

          <Section header="Todos los tests" footer="Tocá un test para borrarlo.">
            {tests.map((t) => (
              <Row
                key={t.id}
                onClick={() => handleDelete(t.id)}
                title={formatDate(t.date)}
                detail={<span className="tabular-nums text-label">{t.seconds} s</span>}
              />
            ))}
          </Section>
        </div>
      )}
    </div>
  )
}

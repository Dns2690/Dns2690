import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar, { BarButton } from '../components/TopBar'
import Icon, { IconTile } from '../components/Icon'
import { Button, Placeholder, Section } from '../components/ui'
import { listRoutines } from '../lib/store'
import type { Routine } from '../lib/types'

/**
 * Lista de rutinas propias. Borrar vive dentro del editor, como en
 * Recordatorios: acá cada fila solo abre la rutina o la entrena.
 */
export default function Routines() {
  const [routines, setRoutines] = useState<Routine[] | null>(null)

  useEffect(() => {
    listRoutines().then(setRoutines)
  }, [])

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar title="Rutinas" large right={<BarButton icon="plus" label="Nueva rutina" to="/rutinas/nueva" />} />

      {routines === null && <Placeholder>Cargando…</Placeholder>}

      {routines?.length === 0 && (
        <div className="flex flex-col items-center px-8 pt-16 text-center">
          <IconTile name="list" size="xl" />
          <p className="mt-5 text-[22px] font-bold text-label">Sin rutinas todavía</p>
          <p className="mt-2 text-[15px] leading-snug text-label-2">
            Armá una con los ejercicios de la biblioteca y entrenala cuando quieras.
          </p>
          <div className="mt-6 w-full max-w-xs">
            <Button to="/rutinas/nueva" icon="plus">
              Nueva rutina
            </Button>
          </div>
        </div>
      )}

      {routines && routines.length > 0 && (
        <Section>
          {routines.map((r) => (
            <div key={r.id} className="flex items-center gap-3 pr-4" style={{ ['--sep-inset' as string]: '58px' }}>
              <Link to={`/rutinas/${r.id}`} className="flex min-w-0 flex-1 items-center gap-3 py-2.5 pl-4 active:opacity-60">
                <IconTile name="list" />
                <div className="min-w-0">
                  <p className="truncate text-[17px] text-label">{r.name}</p>
                  <p className="text-[15px] text-label-2">
                    {r.exercises.length} {r.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
                  </p>
                </div>
              </Link>
              <Link
                to={`/entrenar?rutina=${r.id}`}
                className="flex h-[30px] shrink-0 items-center gap-1 rounded-full bg-fit-500/15 pl-2.5 pr-3.5 text-[15px] font-semibold text-fit-400 active:bg-fit-500/25"
                aria-label={`Entrenar ${r.name}`}
              >
                <Icon name="play" size={14} />
                Entrenar
              </Link>
            </div>
          ))}
        </Section>
      )}
    </div>
  )
}

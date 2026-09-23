import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import Icon, { IconTile } from '../components/Icon'
import { Button, Placeholder, Row, Section } from '../components/ui'
import PlanSummary from '../components/PlanSummary'
import { useActivePlan } from '../lib/usePlan'
import { listRoutines, listSessions } from '../lib/store'
import { startSession, startSessionFromRoutine } from '../lib/workout'
import type { Routine, WorkoutSession } from '../lib/types'

export default function Workout() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [routines, setRoutines] = useState<Routine[]>([])
  const [active, setActive] = useState<WorkoutSession | null | undefined>(undefined)
  const [starting, setStarting] = useState(false)
  const planState = useActivePlan()

  useEffect(() => {
    listRoutines().then(setRoutines)
    listSessions().then((sessions) => {
      setActive(sessions.find((s) => !s.finishedAt) ?? null)
    })
  }, [])

  useEffect(() => {
    const rutinaId = searchParams.get('rutina')
    if (!rutinaId || starting) return
    setStarting(true)
    startSessionFromRoutine(rutinaId).then((s) => navigate(`/entrenar/${s.id}`, { replace: true }))
  }, [searchParams, starting, navigate])

  async function handleFreeform() {
    const s = await startSession()
    navigate(`/entrenar/${s.id}`)
  }

  async function handleFromRoutine(id: string) {
    const s = await startSessionFromRoutine(id)
    navigate(`/entrenar/${s.id}`)
  }

  if (searchParams.get('rutina')) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Entrenar" large />
        <Placeholder>Preparando entrenamiento…</Placeholder>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar title="Entrenar" large />

      <div className="flex flex-col gap-7">
        {active ? (
          <div className="px-4">
            <div className="rounded-2xl bg-cell p-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-warn-500/20 px-2.5 py-0.5 text-[13px] font-semibold text-warn-300">
                <span className="h-1.5 w-1.5 rounded-full bg-warn-400" />
                En curso
              </span>
              <p className="mt-2 text-[22px] font-bold leading-tight tracking-tight text-label">{active.routineName}</p>
              <p className="mt-1 text-[15px] text-label-2">
                Empezaste a las{' '}
                {new Date(active.startedAt).toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
              </p>
              <div className="mt-4 flex flex-col gap-2.5">
                <Button icon="play" onClick={() => navigate(`/entrenar/${active.id}`)}>
                  Continuar entrenamiento
                </Button>
              </div>
            </div>
          </div>
        ) : planState.plan ? (
          <div className="flex flex-col gap-3 px-4">
            <PlanSummary state={planState} />
            <Button variant="tinted" icon="plus" onClick={handleFreeform}>
              Entrenamiento libre
            </Button>
          </div>
        ) : (
          <div className="px-4">
            <Button icon="plus" onClick={handleFreeform}>
              Entrenamiento libre
            </Button>
            <p className="mt-2 px-4 text-center text-[13px] text-label-2">
              Arrancás vacío y vas sumando ejercicios sobre la marcha.
            </p>
          </div>
        )}

        <Section
          header="Desde una rutina"
          footer={routines.length === 0 ? 'Todavía no tenés rutinas. Armá una en la pestaña Rutinas.' : undefined}
        >
          {routines.length === 0 ? (
            <Row to="/rutinas/nueva" icon="plus" title={<span className="text-fit-400">Crear una rutina</span>} />
          ) : (
            routines.map((r) => (
              <Row
                key={r.id}
                onClick={() => handleFromRoutine(r.id)}
                leading={<IconTile name="list" />}
                title={r.name}
                subtitle={`${r.exercises.length} ${r.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}`}
                trailing={<Icon name="play" size={18} className="shrink-0 text-fit-400" />}
              />
            ))
          )}
        </Section>

        {active && (
          <Section>
            <Row onClick={handleFreeform} title={<span className="text-fit-400">Empezar otro entrenamiento libre</span>} />
          </Section>
        )}
      </div>
    </div>
  )
}

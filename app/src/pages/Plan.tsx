import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar, { BarTextButton } from '../components/TopBar'
import Icon, { IconTile } from '../components/Icon'
import PlanSummary from '../components/PlanSummary'
import { Button, Placeholder, Row, Section, Stat } from '../components/ui'
import { getExercise } from '../lib/exercises'
import { planExerciseProgress } from '../lib/plan'
import { formatKg } from '../lib/progression'
import { savePlan } from '../lib/store'
import { useActivePlan } from '../lib/usePlan'

export default function Plan() {
  const navigate = useNavigate()
  const state = useActivePlan()
  const { loading, plan, progress, routinesById } = state

  const evolution = useMemo(() => (progress ? planExerciseProgress(progress.sessions) : []), [progress])

  if (loading) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Mi plan" back="Rutinas" large />
        <Placeholder>Cargando…</Placeholder>
      </div>
    )
  }

  if (!plan || !progress) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Mi plan" back="Rutinas" large />
        <div className="flex flex-col items-center px-8 pt-10 text-center">
          <IconTile name="calendar" size="xl" />
          <p className="mt-5 text-[22px] font-bold text-label">Sin plan activo</p>
          <p className="mt-2 text-[15px] leading-snug text-label-2">
            Poné tus rutinas en rotación con una meta semanal y la app te dice qué toca y cómo venís.
          </p>
          <div className="mt-6 w-full max-w-xs">
            <Button to="/plan/nuevo" icon="plus">
              Armar mi plan
            </Button>
          </div>
        </div>
      </div>
    )
  }

  async function endPlan() {
    if (!plan || !confirm('¿Terminar este plan? Lo que entrenaste queda en el historial.')) return
    await savePlan({ ...plan, endedAt: new Date().toISOString() })
    navigate('/rutinas', { replace: true })
  }

  async function renewBlock() {
    if (!plan) return
    // Un bloque nuevo es un plan nuevo con la misma rotación: el anterior queda
    // cerrado con sus resultados.
    await savePlan({ name: plan.name, routineIds: plan.routineIds, perWeek: plan.perWeek, weeks: plan.weeks })
    state.reload()
  }

  const maxCount = Math.max(plan.perWeek, ...progress.weekCounts)

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar
        title={plan.name}
        back="Rutinas"
        large
        right={<BarTextButton onClick={() => navigate('/plan/editar')}>Editar</BarTextButton>}
      />

      <div className="flex flex-col gap-7">
        <div className="px-4">
          {progress.finished ? (
            <div className="rounded-2xl bg-cell p-4">
              <div className="flex items-center gap-3">
                <IconTile name="trophy" size="md" />
                <div>
                  <p className="text-[20px] font-bold leading-tight text-label">Bloque terminado</p>
                  <p className="text-[15px] text-label-2">
                    {progress.sessions.length} sesiones en {plan.weeks} semanas
                  </p>
                </div>
              </div>
              <p className="mt-3 text-[15px] leading-snug text-label-2">
                Abajo está cuánto subiste en cada ejercicio. Para seguir, empezá otro bloque con la misma rotación o
                editá el plan.
              </p>
              <div className="mt-4">
                <Button icon="repeat" onClick={() => void renewBlock()}>
                  Empezar otro bloque
                </Button>
              </div>
            </div>
          ) : (
            <PlanSummary state={state} />
          )}
        </div>

        <Section header="Semanas" footer={`Meta: ${plan.perWeek} sesiones por semana.`}>
          <div className="p-4">
            <div className="flex gap-4">
              <Stat
                label="Racha"
                value={
                  <span className="flex items-center gap-1">
                    {progress.weekStreak}
                    <span className="text-[15px] font-medium text-label-2">sem</span>
                  </span>
                }
              />
              <Stat label="Sesiones" value={`${progress.sessions.length}/${progress.totalTarget}`} />
              <Stat label="Bloque" value={`${progress.percent}%`} tone="fit" />
            </div>

            {/* Una columna por semana del bloque; la línea punteada es la meta. */}
            <div className="relative mt-5 flex h-20 items-end gap-1.5" role="img" aria-label="Sesiones por semana del bloque">
              <div
                className="pointer-events-none absolute inset-x-0 border-t border-dashed border-label-3"
                style={{ bottom: `${(plan.perWeek / maxCount) * 100}%` }}
              />
              {Array.from({ length: plan.weeks }, (_, i) => {
                const count = progress.weekCounts[i]
                const future = count === undefined
                const met = !future && count >= plan.perWeek
                return (
                  <div key={i} className="flex h-full flex-1 items-end" title={future ? `Semana ${i + 1}` : `Semana ${i + 1}: ${count}`}>
                    <div
                      className={`w-full rounded-t-[4px] ${
                        future ? 'bg-cell-2/50' : count === 0 ? 'bg-cell-2' : met ? 'bg-fit-500' : 'bg-fit-data'
                      }`}
                      style={{ height: future || count === 0 ? 3 : `${(count / maxCount) * 100}%` }}
                    />
                  </div>
                )
              })}
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-label-2">
              <span>Sem 1</span>
              <span>Sem {plan.weeks}</span>
            </div>
          </div>
        </Section>

        <Section header="Rotación">
          {plan.routineIds.map((id, i) => {
            const isNext = !progress.finished && id === progress.nextRoutineId
            return (
              <Row
                key={id}
                to={`/rutinas/${id}`}
                leading={
                  <span
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[15px] font-bold ${
                      isNext ? 'bg-fit-500 text-black' : 'bg-cell-2 text-label-2'
                    }`}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>
                }
                sepInset={56}
                title={routinesById[id]?.name}
                detail={
                  isNext ? (
                    <span className="rounded-full bg-fit-500/15 px-2 py-0.5 text-[13px] font-semibold text-fit-400">Toca</span>
                  ) : undefined
                }
              />
            )
          })}
        </Section>

        <Section
          header="Evolución de cargas"
          footer={
            evolution.length
              ? 'Mejor serie de la primera vez contra la de la última, comparadas por fuerza estimada.'
              : 'Aparece desde la segunda vez que hacés cada ejercicio dentro del plan.'
          }
        >
          {evolution.length === 0 ? (
            <div className="flex items-center gap-3 px-4 py-3 text-[15px] text-label-2">
              <Icon name="trend" size={20} className="shrink-0" />
              Todavía sin comparaciones.
            </div>
          ) : (
            evolution.map((e) => {
              const ex = getExercise(e.exerciseId)
              const fmt = (w: number | null, r: number) => (w ? `${formatKg(w)} kg × ${r}` : `${r} reps`)
              return (
                <Row
                  key={e.exerciseId}
                  to={`/ejercicio/${e.exerciseId}`}
                  title={<span className="capitalize">{ex?.name ?? e.exerciseId}</span>}
                  subtitle={`${fmt(e.first.weight, e.first.reps)} → ${fmt(e.latest.weight, e.latest.reps)}`}
                  detail={
                    <span className="flex items-center gap-1 text-[17px] font-semibold tabular-nums text-label">
                      {e.changePercent !== 0 && (
                        <Icon
                          name="arrow-up"
                          size={15}
                          strokeWidth={2.8}
                          className={e.changePercent > 0 ? 'text-fit-400' : 'rotate-180 text-warn-400'}
                        />
                      )}
                      {e.changePercent > 0 ? '+' : ''}
                      {e.changePercent}%
                    </span>
                  }
                />
              )
            })
          )}
        </Section>

        <Section>
          <Row onClick={() => void endPlan()} title="Terminar plan" destructive />
        </Section>
      </div>
    </div>
  )
}

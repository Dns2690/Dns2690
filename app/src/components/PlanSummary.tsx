import { Link } from 'react-router-dom'
import Icon from './Icon'
import { Button } from './ui'
import type { ActivePlanState } from '../lib/usePlan'

/** Puntos de la semana: uno por sesión de la meta, llenos los que ya hiciste. */
export function WeekDots({ done, goal }: { done: number; goal: number }) {
  const total = Math.max(goal, done)
  return (
    <span className="flex items-center gap-1.5" aria-label={`${done} de ${goal} esta semana`}>
      {Array.from({ length: total }, (_, i) => (
        <span
          key={i}
          className={`h-2.5 w-2.5 rounded-full ${i < done ? 'bg-fit-500' : 'bg-cell-2 ring-1 ring-inset ring-sep'}`}
        />
      ))}
    </span>
  )
}

/**
 * Resumen del plan activo: qué rutina toca y cómo va la semana, con el botón
 * para arrancarla. Si el bloque terminó, invita a ver los resultados.
 */
export default function PlanSummary({ state }: { state: ActivePlanState }) {
  const { plan, progress, nextRoutine, startNext } = state
  if (!plan || !progress) return null

  if (progress.finished) {
    return (
      <div className="rounded-2xl bg-cell p-4">
        <p className="text-[15px] font-semibold text-fit-400">{plan.name} · bloque terminado</p>
        <p className="mt-1 text-[22px] font-bold leading-tight tracking-tight text-label">Mirá cuánto subiste</p>
        <p className="mt-1 text-[15px] text-label-2">
          {progress.sessions.length} sesiones en {plan.weeks} semanas.
        </p>
        <div className="mt-4">
          <Button to="/plan" icon="trophy">
            Ver resultados
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-2xl bg-cell p-4">
      <Link to="/plan" className="flex items-center justify-between gap-2 active:opacity-60">
        <p className="min-w-0 truncate text-[15px] font-semibold text-fit-400">
          {plan.name} · semana {progress.currentWeek} de {plan.weeks}
        </p>
        <Icon name="chevron-right" size={18} strokeWidth={2.4} className="shrink-0 text-label-3" />
      </Link>
      <p className="mt-1 text-[13px] font-semibold uppercase tracking-wide text-label-2">Toca</p>
      <p className="text-[28px] font-bold leading-tight tracking-tight text-label">
        {nextRoutine?.name ?? 'Sin rutinas en el plan'}
      </p>
      <div className="mt-3 flex items-center gap-3">
        <WeekDots done={progress.thisWeek} goal={plan.perWeek} />
        <span className="text-[15px] text-label-2">
          {progress.thisWeek} de {plan.perWeek} esta semana
        </span>
      </div>
      {nextRoutine && (
        <div className="mt-4">
          <Button icon="play" onClick={() => void startNext()}>
            Empezar {nextRoutine.name}
          </Button>
        </div>
      )}
    </div>
  )
}

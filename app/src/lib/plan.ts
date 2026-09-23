import { estimatedOneRepMax } from './progression'
import type { TrainingPlan, WorkoutSession } from './types'

/*
 * Seguimiento del plan personal.
 *
 * Todo se deriva de las sesiones: una sesión cuenta para el plan si es de una
 * de sus rutinas y se terminó mientras el plan estaba vigente. Así no importa
 * si la rutina se arrancó desde el plan, desde la lista o desde Entrenar: lo
 * que hiciste cuenta igual.
 */

export const PLAN_PER_WEEK_OPTIONS = [2, 3, 4, 5] as const
export const PLAN_WEEK_OPTIONS = [4, 6, 8, 12] as const

const DAY_MS = 86_400_000

/** Lunes a la medianoche local de la semana de `date`. */
function mondayOf(date: Date): Date {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate())
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d
}

/**
 * Semana del bloque en la que cae una fecha, empezando en 0. Las semanas van de
 * lunes a domingo: si el plan arrancó un jueves, esa primera semana es corta.
 * Se redondea para que el cambio de horario no corra un día.
 */
function weekIndex(plan: TrainingPlan, date: Date): number {
  const start = mondayOf(new Date(plan.startedAt))
  return Math.floor(Math.round((mondayOf(date).getTime() - start.getTime()) / DAY_MS) / 7)
}

/** Sesiones terminadas que cuentan para el plan, de la más vieja a la más nueva. */
export function planSessions(plan: TrainingPlan, sessions: WorkoutSession[]): WorkoutSession[] {
  const ids = new Set(plan.routineIds)
  return sessions
    .filter(
      (s) =>
        s.finishedAt &&
        s.routineId &&
        ids.has(s.routineId) &&
        s.finishedAt >= plan.startedAt &&
        (plan.endedAt === null || s.finishedAt <= plan.endedAt),
    )
    .sort((a, b) => a.finishedAt!.localeCompare(b.finishedAt!))
}

export interface PlanProgress {
  sessions: WorkoutSession[]
  /** Rutina que toca: la que sigue a la última que hiciste. */
  nextRoutineId: string | null
  nextIndex: number
  /** Semana en curso, de 1 a `plan.weeks`. */
  currentWeek: number
  /** Sesiones hechas en cada semana del bloque, hasta la actual. */
  weekCounts: number[]
  thisWeek: number
  totalTarget: number
  percent: number
  /** Semanas seguidas cumpliendo la meta. La semana en curso suma si ya la cumplió y no corta si todavía no. */
  weekStreak: number
  /** Pasaron todas las semanas del bloque. */
  finished: boolean
}

export function planProgress(plan: TrainingPlan, sessions: WorkoutSession[], now = new Date()): PlanProgress {
  const done = planSessions(plan, sessions)
  const n = plan.routineIds.length

  let nextIndex = 0
  const lastRoutine = done.at(-1)?.routineId
  if (n > 0 && lastRoutine) {
    const i = plan.routineIds.indexOf(lastRoutine)
    nextIndex = i >= 0 ? (i + 1) % n : done.length % n
  }

  const nowIdx = weekIndex(plan, now)
  const finished = nowIdx >= plan.weeks
  const visibleWeeks = Math.max(1, Math.min(nowIdx + 1, plan.weeks))
  const weekCounts = Array.from({ length: visibleWeeks }, () => 0)
  for (const s of done) {
    const idx = weekIndex(plan, new Date(s.finishedAt!))
    if (idx >= 0 && idx < visibleWeeks) weekCounts[idx]++
  }

  const currentIdx = visibleWeeks - 1
  let weekStreak = 0
  for (let i = currentIdx; i >= 0; i--) {
    if (weekCounts[i] >= plan.perWeek) weekStreak++
    else if (i === currentIdx && !finished) continue
    else break
  }

  const totalTarget = plan.perWeek * plan.weeks
  return {
    sessions: done,
    nextRoutineId: n > 0 ? plan.routineIds[nextIndex] : null,
    nextIndex,
    currentWeek: currentIdx + 1,
    weekCounts,
    thisWeek: finished ? 0 : weekCounts[currentIdx],
    totalTarget,
    percent: Math.min(100, Math.round((done.length / totalTarget) * 100)),
    weekStreak,
    finished,
  }
}

export interface ExerciseProgress {
  exerciseId: string
  first: { weight: number | null; reps: number; date: string }
  latest: { weight: number | null; reps: number; date: string }
  /** Cambio de la fuerza estimada (o de repeticiones, sin carga), en %. */
  changePercent: number
}

/**
 * Evolución de cada ejercicio dentro del plan: la mejor serie de la primera vez
 * contra la mejor de la última. "Mejor" es la de mayor fuerza estimada, así
 * 40 × 12 y 45 × 8 se comparan de igual a igual. Sin carga, cuenta la serie
 * con más repeticiones.
 */
export function planExerciseProgress(sessions: WorkoutSession[]): ExerciseProgress[] {
  const byExercise = new Map<string, { date: string; weight: number | null; reps: number; score: number }[]>()
  for (const s of sessions) {
    for (const se of s.exercises) {
      const sets = se.sets.filter((x) => x.done && x.reps != null && x.reps > 0)
      if (sets.length === 0) continue
      const scored = sets.map((x) => ({
        weight: x.weight && x.weight > 0 ? x.weight : null,
        reps: x.reps!,
        score: x.weight && x.weight > 0 ? estimatedOneRepMax(x.weight, x.reps!) : x.reps!,
      }))
      const best = scored.sort((a, b) => b.score - a.score)[0]
      const list = byExercise.get(se.exerciseId) ?? []
      list.push({ date: s.finishedAt!, ...best })
      byExercise.set(se.exerciseId, list)
    }
  }
  const out: ExerciseProgress[] = []
  for (const [exerciseId, list] of byExercise) {
    if (list.length < 2) continue
    const first = list[0]
    const latest = list[list.length - 1]
    // Comparar una serie con carga contra una sin carga no dice nada.
    if ((first.weight === null) !== (latest.weight === null)) continue
    out.push({
      exerciseId,
      first: { weight: first.weight, reps: first.reps, date: first.date },
      latest: { weight: latest.weight, reps: latest.reps, date: latest.date },
      changePercent: Math.round(((latest.score - first.score) / first.score) * 100),
    })
  }
  return out.sort((a, b) => b.changePercent - a.changePercent)
}

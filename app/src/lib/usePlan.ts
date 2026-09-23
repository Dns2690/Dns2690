import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getActivePlan, listRoutines, listSessions } from './store'
import { planProgress, type PlanProgress } from './plan'
import { startSessionFromRoutine } from './workout'
import type { Routine, TrainingPlan, WorkoutSession } from './types'

export interface ActivePlanState {
  loading: boolean
  /** El plan activo, con las rutinas borradas ya fuera de la rotación. */
  plan: TrainingPlan | null
  progress: PlanProgress | null
  routines: Routine[]
  routinesById: Record<string, Routine>
  sessions: WorkoutSession[]
  nextRoutine: Routine | null
  /** Arranca la rutina que toca y abre la sesión. */
  startNext: () => Promise<void>
  reload: () => void
}

/** Plan activo y su seguimiento, para las pantallas que lo muestran. */
export function useActivePlan(): ActivePlanState {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [rawPlan, setRawPlan] = useState<TrainingPlan | null>(null)
  const [routines, setRoutines] = useState<Routine[]>([])
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [tick, setTick] = useState(0)

  useEffect(() => {
    let alive = true
    void Promise.all([getActivePlan(), listRoutines(), listSessions()]).then(([p, r, s]) => {
      if (!alive) return
      setRawPlan(p ?? null)
      setRoutines(r)
      setSessions(s)
      setLoading(false)
    })
    return () => {
      alive = false
    }
  }, [tick])

  const routinesById = useMemo(() => Object.fromEntries(routines.map((r) => [r.id, r])), [routines])

  // Una rutina borrada sale de la rotación sin tocar el plan guardado: si la
  // volvés a crear con otro id no vuelve sola, pero tampoco rompe nada.
  const plan = useMemo(
    () => (rawPlan ? { ...rawPlan, routineIds: rawPlan.routineIds.filter((id) => routinesById[id]) } : null),
    [rawPlan, routinesById],
  )
  const progress = useMemo(() => (plan ? planProgress(plan, sessions) : null), [plan, sessions])
  const nextRoutine = progress?.nextRoutineId ? (routinesById[progress.nextRoutineId] ?? null) : null

  const startNext = useCallback(async () => {
    if (!nextRoutine) return
    const s = await startSessionFromRoutine(nextRoutine.id)
    navigate(`/entrenar/${s.id}`)
  }, [nextRoutine, navigate])

  const reload = useCallback(() => setTick((t) => t + 1), [])

  return { loading, plan, progress, routines, routinesById, sessions, nextRoutine, startNext, reload }
}

import { getRoutine, newSessionId, saveSession } from './store'
import type { Routine, SessionExercise, SetLog, WorkoutSession } from './types'

function emptySets(count: number): SetLog[] {
  return Array.from({ length: count }, (_, i) => ({
    setNumber: i + 1,
    weight: null,
    reps: null,
    rpe: null,
    done: false,
  }))
}

export async function startSessionFromRoutine(routineId: string): Promise<WorkoutSession> {
  const routine = await getRoutine(routineId)
  return startSession(routine)
}

export async function startSession(routine?: Routine): Promise<WorkoutSession> {
  const exercises: SessionExercise[] = (routine?.exercises ?? []).map((re) => ({
    exerciseId: re.exerciseId,
    sets: emptySets(re.targetSets),
  }))

  const session: WorkoutSession = {
    id: newSessionId(),
    routineId: routine?.id ?? null,
    routineName: routine?.name ?? 'Entrenamiento libre',
    startedAt: new Date().toISOString(),
    finishedAt: null,
    exercises,
  }
  await saveSession(session)
  return session
}

export function addExerciseToSession(session: WorkoutSession, exerciseId: string): WorkoutSession {
  return {
    ...session,
    exercises: [...session.exercises, { exerciseId, sets: emptySets(3) }],
  }
}

export function addSet(session: WorkoutSession, exerciseIndex: number): WorkoutSession {
  const exercises = session.exercises.map((se, i) => {
    if (i !== exerciseIndex) return se
    return { ...se, sets: [...se.sets, { setNumber: se.sets.length + 1, weight: null, reps: null, rpe: null, done: false }] }
  })
  return { ...session, exercises }
}

export function removeExercise(session: WorkoutSession, exerciseIndex: number): WorkoutSession {
  return { ...session, exercises: session.exercises.filter((_, i) => i !== exerciseIndex) }
}

export function updateSet(
  session: WorkoutSession,
  exerciseIndex: number,
  setIndex: number,
  patch: Partial<SetLog>,
): WorkoutSession {
  const exercises = session.exercises.map((se, i) => {
    if (i !== exerciseIndex) return se
    const sets = se.sets.map((s, j) => (j === setIndex ? { ...s, ...patch } : s))
    return { ...se, sets }
  })
  return { ...session, exercises }
}

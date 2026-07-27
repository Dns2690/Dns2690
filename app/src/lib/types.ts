export type BodyPart =
  | 'back' | 'cardio' | 'chest' | 'lower arms' | 'lower legs'
  | 'neck' | 'shoulders' | 'upper arms' | 'upper legs' | 'waist'

export interface Exercise {
  id: string
  name: string
  category: string
  body_part: BodyPart
  equipment: string
  target: string
  muscle_group: string
  secondary_muscles: string[]
  instructions_es: string
  instruction_steps_es: string[]
  image: string
  gif_url: string
  media_id: string
  attribution: string
}

export interface RoutineExercise {
  exerciseId: string
  targetSets: number
  targetReps: string
  notes?: string
}

export interface Routine {
  id: string
  name: string
  exercises: RoutineExercise[]
  createdAt: string
  updatedAt: string
}

export interface SetLog {
  setNumber: number
  weight: number | null
  reps: number | null
  rpe: number | null
  done: boolean
}

export interface SessionExercise {
  exerciseId: string
  sets: SetLog[]
  targetReps?: string
  restSeconds?: number
  note?: string
}

export interface ProgramSessionMeta {
  month: number
  day: 1 | 2 | 3
}

export interface WorkoutSession {
  id: string
  routineId: string | null
  routineName: string
  startedAt: string
  finishedAt: string | null
  exercises: SessionExercise[]
  programMeta?: ProgramSessionMeta
}

export interface ProgramExercise {
  exerciseId: string
  sets: number
  reps: string
  restSeconds: number
  note?: string
}

export interface ProgramDay {
  day: 1 | 2 | 3
  name: string
  exercises: ProgramExercise[]
}

export interface ProgramMonth {
  month: number
  title: string
  focus: string
  description: string
  weeks: number
  days: [ProgramDay, ProgramDay, ProgramDay]
}

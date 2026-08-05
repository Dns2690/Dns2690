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
  programId: string
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

export interface ProgramInfo {
  id: string
  name: string
  tagline: string
  icon: string
  equipment: string
  months: ProgramMonth[]
}

export interface MeasurementComputed {
  bodyFatPercent: number | null
  bmi: number | null
  leanMassKg: number | null
  fatMassKg: number | null
  waistHipRatio: number | null
}

export interface MeasurementEntry {
  id: string
  date: string
  weightKg: number | null
  chestCm: number | null
  waistCm: number | null
  hipsCm: number | null
  armCm: number | null
  legCm: number | null
  neckCm: number | null
  note?: string
  computed?: MeasurementComputed
}

export type Sex = 'male' | 'female'

export type KegelLevelId = 'beginner' | 'medium' | 'advanced'

export type KegelPhase = 'contract' | 'hold' | 'release' | 'rest'

export interface KegelStep {
  phase: KegelPhase
  seconds: number
  /** Intensidad de contracción al empezar el paso, 0–1. */
  from: number
  /** Intensidad al terminarlo, 0–1. */
  to: number
  /** Etiqueta propia del paso, para los escalones de Gearbox. */
  label?: string
}

/**
 * 'lengthen' invierte el sentido del trabajo: en vez de apretar, se alarga y
 * relaja el piso pélvico (Reverse Kegel). Cambia las etiquetas y el color de la
 * guía, porque hacer uno creyendo que es el otro es contraproducente.
 */
export type KegelMode = 'contract' | 'lengthen'

export interface KegelExercise {
  id: string
  name: string
  icon: string
  description: string
  minLevel: KegelLevelId
  mode?: KegelMode
  pattern: KegelStep[]
}

export interface KegelLevel {
  id: KegelLevelId
  label: string
  workSeconds: number
  restSeconds: number
  rank: number
}

export interface KegelTimelineEntry {
  kind: 'exercise' | 'interRest'
  exerciseId: string
  exerciseIndex: number
  repIndex: number
  totalReps: number
  step: KegelStep
  startMs: number
  endMs: number
  /** Límites del bloque completo (todas las reps del ejercicio, o el descanso). */
  blockStartMs: number
  blockEndMs: number
}

export interface KegelSession {
  id: string
  /** Fecha local YYYY-MM-DD, para agrupar por día. */
  date: string
  completedAt: string
  levelId: KegelLevelId
  exerciseIds: string[]
  durationSeconds: number
}

export interface KegelTest {
  id: string
  date: string
  seconds: number
}

export interface KegelSettings {
  levelId: KegelLevelId
  sound: boolean
  vibration: boolean
  /** Fecha en que rechazó la sugerencia de subir de nivel, para no insistir. */
  levelUpDismissedAt?: string
}

export type MindfulnessLevelId = 'beginner' | 'basic' | 'intermediate' | 'advanced' | 'expert'

export interface MindfulnessSegment {
  kind: 'settle' | 'breath' | 'scan' | 'open' | 'metta' | 'close'
  seconds: number
  title: string
  guidance: string
  /** Si está, el segmento muestra el marcador de respiración. */
  breathId?: string
  /** Indicaciones que van rotando dentro del segmento. */
  cues?: { at: number; text: string }[]
}

export interface MindfulnessSession {
  levelId: MindfulnessLevelId
  breathId: string
  totalSeconds: number
  segments: MindfulnessSegment[]
}

export interface MindfulnessLog {
  id: string
  date: string
  completedAt: string
  levelId: MindfulnessLevelId
  /** Minutos efectivamente meditados, que pueden ser menos si cortó antes. */
  minutes: number
  ambient: string
}

export interface MindfulnessSettings {
  levelId: MindfulnessLevelId
  breathId: string
  ambient: string
  ambientVolume: number
  bells: boolean
  voiceEnabled?: boolean
  /** `voiceURI` de la voz elegida; vacío usa la que el sistema dé por defecto. */
  voiceURI?: string
  /** Velocidad del habla. Por debajo de 1 suena más calmo. */
  voiceRate?: number
}

export interface Profile {
  name: string
  avatar: string
  createdAt: string
  heightCm?: number | null
  sex?: Sex | null
}

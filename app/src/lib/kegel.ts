import type { KegelExercise, KegelLevel, KegelLevelId, KegelStep, KegelTimelineEntry } from './types'

/**
 * Cada paso define la intensidad de contracción al inicio (`from`) y al final
 * (`to`), en escala 0–1. El guía visual interpola entre ambas, así una rampa
 * lenta (Front Clamp) y un escalón (Gearbox) salen del mismo mecanismo.
 */

export const KEGEL_LEVELS: KegelLevel[] = [
  { id: 'beginner', label: 'Principiante', workSeconds: 35, restSeconds: 5, rank: 0 },
  { id: 'medium', label: 'Medio', workSeconds: 45, restSeconds: 8, rank: 1 },
  { id: 'advanced', label: 'Avanzado', workSeconds: 55, restSeconds: 10, rank: 2 },
]

export function getLevel(id: KegelLevelId): KegelLevel {
  return KEGEL_LEVELS.find((l) => l.id === id) ?? KEGEL_LEVELS[0]
}

export const KEGEL_EXERCISES: KegelExercise[] = [
  {
    id: 'starter',
    name: 'Starter',
    icon: '🔑',
    description:
      'Contraé y soltá rápido. Después contraé de nuevo y mantené 3 segundos. Soltá. Mantené el ritmo.',
    minLevel: 'beginner',
    pattern: [
      { phase: 'contract', seconds: 1, from: 0, to: 1 },
      { phase: 'release', seconds: 1, from: 1, to: 0 },
      { phase: 'contract', seconds: 1, from: 0, to: 1 },
      { phase: 'hold', seconds: 3, from: 1, to: 1 },
      { phase: 'release', seconds: 1, from: 1, to: 0 },
      { phase: 'rest', seconds: 2, from: 0, to: 0 },
    ],
  },
  {
    id: 'short-holding',
    name: 'Short Holding',
    icon: '⏳',
    description: 'Contraé, mantené 3 segundos, soltá y descansá 3 segundos.',
    minLevel: 'beginner',
    pattern: [
      { phase: 'contract', seconds: 1, from: 0, to: 1 },
      { phase: 'hold', seconds: 3, from: 1, to: 1 },
      { phase: 'release', seconds: 1, from: 1, to: 0 },
      { phase: 'rest', seconds: 3, from: 0, to: 0 },
    ],
  },
  {
    id: 'short-holding-2',
    name: 'Short Holding 2',
    icon: '⏳',
    description:
      'Contraé lo más fuerte que puedas. Mantené 5 segundos. Después soltá y descansá 5 segundos.',
    minLevel: 'beginner',
    pattern: [
      { phase: 'contract', seconds: 1, from: 0, to: 1 },
      { phase: 'hold', seconds: 5, from: 1, to: 1 },
      { phase: 'release', seconds: 1, from: 1, to: 0 },
      { phase: 'rest', seconds: 5, from: 0, to: 0 },
    ],
  },
  {
    id: 'front-clamp',
    name: 'Front Clamp',
    icon: '🗜️',
    description:
      'Contraé lentamente durante 2 segundos hasta la tensión máxima. Después soltá rápido. Mantené el ritmo.',
    minLevel: 'beginner',
    pattern: [
      { phase: 'contract', seconds: 2, from: 0, to: 1 },
      { phase: 'release', seconds: 1, from: 1, to: 0 },
      { phase: 'rest', seconds: 1, from: 0, to: 0 },
    ],
  },
  {
    id: 'back-clamp',
    name: 'Back Clamp',
    icon: '🗜️',
    description:
      'Contraé rápido hasta la tensión máxima. Después soltá lentamente durante 2 segundos. Mantené el ritmo.',
    minLevel: 'beginner',
    pattern: [
      { phase: 'contract', seconds: 1, from: 0, to: 1 },
      { phase: 'release', seconds: 2, from: 1, to: 0 },
      { phase: 'rest', seconds: 1, from: 0, to: 0 },
    ],
  },
  {
    id: 'trembling',
    name: 'Trembling',
    icon: '〰️',
    description: 'Contraé y soltá siguiendo el ritmo. Llevá cada contracción a la tensión máxima.',
    minLevel: 'beginner',
    pattern: [
      { phase: 'contract', seconds: 1, from: 0, to: 1 },
      { phase: 'release', seconds: 1, from: 1, to: 0 },
    ],
  },
  {
    id: 'trembling-2',
    name: 'Trembling 2',
    icon: '⚡',
    description:
      'Pulsos rápidos: contraé y soltá al ritmo marcado, llevando cada contracción a la tensión máxima.',
    minLevel: 'beginner',
    pattern: [
      { phase: 'contract', seconds: 0.5, from: 0, to: 1 },
      { phase: 'release', seconds: 0.5, from: 1, to: 0 },
    ],
  },
  {
    id: 'gearbox',
    name: 'Gearbox',
    icon: '⚙️',
    description:
      'Subí la contracción por etapas hasta el máximo y bajá por las mismas etapas. Trabajá el control gradual, no la fuerza bruta.',
    minLevel: 'medium',
    pattern: [
      { phase: 'contract', seconds: 2, from: 0, to: 0.33, label: '33%' },
      { phase: 'contract', seconds: 2, from: 0.33, to: 0.66, label: '66%' },
      { phase: 'contract', seconds: 2, from: 0.66, to: 1, label: '100%' },
      { phase: 'release', seconds: 2, from: 1, to: 0.66, label: '66%' },
      { phase: 'release', seconds: 2, from: 0.66, to: 0.33, label: '33%' },
      { phase: 'release', seconds: 2, from: 0.33, to: 0 },
      { phase: 'rest', seconds: 2, from: 0, to: 0 },
    ],
  },
  {
    id: 'holding',
    name: 'Holding',
    icon: '🏔️',
    description:
      'Contraé y sostené 10 segundos sin aflojar. Después soltá y descansá 10 segundos. Es el ejercicio de resistencia.',
    minLevel: 'medium',
    pattern: [
      { phase: 'contract', seconds: 1, from: 0, to: 1 },
      { phase: 'hold', seconds: 10, from: 1, to: 1 },
      { phase: 'release', seconds: 1, from: 1, to: 0 },
      { phase: 'rest', seconds: 10, from: 0, to: 0 },
    ],
  },
]

export function getExercise(id: string): KegelExercise | undefined {
  return KEGEL_EXERCISES.find((e) => e.id === id)
}

export function cycleSeconds(exercise: KegelExercise): number {
  return exercise.pattern.reduce((sum, s) => sum + s.seconds, 0)
}

/**
 * Cuántas repeticiones entran en la ventana de trabajo del nivel. Redondeamos
 * en vez de truncar para no cortar una contracción por la mitad: el ejercicio
 * real cae cerca del objetivo, nunca en medio de un apretón.
 */
export function repsFor(exercise: KegelExercise, level: KegelLevel): number {
  return Math.max(1, Math.round(level.workSeconds / cycleSeconds(exercise)))
}

export function exercisePool(levelId: KegelLevelId): KegelExercise[] {
  const rank = getLevel(levelId).rank
  return KEGEL_EXERCISES.filter((e) => getLevel(e.minLevel).rank <= rank)
}

export const EXERCISES_PER_ROUTINE = 6

/** 6 ejercicios al azar del pool del nivel, sin repetir dentro de la rutina. */
export function generateRoutine(levelId: KegelLevelId): string[] {
  const pool = [...exercisePool(levelId)]
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[pool[i], pool[j]] = [pool[j], pool[i]]
  }
  return pool.slice(0, EXERCISES_PER_ROUTINE).map((e) => e.id)
}

/**
 * Aplana la rutina en una línea de tiempo absoluta en milisegundos. Al
 * precalcularla, el reloj de reproducción solo tiene que buscar en qué tramo
 * cae `performance.now()`, sin acumular deriva.
 */
export function buildTimeline(exerciseIds: string[], levelId: KegelLevelId): KegelTimelineEntry[] {
  const level = getLevel(levelId)
  const timeline: KegelTimelineEntry[] = []
  let cursor = 0

  exerciseIds.forEach((exerciseId, exerciseIndex) => {
    const exercise = getExercise(exerciseId)
    if (!exercise) return
    const reps = repsFor(exercise, level)
    const blockStartMs = cursor
    const blockEntries: KegelTimelineEntry[] = []

    for (let rep = 0; rep < reps; rep++) {
      for (const step of exercise.pattern) {
        const duration = step.seconds * 1000
        blockEntries.push({
          kind: 'exercise',
          exerciseId,
          exerciseIndex,
          repIndex: rep,
          totalReps: reps,
          step,
          startMs: cursor,
          endMs: cursor + duration,
          blockStartMs,
          blockEndMs: 0, // se completa al cerrar el bloque
        })
        cursor += duration
      }
    }
    for (const entry of blockEntries) entry.blockEndMs = cursor
    timeline.push(...blockEntries)

    const isLast = exerciseIndex === exerciseIds.length - 1
    if (!isLast) {
      const duration = level.restSeconds * 1000
      timeline.push({
        kind: 'interRest',
        exerciseId,
        exerciseIndex,
        repIndex: 0,
        totalReps: 1,
        step: { phase: 'rest', seconds: level.restSeconds, from: 0, to: 0 },
        startMs: cursor,
        endMs: cursor + duration,
        blockStartMs: cursor,
        blockEndMs: cursor + duration,
      })
      cursor += duration
    }
  })

  return timeline
}

export function timelineDurationMs(timeline: KegelTimelineEntry[]): number {
  return timeline.length === 0 ? 0 : timeline[timeline.length - 1].endMs
}

export function routineDurationSeconds(exerciseIds: string[], levelId: KegelLevelId): number {
  return Math.round(timelineDurationMs(buildTimeline(exerciseIds, levelId)) / 1000)
}

const PHASE_LABELS: Record<KegelStep['phase'], string> = {
  contract: 'Contraé',
  hold: 'Mantené',
  release: 'Soltá',
  rest: 'Descansá',
}

export function phaseLabel(entry: KegelTimelineEntry): string {
  if (entry.kind === 'interRest') return 'Descanso'
  const base = PHASE_LABELS[entry.step.phase]
  // Los escalones de Gearbox necesitan el verbo además del porcentaje: un
  // "33%" solo no dice si hay que subir o bajar.
  return entry.step.label ? `${base} ${entry.step.label}` : base
}

/** Intensidad 0–1 interpolada dentro del paso actual. */
export function intensityAt(entry: KegelTimelineEntry, elapsedMs: number): number {
  const span = entry.endMs - entry.startMs
  if (span <= 0) return entry.step.to
  const t = Math.min(1, Math.max(0, (elapsedMs - entry.startMs) / span))
  return entry.step.from + (entry.step.to - entry.step.from) * t
}

export function formatDuration(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

export const REST_BETWEEN_ROUTINES_HOURS = 2
export const DAILY_ROUTINE_GOAL = 2
export const MAX_HOLD_TEST_INTERVAL_DAYS = 30

/**
 * Clave de día en hora local. No usamos `toISOString()` porque convierte a UTC
 * y cerca de medianoche asignaría la sesión al día equivocado.
 */
export function toDateKey(d: Date): string {
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

export function todayKey(): string {
  return toDateKey(new Date())
}

/** Días consecutivos (hacia atrás desde hoy) en los que se cumplió la meta. */
export function computeStreak(countsByDate: Record<string, number>, today: string): number {
  let streak = 0
  const cursor = new Date(today + 'T00:00:00')
  // Si hoy todavía no completó la meta, la racha se mide desde ayer: el día
  // en curso aún puede cumplirse y no debería romperla.
  if ((countsByDate[today] ?? 0) < DAILY_ROUTINE_GOAL) {
    cursor.setDate(cursor.getDate() - 1)
  }
  for (;;) {
    const key = toDateKey(cursor)
    if ((countsByDate[key] ?? 0) >= DAILY_ROUTINE_GOAL) {
      streak++
      cursor.setDate(cursor.getDate() - 1)
    } else {
      break
    }
  }
  return streak
}

/**
 * Sugerimos subir de nivel con 10 de los últimos 14 días cumplidos: tolera
 * faltar algún día sin exigir una racha perfecta.
 */
export const LEVEL_UP_WINDOW_DAYS = 14
export const LEVEL_UP_REQUIRED_DAYS = 10

export function shouldSuggestLevelUp(
  countsByDate: Record<string, number>,
  today: string,
  levelId: KegelLevelId,
): KegelLevelId | null {
  const current = getLevel(levelId)
  const next = KEGEL_LEVELS.find((l) => l.rank === current.rank + 1)
  if (!next) return null

  let met = 0
  const cursor = new Date(today + 'T00:00:00')
  for (let i = 0; i < LEVEL_UP_WINDOW_DAYS; i++) {
    if ((countsByDate[toDateKey(cursor)] ?? 0) >= DAILY_ROUTINE_GOAL) met++
    cursor.setDate(cursor.getDate() - 1)
  }
  return met >= LEVEL_UP_REQUIRED_DAYS ? next.id : null
}

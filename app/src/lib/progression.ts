import type { SessionExercise, SetLog, WorkoutSession } from './types'

/*
 * Progresión de cargas: qué hiciste la última vez con un ejercicio, y si toca
 * subir el peso.
 *
 * El método es la doble progresión, el estándar para quien entrena solo: se
 * trabaja en un rango de repeticiones (por ejemplo 10–12) y el peso sube recién
 * cuando todas las series llegan al tope del rango. Después de subir, se vuelve
 * a apuntar al piso del rango y se trepa de nuevo.
 */

export interface RepTarget {
  /** Piso del rango: a lo que se apunta después de subir el peso. */
  min: number
  /** Tope del rango: alcanzarlo en todas las series habilita la subida. */
  max: number
}

/**
 * Lee el objetivo de repeticiones de una rutina o programa: "10-12", "12",
 * "10 por pierna", "15 (total)". Los objetivos por tiempo ("30 seg") y los
 * AMRAP no tienen tope fijo, así que no admiten sugerencia de peso.
 */
export function parseReps(target: string | undefined): RepTarget | null {
  if (!target) return null
  const t = target.toLowerCase()
  if (/seg|min|amrap|máx|max/.test(t)) return null
  const range = t.match(/(\d+)\s*(?:-|–|a)\s*(\d+)/)
  if (range) {
    const a = Number(range[1])
    const b = Number(range[2])
    return { min: Math.min(a, b), max: Math.max(a, b) }
  }
  const single = t.match(/\d+/)
  if (single) {
    const n = Number(single[0])
    return { min: n, max: n }
  }
  return null
}

/** Series que cuentan: marcadas como hechas y con repeticiones anotadas. */
function doneSets(se: SessionExercise): SetLog[] {
  return se.sets.filter((s) => s.done && s.reps != null)
}

export interface LastPerformance {
  date: string
  sets: SetLog[]
}

/**
 * La última vez que hiciste un ejercicio en una sesión terminada, sin contar
 * la sesión en curso. Si el ejercicio aparece dos veces en esa sesión, cuenta
 * la aparición con más series hechas.
 */
export function lastPerformance(
  sessions: WorkoutSession[],
  exerciseId: string,
  excludeSessionId?: string,
): LastPerformance | null {
  const finished = sessions
    .filter((s) => s.finishedAt && s.id !== excludeSessionId)
    .sort((a, b) => b.finishedAt!.localeCompare(a.finishedAt!))
  for (const s of finished) {
    const candidates = s.exercises.filter((e) => e.exerciseId === exerciseId).map(doneSets)
    const best = candidates.sort((a, b) => b.length - a.length)[0]
    if (best && best.length > 0) return { date: s.finishedAt!, sets: best }
  }
  return null
}

/**
 * Cuánto se sube según el equipo. Son los saltos que existen en un gimnasio:
 * discos de 1,25 kg por lado en barra y máquinas, mancuernas de a 2 kg, pesas
 * rusas de a 4 kg.
 */
export function loadIncrement(equipment: string): number | null {
  const e = equipment.toLowerCase()
  if (e.includes('kettlebell')) return 4
  if (e.includes('dumbbell')) return 2
  if (/barbell|machine|cable|smith|weighted|sled|trap bar|ez/.test(e)) return 2.5
  // Peso corporal, bandas, pelota: no hay carga que subir.
  return null
}

export interface LoadSuggestion {
  /** Peso con el que se trabajó la última vez. */
  from: number
  /** Peso sugerido para hoy. */
  to: number
  /** Explicación en una línea: "Completaste 3 × 12 con 40 kg". */
  reason: string
}

function formatKg(kg: number): string {
  return Number.isInteger(kg) ? String(kg) : kg.toFixed(1).replace('.', ',')
}

/**
 * Sugiere subir el peso si la última vez todas las series llegaron al tope del
 * rango con el mismo peso de trabajo. Pide al menos tantas series como las que
 * tiene la sesión de hoy: haber hecho 1 de 3 no alcanza.
 */
export function suggestLoad(
  last: LastPerformance | null,
  target: RepTarget | null,
  plannedSets: number,
  equipment: string,
): LoadSuggestion | null {
  if (!last || !target) return null
  const step = loadIncrement(equipment)
  if (step == null) return null
  const weighted = last.sets.filter((s) => s.done && s.weight != null && s.weight > 0)
  if (weighted.length === 0) return null
  const working = Math.max(...weighted.map((s) => s.weight!))
  const atWorking = weighted.filter((s) => s.weight === working)
  if (atWorking.length < Math.max(1, plannedSets)) return null
  if (!atWorking.every((s) => (s.reps ?? 0) >= target.max)) return null
  const reps = atWorking.map((s) => s.reps).join(', ')
  const allSame = atWorking.every((s) => s.reps === atWorking[0].reps)
  return {
    from: working,
    to: Math.round((working + step) * 100) / 100,
    reason: allSame
      ? `Completaste ${atWorking.length} × ${atWorking[0].reps} con ${formatKg(working)} kg`
      : `Hiciste ${reps} repeticiones con ${formatKg(working)} kg`,
  }
}

export interface SetHint {
  weight: number | null
  reps: number | null
}

/**
 * Lo que se precarga en cada serie de hoy. Sin sugerencia aceptada, es lo que
 * hiciste la última vez en esa misma serie. Con la subida aceptada, es el peso
 * nuevo apuntando al piso del rango.
 */
export function setHints(
  count: number,
  last: LastPerformance | null,
  target: RepTarget | null,
  accepted: LoadSuggestion | null,
): SetHint[] {
  return Array.from({ length: count }, (_, i) => {
    const prev = last ? (last.sets[i] ?? last.sets[last.sets.length - 1]) : undefined
    if (accepted) {
      return { weight: accepted.to, reps: target?.min ?? prev?.reps ?? null }
    }
    return {
      weight: prev?.weight ?? null,
      reps: prev?.reps ?? target?.max ?? null,
    }
  })
}

/**
 * Fuerza estimada a una repetición (fórmula de Epley). Sirve para comparar
 * series con distinto peso y repeticiones: 40 × 12 y 45 × 8 son parecidas.
 */
export function estimatedOneRepMax(weight: number, reps: number): number {
  if (reps <= 1) return weight
  return weight * (1 + reps / 30)
}

export { formatKg }

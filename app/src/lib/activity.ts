import { toDateKey, todayKey } from './kegel'
import { listKegelSessions, listMindfulnessLogs, listSessions } from './store'

/**
 * Actividad unificada de todos los módulos.
 *
 * Un día cuenta como activo si entrenaste, hiciste Kegel o meditaste. Es lo que
 * convierte tres módulos sueltos en una sola práctica: la racha no se rompe por
 * saltear un módulo, solo por no hacer nada.
 */

export interface DayActivity {
  workout: number
  kegel: number
  mindfulness: number
}

export type ActivityByDate = Record<string, DayActivity>

const EMPTY: DayActivity = { workout: 0, kegel: 0, mindfulness: 0 }

function bump(map: ActivityByDate, date: string, key: keyof DayActivity): void {
  const current = map[date] ?? { ...EMPTY }
  map[date] = { ...current, [key]: current[key] + 1 }
}

export async function loadActivity(): Promise<ActivityByDate> {
  const [workouts, kegels, minds] = await Promise.all([
    listSessions(),
    listKegelSessions(),
    listMindfulnessLogs(),
  ])
  const map: ActivityByDate = {}

  for (const s of workouts) {
    // Solo las sesiones terminadas cuentan; una abierta y abandonada no es
    // actividad.
    if (!s.finishedAt) continue
    bump(map, toDateKey(new Date(s.finishedAt)), 'workout')
  }
  for (const k of kegels) bump(map, k.date, 'kegel')
  for (const m of minds) bump(map, m.date, 'mindfulness')

  return map
}

export function isActive(day: DayActivity | undefined): boolean {
  if (!day) return false
  return day.workout > 0 || day.kegel > 0 || day.mindfulness > 0
}

/** Días activos consecutivos hacia atrás. El día en curso no rompe la racha. */
export function activeStreak(activity: ActivityByDate, today = todayKey()): number {
  let streak = 0
  const cursor = new Date(today + 'T00:00:00')
  if (!isActive(activity[today])) cursor.setDate(cursor.getDate() - 1)
  for (;;) {
    if (!isActive(activity[toDateKey(cursor)])) break
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export const CONSISTENCY_WINDOW_DAYS = 30

export function consistencyPercent(activity: ActivityByDate, today = todayKey()): number {
  let active = 0
  const cursor = new Date(today + 'T00:00:00')
  for (let i = 0; i < CONSISTENCY_WINDOW_DAYS; i++) {
    if (isActive(activity[toDateKey(cursor)])) active++
    cursor.setDate(cursor.getDate() - 1)
  }
  return Math.round((active / CONSISTENCY_WINDOW_DAYS) * 100)
}

/** Últimos N días, del más viejo al más nuevo, para la tira de constancia. */
export function recentDays(activity: ActivityByDate, days: number, today = todayKey()): {
  date: string
  active: boolean
}[] {
  const out: { date: string; active: boolean }[] = []
  const cursor = new Date(today + 'T00:00:00')
  cursor.setDate(cursor.getDate() - (days - 1))
  for (let i = 0; i < days; i++) {
    const key = toDateKey(cursor)
    out.push({ date: key, active: isActive(activity[key]) })
    cursor.setDate(cursor.getDate() + 1)
  }
  return out
}

export function totalActiveDays(activity: ActivityByDate): number {
  return Object.values(activity).filter(isActive).length
}

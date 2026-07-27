import { PROGRAM_MONTHS, WEEKS_PER_MONTH } from '../data/program'
import type { ProgramDay, ProgramMonth, WorkoutSession } from './types'

export const SESSIONS_PER_WEEK = 3
export const SESSIONS_PER_MONTH = WEEKS_PER_MONTH.map((w) => w * SESSIONS_PER_WEEK)
export const TOTAL_WEEKS = WEEKS_PER_MONTH.reduce((a, b) => a + b, 0)
export const TOTAL_SESSIONS = SESSIONS_PER_MONTH.reduce((a, b) => a + b, 0)

export function getProgramMonth(month: number): ProgramMonth | undefined {
  return PROGRAM_MONTHS.find((m) => m.month === month)
}

export function getProgramDay(month: number, day: number): ProgramDay | undefined {
  return getProgramMonth(month)?.days.find((d) => d.day === day)
}

export function monthWeekRange(month: number): { start: number; end: number } {
  let start = 1
  for (let i = 0; i < month - 1; i++) start += WEEKS_PER_MONTH[i]
  return { start, end: start + WEEKS_PER_MONTH[month - 1] - 1 }
}

export interface ProgramPosition {
  month: number
  day: 1 | 2 | 3
}

export function positionForIndex(index0: number): ProgramPosition {
  let acc = 0
  for (let i = 0; i < SESSIONS_PER_MONTH.length; i++) {
    const count = SESSIONS_PER_MONTH[i]
    if (index0 < acc + count) {
      const day = ((index0 - acc) % SESSIONS_PER_WEEK) + 1
      return { month: i + 1, day: day as 1 | 2 | 3 }
    }
    acc += count
  }
  return { month: PROGRAM_MONTHS.length, day: 3 }
}

function isFinishedProgramSession(s: WorkoutSession): boolean {
  return !!s.programMeta && !!s.finishedAt
}

export function programSessions(sessions: WorkoutSession[]): WorkoutSession[] {
  return sessions
    .filter(isFinishedProgramSession)
    .sort((a, b) => (a.finishedAt ?? '').localeCompare(b.finishedAt ?? ''))
}

export interface ProgramProgress {
  completedCount: number
  totalSessions: number
  percent: number
  finished: boolean
  currentWeek: number
  next: ProgramPosition | null
  countByMonth: Record<number, number>
}

export function computeProgress(sessions: WorkoutSession[]): ProgramProgress {
  const done = programSessions(sessions)
  const completedCount = done.length
  const finished = completedCount >= TOTAL_SESSIONS
  const capped = Math.min(completedCount, TOTAL_SESSIONS)
  const currentWeek = Math.min(TOTAL_WEEKS, Math.floor(capped / SESSIONS_PER_WEEK) + (finished ? 0 : 1))
  const countByMonth: Record<number, number> = {}
  for (const s of done) {
    const m = s.programMeta!.month
    countByMonth[m] = (countByMonth[m] ?? 0) + 1
  }
  return {
    completedCount,
    totalSessions: TOTAL_SESSIONS,
    percent: Math.round((capped / TOTAL_SESSIONS) * 100),
    finished,
    currentWeek,
    next: finished ? null : positionForIndex(capped),
    countByMonth,
  }
}

function mondayOf(date: Date): string {
  const d = new Date(date)
  const day = (d.getDay() + 6) % 7
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - day)
  return d.toISOString().slice(0, 10)
}

export interface WeekActivity {
  weekStart: string
  count: number
}

export function last12WeeksActivity(sessions: WorkoutSession[]): WeekActivity[] {
  const done = programSessions(sessions)
  const counts = new Map<string, number>()
  for (const s of done) {
    const key = mondayOf(new Date(s.finishedAt!))
    counts.set(key, (counts.get(key) ?? 0) + 1)
  }
  const weeks: WeekActivity[] = []
  const today = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i * 7)
    const key = mondayOf(d)
    weeks.push({ weekStart: key, count: Math.min(3, counts.get(key) ?? 0) })
  }
  return weeks
}

export function currentStreakWeeks(activity: WeekActivity[]): number {
  let streak = 0
  for (let i = activity.length - 1; i >= 0; i--) {
    if (activity[i].count > 0) streak++
    else break
  }
  return streak
}

const MOTIVATION_BY_PERCENT: [number, string][] = [
  [0, 'Arrancaste tu primer año. Cada sesión, por corta que sea, ya es más de lo que hacías antes.'],
  [10, 'Ya no sos la misma persona que empezó. El hábito se está formando.'],
  [25, 'Un cuarto del camino. Los movimientos que costaban al principio ahora te salen naturales.'],
  [40, 'Vas por más de un tercio del año. El cuerpo ya está respondiendo — seguí sumando.'],
  [50, 'Mitad del año cumplida. De acá en adelante, todo lo que sumes es terreno nuevo.'],
  [65, 'La segunda mitad siempre rinde más rápido que la primera. Se nota en cómo entrenás.'],
  [80, 'Estás en la recta final. Lo más difícil — arrancar y sostenerlo — ya lo hiciste.'],
  [95, 'Últimas sesiones del año. Preparate para la evaluación final del mes 12.'],
  [100, '¡Completaste tu primer año de entrenamiento! Revisá cuánto mejoraste desde la evaluación inicial.'],
]

export function motivationalMessage(percent: number): string {
  let msg = MOTIVATION_BY_PERCENT[0][1]
  for (const [threshold, text] of MOTIVATION_BY_PERCENT) {
    if (percent >= threshold) msg = text
  }
  return msg
}

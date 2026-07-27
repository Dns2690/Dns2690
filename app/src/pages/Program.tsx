import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { listSessions } from '../lib/store'
import { startProgramSession } from '../lib/workout'
import { getProgramInfo } from '../data/programs'
import {
  computeProgress,
  currentStreakWeeks,
  getProgramDay,
  getProgramMonth,
  last12WeeksActivity,
  motivationalMessage,
  TOTAL_SESSIONS,
  TOTAL_WEEKS,
  type ProgramProgress,
  type WeekActivity,
} from '../lib/program'
import type { WorkoutSession } from '../lib/types'

export default function Program() {
  const { programId = '' } = useParams()
  const navigate = useNavigate()
  const [sessions, setSessions] = useState<WorkoutSession[] | null>(null)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    listSessions().then(setSessions)
  }, [])

  const program = getProgramInfo(programId)

  if (!program) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Programa" back />
        <p className="p-6 text-center text-sm text-gray-500">Programa no encontrado.</p>
      </div>
    )
  }

  if (sessions === null) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title={program.name} back />
        <p className="p-6 text-center text-sm text-gray-500">Cargando…</p>
      </div>
    )
  }

  const progress: ProgramProgress = computeProgress(sessions, programId)
  const activity: WeekActivity[] = last12WeeksActivity(sessions, programId)
  const streak = currentStreakWeeks(activity)
  const nextMonth = progress.next ? getProgramMonth(programId, progress.next.month) : null
  const nextDay = progress.next ? getProgramDay(programId, progress.next.month, progress.next.day) : null

  async function handleStart() {
    if (!progress.next || starting) return
    setStarting(true)
    const s = await startProgramSession(programId, progress.next.month, progress.next.day)
    navigate(`/entrenar/${s.id}`)
  }

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar title={program.name} back />

      <div className="flex flex-col gap-4 p-4">
        <div className="rounded-2xl bg-gradient-to-br from-cyan-500/20 to-white/5 p-4">
          <p className="text-xs text-cyan-300">
            Semana {progress.currentWeek} de {TOTAL_WEEKS} · {progress.completedCount}/{TOTAL_SESSIONS} sesiones
          </p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-cyan-400 transition-all"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="mt-3 text-sm text-gray-200">{motivationalMessage(progress.percent)}</p>
        </div>

        {progress.next && nextMonth && nextDay ? (
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-xs text-gray-500">Próxima sesión · Mes {nextMonth.month}: {nextMonth.title}</p>
            <p className="mt-1 text-base font-medium text-gray-100">{nextDay.name}</p>
            <p className="mt-1 text-xs text-gray-400">{nextDay.exercises.length} ejercicios · ~1 hora</p>
            <button
              onClick={handleStart}
              disabled={starting}
              className="mt-3 w-full rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-[#0b0d12] active:bg-cyan-400 disabled:opacity-50"
            >
              Empezar sesión de hoy
            </button>
          </div>
        ) : (
          <div className="rounded-2xl bg-amber-400/10 p-4 text-center">
            <p className="text-sm text-amber-300">🎉 Completaste las 156 sesiones de este programa.</p>
          </div>
        )}

        <div className="rounded-2xl bg-white/5 p-4">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-xs text-gray-500">Últimas 12 semanas</p>
            {streak > 0 && <p className="text-xs text-cyan-400">🔥 Racha: {streak} semana{streak === 1 ? '' : 's'}</p>}
          </div>
          <div className="flex items-end gap-1.5">
            {activity.map((w) => (
              <div key={w.weekStart} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex h-8 w-full items-end">
                  <div
                    className="w-full rounded-sm bg-cyan-400"
                    style={{ height: `${(w.count / 3) * 100}%`, opacity: w.count === 0 ? 0.08 : 0.4 + w.count * 0.2 }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="px-1 text-xs text-gray-500">Recorrido del año</p>
          {program.months.map((m) => {
            const done = progress.countByMonth[m.month] ?? 0
            const total = m.weeks * 3
            const isCurrent = progress.next?.month === m.month
            const isComplete = done >= total
            return (
              <Link
                key={m.month}
                to={`/programas/${programId}/mes/${m.month}`}
                className={`flex items-center justify-between rounded-xl p-3 ${
                  isCurrent ? 'bg-cyan-400/10 ring-1 ring-cyan-400/40' : 'bg-white/5'
                }`}
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-gray-100">
                    Mes {m.month} · {m.title} {isComplete && '✓'}
                  </p>
                  <p className="truncate text-xs text-gray-500">{m.focus}</p>
                </div>
                <p className="ml-2 flex-shrink-0 text-xs text-gray-500">
                  {Math.min(done, total)}/{total}
                </p>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}

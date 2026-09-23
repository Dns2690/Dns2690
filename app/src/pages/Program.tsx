import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import Icon from '../components/Icon'
import { Button, Placeholder, Row, Section, Stat } from '../components/ui'
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
        <Placeholder>Programa no encontrado.</Placeholder>
      </div>
    )
  }

  if (sessions === null) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title={program.name} back="Programas" large />
        <Placeholder>Cargando…</Placeholder>
      </div>
    )
  }

  const progress = computeProgress(sessions, programId)
  const activity = last12WeeksActivity(sessions, programId)
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
    <div className="flex flex-1 flex-col pb-8">
      <TopBar title={program.name} back="Programas" large />

      <div className="flex flex-col gap-7">
        <div className="px-4">
          <div className="rounded-xl bg-cell p-4">
            <div className="flex gap-4">
              <Stat label="Semana" value={`${progress.currentWeek}/${TOTAL_WEEKS}`} />
              <Stat label="Sesiones" value={`${progress.completedCount}/${TOTAL_SESSIONS}`} />
              <Stat label="Avance" value={`${progress.percent}%`} tone="fit" />
            </div>
            <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-cell-2">
              <div className="h-full rounded-full bg-fit-500 transition-all" style={{ width: `${progress.percent}%` }} />
            </div>
            <p className="mt-3 text-[15px] leading-snug text-label-2">{motivationalMessage(progress.percent)}</p>
          </div>
        </div>

        {progress.next && nextMonth && nextDay ? (
          <Section header="Próxima sesión">
            <div className="p-4">
              <p className="text-[13px] text-label-2">
                Mes {nextMonth.month} · {nextMonth.title}
              </p>
              <p className="mt-0.5 text-[22px] font-bold leading-tight tracking-tight text-label">{nextDay.name}</p>
              <p className="mt-1 text-[15px] text-label-2">{nextDay.exercises.length} ejercicios · cerca de una hora</p>
              <div className="mt-4">
                <Button onClick={handleStart} disabled={starting} icon="play">
                  Empezar sesión de hoy
                </Button>
              </div>
            </div>
          </Section>
        ) : (
          <Section>
            <div className="flex items-center gap-3 p-4">
              <Icon name="trophy" size={28} className="text-fit-400" />
              <p className="text-[15px] text-label">Completaste las {TOTAL_SESSIONS} sesiones de este programa.</p>
            </div>
          </Section>
        )}

        <Section
          header="Últimas 12 semanas"
          footer={streak > 0 ? `Racha de ${streak} ${streak === 1 ? 'semana' : 'semanas'} seguidas.` : undefined}
        >
          <div className="p-4">
            {/* Una columna por semana, alto según sesiones hechas (de 0 a 3). */}
            <div className="flex h-16 items-end gap-1.5" role="img" aria-label="Sesiones por semana">
              {activity.map((w) => (
                <div key={w.weekStart} className="flex h-full flex-1 items-end" title={`${w.count} de 3`}>
                  <div
                    className={`w-full rounded-t-[4px] ${w.count === 0 ? 'bg-cell-2' : 'bg-fit-data'}`}
                    style={{ height: w.count === 0 ? 3 : `${(w.count / 3) * 100}%` }}
                  />
                </div>
              ))}
            </div>
            <div className="mt-1.5 flex justify-between text-[11px] text-label-3">
              <span>hace 12 sem.</span>
              <span>esta semana</span>
            </div>
          </div>
        </Section>

        <Section header="Recorrido del año">
          {program.months.map((m) => {
            const done = progress.countByMonth[m.month] ?? 0
            const total = m.weeks * 3
            const isCurrent = progress.next?.month === m.month
            const isComplete = done >= total
            return (
              <Row
                key={m.month}
                to={`/programas/${programId}/mes/${m.month}`}
                leading={
                  <span
                    className={`flex h-[29px] w-[29px] shrink-0 items-center justify-center rounded-full text-[13px] font-bold tabular-nums ${
                      isComplete
                        ? 'bg-fit-500 text-black'
                        : isCurrent
                          ? 'text-fit-400 ring-2 ring-fit-400 ring-inset'
                          : 'bg-cell-2 text-label-2'
                    }`}
                  >
                    {isComplete ? <Icon name="check" size={16} strokeWidth={3} /> : m.month}
                  </span>
                }
                title={m.title}
                subtitle={m.focus}
                detail={<span className="text-[15px] tabular-nums">{Math.min(done, total)}/{total}</span>}
              />
            )
          })}
        </Section>
      </div>
    </div>
  )
}

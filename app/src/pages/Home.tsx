import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  activeStreak,
  consistencyPercent,
  CONSISTENCY_WINDOW_DAYS,
  loadActivity,
  recentDays,
  totalActiveDays,
  type ActivityByDate,
} from '../lib/activity'
import { DAILY_ROUTINE_GOAL, todayKey } from '../lib/kegel'
import { getProfile, listSessions } from '../lib/store'
import { PROGRAMS } from '../data/programs'
import { computeProgress } from '../lib/program'
import { exercises } from '../lib/exercises'
import type { Profile, WorkoutSession } from '../lib/types'
import TopBar from '../components/TopBar'
import Icon, { IconTile } from '../components/Icon'
import ConsistencyStrip from '../components/ConsistencyStrip'
import { Avatar, Button, Placeholder, Row, Section, Stat } from '../components/ui'
import { WeekDots } from '../components/PlanSummary'
import { useActivePlan } from '../lib/usePlan'
import type { IconName } from '../components/Icon'

function greeting(): string {
  const h = new Date().getHours()
  if (h < 6) return 'Buenas noches'
  if (h < 13) return 'Buen día'
  if (h < 20) return 'Buenas tardes'
  return 'Buenas noches'
}

function longDate(): string {
  return new Date().toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })
}

/**
 * Portada de la app, dedicada a los ejercicios.
 *
 * Arriba va lo único que importa al abrirla: qué toca entrenar hoy. Después las
 * secciones de ejercicios que no tienen pestaña propia, la constancia, y al
 * final una sola entrada al plano secundario (Kegel y Mindfulness).
 */
export default function Home() {
  const [activity, setActivity] = useState<ActivityByDate | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const planState = useActivePlan()

  useEffect(() => {
    let alive = true
    void (async () => {
      const [a, p, s] = await Promise.all([loadActivity(), getProfile(), listSessions()])
      if (!alive) return
      setActivity(a)
      setProfile(p ?? null)
      setSessions(s)
    })()
    return () => {
      alive = false
    }
  }, [])

  const today = todayKey()
  const streak = useMemo(() => (activity ? activeStreak(activity, today) : 0), [activity, today])
  const consistency = useMemo(
    () => (activity ? consistencyPercent(activity, today) : 0),
    [activity, today],
  )
  const strip = useMemo(
    () => (activity ? recentDays(activity, CONSISTENCY_WINDOW_DAYS, today).map((d) => d.date) : []),
    [activity, today],
  )
  const activeDays = useMemo(() => (activity ? totalActiveDays(activity) : 0), [activity])

  // Programa con más avance: es el que el usuario está siguiendo de verdad.
  const activeProgram = useMemo(() => {
    let best: { id: string; name: string; month: number; day: number; percent: number } | null = null
    for (const p of PROGRAMS) {
      const progress = computeProgress(sessions, p.id)
      if (progress.completedCount === 0) continue
      if (!best || progress.percent > best.percent) {
        best = {
          id: p.id,
          name: p.name,
          month: progress.next?.month ?? 12,
          day: progress.next?.day ?? 3,
          percent: progress.percent,
        }
      }
    }
    return best
  }, [sessions])

  const header = (
    <TopBar
      large
      title={greeting()}
      subtitle={longDate()}
      right={
        <Link to="/ajustes" aria-label="Ajustes" className="flex h-11 items-center pr-2 active:opacity-60">
          <Avatar name={profile?.name} size={32} />
        </Link>
      }
    />
  )

  if (!activity) {
    return (
      <div className="flex flex-1 flex-col">
        {header}
        <Placeholder>Cargando…</Placeholder>
      </div>
    )
  }

  const todayActivity = activity[today]
  const workoutToday = todayActivity?.workout ?? 0
  const kegelToday = todayActivity?.kegel ?? 0
  const mindToday = todayActivity?.mindfulness ?? 0
  const openSession = sessions.find((s) => !s.finishedAt)
  const finishedCount = sessions.filter((s) => s.finishedAt).length

  /**
   * Lo que la app propone hacer ahora mismo, en este orden: terminar lo que
   * quedó abierto, la rutina que toca del plan propio, el día del programa en
   * curso, o elegir por dónde arrancar.
   */
  interface NextUp {
    icon: IconName
    kicker: string
    title: string
    cta: string
    to?: string
    onClick?: () => void
    percent: number | null
    week?: { done: number; goal: number }
  }
  const { plan, progress: planProg, nextRoutine } = planState
  const next: NextUp = openSession
    ? {
        to: `/entrenar/${openSession.id}`,
        icon: 'stopwatch',
        kicker: 'Sesión sin terminar',
        title: openSession.routineName || 'Sesión libre',
        cta: 'Seguir entrenando',
        percent: null,
      }
    : plan && planProg && planProg.finished
      ? {
          to: '/plan',
          icon: 'trophy',
          kicker: `${plan.name} · bloque terminado`,
          title: 'Mirá cuánto subiste',
          cta: 'Ver resultados',
          percent: planProg.percent,
        }
      : plan && planProg && nextRoutine
        ? {
            onClick: () => void planState.startNext(),
            icon: 'calendar',
            kicker: `${plan.name} · semana ${planProg.currentWeek} de ${plan.weeks}`,
            title: nextRoutine.name,
            cta: `Empezar ${nextRoutine.name}`,
            percent: null,
            week: { done: planProg.thisWeek, goal: plan.perWeek },
          }
        : activeProgram
          ? {
              to: `/programas/${activeProgram.id}/mes/${activeProgram.month}`,
              icon: 'target',
              kicker: activeProgram.name,
              title: `Mes ${activeProgram.month} · Día ${activeProgram.day}`,
              cta: 'Ver la sesión',
              percent: activeProgram.percent,
            }
          : {
              to: '/programas',
              icon: 'target',
              kicker: 'Sin programa empezado',
              title: 'Elegí por dónde arrancar',
              cta: 'Ver programas',
              percent: null,
            }

  const wellnessStatus = [
    `Kegel ${kegelToday}/${DAILY_ROUTINE_GOAL}`,
    mindToday ? `${mindToday} ${mindToday === 1 ? 'meditación' : 'meditaciones'}` : 'sin meditar',
  ].join(' · ')

  return (
    <div className="flex flex-1 flex-col pb-8">
      {header}

      <div className="flex flex-col gap-7">
        {/* Lo próximo: la única tarjeta con acento lleno de la pantalla. */}
        <div className="px-4">
          <div className="rounded-2xl bg-cell p-4">
            <div className="flex items-center gap-2.5">
              <IconTile name={next.icon} tone="fit" />
              <p className="min-w-0 truncate text-[15px] font-semibold text-fit-400">{next.kicker}</p>
            </div>
            <p className="mt-3 text-[28px] font-bold leading-tight tracking-tight text-label">{next.title}</p>
            {next.percent !== null && (
              <div className="mt-3">
                <div className="h-1.5 overflow-hidden rounded-full bg-cell-2">
                  <div className="h-full rounded-full bg-fit-500" style={{ width: `${next.percent}%` }} />
                </div>
                <p className="mt-1.5 text-[13px] text-label-2">
                  {next.percent}% del {plan && planProg?.finished ? 'bloque' : 'programa'}
                </p>
              </div>
            )}
            {next.week && (
              <div className="mt-3 flex items-center gap-3">
                <WeekDots done={next.week.done} goal={next.week.goal} />
                <span className="text-[15px] text-label-2">
                  {next.week.done} de {next.week.goal} esta semana
                </span>
              </div>
            )}
            {workoutToday > 0 && (
              <p className="mt-2 flex items-center gap-1.5 text-[15px] text-label-2">
                <Icon name="check" size={16} strokeWidth={2.6} className="text-fit-400" />
                Hoy ya {workoutToday === 1 ? 'entrenaste una vez' : `entrenaste ${workoutToday} veces`}
              </p>
            )}
            <div className="mt-4">
              <Button to={next.to} onClick={next.onClick} icon={openSession || next.onClick ? 'play' : undefined}>
                {next.cta}
              </Button>
            </div>
          </div>
        </div>

        <Section>
          <Row
            to="/programas"
            icon="target"
            title="Programas"
            subtitle={activeProgram ? `${activeProgram.name} · ${activeProgram.percent}%` : `${PROGRAMS.length} programas de un año`}
          />
          <Row to="/biblioteca" icon="book" title="Biblioteca" subtitle={`${exercises.length} ejercicios`} />
          <Row
            to="/historial"
            icon="bars"
            title="Historial"
            subtitle={
              finishedCount
                ? `${finishedCount} ${finishedCount === 1 ? 'sesión completada' : 'sesiones completadas'}`
                : 'Sin sesiones todavía'
            }
          />
        </Section>

        <Section header="Constancia" footer="Un día cuenta si hiciste algo en cualquier módulo.">
          <div className="p-4">
            <div className="flex items-start gap-4">
              <Stat
                label="Racha"
                value={
                  <span className="flex items-center gap-1">
                    {streak}
                    <Icon name="flame" size={22} className={streak > 0 ? 'text-fit-400' : 'text-label-3'} />
                  </span>
                }
              />
              <Stat label={`${CONSISTENCY_WINDOW_DAYS} días`} value={`${consistency}%`} />
              <Stat label="Activos" value={activeDays} />
            </div>
            <div className="mt-4">
              <ConsistencyStrip activity={activity} days={strip} />
            </div>
          </div>
        </Section>

        <Section header="Bienestar">
          <Row to="/bienestar" icon="leaf" tone="gray" title="Kegel y meditación" subtitle={wellnessStatus} />
        </Section>
      </div>
    </div>
  )
}

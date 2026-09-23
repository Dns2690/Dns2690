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
import { getProfile, listRoutines, listSessions } from '../lib/store'
import { PROGRAMS } from '../data/programs'
import { computeProgress } from '../lib/program'
import { exercises } from '../lib/exercises'
import { MODULE_THEMES } from '../lib/theme'
import type { Profile, Routine, WorkoutSession } from '../lib/types'

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
  const [routines, setRoutines] = useState<Routine[]>([])

  useEffect(() => {
    let alive = true
    void (async () => {
      const [a, p, s, r] = await Promise.all([
        loadActivity(),
        getProfile(),
        listSessions(),
        listRoutines(),
      ])
      if (!alive) return
      setActivity(a)
      setProfile(p ?? null)
      setSessions(s)
      setRoutines(r)
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
  const strip = useMemo(() => (activity ? recentDays(activity, 30, today) : []), [activity, today])
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

  if (!activity) {
    return (
      <div className="flex flex-1 flex-col">
        <p className="p-6 text-center text-base text-gray-500">Cargando…</p>
      </div>
    )
  }

  const todayActivity = activity[today]
  const workoutToday = todayActivity?.workout ?? 0
  const kegelToday = todayActivity?.kegel ?? 0
  const mindToday = todayActivity?.mindfulness ?? 0
  const openSession = sessions.find((s) => !s.finishedAt)
  const finishedCount = sessions.filter((s) => s.finishedAt).length
  const fitness = MODULE_THEMES.fitness

  /** Lo que la app propone hacer ahora mismo. */
  const next = openSession
    ? {
        to: `/entrenar/${openSession.id}`,
        kicker: 'Sesión sin terminar',
        title: openSession.routineName || 'Sesión libre',
        cta: 'Seguir entrenando',
      }
    : activeProgram
      ? {
          to: `/programas/${activeProgram.id}/mes/${activeProgram.month}`,
          kicker: `${activeProgram.name} · ${activeProgram.percent}%`,
          title: `Mes ${activeProgram.month}, día ${activeProgram.day}`,
          cta: 'Ver la sesión',
        }
      : {
          to: '/programas',
          kicker: 'Sin programa empezado',
          title: 'Elegí por dónde arrancar',
          cta: `${PROGRAMS.length} programas de un año`,
        }

  const sections = [
    {
      to: '/programas',
      icon: '🎯',
      title: 'Programas',
      subtitle: activeProgram
        ? `${activeProgram.name} · ${activeProgram.percent}% completado`
        : `${PROGRAMS.length} programas de un año`,
    },
    {
      to: '/biblioteca',
      icon: '📚',
      title: 'Biblioteca',
      subtitle: `${exercises.length} ejercicios con video y explicación`,
    },
    {
      to: '/historial',
      icon: '📈',
      title: 'Historial',
      subtitle: finishedCount
        ? `${finishedCount} ${finishedCount === 1 ? 'sesión completada' : 'sesiones completadas'}`
        : 'Todavía no registraste sesiones',
    },
  ]

  /** Cada día de la tira se pinta con los colores de los módulos que hiciste. */
  function dayBackground(date: string): string {
    const day = activity![date]
    if (!day) return 'rgba(255,255,255,0.08)'
    const colors: string[] = []
    if (day.workout > 0) colors.push(MODULE_THEMES.fitness.textHex)
    if (day.kegel > 0) colors.push(MODULE_THEMES.kegel.textHex)
    if (day.mindfulness > 0) colors.push(MODULE_THEMES.mindfulness.textHex)
    if (colors.length === 0) return 'rgba(255,255,255,0.08)'
    if (colors.length === 1) return colors[0]
    const stops = colors
      .map((c, i) => `${c} ${(i / colors.length) * 100}% ${((i + 1) / colors.length) * 100}%`)
      .join(', ')
    return `linear-gradient(to bottom, ${stops})`
  }

  const wellnessStatus = [
    `Kegel ${kegelToday}/${DAILY_ROUTINE_GOAL}`,
    mindToday ? `${mindToday} ${mindToday === 1 ? 'meditación' : 'meditaciones'}` : 'sin meditar',
  ].join(' · ')

  return (
    <div className="flex flex-1 flex-col pb-6">
      <div className="flex items-start justify-between px-4 pb-2 pt-[calc(env(safe-area-inset-top)+1.5rem)]">
        <div className="min-w-0">
          <p className="text-2xl font-bold text-gray-100">
            {greeting()}
            {profile?.name ? `, ${profile.name}` : ''}
          </p>
          <p className="mt-0.5 text-base text-gray-500 first-letter:uppercase">{longDate()}</p>
        </div>
        <Link
          to="/ajustes"
          className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full text-xl active:bg-white/10"
          aria-label="Ajustes"
        >
          ⚙️
        </Link>
      </div>

      <div className="flex flex-col gap-3 p-4">
        <Link
          to={next.to}
          className="rounded-2xl p-4 active:brightness-110"
          style={{ background: `${fitness.textHex}1f` }}
        >
          <p className="text-sm text-gray-400">{next.kicker}</p>
          <p className="mt-0.5 text-xl font-bold text-gray-100">{next.title}</p>
          <p className="mt-2 text-base font-medium" style={{ color: fitness.textHex }}>
            {next.cta} ›
          </p>
        </Link>

        {workoutToday > 0 && (
          <p className="px-1 text-base text-gray-500">
            Hoy ya {workoutToday === 1 ? 'entrenaste una vez' : `entrenaste ${workoutToday} veces`}.
          </p>
        )}

        <div className="flex flex-col gap-2">
          {sections.map((s) => (
            <Link
              key={s.to}
              to={s.to}
              className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 active:bg-white/10"
            >
              <span className="text-2xl">{s.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-gray-100">{s.title}</p>
                <p className="truncate text-base text-gray-500">{s.subtitle}</p>
              </div>
              <span className="text-gray-600">›</span>
            </Link>
          ))}
          {routines.length > 0 && (
            <Link
              to="/rutinas"
              className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 active:bg-white/10"
            >
              <span className="text-2xl">📋</span>
              <div className="min-w-0 flex-1">
                <p className="text-lg font-semibold text-gray-100">Rutinas</p>
                <p className="truncate text-base text-gray-500">
                  {routines.length} {routines.length === 1 ? 'rutina propia' : 'rutinas propias'}
                </p>
              </div>
              <span className="text-gray-600">›</span>
            </Link>
          )}
        </div>

        <div className="rounded-2xl bg-white/5 p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-lg font-bold text-gray-100">Tu constancia</p>
            {streak > 0 && (
              <p className="text-base font-medium text-gray-200">
                🔥 {streak} {streak === 1 ? 'día' : 'días'}
              </p>
            )}
          </div>
          <p className="mt-1 text-base text-gray-500">
            Un día cuenta si hiciste algo en cualquier módulo.
          </p>

          <div className="mt-3 flex gap-[3px]">
            {strip.map((d) => (
              <div
                key={d.date}
                title={d.date}
                className="h-8 flex-1 rounded-sm"
                style={{ background: dayBackground(d.date) }}
              />
            ))}
          </div>
          <div className="mt-1.5 flex justify-between text-sm text-gray-600">
            <span>hace {CONSISTENCY_WINDOW_DAYS} días</span>
            <span>hoy</span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/5 p-3 text-center">
              <p className="text-2xl font-bold text-white">{consistency}%</p>
              <p className="mt-0.5 text-sm text-gray-400">últimos {CONSISTENCY_WINDOW_DAYS} días</p>
            </div>
            <div className="rounded-xl bg-white/5 p-3 text-center">
              <p className="text-2xl font-bold text-white">{activeDays}</p>
              <p className="mt-0.5 text-sm text-gray-400">días activos</p>
            </div>
          </div>
        </div>

        {/* Única entrada al plano secundario desde la portada. */}
        <Link
          to="/bienestar"
          className="flex items-center gap-3 rounded-2xl border border-white/10 px-4 py-3 active:bg-white/5"
        >
          <span className="text-xl">🌿</span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-medium text-gray-300">Bienestar</p>
            <p className="truncate text-sm text-gray-500">{wellnessStatus}</p>
          </div>
          <span className="text-gray-600">›</span>
        </Link>
      </div>
    </div>
  )
}

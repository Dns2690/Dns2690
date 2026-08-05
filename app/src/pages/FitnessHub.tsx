import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { listRoutines, listSessions } from '../lib/store'
import { computeProgress } from '../lib/program'
import { PROGRAMS } from '../data/programs'
import { exercises } from '../lib/exercises'
import type { Routine, WorkoutSession } from '../lib/types'

export default function FitnessHub() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([])
  const [routines, setRoutines] = useState<Routine[]>([])

  useEffect(() => {
    let alive = true
    Promise.all([listSessions(), listRoutines()]).then(([s, r]) => {
      if (!alive) return
      setSessions(s)
      setRoutines(r)
    })
    return () => {
      alive = false
    }
  }, [])

  const activeProgram = useMemo(() => {
    let best: { name: string; percent: number; month: number; day: number } | null = null
    for (const p of PROGRAMS) {
      const progress = computeProgress(sessions, p.id)
      if (progress.completedCount === 0) continue
      if (!best || progress.percent > best.percent) {
        best = {
          name: p.name,
          percent: progress.percent,
          month: progress.next?.month ?? 12,
          day: progress.next?.day ?? 3,
        }
      }
    }
    return best
  }, [sessions])

  const finishedCount = sessions.filter((s) => s.finishedAt).length
  const openSession = sessions.find((s) => !s.finishedAt)

  const items = [
    {
      to: '/ejercicios/biblioteca',
      icon: '📚',
      title: 'Biblioteca',
      subtitle: `${exercises.length} ejercicios con video y explicación`,
    },
    {
      to: '/programas',
      icon: '🎯',
      title: 'Programas',
      subtitle: activeProgram
        ? `${activeProgram.name} · ${activeProgram.percent}% · mes ${activeProgram.month}, día ${activeProgram.day}`
        : `${PROGRAMS.length} programas de un año`,
    },
    {
      to: '/rutinas',
      icon: '📋',
      title: 'Rutinas',
      subtitle: routines.length
        ? `${routines.length} ${routines.length === 1 ? 'rutina propia' : 'rutinas propias'}`
        : 'Armá tus propias rutinas',
    },
    {
      to: openSession ? `/entrenar/${openSession.id}` : '/entrenar',
      icon: '⏱️',
      title: openSession ? 'Seguir entrenando' : 'Entrenar',
      subtitle: openSession ? 'Tenés una sesión sin terminar' : 'Empezá una sesión libre o con rutina',
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

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar
        title="Ejercicios"
        right={
          <Link
            to="/ajustes"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-lg text-gray-300 active:bg-white/10"
            aria-label="Ajustes"
          >
            ⚙️
          </Link>
        }
      />

      <div className="flex flex-col gap-2 p-4">
        {items.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 active:bg-white/10"
          >
            <span className="text-2xl">{item.icon}</span>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-gray-100">{item.title}</p>
              <p className="truncate text-base text-gray-500">{item.subtitle}</p>
            </div>
            <span className="text-gray-600">›</span>
          </Link>
        ))}
      </div>
    </div>
  )
}

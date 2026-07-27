import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { listSessions } from '../lib/store'
import type { WorkoutSession } from '../lib/types'

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('es', { weekday: 'short', day: 'numeric', month: 'short' })
}

export default function History() {
  const [sessions, setSessions] = useState<WorkoutSession[] | null>(null)

  useEffect(() => {
    listSessions().then(setSessions)
  }, [])

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Historial" />
      <div className="flex flex-col gap-2 p-4">
        {sessions === null && <p className="py-10 text-center text-sm text-gray-500">Cargando…</p>}

        {sessions?.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-500">
            Todavía no registraste entrenamientos.
          </p>
        )}

        {sessions?.map((s) => {
          const totalSets = s.exercises.reduce((acc, se) => acc + se.sets.filter((set) => set.done).length, 0)
          return (
            <Link
              key={s.id}
              to={`/historial/${s.id}`}
              className="flex items-center justify-between rounded-xl bg-white/5 p-3 active:bg-white/10"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium capitalize text-gray-100">{s.routineName}</p>
                <p className="text-xs text-gray-500">
                  {formatDate(s.startedAt)} · {s.exercises.length} ejercicios · {totalSets} series
                </p>
              </div>
              {!s.finishedAt && (
                <span className="rounded-full bg-amber-400/20 px-2 py-1 text-[11px] text-amber-300">
                  en curso
                </span>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

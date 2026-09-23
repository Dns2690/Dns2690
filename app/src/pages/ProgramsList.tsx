import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import Icon, { IconTile } from '../components/Icon'
import { PROGRAMS } from '../data/programs'
import { listSessions } from '../lib/store'
import { computeProgress, TOTAL_SESSIONS } from '../lib/program'
import type { WorkoutSession } from '../lib/types'

export default function ProgramsList() {
  const [sessions, setSessions] = useState<WorkoutSession[] | null>(null)

  useEffect(() => {
    listSessions().then(setSessions)
  }, [])

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar title="Programas" back="Ejercicios" large />
      <p className="px-4 pb-4 text-[15px] leading-snug text-label-2">
        Un año guiado, tres sesiones por semana. Elegí uno para ver tu progreso o empezar.
      </p>

      <div className="flex flex-col gap-3 px-4">
        {PROGRAMS.map((p) => {
          const completed = sessions ? computeProgress(sessions, p.id).completedCount : 0
          const percent = Math.round((Math.min(completed, TOTAL_SESSIONS) / TOTAL_SESSIONS) * 100)
          return (
            <Link key={p.id} to={`/programas/${p.id}`} className="rounded-xl bg-cell p-4 active:bg-press">
              <div className="flex items-center gap-3">
                <IconTile name={p.icon} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[17px] font-semibold text-label">{p.name}</p>
                  <p className="truncate text-[15px] text-label-2">{p.tagline}</p>
                </div>
                <Icon name="chevron-right" size={18} strokeWidth={2.4} className="-mr-1 shrink-0 text-label-3" />
              </div>
              <p className="mt-3 text-[13px] leading-snug text-label-2">{p.equipment}</p>
              {sessions && (
                <div className="mt-3 flex items-center gap-3">
                  <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-cell-2">
                    <div className="h-full rounded-full bg-fit-500" style={{ width: `${percent}%` }} />
                  </div>
                  <span className="text-[13px] tabular-nums text-label-2">
                    {completed}/{TOTAL_SESSIONS}
                  </span>
                </div>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

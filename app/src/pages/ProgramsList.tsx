import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { PROGRAMS } from '../data/programs'
import { listSessions, getProfile } from '../lib/store'
import { computeProgress, TOTAL_SESSIONS } from '../lib/program'
import type { Profile, WorkoutSession } from '../lib/types'

export default function ProgramsList() {
  const [sessions, setSessions] = useState<WorkoutSession[] | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    listSessions().then(setSessions)
    getProfile().then((p) => setProfile(p ?? null))
  }, [])

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Programas" />
      <div className="flex flex-col gap-3 p-4">
        {profile && (
          <p className="px-1 text-sm text-gray-200">
            Hola {profile.name} {profile.avatar}
          </p>
        )}
        <p className="px-1 text-xs text-gray-500">
          Programas guiados de 1 año, 3 sesiones por semana. Elegí uno para ver tu progreso o empezar.
        </p>
        {PROGRAMS.map((p) => {
          const completed = sessions ? computeProgress(sessions, p.id).completedCount : 0
          const percent = Math.round((Math.min(completed, TOTAL_SESSIONS) / TOTAL_SESSIONS) * 100)
          return (
            <Link key={p.id} to={`/programas/${p.id}`} className="rounded-2xl bg-white/5 p-4 active:bg-white/10">
              <div className="flex items-center gap-3">
                <span className="text-2xl">{p.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-gray-100">{p.name}</p>
                  <p className="text-xs text-gray-400">{p.tagline}</p>
                </div>
              </div>
              <p className="mt-2 text-[11px] text-gray-500">{p.equipment}</p>
              {sessions && (
                <>
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-cyan-400" style={{ width: `${percent}%` }} />
                  </div>
                  <p className="mt-1 text-[11px] text-gray-500">{completed}/{TOTAL_SESSIONS} sesiones</p>
                </>
              )}
            </Link>
          )
        })}
      </div>
    </div>
  )
}

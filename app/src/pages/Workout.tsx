import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { listRoutines, listSessions } from '../lib/store'
import { startSession, startSessionFromRoutine } from '../lib/workout'
import type { Routine, WorkoutSession } from '../lib/types'

export default function Workout() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [routines, setRoutines] = useState<Routine[]>([])
  const [active, setActive] = useState<WorkoutSession | null | undefined>(undefined)
  const [starting, setStarting] = useState(false)

  useEffect(() => {
    listRoutines().then(setRoutines)
    listSessions().then((sessions) => {
      setActive(sessions.find((s) => !s.finishedAt) ?? null)
    })
  }, [])

  useEffect(() => {
    const rutinaId = searchParams.get('rutina')
    if (!rutinaId || starting) return
    setStarting(true)
    startSessionFromRoutine(rutinaId).then((s) => navigate(`/entrenar/${s.id}`, { replace: true }))
  }, [searchParams, starting, navigate])

  async function handleFreeform() {
    const s = await startSession()
    navigate(`/entrenar/${s.id}`)
  }

  async function handleFromRoutine(id: string) {
    const s = await startSessionFromRoutine(id)
    navigate(`/entrenar/${s.id}`)
  }

  if (searchParams.get('rutina')) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Entrenar" />
        <p className="p-6 text-center text-sm text-gray-500">Preparando entrenamiento…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Entrenar" />
      <div className="flex flex-col gap-3 p-4">
        {active && (
          <button
            onClick={() => navigate(`/entrenar/${active.id}`)}
            className="rounded-lg bg-amber-400 py-2.5 text-sm font-medium text-[#0b0d12] active:bg-amber-300"
          >
            Continuar entrenamiento en curso — {active.routineName}
          </button>
        )}

        <button
          onClick={handleFreeform}
          className="rounded-lg border border-white/20 py-2.5 text-sm text-gray-200 active:bg-white/10"
        >
          + Entrenamiento libre
        </button>

        <h2 className="mt-2 text-sm font-semibold text-gray-300">Empezar desde una rutina</h2>
        {routines.length === 0 && (
          <p className="text-sm text-gray-500">No tenés rutinas todavía. Creá una en la pestaña Rutinas.</p>
        )}
        {routines.map((r) => (
          <button
            key={r.id}
            onClick={() => handleFromRoutine(r.id)}
            className="flex items-center justify-between rounded-xl bg-white/5 p-3 text-left active:bg-white/10"
          >
            <span>
              <p className="text-sm font-medium text-gray-100">{r.name}</p>
              <p className="text-xs text-gray-500">{r.exercises.length} ejercicios</p>
            </span>
            <span className="text-cyan-400">▶</span>
          </button>
        ))}
      </div>
    </div>
  )
}

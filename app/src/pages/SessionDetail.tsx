import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { getExercise, imageUrl } from '../lib/exercises'
import { deleteSession, getSession } from '../lib/store'
import type { WorkoutSession } from '../lib/types'

export default function SessionDetail() {
  const { sessionId = '' } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<WorkoutSession | null | undefined>(undefined)

  useEffect(() => {
    getSession(sessionId).then((s) => setSession(s ?? null))
  }, [sessionId])

  async function handleDelete() {
    if (!session || !confirm('¿Eliminar este entrenamiento del historial?')) return
    await deleteSession(session.id)
    navigate('/historial', { replace: true })
  }

  if (session === undefined) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Entrenamiento" back />
        <p className="p-6 text-center text-sm text-gray-500">Cargando…</p>
      </div>
    )
  }

  if (session === null) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Entrenamiento" back />
        <p className="p-6 text-center text-sm text-gray-500">No se encontró el entrenamiento.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar title={session.routineName} back />
      <div className="flex flex-col gap-3 p-4">
        <p className="text-xs text-gray-500">
          {new Date(session.startedAt).toLocaleString('es')}
          {session.finishedAt ? '' : ' · en curso'}
        </p>

        {!session.finishedAt && (
          <button
            onClick={() => navigate(`/entrenar/${session.id}`)}
            className="rounded-lg bg-amber-400 py-2 text-sm font-medium text-[#0b0d12]"
          >
            Continuar entrenamiento
          </button>
        )}

        {session.exercises.map((se, i) => {
          const ex = getExercise(se.exerciseId)
          if (!ex) return null
          const doneSets = se.sets.filter((s) => s.done)
          return (
            <div key={i} className="rounded-xl bg-white/5 p-3">
              <button
                type="button"
                onClick={() => navigate(`/ejercicio/${ex.id}`)}
                className="mb-1 flex items-center gap-2 text-left"
              >
                <img src={imageUrl(ex)} alt="" className="h-10 w-10 rounded-lg bg-white/10 object-cover" />
                <p className="truncate text-sm font-medium capitalize text-gray-100">{ex.name}</p>
              </button>
              {doneSets.length === 0 ? (
                <p className="pl-1 text-xs text-gray-500">Sin series registradas</p>
              ) : (
                <ul className="flex flex-wrap gap-2 pl-1 text-xs text-gray-300">
                  {doneSets.map((s, j) => (
                    <li key={j} className="rounded bg-white/10 px-2 py-1">
                      {s.weight ?? '-'}kg × {s.reps ?? '-'}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )
        })}

        <button onClick={handleDelete} className="mt-4 text-sm text-red-400">
          Eliminar entrenamiento
        </button>
      </div>
    </div>
  )
}

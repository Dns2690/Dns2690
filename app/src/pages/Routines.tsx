import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { deleteRoutine, listRoutines } from '../lib/store'
import type { Routine } from '../lib/types'

export default function Routines() {
  const [routines, setRoutines] = useState<Routine[] | null>(null)
  const navigate = useNavigate()

  useEffect(() => {
    listRoutines().then(setRoutines)
  }, [])

  async function handleDelete(id: string) {
    if (!confirm('¿Eliminar esta rutina?')) return
    await deleteRoutine(id)
    setRoutines((await listRoutines()) ?? [])
  }

  return (
    <div className="flex flex-1 flex-col">
      <TopBar title="Rutinas" />
      <div className="flex flex-col gap-2 p-4">
        <button
          onClick={() => navigate('/rutinas/nueva')}
          className="rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-[#0b0d12] active:bg-cyan-400"
        >
          + Nueva rutina
        </button>

        {routines === null && <p className="py-10 text-center text-sm text-gray-500">Cargando…</p>}

        {routines?.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-500">
            Todavía no tenés rutinas. Creá una para empezar.
          </p>
        )}

        {routines?.map((r) => (
          <div key={r.id} className="flex items-center gap-2 rounded-xl bg-white/5 p-3">
            <Link to={`/rutinas/${r.id}`} className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-100">{r.name}</p>
              <p className="text-xs text-gray-500">{r.exercises.length} ejercicios</p>
            </Link>
            <button
              onClick={() => navigate(`/entrenar?rutina=${r.id}`)}
              className="rounded-lg bg-white/10 px-3 py-1.5 text-xs text-gray-200 active:bg-white/20"
            >
              Entrenar
            </button>
            <button
              onClick={() => handleDelete(r.id)}
              className="rounded-lg px-2 py-1.5 text-xs text-red-400 active:bg-white/10"
              aria-label="Eliminar rutina"
            >
              🗑
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

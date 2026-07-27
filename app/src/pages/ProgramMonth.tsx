import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { getExercise, imageUrl } from '../lib/exercises'
import { getProgramMonth } from '../lib/program'
import { startProgramSession } from '../lib/workout'

export default function ProgramMonth() {
  const { month: monthParam = '' } = useParams()
  const navigate = useNavigate()
  const [starting, setStarting] = useState<number | null>(null)
  const month = Number(monthParam)
  const data = getProgramMonth(month)

  if (!data) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Año 1" back />
        <p className="p-6 text-center text-sm text-gray-500">Mes no encontrado.</p>
      </div>
    )
  }

  async function handleStart(day: 1 | 2 | 3) {
    if (starting !== null) return
    setStarting(day)
    const s = await startProgramSession(month, day)
    navigate(`/entrenar/${s.id}`)
  }

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar title={`Mes ${data.month} · ${data.title}`} back />

      <div className="flex flex-col gap-4 p-4">
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-sm font-medium text-cyan-300">{data.focus}</p>
          <p className="mt-2 text-sm text-gray-300">{data.description}</p>
          <p className="mt-2 text-xs text-gray-500">{data.weeks} semanas · 3 sesiones por semana</p>
        </div>

        {data.days.map((d) => (
          <div key={d.day} className="rounded-2xl bg-white/5 p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold text-gray-100">{d.name}</p>
              <button
                onClick={() => handleStart(d.day)}
                disabled={starting !== null}
                className="rounded-lg bg-cyan-500 px-3 py-1.5 text-xs font-medium text-[#0b0d12] active:bg-cyan-400 disabled:opacity-50"
              >
                Empezar
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {d.exercises.map((pe, i) => {
                const ex = getExercise(pe.exerciseId)
                if (!ex) return null
                return (
                  <div key={i} className="flex items-center gap-2">
                    <img src={imageUrl(ex)} alt="" className="h-9 w-9 flex-shrink-0 rounded-lg bg-white/10 object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium capitalize text-gray-200">{ex.name}</p>
                      <p className="text-[11px] text-gray-500">
                        {pe.sets}×{pe.reps} · descanso {pe.restSeconds}s
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

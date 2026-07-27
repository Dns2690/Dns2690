import { Fragment, useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import ExercisePicker from '../components/ExercisePicker'
import { getExercise, imageUrl } from '../lib/exercises'
import { getSession, saveSession } from '../lib/store'
import { addExerciseToSession, addSet, removeExercise, updateSet } from '../lib/workout'
import type { WorkoutSession as Session } from '../lib/types'

export default function WorkoutSession() {
  const { sessionId = '' } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    getSession(sessionId).then((s) => setSession(s ?? null))
  }, [sessionId])

  async function persist(next: Session) {
    setSession(next)
    await saveSession(next)
  }

  async function handleFinish() {
    if (!session) return
    await persist({ ...session, finishedAt: new Date().toISOString() })
    if (session.programMeta) {
      navigate('/ano1', { replace: true })
    } else {
      navigate(`/historial/${session.id}`, { replace: true })
    }
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

      <div className="flex flex-col gap-4 p-4">
        {session.exercises.map((se, exIdx) => {
          const ex = getExercise(se.exerciseId)
          if (!ex) return null
          return (
            <div key={exIdx} className="rounded-xl bg-white/5 p-3">
              <div className="mb-2 flex items-center gap-2">
                <img src={imageUrl(ex)} alt="" className="h-10 w-10 rounded-lg bg-white/10 object-cover" />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium capitalize text-gray-100">{ex.name}</p>
                  {(se.targetReps || se.restSeconds) && (
                    <p className="truncate text-[11px] text-cyan-400">
                      Objetivo: {se.sets.length}×{se.targetReps ?? '?'}
                      {se.restSeconds ? ` · Descanso ${se.restSeconds}s` : ''}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => persist(removeExercise(session, exIdx))}
                  className="px-2 text-red-400"
                  aria-label="Quitar ejercicio"
                >
                  ✕
                </button>
              </div>

              {se.note && <p className="mb-2 rounded-lg bg-cyan-400/10 px-2 py-1.5 text-xs text-cyan-200">{se.note}</p>}

              <div className="grid grid-cols-[auto_1fr_1fr_auto] items-center gap-x-2 gap-y-1 text-xs text-gray-400">
                <span></span>
                <span>Peso (kg)</span>
                <span>Reps</span>
                <span></span>
                {se.sets.map((set, setIdx) => (
                  <Fragment key={setIdx}>
                    <span className="text-gray-500">
                      {set.setNumber}
                    </span>
                    <input
                      type="number"
                      inputMode="decimal"
                      value={set.weight ?? ''}
                      onChange={(e) =>
                        persist(
                          updateSet(session, exIdx, setIdx, {
                            weight: e.target.value === '' ? null : Number(e.target.value),
                          }),
                        )
                      }
                      className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-center text-gray-100"
                    />
                    <input
                      type="number"
                      inputMode="numeric"
                      value={set.reps ?? ''}
                      onChange={(e) =>
                        persist(
                          updateSet(session, exIdx, setIdx, {
                            reps: e.target.value === '' ? null : Number(e.target.value),
                          }),
                        )
                      }
                      className="w-full rounded border border-white/10 bg-white/5 px-2 py-1 text-center text-gray-100"
                    />
                    <button
                      onClick={() => persist(updateSet(session, exIdx, setIdx, { done: !set.done }))}
                      className={`rounded px-2 py-1 ${set.done ? 'bg-cyan-500 text-[#0b0d12]' : 'bg-white/10 text-gray-400'}`}
                    >
                      ✓
                    </button>
                  </Fragment>
                ))}
              </div>

              <button
                onClick={() => persist(addSet(session, exIdx))}
                className="mt-2 w-full rounded-lg border border-dashed border-white/15 py-1.5 text-xs text-gray-400 active:bg-white/10"
              >
                + Serie
              </button>
            </div>
          )
        })}

        <button
          onClick={() => setPickerOpen(true)}
          className="rounded-lg border border-dashed border-white/20 py-2.5 text-sm text-gray-300 active:bg-white/10"
        >
          + Agregar ejercicio
        </button>

        <button
          onClick={handleFinish}
          className="mt-2 rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-[#0b0d12] active:bg-cyan-400"
        >
          Finalizar entrenamiento
        </button>
      </div>

      {pickerOpen && (
        <ExercisePicker
          onSelect={(e) => {
            persist(addExerciseToSession(session, e.id))
            setPickerOpen(false)
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}
    </div>
  )
}

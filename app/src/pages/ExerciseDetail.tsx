import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { bodyPartLabel, equipmentLabel, getExercise, gifUrl } from '../lib/exercises'
import { listSessions } from '../lib/store'
import type { WorkoutSession } from '../lib/types'

interface ProgressEntry {
  date: string
  sets: { weight: number | null; reps: number | null }[]
}

export default function ExerciseDetail() {
  const { id = '' } = useParams()
  const exercise = getExercise(id)
  const [progress, setProgress] = useState<ProgressEntry[]>([])

  useEffect(() => {
    let cancelled = false
    listSessions().then((sessions: WorkoutSession[]) => {
      if (cancelled) return
      const entries: ProgressEntry[] = []
      for (const s of sessions) {
        const se = s.exercises.find((x) => x.exerciseId === id)
        if (!se) continue
        const doneSets = se.sets.filter((set) => set.done && (set.weight != null || set.reps != null))
        if (doneSets.length === 0) continue
        entries.push({
          date: s.finishedAt ?? s.startedAt,
          sets: doneSets.map((set) => ({ weight: set.weight, reps: set.reps })),
        })
      }
      setProgress(entries.slice(0, 8))
    })
    return () => {
      cancelled = true
    }
  }, [id])

  if (!exercise) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Ejercicio" back />
        <p className="p-6 text-center text-sm text-gray-500">Ejercicio no encontrado.</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar title={exercise.name} back />

      <img
        src={gifUrl(exercise)}
        alt={exercise.name}
        className="mx-auto mt-4 h-48 w-48 rounded-2xl bg-white/5 object-contain"
      />

      <div className="flex flex-wrap justify-center gap-2 px-4 py-3">
        <span className="rounded-full bg-cyan-400/10 px-3 py-1 text-xs text-cyan-300">
          {bodyPartLabel(exercise.body_part)}
        </span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300">
          {equipmentLabel(exercise.equipment)}
        </span>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-gray-300 capitalize">
          Músculo: {exercise.target}
        </span>
      </div>

      {exercise.secondary_muscles.length > 0 && (
        <p className="px-4 text-center text-xs text-gray-500">
          Músculos secundarios: {exercise.secondary_muscles.join(', ')}
        </p>
      )}

      <section className="mt-4 px-4">
        <h2 className="mb-2 text-sm font-semibold text-gray-200">Instrucciones</h2>
        {exercise.instruction_steps_es.length > 0 ? (
          <ol className="list-decimal space-y-2 pl-5 text-sm text-gray-300">
            {exercise.instruction_steps_es.map((step, i) => (
              <li key={i}>{step}</li>
            ))}
          </ol>
        ) : (
          <p className="text-sm text-gray-300">{exercise.instructions_es}</p>
        )}
      </section>

      {progress.length > 0 && (
        <section className="mt-6 px-4">
          <h2 className="mb-2 text-sm font-semibold text-gray-200">Tu progreso</h2>
          <div className="flex flex-col gap-2">
            {progress.map((p, i) => (
              <div key={i} className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-sm">
                <span className="text-gray-400">{new Date(p.date).toLocaleDateString('es')}</span>
                <span className="text-gray-200">
                  {p.sets.map((s, j) => (
                    <span key={j} className="ml-2">
                      {s.weight ?? '-'}kg×{s.reps ?? '-'}
                    </span>
                  ))}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}

      <p className="mt-8 px-4 text-center text-[11px] text-gray-600">{exercise.attribution}</p>
    </div>
  )
}

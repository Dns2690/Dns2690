import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { Placeholder, Row, Section } from '../components/ui'
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
        <Placeholder>Ejercicio no encontrado.</Placeholder>
      </div>
    )
  }

  const steps = exercise.instruction_steps_es

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar title={exercise.name} back />

      {/* Las animaciones vienen sobre fondo blanco: se muestran en una tarjeta
          blanca a lo ancho en vez de pelearse con el negro. */}
      <div className="px-4 pt-2">
        <div className="overflow-hidden rounded-2xl bg-white">
          <img src={gifUrl(exercise)} alt={exercise.name} className="mx-auto aspect-square w-full max-w-[320px] object-contain" />
        </div>
        <h1 className="mt-4 text-[28px] font-bold capitalize leading-tight tracking-tight text-label">{exercise.name}</h1>
      </div>

      <div className="mt-6 flex flex-col gap-7">
        <Section>
          <Row title="Zona" detail={bodyPartLabel(exercise.body_part)} />
          <Row title="Equipo" detail={equipmentLabel(exercise.equipment)} />
          <Row title="Músculo" detail={<span className="capitalize">{exercise.target}</span>} />
          {exercise.secondary_muscles.length > 0 && (
            <Row
              title="Secundarios"
              detail={<span className="block max-w-[55vw] truncate capitalize">{exercise.secondary_muscles.join(', ')}</span>}
            />
          )}
        </Section>

        <Section header="Cómo se hace">
          <div className="p-4">
            {steps.length > 0 ? (
              <ol className="flex flex-col gap-3">
                {steps.map((step, i) => (
                  <li key={i} className="flex gap-3 text-[15px] leading-relaxed text-label">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fit-500 text-[13px] font-bold text-black">
                      {i + 1}
                    </span>
                    <span>{step}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="text-[15px] leading-relaxed text-label">{exercise.instructions_es}</p>
            )}
          </div>
        </Section>

        {progress.length > 0 && (
          <Section header="Tu progreso">
            {progress.map((p, i) => (
              <Row
                key={i}
                title={new Date(p.date).toLocaleDateString('es', { day: 'numeric', month: 'short' })}
                detail={
                  <span className="text-[15px] tabular-nums">
                    {p.sets.map((s) => `${s.weight ?? '–'}×${s.reps ?? '–'}`).join('  ')}
                  </span>
                }
              />
            ))}
          </Section>
        )}

        <p className="px-8 text-center text-[11px] text-label-3">{exercise.attribution}</p>
      </div>
    </div>
  )
}

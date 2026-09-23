import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { Button, Placeholder, Row, Section } from '../components/ui'
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

  if (session === undefined || session === null) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Entrenamiento" back />
        <Placeholder>{session === undefined ? 'Cargando…' : 'No se encontró el entrenamiento.'}</Placeholder>
      </div>
    )
  }

  const started = new Date(session.startedAt)
  const minutes = session.finishedAt
    ? Math.round((new Date(session.finishedAt).getTime() - started.getTime()) / 60000)
    : null

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar title={session.routineName} back="Historial" large />

      <div className="flex flex-col gap-7">
        <p className="-mt-1 px-4 text-[15px] text-label-2 first-letter:uppercase">
          {started.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })}
          {' · '}
          {started.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' })}
          {minutes !== null ? ` · ${minutes} min` : ' · en curso'}
        </p>

        {!session.finishedAt && (
          <div className="px-4">
            <Button tone="warn" icon="play" onClick={() => navigate(`/entrenar/${session.id}`)}>
              Continuar entrenamiento
            </Button>
          </div>
        )}

        {session.exercises.map((se, i) => {
          const ex = getExercise(se.exerciseId)
          if (!ex) return null
          const doneSets = se.sets.filter((s) => s.done)
          return (
            <Section key={i}>
              <Row
                to={`/ejercicio/${ex.id}`}
                leading={<img src={imageUrl(ex)} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-white object-cover" />}
                title={<span className="font-semibold capitalize">{ex.name}</span>}
                subtitle={doneSets.length ? `${doneSets.length} ${doneSets.length === 1 ? 'serie' : 'series'}` : 'Sin series registradas'}
              />
              {doneSets.map((s, j) => (
                <Row
                  key={j}
                  title={<span className="text-label-2">Serie {j + 1}</span>}
                  detail={
                    <span className="tabular-nums text-label">
                      {s.weight ?? '–'} kg × {s.reps ?? '–'}
                    </span>
                  }
                />
              ))}
            </Section>
          )
        })}

        <Section>
          <Row onClick={handleDelete} title="Eliminar entrenamiento" destructive />
        </Section>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import Icon from '../components/Icon'
import { Placeholder, Row, Section } from '../components/ui'
import { getExercise, imageUrl } from '../lib/exercises'
import { getProgramMonth } from '../lib/program'
import { startProgramSession } from '../lib/workout'

export default function ProgramMonth() {
  const { programId = '', month: monthParam = '' } = useParams()
  const navigate = useNavigate()
  const [starting, setStarting] = useState<number | null>(null)
  const month = Number(monthParam)
  const data = getProgramMonth(programId, month)

  if (!data) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Programa" back />
        <Placeholder>Mes no encontrado.</Placeholder>
      </div>
    )
  }

  async function handleStart(day: 1 | 2 | 3) {
    if (starting !== null) return
    setStarting(day)
    const s = await startProgramSession(programId, month, day)
    navigate(`/entrenar/${s.id}`)
  }

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar title={`Mes ${data.month}`} back large />

      <div className="flex flex-col gap-7">
        <div className="px-4">
          <p className="text-[22px] font-bold leading-tight tracking-tight text-label">{data.title}</p>
          <p className="mt-1 text-[15px] font-semibold text-fit-400">{data.focus}</p>
          <p className="mt-3 text-[15px] leading-relaxed text-label-2">{data.description}</p>
          <p className="mt-3 flex items-center gap-1.5 text-[13px] text-label-2">
            <Icon name="calendar" size={16} />
            {data.weeks} semanas · 3 sesiones por semana
          </p>
        </div>

        {data.days.map((d) => (
          <Section key={d.day} header={d.name}>
            {d.exercises.map((pe, i) => {
              const ex = getExercise(pe.exerciseId)
              if (!ex) return null
              return (
                <Row
                  key={i}
                  to={`/ejercicio/${ex.id}`}
                  leading={<img src={imageUrl(ex)} alt="" className="h-11 w-11 shrink-0 rounded-lg bg-white object-cover" />}
                  title={<span className="capitalize">{ex.name}</span>}
                  subtitle={`${pe.sets} × ${pe.reps} · descanso ${pe.restSeconds} s`}
                />
              )
            })}
            <Row
              onClick={() => handleStart(d.day)}
              disabled={starting !== null}
              title={
                <span className="flex items-center gap-2 font-semibold text-fit-400">
                  <Icon name="play" size={16} />
                  Empezar esta sesión
                </span>
              }
            />
          </Section>
        ))}
      </div>
    </div>
  )
}

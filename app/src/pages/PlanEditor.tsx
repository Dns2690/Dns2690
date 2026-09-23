import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import Icon, { IconTile } from '../components/Icon'
import { Button, Placeholder, Row, Section, Segmented } from '../components/ui'
import { getActivePlan, listRoutines, savePlan } from '../lib/store'
import { PLAN_PER_WEEK_OPTIONS, PLAN_WEEK_OPTIONS } from '../lib/plan'
import type { Routine, TrainingPlan } from '../lib/types'

/**
 * Crear o editar el plan. Editar conserva la fecha de inicio, así no se pierde
 * el avance del bloque; crear uno nuevo cierra el que hubiera.
 */
export default function PlanEditor({ mode }: { mode: 'new' | 'edit' }) {
  const navigate = useNavigate()
  const [routines, setRoutines] = useState<Routine[] | null>(null)
  const [existing, setExisting] = useState<TrainingPlan | null>(null)
  const [name, setName] = useState('Mi plan')
  const [routineIds, setRoutineIds] = useState<string[]>([])
  const [perWeek, setPerWeek] = useState(3)
  const [weeks, setWeeks] = useState(8)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    void Promise.all([listRoutines(), mode === 'edit' ? getActivePlan() : Promise.resolve(undefined)]).then(
      ([r, p]) => {
        setRoutines(r)
        if (p) {
          setExisting(p)
          setName(p.name)
          setRoutineIds(p.routineIds.filter((id) => r.some((x) => x.id === id)))
          setPerWeek(p.perWeek)
          setWeeks(p.weeks)
        }
      },
    )
  }, [mode])

  const byId = Object.fromEntries((routines ?? []).map((r) => [r.id, r]))
  const available = (routines ?? []).filter((r) => !routineIds.includes(r.id))

  function move(i: number, delta: -1 | 1) {
    setRoutineIds((ids) => {
      const j = i + delta
      if (j < 0 || j >= ids.length) return ids
      const next = [...ids]
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }

  async function handleSave() {
    if (routineIds.length === 0 || saving) return
    setSaving(true)
    await savePlan({
      id: existing?.id,
      name: name.trim() || 'Mi plan',
      routineIds,
      perWeek,
      weeks,
      startedAt: existing?.startedAt,
    })
    navigate('/plan', { replace: true })
  }

  const title = mode === 'edit' ? 'Editar plan' : 'Nuevo plan'

  if (routines === null) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title={title} back />
        <Placeholder>Cargando…</Placeholder>
      </div>
    )
  }

  if (routines.length === 0) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title={title} back="Rutinas" />
        <div className="flex flex-col items-center px-8 pt-16 text-center">
          <IconTile name="calendar" size="xl" />
          <p className="mt-5 text-[22px] font-bold text-label">Primero, una rutina</p>
          <p className="mt-2 text-[15px] leading-snug text-label-2">
            El plan rota tus rutinas. Armá al menos una y volvé.
          </p>
          <div className="mt-6 w-full max-w-xs">
            <Button to="/rutinas/nueva" icon="plus">
              Nueva rutina
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar title={title} back="Rutinas" />

      <div className="flex flex-col gap-7 pt-4">
        <Section>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre del plan"
            aria-label="Nombre del plan"
            className="h-11 w-full bg-transparent px-4 text-[17px] text-label placeholder:text-label-3 focus:outline-none"
          />
        </Section>

        <Section
          header="Rotación"
          footer="Siempre toca la que sigue a la última que hiciste, entrenes el día que entrenes."
        >
          {routineIds.length === 0 && (
            <p className="px-4 py-3 text-[15px] text-label-2">Agregá rutinas desde la lista de abajo.</p>
          )}
          {routineIds.map((id, i) => (
            <div key={id} className="flex items-center gap-3 px-4 py-2" style={{ ['--sep-inset' as string]: '56px' }}>
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fit-500 text-[15px] font-bold text-black">
                {String.fromCharCode(65 + i)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[17px] text-label">{byId[id]?.name}</p>
                <p className="text-[13px] text-label-2">
                  {byId[id]?.exercises.length} {byId[id]?.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}
                </p>
              </div>
              <button
                onClick={() => move(i, -1)}
                disabled={i === 0}
                aria-label={`Subir ${byId[id]?.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-label-2 active:bg-press disabled:opacity-25"
              >
                <Icon name="chevron-down" size={18} strokeWidth={2.4} className="rotate-180" />
              </button>
              <button
                onClick={() => move(i, 1)}
                disabled={i === routineIds.length - 1}
                aria-label={`Bajar ${byId[id]?.name}`}
                className="flex h-8 w-8 items-center justify-center rounded-full text-label-2 active:bg-press disabled:opacity-25"
              >
                <Icon name="chevron-down" size={18} strokeWidth={2.4} />
              </button>
              <button
                onClick={() => setRoutineIds((ids) => ids.filter((x) => x !== id))}
                aria-label={`Sacar ${byId[id]?.name} del plan`}
                className="flex h-8 w-8 items-center justify-center active:opacity-50"
              >
                <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-danger-500">
                  <span className="h-[2.5px] w-2.5 rounded-full bg-white" />
                </span>
              </button>
            </div>
          ))}
        </Section>

        {available.length > 0 && (
          <Section header="Tus rutinas">
            {available.map((r) => (
              <Row
                key={r.id}
                onClick={() => setRoutineIds((ids) => [...ids, r.id])}
                leading={
                  <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-fit-500 text-black">
                    <Icon name="plus" size={14} strokeWidth={3} />
                  </span>
                }
                sepInset={50}
                title={r.name}
                subtitle={`${r.exercises.length} ${r.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}`}
              />
            ))}
          </Section>
        )}

        <Section header="Meta semanal" footer={`${perWeek} sesiones por semana, en cualquier día.`}>
          <div className="px-4 py-3">
            <Segmented
              label="Sesiones por semana"
              value={String(perWeek)}
              onChange={(v) => setPerWeek(Number(v))}
              options={PLAN_PER_WEEK_OPTIONS.map((n) => ({ value: String(n), label: `${n}` }))}
            />
          </div>
        </Section>

        <Section
          header="Duración del bloque"
          footer="Al terminar el bloque ves cuánto subiste en cada ejercicio, y podés empezar otro."
        >
          <div className="px-4 py-3">
            <Segmented
              label="Semanas del bloque"
              value={String(weeks)}
              onChange={(v) => setWeeks(Number(v))}
              options={PLAN_WEEK_OPTIONS.map((n) => ({ value: String(n), label: `${n} sem` }))}
            />
          </div>
        </Section>

        <div className="px-4">
          <Button onClick={handleSave} disabled={routineIds.length === 0 || saving}>
            {mode === 'edit' ? 'Guardar cambios' : 'Empezar plan'}
          </Button>
        </div>
      </div>
    </div>
  )
}

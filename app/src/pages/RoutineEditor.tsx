import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import ExercisePicker from '../components/ExercisePicker'
import Icon from '../components/Icon'
import { Button, Placeholder, Row, Section } from '../components/ui'
import { getExercise, imageUrl } from '../lib/exercises'
import {
  deleteRoutine,
  deleteRoutineDraft,
  getRoutine,
  getRoutineDraft,
  saveRoutine,
  saveRoutineDraft,
} from '../lib/store'
import type { RoutineExercise } from '../lib/types'

/** Representación estable del formulario, para comparar contra lo guardado. */
function snapshot(name: string, exercises: RoutineExercise[]): string {
  return JSON.stringify({ name, exercises })
}

export default function RoutineEditor() {
  const { id } = useParams()
  const isNew = !id || id === 'nueva'
  const draftKey = isNew ? 'nueva' : id!
  const navigate = useNavigate()

  // El selector de ejercicios vive en la URL en vez de en un estado local: así
  // el gesto de volver del teléfono lo cierra en lugar de sacarte del editor y
  // tirar la rutina a medio armar.
  const [searchParams, setSearchParams] = useSearchParams()
  const pickerOpen = searchParams.get('agregar') === '1'
  const pickerPushed = useRef(false)

  const [name, setName] = useState('')
  const [items, setItems] = useState<RoutineExercise[]>([])
  const [loaded, setLoaded] = useState(false)
  const [restored, setRestored] = useState(false)

  /** Lo que hay guardado: vacío si es nueva, la rutina tal cual si se edita. */
  const baseline = useRef(snapshot('', []))

  useEffect(() => {
    let alive = true
    void (async () => {
      const [routine, draft] = await Promise.all([
        isNew ? Promise.resolve(undefined) : getRoutine(id!),
        getRoutineDraft(draftKey),
      ])
      if (!alive) return
      if (routine) {
        baseline.current = snapshot(routine.name, routine.exercises)
        setName(routine.name)
        setItems(routine.exercises)
      }
      // El borrador manda sobre lo guardado: es lo último que estuvo en pantalla.
      if (draft && snapshot(draft.name, draft.exercises) !== baseline.current) {
        setName(draft.name)
        setItems(draft.exercises)
        setRestored(true)
      }
      setLoaded(true)
    })()
    return () => {
      alive = false
    }
  }, [id, isNew, draftKey])

  // Autoguardado. Sin esto, salir del editor —tocar la miniatura de un
  // ejercicio para verlo, el gesto de volver, cerrar la app— desmontaba el
  // componente y se perdía todo lo agregado. Solo se escribe si hay diferencia
  // con lo guardado, para no dejar borradores fantasma que luego avisen de
  // cambios que no existen.
  useEffect(() => {
    if (!loaded) return
    if (snapshot(name, items) === baseline.current) {
      void deleteRoutineDraft(draftKey)
      return
    }
    void saveRoutineDraft(draftKey, {
      name,
      exercises: items,
      savedAt: new Date().toISOString(),
    })
  }, [loaded, name, items, draftKey])

  function openPicker() {
    pickerPushed.current = true
    setSearchParams({ agregar: '1' })
  }

  function closePicker() {
    // Cerrar retrocediendo deja el historial limpio; si se llegó acá con la URL
    // ya abierta no hay entrada que sacar, así que se reemplaza.
    if (pickerPushed.current) {
      pickerPushed.current = false
      navigate(-1)
    } else {
      setSearchParams({}, { replace: true })
    }
  }

  function addExercise(exerciseId: string) {
    setItems((prev) => [...prev, { exerciseId, targetSets: 3, targetReps: '10-12' }])
    closePicker()
  }

  function updateItem(i: number, patch: Partial<RoutineExercise>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i))
  }

  function discardDraft() {
    const base = JSON.parse(baseline.current) as { name: string; exercises: RoutineExercise[] }
    setName(base.name)
    setItems(base.exercises)
    setRestored(false)
  }

  async function handleSave() {
    if (!name.trim() || items.length === 0) return
    await saveRoutine({
      id: isNew ? undefined : id,
      name: name.trim(),
      exercises: items,
    })
    await deleteRoutineDraft(draftKey)
    navigate('/rutinas')
  }

  async function handleDelete() {
    if (isNew || !confirm('¿Eliminar esta rutina?')) return
    await deleteRoutine(id!)
    navigate('/rutinas', { replace: true })
  }

  if (!loaded) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Rutina" back />
        <Placeholder>Cargando…</Placeholder>
      </div>
    )
  }

  const fieldClass =
    'h-8 rounded-lg bg-cell-2 px-2 text-center text-[17px] tabular-nums text-label focus:outline-none focus:ring-2 focus:ring-fit-500'

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar title={isNew ? 'Nueva rutina' : 'Editar rutina'} back="Rutinas" />

      <div className="flex flex-col gap-7 pt-4">
        {restored && (
          <div className="px-4">
            <div className="flex items-center gap-3 rounded-xl bg-fit-500/12 px-4 py-3">
              <Icon name="clock" size={20} className="shrink-0 text-fit-400" />
              <span className="flex-1 text-[15px] text-label">Recuperamos lo que tenías sin guardar.</span>
              <button type="button" onClick={discardDraft} className="text-[15px] font-semibold text-fit-400 active:opacity-50">
                Descartar
              </button>
            </div>
          </div>
        )}

        <Section>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Nombre de la rutina (ej. Día de pierna)"
            className="h-11 w-full bg-transparent px-4 text-[17px] text-label placeholder:text-label-3 focus:outline-none"
          />
        </Section>

        <Section header="Ejercicios" footer={items.length ? 'Tocá la imagen para ver cómo se hace.' : undefined}>
          {items.map((it, i) => {
            const ex = getExercise(it.exerciseId)
            if (!ex) return null
            return (
              <div key={i} className="flex items-center gap-3 px-4 py-2.5" style={{ ['--sep-inset' as string]: '76px' }}>
                <button
                  type="button"
                  onClick={() => navigate(`/ejercicio/${ex.id}`)}
                  className="shrink-0 active:opacity-60"
                  aria-label={`Ver ${ex.name}`}
                >
                  <img src={imageUrl(ex)} alt="" className="h-12 w-12 rounded-lg bg-white object-cover" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[17px] capitalize text-label">{ex.name}</p>
                  <div className="mt-1.5 flex items-center gap-1.5 text-[15px] text-label-2">
                    <input
                      type="number"
                      inputMode="numeric"
                      min={1}
                      value={it.targetSets}
                      onChange={(e) => updateItem(i, { targetSets: Number(e.target.value) || 1 })}
                      aria-label="Series"
                      className={`w-11 ${fieldClass}`}
                    />
                    <span>series ×</span>
                    <input
                      value={it.targetReps}
                      onChange={(e) => updateItem(i, { targetReps: e.target.value })}
                      aria-label="Repeticiones"
                      className={`w-16 ${fieldClass}`}
                    />
                    <span>reps</span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(i)}
                  className="flex h-8 w-8 shrink-0 items-center justify-center active:opacity-50"
                  aria-label="Quitar ejercicio"
                >
                  <span className="flex h-[22px] w-[22px] items-center justify-center rounded-full bg-danger-500 text-white">
                    <span className="h-[2.5px] w-2.5 rounded-full bg-white" />
                  </span>
                </button>
              </div>
            )
          })}
          <Row
            onClick={openPicker}
            leading={
              <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-fit-500 text-black">
                <Icon name="plus" size={14} strokeWidth={3} />
              </span>
            }
            title={<span className="text-fit-400">Agregar ejercicio</span>}
          />
        </Section>

        <div className="px-4">
          <Button onClick={handleSave} disabled={!name.trim() || items.length === 0}>
            Guardar rutina
          </Button>
        </div>

        {!isNew && (
          <Section>
            <Row onClick={handleDelete} title="Eliminar rutina" destructive />
          </Section>
        )}
      </div>

      {pickerOpen && <ExercisePicker onSelect={(e) => addExercise(e.id)} onClose={closePicker} />}
    </div>
  )
}

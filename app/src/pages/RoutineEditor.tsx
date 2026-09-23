import { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, useSearchParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import ExercisePicker from '../components/ExercisePicker'
import { getExercise, imageUrl } from '../lib/exercises'
import {
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

  if (!loaded) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Rutina" back />
        <p className="p-6 text-center text-sm text-gray-500">Cargando…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar title={isNew ? 'Nueva rutina' : 'Editar rutina'} back />

      <div className="flex flex-col gap-3 p-4">
        {restored && (
          <div className="flex items-center gap-3 rounded-lg border border-cyan-500/30 bg-cyan-500/10 px-3 py-2 text-xs text-cyan-200">
            <span className="flex-1">Recuperamos lo que tenías sin guardar.</span>
            <button type="button" onClick={discardDraft} className="font-medium underline">
              Descartar
            </button>
          </div>
        )}

        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nombre de la rutina (ej. Día de pierna)"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500"
        />

        <div className="flex flex-col gap-2">
          {items.map((it, i) => {
            const ex = getExercise(it.exerciseId)
            if (!ex) return null
            return (
              <div key={i} className="flex items-center gap-2 rounded-xl bg-white/5 p-2">
                <button
                  type="button"
                  onClick={() => navigate(`/ejercicio/${ex.id}`)}
                  className="flex-shrink-0"
                  aria-label={`Ver ${ex.name}`}
                >
                  <img src={imageUrl(ex)} alt="" className="h-12 w-12 rounded-lg bg-white/10 object-cover" />
                </button>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm capitalize text-gray-100">{ex.name}</p>
                  <div className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                    <input
                      type="number"
                      min={1}
                      value={it.targetSets}
                      onChange={(e) => updateItem(i, { targetSets: Number(e.target.value) || 1 })}
                      className="w-12 rounded border border-white/10 bg-white/5 px-1 py-0.5 text-center text-gray-100"
                    />
                    <span>series ×</span>
                    <input
                      value={it.targetReps}
                      onChange={(e) => updateItem(i, { targetReps: e.target.value })}
                      className="w-16 rounded border border-white/10 bg-white/5 px-1 py-0.5 text-center text-gray-100"
                    />
                    <span>reps</span>
                  </div>
                </div>
                <button
                  onClick={() => removeItem(i)}
                  className="px-2 text-red-400"
                  aria-label="Quitar ejercicio"
                >
                  ✕
                </button>
              </div>
            )
          })}
        </div>

        <button
          onClick={openPicker}
          className="rounded-lg border border-dashed border-white/20 py-2.5 text-sm text-gray-300 active:bg-white/10"
        >
          + Agregar ejercicio
        </button>

        <button
          onClick={handleSave}
          disabled={!name.trim() || items.length === 0}
          className="mt-2 rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-[#0b0d12] disabled:opacity-40"
        >
          Guardar rutina
        </button>
      </div>

      {pickerOpen && <ExercisePicker onSelect={(e) => addExercise(e.id)} onClose={closePicker} />}
    </div>
  )
}

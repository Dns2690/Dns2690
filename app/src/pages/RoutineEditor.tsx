import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import ExercisePicker from '../components/ExercisePicker'
import { getExercise, imageUrl } from '../lib/exercises'
import { getRoutine, saveRoutine } from '../lib/store'
import type { RoutineExercise } from '../lib/types'

export default function RoutineEditor() {
  const { id } = useParams()
  const isNew = !id || id === 'nueva'
  const navigate = useNavigate()

  const [name, setName] = useState('')
  const [items, setItems] = useState<RoutineExercise[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)
  const [loaded, setLoaded] = useState(isNew)

  useEffect(() => {
    if (isNew) return
    getRoutine(id!).then((r) => {
      if (r) {
        setName(r.name)
        setItems(r.exercises)
      }
      setLoaded(true)
    })
  }, [id, isNew])

  function addExercise(exerciseId: string) {
    setItems((prev) => [...prev, { exerciseId, targetSets: 3, targetReps: '10-12' }])
    setPickerOpen(false)
  }

  function updateItem(i: number, patch: Partial<RoutineExercise>) {
    setItems((prev) => prev.map((it, idx) => (idx === i ? { ...it, ...patch } : it)))
  }

  function removeItem(i: number) {
    setItems((prev) => prev.filter((_, idx) => idx !== i))
  }

  async function handleSave() {
    if (!name.trim() || items.length === 0) return
    await saveRoutine({
      id: isNew ? undefined : id,
      name: name.trim(),
      exercises: items,
    })
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
          onClick={() => setPickerOpen(true)}
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

      {pickerOpen && (
        <ExercisePicker onSelect={(e) => addExercise(e.id)} onClose={() => setPickerOpen(false)} />
      )}
    </div>
  )
}

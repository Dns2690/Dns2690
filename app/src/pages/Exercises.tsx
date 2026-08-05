import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import ExerciseCard from '../components/ExerciseCard'
import { ALL_BODY_PARTS, ALL_EQUIPMENT, bodyPartLabel, equipmentLabel, filterExercises } from '../lib/exercises'

const PAGE_SIZE = 60

export default function Exercises() {
  const [query, setQuery] = useState('')
  const [bodyPart, setBodyPart] = useState('')
  const [equipment, setEquipment] = useState('')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const results = useMemo(() => {
    setVisible(PAGE_SIZE)
    return filterExercises({ query, bodyPart, equipment })
  }, [query, bodyPart, equipment])

  return (
    <div className="flex flex-1 flex-col">
      <TopBar
        title="Biblioteca"
        back
        right={
          <Link
            to="/ajustes"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-lg text-gray-300 active:bg-white/10"
            aria-label="Ajustes"
          >
            ⚙️
          </Link>
        }
      />
      <div className="flex flex-col gap-2 px-4 py-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar ejercicio o músculo..."
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-cyan-400"
        />
        <div className="flex gap-2">
          <select
            value={bodyPart}
            onChange={(e) => setBodyPart(e.target.value)}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-gray-100"
          >
            <option value="">Zona: todas</option>
            {ALL_BODY_PARTS.map((bp) => (
              <option key={bp} value={bp}>
                {bodyPartLabel(bp)}
              </option>
            ))}
          </select>
          <select
            value={equipment}
            onChange={(e) => setEquipment(e.target.value)}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-gray-100"
          >
            <option value="">Equipo: todo</option>
            {ALL_EQUIPMENT.map((eq) => (
              <option key={eq} value={eq}>
                {equipmentLabel(eq)}
              </option>
            ))}
          </select>
        </div>
        <p className="text-xs text-gray-500">{results.length} ejercicios</p>
      </div>

      <div className="flex flex-col gap-2 px-4 pb-4">
        {results.slice(0, visible).map((e) => (
          <ExerciseCard key={e.id} exercise={e} />
        ))}
        {results.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-500">No se encontraron ejercicios.</p>
        )}
        {visible < results.length && (
          <button
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="mt-2 rounded-lg border border-white/10 py-2 text-sm text-gray-300 active:bg-white/10"
          >
            Cargar más
          </button>
        )}
      </div>
    </div>
  )
}

import { useMemo, useState } from 'react'
import type { Exercise } from '../lib/types'
import { ALL_BODY_PARTS, bodyPartLabel, filterExercises, imageUrl } from '../lib/exercises'

const PAGE_SIZE = 60

export default function ExercisePicker({
  onSelect,
  onClose,
}: {
  onSelect: (exercise: Exercise) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [bodyPart, setBodyPart] = useState('')
  const [visible, setVisible] = useState(PAGE_SIZE)

  const results = useMemo(() => {
    setVisible(PAGE_SIZE)
    return filterExercises({ query, bodyPart })
  }, [query, bodyPart])

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-[#0b0d12]">
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)]">
        <button onClick={onClose} className="text-lg text-gray-300" aria-label="Cerrar">
          ✕
        </button>
        <input
          autoFocus
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar ejercicio..."
          className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-500 focus:outline-none"
        />
      </div>
      <div className="border-b border-white/10 px-4 py-2">
        <select
          value={bodyPart}
          onChange={(e) => setBodyPart(e.target.value)}
          className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-gray-100"
        >
          <option value="">Zona: todas</option>
          {ALL_BODY_PARTS.map((bp) => (
            <option key={bp} value={bp}>
              {bodyPartLabel(bp)}
            </option>
          ))}
        </select>
      </div>
      <div className="flex-1 overflow-y-auto px-4 py-2">
        <div className="flex flex-col gap-2 pb-6">
          {results.slice(0, visible).map((e) => (
            <button
              key={e.id}
              onClick={() => onSelect(e)}
              className="flex items-center gap-3 rounded-xl bg-white/5 p-2 text-left active:bg-white/10"
            >
              <img src={imageUrl(e)} alt="" loading="lazy" className="h-12 w-12 rounded-lg bg-white/10 object-cover" />
              <span className="min-w-0 truncate text-sm capitalize text-gray-100">{e.name}</span>
            </button>
          ))}
          {visible < results.length && (
            <button
              onClick={() => setVisible((v) => v + PAGE_SIZE)}
              className="rounded-lg border border-white/10 py-2 text-sm text-gray-300"
            >
              Cargar más
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

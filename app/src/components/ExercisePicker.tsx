import { useMemo, useState } from 'react'
import type { Exercise } from '../lib/types'
import { ALL_BODY_PARTS, bodyPartLabel, filterExercises, imageUrl } from '../lib/exercises'
import { Row, SearchField, Section, SelectPill } from './ui'

const PAGE_SIZE = 60

const BODY_OPTIONS = [
  { value: '', label: 'Todas las zonas' },
  ...ALL_BODY_PARTS.map((bp) => ({ value: bp, label: bodyPartLabel(bp) })),
]

/** Hoja a pantalla completa para elegir un ejercicio, con Cancelar a la izquierda como en iOS. */
export default function ExercisePicker({
  onSelect,
  onClose,
  initialBodyPart,
  title,
}: {
  onSelect: (exercise: Exercise) => void
  onClose: () => void
  initialBodyPart?: string
  title?: string
}) {
  const [query, setQuery] = useState('')
  const [bodyPart, setBodyPart] = useState(initialBodyPart ?? '')

  const results = useMemo(() => filterExercises({ query, bodyPart }), [query, bodyPart])

  // La paginación se ata al filtro con el que se pidió: al cambiar de filtro la
  // clave deja de coincidir y vuelve sola al primer tramo. Antes se hacía con
  // un setVisible dentro del useMemo, que es escribir estado durante el render.
  const filterKey = `${query}\u0000${bodyPart}`
  const [page, setPage] = useState({ filterKey, visible: PAGE_SIZE })
  const visible = page.filterKey === filterKey ? page.visible : PAGE_SIZE

  return (
    <div className="fixed inset-0 z-30 flex flex-col bg-black">
      <div className="material hairline-b pt-[env(safe-area-inset-top)]">
        <div className="relative flex h-11 items-center px-4">
          <button onClick={onClose} className="text-[17px] text-fit-400 active:opacity-50" aria-label="Cerrar">
            Cancelar
          </button>
          <p className="pointer-events-none absolute inset-x-24 truncate text-center text-[17px] font-semibold text-label">
            {title ?? 'Agregar ejercicio'}
          </p>
        </div>
        <div className="flex flex-col gap-2.5 px-4 pb-3">
          <SearchField value={query} onChange={setQuery} placeholder="Buscar ejercicio" autoFocus />
          <div className="flex">
            <SelectPill label="Zona" value={bodyPart} onChange={setBodyPart} options={BODY_OPTIONS} active={!!bodyPart} />
          </div>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <Section>
          {results.slice(0, visible).map((e) => (
            <Row
              key={e.id}
              onClick={() => onSelect(e)}
              leading={<img src={imageUrl(e)} alt="" loading="lazy" className="h-11 w-11 shrink-0 rounded-lg bg-white object-cover" />}
              title={<span className="capitalize">{e.name}</span>}
              subtitle={bodyPartLabel(e.body_part)}
            />
          ))}
          {visible < results.length && (
            <Row
              onClick={() => setPage({ filterKey, visible: visible + PAGE_SIZE })}
              title={<span className="text-fit-400">Mostrar más</span>}
            />
          )}
        </Section>
        <div className="h-[env(safe-area-inset-bottom)]" />
      </div>
    </div>
  )
}

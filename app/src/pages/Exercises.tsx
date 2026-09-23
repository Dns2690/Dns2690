import { useMemo, useState } from 'react'
import TopBar from '../components/TopBar'
import { Placeholder, Row, SearchField, Section, SelectPill } from '../components/ui'
import {
  ALL_BODY_PARTS,
  ALL_EQUIPMENT,
  bodyPartLabel,
  equipmentLabel,
  filterExercises,
  imageUrl,
} from '../lib/exercises'

const PAGE_SIZE = 60

const BODY_OPTIONS = [
  { value: '', label: 'Todas las zonas' },
  ...ALL_BODY_PARTS.map((bp) => ({ value: bp, label: bodyPartLabel(bp) })),
]
const EQUIPMENT_OPTIONS = [
  { value: '', label: 'Todo el equipo' },
  ...ALL_EQUIPMENT.map((eq) => ({ value: eq, label: equipmentLabel(eq) })),
]

export default function Exercises() {
  const [query, setQuery] = useState('')
  const [bodyPart, setBodyPart] = useState('')
  const [equipment, setEquipment] = useState('')

  const results = useMemo(
    () => filterExercises({ query, bodyPart, equipment }),
    [query, bodyPart, equipment],
  )

  // La paginación se ata al filtro con que se pidió: al cambiarlo vuelve sola
  // al primer tramo, sin escribir estado durante el render.
  const filterKey = `${query}\u0000${bodyPart}\u0000${equipment}`
  const [page, setPage] = useState({ filterKey, visible: PAGE_SIZE })
  const visible = page.filterKey === filterKey ? page.visible : PAGE_SIZE

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar title="Biblioteca" back="Ejercicios" large />

      <div className="flex flex-col gap-3 px-4 pb-4">
        <SearchField value={query} onChange={setQuery} placeholder="Ejercicio o músculo" />
        <div className="-mx-4 flex gap-2 overflow-x-auto px-4">
          <SelectPill label="Zona" value={bodyPart} onChange={setBodyPart} options={BODY_OPTIONS} active={!!bodyPart} />
          <SelectPill
            label="Equipo"
            value={equipment}
            onChange={setEquipment}
            options={EQUIPMENT_OPTIONS}
            active={!!equipment}
          />
        </div>
      </div>

      {results.length === 0 ? (
        <Placeholder>No hay ejercicios con esos filtros.</Placeholder>
      ) : (
        <Section header={`${results.length} ejercicios`}>
          {results.slice(0, visible).map((e) => (
            <Row
              key={e.id}
              to={`/ejercicio/${e.id}`}
              leading={
                <img
                  src={imageUrl(e)}
                  alt=""
                  loading="lazy"
                  width={48}
                  height={48}
                  className="h-12 w-12 shrink-0 rounded-lg bg-white object-cover"
                />
              }
              title={<span className="capitalize">{e.name}</span>}
              subtitle={`${bodyPartLabel(e.body_part)} · ${equipmentLabel(e.equipment)}`}
            />
          ))}
          {visible < results.length && (
            <Row
              onClick={() => setPage({ filterKey, visible: visible + PAGE_SIZE })}
              title={<span className="text-fit-400">Mostrar más</span>}
            />
          )}
        </Section>
      )}
    </div>
  )
}

import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import ProfileSetup from '../components/ProfileSetup'
import { Button, Placeholder, Row, Section } from '../components/ui'
import { deleteMeasurement, getMeasurement, getProfile, saveMeasurement } from '../lib/store'
import { computeDerived, METRICS } from '../lib/measurements'
import type { MeasurementEntry, Profile } from '../lib/types'

function today(): string {
  return new Date().toISOString().slice(0, 10)
}

type FormValues = Record<string, string>

export default function MeasurementForm() {
  const { id } = useParams()
  const isNew = !id || id === 'nueva'
  const navigate = useNavigate()

  const [date, setDate] = useState(today())
  const [values, setValues] = useState<FormValues>({})
  const [note, setNote] = useState('')
  const [loaded, setLoaded] = useState(false)
  const [needsProfile, setNeedsProfile] = useState(false)
  const [profile, setProfile] = useState<Profile | null>(null)

  useEffect(() => {
    if (!isNew) {
      Promise.all([getMeasurement(id!), getProfile()]).then(([e, p]) => {
        if (e) {
          setDate(e.date)
          setNote(e.note ?? '')
          const v: FormValues = {}
          for (const m of METRICS) {
            const val = e[m.key]
            if (val != null) v[m.key] = String(val)
          }
          setValues(v)
        }
        setProfile(p ?? null)
        setLoaded(true)
      })
      return
    }
    getProfile().then((p) => {
      setProfile(p ?? null)
      setNeedsProfile(!p)
      setLoaded(true)
    })
  }, [id, isNew])

  async function handleSave() {
    const draft: Omit<MeasurementEntry, 'id'> = {
      date,
      weightKg: values.weightKg ? Number(values.weightKg) : null,
      chestCm: values.chestCm ? Number(values.chestCm) : null,
      waistCm: values.waistCm ? Number(values.waistCm) : null,
      hipsCm: values.hipsCm ? Number(values.hipsCm) : null,
      armCm: values.armCm ? Number(values.armCm) : null,
      legCm: values.legCm ? Number(values.legCm) : null,
      neckCm: values.neckCm ? Number(values.neckCm) : null,
      note: note.trim() || undefined,
    }
    const computed = computeDerived(draft, profile)
    await saveMeasurement({ ...draft, computed, id: isNew ? undefined : id })
    navigate('/medidas')
  }

  async function handleDelete() {
    if (isNew || !confirm('¿Eliminar esta medición?')) return
    await deleteMeasurement(id!)
    navigate('/medidas', { replace: true })
  }

  const hasAnyValue = Object.values(values).some((v) => v.trim() !== '')
  const missingForBodyFat = !profile?.heightCm || !profile?.sex

  if (!loaded) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Medición" back />
        <Placeholder>Cargando…</Placeholder>
      </div>
    )
  }

  if (needsProfile) {
    return (
      <div className="flex flex-1 flex-col pb-8">
        <TopBar title="Nueva medición" back />
        <div className="pt-6">
          <ProfileSetup onDone={() => setNeedsProfile(false)} />
        </div>
      </div>
    )
  }

  const fieldClass =
    'min-w-0 flex-1 bg-transparent text-right text-[17px] tabular-nums text-label placeholder:text-label-3 focus:outline-none'

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar title={isNew ? 'Nueva medición' : 'Editar medición'} back="Medidas" />

      <div className="flex flex-col gap-7 pt-4">
        <Section>
          <label className="flex h-11 items-center gap-3 px-4">
            <span className="flex-1 text-[17px] text-label">Fecha</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="rounded-md bg-cell-2 px-2 py-1 text-[17px] text-label focus:outline-none"
            />
          </label>
        </Section>

        <Section header="Medidas" footer="Completá solo lo que puedas medir; no hace falta llenar todo.">
          {METRICS.map((m) => (
            <label key={m.key} className="flex h-11 items-center gap-3 px-4">
              <span className="text-[17px] text-label">{m.label}</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={values[m.key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [m.key]: e.target.value }))}
                placeholder="—"
                aria-label={`${m.label} en ${m.unit}`}
                className={fieldClass}
              />
              <span className="w-6 shrink-0 text-[17px] text-label-2">{m.unit}</span>
            </label>
          ))}
        </Section>

        {missingForBodyFat && (
          <p className="-mt-4 px-8 text-[13px] leading-snug text-label-2">
            Cargá cintura y cuello acá, y tu altura y sexo en{' '}
            <Link to="/ajustes" className="text-fit-400">
              Ajustes
            </Link>
            , para calcular tu % de grasa corporal automáticamente.
          </p>
        )}

        <Section header="Notas">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={3}
            placeholder="Opcional"
            className="block w-full resize-none bg-transparent px-4 py-3 text-[17px] text-label placeholder:text-label-3 focus:outline-none"
          />
        </Section>

        <div className="px-4">
          <Button onClick={handleSave} disabled={!hasAnyValue}>
            Guardar medición
          </Button>
        </div>

        {!isNew && (
          <Section>
            <Row onClick={handleDelete} title="Eliminar medición" destructive />
          </Section>
        )}
      </div>
    </div>
  )
}

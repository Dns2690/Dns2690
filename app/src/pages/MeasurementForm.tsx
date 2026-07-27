import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import ProfileSetup from '../components/ProfileSetup'
import { getMeasurement, getProfile, saveMeasurement } from '../lib/store'
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

  const hasAnyValue = Object.values(values).some((v) => v.trim() !== '')
  const missingForBodyFat = !profile?.heightCm || !profile?.sex

  if (!loaded) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Medición" back />
        <p className="p-6 text-center text-sm text-gray-500">Cargando…</p>
      </div>
    )
  }

  if (needsProfile) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Nueva medición" back />
        <div className="p-4">
          <ProfileSetup onDone={() => setNeedsProfile(false)} />
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar title={isNew ? 'Nueva medición' : 'Editar medición'} back />

      <div className="flex flex-col gap-3 p-4">
        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-400">Fecha</span>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100"
          />
        </label>

        <div className="grid grid-cols-2 gap-3">
          {METRICS.map((m) => (
            <label key={m.key} className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">{m.icon} {m.label} ({m.unit})</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.1"
                value={values[m.key] ?? ''}
                onChange={(e) => setValues((v) => ({ ...v, [m.key]: e.target.value }))}
                placeholder="—"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600"
              />
            </label>
          ))}
        </div>

        <label className="flex flex-col gap-1">
          <span className="text-xs text-gray-400">Notas (opcional)</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={2}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100"
          />
        </label>

        <p className="text-xs text-gray-500">Completá solo lo que puedas medir — no hace falta llenar todo.</p>

        {missingForBodyFat && (
          <p className="rounded-lg bg-cyan-400/10 px-3 py-2 text-xs text-cyan-200">
            Cargá cintura + cuello acá y tu altura y sexo en{' '}
            <Link to="/perfil" className="underline">
              Perfil
            </Link>{' '}
            para que calculemos tu % de grasa corporal automáticamente.
          </p>
        )}

        <button
          onClick={handleSave}
          disabled={!hasAnyValue}
          className="mt-2 rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-[#0b0d12] disabled:opacity-40"
        >
          Guardar medición
        </button>
      </div>
    </div>
  )
}

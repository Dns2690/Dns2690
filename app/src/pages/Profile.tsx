import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { getKegelSettings, getProfile, saveKegelSettings, saveProfile } from '../lib/store'
import { AVATARS } from '../lib/profile'
import { clearAllData, exportBackup, importBackup } from '../lib/backup'
import { KEGEL_LEVELS } from '../lib/kegel'
import { supportsVibration } from '../lib/feedback'
import type { KegelLevelId, KegelSettings, Profile as ProfileType, Sex } from '../lib/types'

const DEFAULT_KEGEL: KegelSettings = { levelId: 'beginner', sound: true, vibration: true }

export default function Profile() {
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [heightCm, setHeightCm] = useState('')
  const [sex, setSex] = useState<Sex | ''>('')
  const [kegel, setKegel] = useState<KegelSettings>(DEFAULT_KEGEL)
  const [loaded, setLoaded] = useState(false)
  const [status, setStatus] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const canVibrate = supportsVibration()

  useEffect(() => {
    Promise.all([getProfile(), getKegelSettings()]).then(([p, k]) => {
      if (p) {
        setProfile(p)
        setName(p.name)
        setAvatar(p.avatar)
        setHeightCm(p.heightCm ? String(p.heightCm) : '')
        setSex(p.sex ?? '')
      }
      if (k) setKegel(k)
      setLoaded(true)
    })
  }, [])

  async function handleSaveProfile() {
    if (!name.trim()) return
    const p: ProfileType = {
      name: name.trim(),
      avatar,
      createdAt: profile?.createdAt ?? new Date().toISOString(),
      heightCm: heightCm ? Number(heightCm) : null,
      sex: sex || null,
    }
    await saveProfile(p)
    setProfile(p)
    setStatus('Perfil guardado.')
  }

  async function updateKegel(patch: Partial<KegelSettings>) {
    const next = { ...kegel, ...patch }
    setKegel(next)
    await saveKegelSettings(next)
  }

  async function handleExport() {
    const backup = await exportBackup()
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    const who = profile?.name ? profile.name.toLowerCase().replace(/\s+/g, '-') : 'backup'
    a.href = url
    a.download = `workoutos-${who}-${date}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  async function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    try {
      const text = await file.text()
      const parsed = JSON.parse(text)
      const count = await importBackup(parsed)
      setStatus(`Se importaron ${count} registros. Recargá la app para verlos.`)
    } catch {
      setStatus('No se pudo leer ese archivo — revisá que sea un backup válido.')
    } finally {
      e.target.value = ''
    }
  }

  async function handleReset() {
    if (!confirm('¿Borrar TODOS los datos de esta app en este dispositivo? Rutinas, entrenamientos, mediciones, Kegel y perfil. No se puede deshacer salvo que tengas un backup exportado.')) return
    await clearAllData()
    window.location.reload()
  }

  if (!loaded) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Ajustes" back />
        <p className="p-6 text-center text-sm text-gray-500">Cargando…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar title="Ajustes" back />

      <div className="flex flex-col gap-4 p-4">
        <Link
          to="/medidas"
          className="flex items-center gap-3 rounded-2xl bg-white/5 p-4 active:bg-white/10"
        >
          <span className="text-2xl">📏</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-100">Medidas</p>
            <p className="text-xs text-gray-500">Peso, glúteos, cintura, % de grasa y tendencias</p>
          </div>
          <span className="text-gray-600">›</span>
        </Link>

        <div className="rounded-2xl bg-white/5 p-4">
          <p className="mb-1 text-sm font-medium text-gray-100">🌊 Kegel</p>
          <p className="mb-3 text-xs text-gray-500">
            Tu nivel define cuánto dura cada ejercicio y cuáles entran en la rotación.
          </p>
          <div className="mb-4 flex gap-2">
            {KEGEL_LEVELS.map((l) => (
              <button
                key={l.id}
                onClick={() => updateKegel({ levelId: l.id as KegelLevelId, levelUpDismissedAt: undefined })}
                className={`flex-1 rounded-lg py-2 text-xs font-medium ${
                  kegel.levelId === l.id
                    ? 'bg-cyan-400/20 text-cyan-300 ring-1 ring-cyan-400'
                    : 'bg-white/5 text-gray-400'
                }`}
              >
                {l.label}
                <span className="mt-0.5 block text-[10px] font-normal text-gray-500">
                  {l.workSeconds}s / {l.restSeconds}s
                </span>
              </button>
            ))}
          </div>

          <label className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-200">🔊 Señales de sonido</span>
            <input
              type="checkbox"
              checked={kegel.sound}
              onChange={(e) => updateKegel({ sound: e.target.checked })}
              className="h-5 w-5 accent-cyan-400"
            />
          </label>

          <label className="flex items-center justify-between py-2">
            <span className="text-sm text-gray-200">📳 Vibración</span>
            <input
              type="checkbox"
              checked={kegel.vibration}
              disabled={!canVibrate}
              onChange={(e) => updateKegel({ vibration: e.target.checked })}
              className="h-5 w-5 accent-cyan-400 disabled:opacity-30"
            />
          </label>
          {!canVibrate && (
            <p className="mt-1 text-[11px] leading-relaxed text-gray-500">
              Tu navegador no expone vibración. En iPhone Safari nunca la implementó, así que el ritmo se marca con
              sonido — funciona incluso con el switch de silencio activado.
            </p>
          )}
        </div>

        <div className="rounded-2xl bg-white/5 p-4">
          <p className="mb-2 text-sm font-medium text-gray-100">Tu perfil</p>
          <div className="mb-3 flex flex-wrap gap-2">
            {AVATARS.map((a) => (
              <button
                key={a}
                onClick={() => setAvatar(a)}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-lg ${
                  avatar === a ? 'bg-cyan-400/20 ring-1 ring-cyan-400' : 'bg-white/10'
                }`}
              >
                {a}
              </button>
            ))}
          </div>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Tu nombre"
            className="mb-3 w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600"
          />

          <p className="mb-1 text-xs text-gray-500">
            Altura y sexo son opcionales — solo se usan para calcular tu % de grasa corporal en Medidas.
          </p>
          <div className="mb-3 grid grid-cols-2 gap-2">
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Altura (cm)</span>
              <input
                type="number"
                inputMode="decimal"
                value={heightCm}
                onChange={(e) => setHeightCm(e.target.value)}
                placeholder="—"
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600"
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs text-gray-400">Sexo</span>
              <select
                value={sex}
                onChange={(e) => setSex(e.target.value as Sex | '')}
                className="rounded-lg border border-white/10 bg-white/5 px-2 py-2 text-sm text-gray-100"
              >
                <option value="">—</option>
                <option value="male">Hombre</option>
                <option value="female">Mujer</option>
              </select>
            </label>
          </div>

          <button
            onClick={handleSaveProfile}
            disabled={!name.trim()}
            className="w-full rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-[#0b0d12] disabled:opacity-40"
          >
            Guardar
          </button>
        </div>

        <div className="rounded-2xl bg-white/5 p-4">
          <p className="mb-1 text-sm font-medium text-gray-100">Tus datos</p>
          <p className="mb-3 text-xs text-gray-500">
            Todo se guarda solo en este dispositivo. Exportá un backup de vez en cuando para no perder tu historial.
          </p>
          <div className="flex flex-col gap-2">
            <button
              onClick={handleExport}
              className="rounded-lg border border-white/15 py-2.5 text-sm text-gray-200 active:bg-white/10"
            >
              ⬇️ Exportar backup
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="rounded-lg border border-white/15 py-2.5 text-sm text-gray-200 active:bg-white/10"
            >
              ⬆️ Importar backup
            </button>
            <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
          </div>
          {status && <p className="mt-3 text-xs text-cyan-300">{status}</p>}
        </div>

        <button onClick={handleReset} className="text-center text-xs text-red-400">
          Borrar todos los datos de este dispositivo
        </button>
      </div>
    </div>
  )
}

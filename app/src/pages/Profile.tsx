import { useEffect, useRef, useState } from 'react'
import TopBar from '../components/TopBar'
import { getProfile, saveProfile } from '../lib/store'
import { AVATARS } from '../lib/profile'
import { clearAllData, exportBackup, importBackup } from '../lib/backup'
import type { Profile as ProfileType } from '../lib/types'

export default function Profile() {
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [loaded, setLoaded] = useState(false)
  const [status, setStatus] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getProfile().then((p) => {
      if (p) {
        setProfile(p)
        setName(p.name)
        setAvatar(p.avatar)
      }
      setLoaded(true)
    })
  }, [])

  async function handleSaveProfile() {
    if (!name.trim()) return
    const p: ProfileType = { name: name.trim(), avatar, createdAt: profile?.createdAt ?? new Date().toISOString() }
    await saveProfile(p)
    setProfile(p)
    setStatus('Perfil guardado.')
  }

  async function handleExport() {
    const backup = await exportBackup()
    const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    const date = new Date().toISOString().slice(0, 10)
    const who = profile?.name ? profile.name.toLowerCase().replace(/\s+/g, '-') : 'backup'
    a.href = url
    a.download = `mis-ejercicios-${who}-${date}.json`
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
    if (!confirm('¿Borrar TODOS los datos de esta app en este dispositivo? Rutinas, entrenamientos, mediciones y perfil. No se puede deshacer salvo que tengas un backup exportado.')) return
    await clearAllData()
    window.location.reload()
  }

  if (!loaded) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Perfil" back />
        <p className="p-6 text-center text-sm text-gray-500">Cargando…</p>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar title="Perfil" back />

      <div className="flex flex-col gap-4 p-4">
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

import { useEffect, useRef, useState } from 'react'
import TopBar from '../components/TopBar'
import { Avatar, Placeholder, Row, Section, Segmented, Toggle } from '../components/ui'
import { getKegelSettings, getProfile, saveKegelSettings, saveProfile } from '../lib/store'
import { clearAllData, exportBackup, importBackup } from '../lib/backup'
import { KEGEL_LEVELS } from '../lib/kegel'
import { supportsVibration } from '../lib/feedback'
import type { KegelLevelId, KegelSettings, Profile as ProfileType, Sex } from '../lib/types'

const DEFAULT_KEGEL: KegelSettings = { levelId: 'beginner', sound: true, vibration: true }

export default function Profile() {
  const [profile, setProfile] = useState<ProfileType | null>(null)
  const [name, setName] = useState('')
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
        setHeightCm(p.heightCm ? String(p.heightCm) : '')
        setSex(p.sex ?? '')
      }
      if (k) setKegel(k)
      setLoaded(true)
    })
  }, [])

  /**
   * Se guarda solo, como en Ajustes de iOS: al salir de un campo o al cambiar
   * el sexo. Sin nombre no se guarda, porque el perfil lo necesita.
   */
  async function commitProfile(patch: { name?: string; heightCm?: string; sex?: Sex | '' } = {}) {
    const n = (patch.name ?? name).trim()
    if (!n) return
    const h = patch.heightCm ?? heightCm
    const sx = patch.sex ?? sex
    const p: ProfileType = {
      name: n,
      avatar: profile?.avatar ?? '',
      createdAt: profile?.createdAt ?? new Date().toISOString(),
      heightCm: h ? Number(h) : null,
      sex: sx || null,
    }
    await saveProfile(p)
    setProfile(p)
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
    a.download = `soma-${who}-${date}.json`
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
        <TopBar title="Ajustes" back large />
        <Placeholder>Cargando…</Placeholder>
      </div>
    )
  }

  const level = KEGEL_LEVELS.find((l) => l.id === kegel.levelId) ?? KEGEL_LEVELS[0]
  const fieldClass =
    'min-w-0 flex-1 bg-transparent text-right text-[17px] text-label-2 placeholder:text-label-3 focus:text-label focus:outline-none'

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar title="Ajustes" back large />

      <div className="flex flex-col gap-7">
        <Section footer="Altura y sexo son opcionales: solo se usan para calcular tu % de grasa corporal en Medidas.">
          <div className="flex items-center gap-4 px-4 py-3">
            <Avatar name={name} size={56} />
            <div className="min-w-0">
              <p className="truncate text-[22px] font-semibold text-label">{name || 'Tu nombre'}</p>
              <p className="text-[15px] text-label-2">Perfil en este dispositivo</p>
            </div>
          </div>
          <label className="flex h-11 items-center gap-3 px-4">
            <span className="text-[17px] text-label">Nombre</span>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onBlur={() => commitProfile()}
              placeholder="Tu nombre"
              className={fieldClass}
            />
          </label>
          <label className="flex h-11 items-center gap-3 px-4">
            <span className="text-[17px] text-label">Altura</span>
            <input
              type="number"
              inputMode="decimal"
              value={heightCm}
              onChange={(e) => setHeightCm(e.target.value)}
              onBlur={() => commitProfile()}
              placeholder="cm"
              className={fieldClass}
            />
            {heightCm && <span className="text-[17px] text-label-2">cm</span>}
          </label>
          <label className="flex h-11 items-center gap-3 px-4">
            <span className="flex-1 text-[17px] text-label">Sexo</span>
            <select
              value={sex}
              onChange={(e) => {
                const v = e.target.value as Sex | ''
                setSex(v)
                void commitProfile({ sex: v })
              }}
              className="appearance-none bg-transparent text-right text-[17px] text-label-2 focus:outline-none"
            >
              <option value="">Sin indicar</option>
              <option value="male">Hombre</option>
              <option value="female">Mujer</option>
            </select>
          </label>
        </Section>

        <Section>
          <Row to="/medidas" icon="tape" title="Medidas" subtitle="Peso, cintura, % de grasa y tendencias" />
        </Section>

        <Section header="Kegel" footer={`${level.workSeconds} s por ejercicio, ${level.restSeconds} s de descanso entre uno y otro, ${level.exercises} ejercicios por rutina.`}>
          <div className="px-4 py-3">
            <Segmented
              label="Nivel de Kegel"
              value={kegel.levelId}
              onChange={(v) => updateKegel({ levelId: v as KegelLevelId, levelUpDismissedAt: undefined })}
              options={KEGEL_LEVELS.map((l) => ({ value: l.id, label: l.label }))}
            />
          </div>
          <Row
            icon="speaker"
            tone="kegel"
            title="Señales de sonido"
            trailing={
              <Toggle tone="kegel" label="Señales de sonido" checked={kegel.sound} onChange={(v) => updateKegel({ sound: v })} />
            }
          />
          <Row
            icon="vibrate"
            tone={canVibrate ? 'kegel' : 'gray'}
            title="Vibración"
            disabled={!canVibrate}
            trailing={
              canVibrate ? (
                <Toggle
                  tone="kegel"
                  label="Vibración"
                  checked={kegel.vibration}
                  onChange={(v) => updateKegel({ vibration: v })}
                />
              ) : (
                <span className="text-[17px] text-label-3">No disponible</span>
              )
            }
          />
        </Section>
        {!canVibrate && (
          <p className="-mt-5 px-8 text-[13px] leading-snug text-label-2">
            Safari en iPhone nunca implementó la vibración, así que el ritmo se marca con sonido. Funciona incluso con
            el interruptor de silencio activado.
          </p>
        )}

        <Section
          header="Tus datos"
          footer={status || 'Todo se guarda solo en este dispositivo. Exportá un respaldo de vez en cuando para no perder tu historial.'}
        >
          <Row onClick={handleExport} icon="share" tone="gray" title="Exportar respaldo" chevron={false} />
          <Row
            onClick={() => fileInputRef.current?.click()}
            icon="download"
            tone="gray"
            title="Importar respaldo"
            chevron={false}
          />
          <input ref={fileInputRef} type="file" accept="application/json" onChange={handleImportFile} className="hidden" />
        </Section>

        <Section>
          <Row onClick={handleReset} title="Borrar todos los datos" destructive />
        </Section>
      </div>
    </div>
  )
}

import { useState } from 'react'
import { saveProfile } from '../lib/store'
import { AVATARS } from '../lib/profile'

export default function ProfileSetup({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('')
  const [avatar, setAvatar] = useState(AVATARS[0])
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim() || saving) return
    setSaving(true)
    await saveProfile({ name: name.trim(), avatar, createdAt: new Date().toISOString() })
    onDone()
  }

  return (
    <div className="flex flex-col gap-3 rounded-2xl bg-white/5 p-4">
      <p className="text-sm font-medium text-gray-100">Antes de tu primera medición, ¿cómo te llamás?</p>
      <p className="text-xs text-gray-500">Es solo para personalizar la app en este dispositivo — no se manda a ningún lado.</p>

      <div className="flex flex-wrap gap-2">
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
        autoFocus
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Tu nombre"
        className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-100 placeholder:text-gray-600"
      />

      <button
        onClick={handleSave}
        disabled={!name.trim() || saving}
        className="rounded-lg bg-cyan-500 py-2.5 text-sm font-medium text-[#0b0d12] disabled:opacity-40"
      >
        Continuar
      </button>
    </div>
  )
}

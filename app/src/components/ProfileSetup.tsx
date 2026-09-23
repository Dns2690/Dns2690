import { useState } from 'react'
import { saveProfile } from '../lib/store'
import { Avatar, Button, Section } from './ui'

export default function ProfileSetup({ onDone }: { onDone: () => void }) {
  const [name, setName] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleSave() {
    if (!name.trim() || saving) return
    setSaving(true)
    // `avatar` queda vacío: el avatar ahora son las iniciales. El campo sigue
    // existiendo para que los respaldos viejos se importen sin tocar nada.
    await saveProfile({ name: name.trim(), avatar: '', createdAt: new Date().toISOString() })
    onDone()
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col items-center px-8 text-center">
        <Avatar name={name} size={72} />
        <p className="mt-4 text-[22px] font-bold text-label">¿Cómo te llamás?</p>
        <p className="mt-1 text-[15px] leading-snug text-label-2">
          Antes de tu primera medición. Es solo para personalizar la app en este dispositivo; no se manda a ningún lado.
        </p>
      </div>
      <Section>
        <input
          autoFocus
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Tu nombre"
          className="h-11 w-full bg-transparent px-4 text-[17px] text-label placeholder:text-label-3 focus:outline-none"
        />
      </Section>
      <div className="px-4">
        <Button onClick={handleSave} disabled={!name.trim() || saving}>
          Continuar
        </Button>
      </div>
    </div>
  )
}

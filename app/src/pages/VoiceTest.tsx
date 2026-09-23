import { useEffect, useRef, useState } from 'react'
import TopBar from '../components/TopBar'
import Icon from '../components/Icon'
import { Row, Section, Toggle } from '../components/ui'
import { getMindfulnessSettings, saveMindfulnessSettings } from '../lib/store'
import type { MindfulnessSettings } from '../lib/types'

/**
 * Elección de voz.
 *
 * La prueba anterior ya confirmó que iOS deja hablar desde temporizadores. Lo
 * que queda es la calidad: `getVoices()` devuelve la voz compacta del sistema,
 * que suena robótica. Las voces mejoradas hay que bajarlas a mano en Ajustes de
 * iOS, y aun así puede que el navegador no las exponga — depende del aparato y
 * de la versión. No hay forma de saberlo sin listar lo que este teléfono da.
 */

const SAMPLE =
  'Llevá la atención a la respiración. No hace falta cambiarla, solo notar cómo entra y cómo sale.'

const DEFAULTS: MindfulnessSettings = {
  levelId: 'beginner',
  breathId: 'coherent',
  ambient: 'drone',
  ambientVolume: 0.55,
  bells: true,
  voiceEnabled: false,
  voiceRate: 0.85,
}

export default function VoiceTest() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([])
  const [settings, setSettings] = useState<MindfulnessSettings | null>(null)
  const [speaking, setSpeaking] = useState<string | null>(null)
  const [showAll, setShowAll] = useState(false)
  const keepAlive = useRef<SpeechSynthesisUtterance[]>([])

  useEffect(() => {
    getMindfulnessSettings().then((s) => setSettings({ ...DEFAULTS, ...(s ?? {}) }))
  }, [])

  useEffect(() => {
    if (!('speechSynthesis' in window)) return
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    // La lista llega vacía en la primera llamada y se puebla después, y en iOS
    // el evento `voiceschanged` no siempre dispara. Sondeamos unos segundos.
    const polls = [100, 300, 700, 1500, 3000].map((ms) => window.setTimeout(load, ms))
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => {
      for (const t of polls) window.clearTimeout(t)
      window.speechSynthesis.removeEventListener('voiceschanged', load)
    }
  }, [])

  function reload() {
    window.speechSynthesis.cancel()
    setVoices(window.speechSynthesis.getVoices())
  }

  /** El identificador interno delata la calidad: compact, enhanced o premium. */
  function tierOf(v: SpeechSynthesisVoice): string | null {
    const uri = v.voiceURI.toLowerCase()
    if (uri.includes('premium')) return 'Premium'
    if (uri.includes('enhanced')) return 'Mejorada'
    if (uri.includes('compact')) return 'Compacta'
    return null
  }

  async function update(patch: Partial<MindfulnessSettings>) {
    if (!settings) return
    const next = { ...settings, ...patch }
    setSettings(next)
    await saveMindfulnessSettings(next)
  }

  function preview(voice: SpeechSynthesisVoice) {
    window.speechSynthesis.cancel()
    // En iOS la lista a veces se completa recién después del primer habla.
    window.setTimeout(() => setVoices(window.speechSynthesis.getVoices()), 600)
    const u = new SpeechSynthesisUtterance(SAMPLE)
    u.voice = voice
    u.lang = voice.lang
    u.rate = settings?.voiceRate ?? 0.85
    u.onend = () => setSpeaking(null)
    u.onerror = () => setSpeaking(null)
    keepAlive.current = [u]
    setSpeaking(voice.voiceURI)
    window.speechSynthesis.speak(u)
  }

  if (!settings) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Voz" back />
        <p className="p-6 text-center text-base text-label-2">Cargando…</p>
      </div>
    )
  }

  const spanish = voices.filter((v) => v.lang.toLowerCase().startsWith('es'))
  const shown = showAll ? voices : spanish
  const selected = settings.voiceURI

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar title="Voz guiada" back="Mindfulness" large />

      <div className="flex flex-col gap-7">
        <Section footer="Si la apagás, la guía queda por texto y campanas.">
          <Row
            icon="mic"
            tone="mind"
            title="Usar voz en las sesiones"
            trailing={
              <Toggle
                tone="mind"
                label="Usar voz en las sesiones"
                checked={settings.voiceEnabled ?? false}
                onChange={(v) => update({ voiceEnabled: v })}
              />
            }
          />
        </Section>

        <Section header="Velocidad" footer="Más lento suena más calmo, y es el ajuste que más mejora una voz mediocre.">
          <div className="flex items-center gap-3 px-4 py-3">
            <Icon name="speaker" size={18} className="shrink-0 text-label-2" />
            <input
              type="range"
              min="0.6"
              max="1.1"
              step="0.05"
              value={settings.voiceRate ?? 0.85}
              onChange={(e) => update({ voiceRate: Number(e.target.value) })}
              aria-label="Velocidad de la voz"
              className="h-1 flex-1 accent-mind-500"
            />
            <span className="w-12 shrink-0 text-right text-[17px] tabular-nums text-label-2">
              {(settings.voiceRate ?? 0.85).toFixed(2)}×
            </span>
          </div>
        </Section>

        <Section
          header={`${shown.length} de ${voices.length} ${voices.length === 1 ? 'voz' : 'voces'}`}
          footer="El identificador gris es la prueba de qué versión de la voz es: dice compact, enhanced o premium."
        >
          {spanish.length > 0 && spanish.every((v) => tierOf(v) === 'Compacta') && (
            <div className="px-4 py-3">
              <p className="flex items-center gap-2 text-[15px] font-semibold text-warn-300">
                <Icon name="info" size={18} />
                Todas las voces en español son compactas
              </p>
              <p className="mt-1 text-[15px] leading-snug text-label-2">
                Aunque tengas una voz mejorada instalada en Ajustes, tu iOS no la está exponiendo al navegador. Es una
                limitación conocida y no hay forma de sortearla desde la web.
              </p>
            </div>
          )}

          {shown.length === 0 && (
            <p className="px-4 py-3 text-[15px] text-label-2">
              Este navegador no está exponiendo voces todavía. Probá recargar.
            </p>
          )}

          {shown.map((v) => (
            <div key={v.voiceURI} className="flex items-center gap-3 px-4 py-2.5">
              <button
                onClick={() => update({ voiceURI: v.voiceURI })}
                className="flex min-w-0 flex-1 items-center gap-3 text-left active:opacity-60"
              >
                <span className="w-5 shrink-0">
                  {selected === v.voiceURI && <Icon name="check" size={20} strokeWidth={2.6} className="text-mind-400" />}
                </span>
                <span className="min-w-0">
                  <span className="flex items-center gap-2">
                    <span className="truncate text-[17px] text-label">{v.name}</span>
                    {tierOf(v) && (
                      <span
                        className={`shrink-0 rounded-md px-1.5 py-px text-[12px] font-medium ${
                          tierOf(v) === 'Compacta' ? 'bg-cell-2 text-label-2' : 'bg-mind-500/20 text-mind-300'
                        }`}
                      >
                        {tierOf(v)}
                      </span>
                    )}
                  </span>
                  <span className="block text-[13px] text-label-2">
                    {v.lang}
                    {v.localService ? ' · en el dispositivo' : ' · por red'}
                  </span>
                  <span className="mt-0.5 block break-all font-mono text-[11px] text-label-3">{v.voiceURI}</span>
                </span>
              </button>
              <button
                onClick={() => preview(v)}
                aria-label={speaking === v.voiceURI ? `Detener ${v.name}` : `Escuchar ${v.name}`}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-mind-500/20 text-mind-300 active:bg-mind-500/30"
              >
                <Icon name={speaking === v.voiceURI ? 'pause' : 'play'} size={16} />
              </button>
            </div>
          ))}
          <Row onClick={reload} title={<span className="text-mind-400">Recargar voces</span>} />
          {voices.length > spanish.length && (
            <Row
              onClick={() => setShowAll((v) => !v)}
              title={<span className="text-mind-400">{showAll ? 'Solo español' : 'Ver todas las voces'}</span>}
            />
          )}
        </Section>

        <Section header="Mejores voces">
          <div className="px-4 py-3 text-[15px] leading-relaxed text-label-2">
            <p>La voz que trae iOS de fábrica es la compacta, y suena robótica. Las buenas hay que bajarlas a mano:</p>
            <p className="mt-2 text-label">
              Ajustes → Accesibilidad → <strong>Contenido hablado</strong> → Voces → Español → elegí una voz y bajá la
              versión <strong>Mejorada</strong> o <strong>Premium</strong>.
            </p>
            <p className="mt-2">
              Pesan más de 100 MB cada una y hace falta wifi. Después, <strong className="text-label">cerrá la app del todo</strong>{' '}
              y volvé a abrirla: Safari guarda la lista de voces y no la relee sola.
            </p>
          </div>
        </Section>
      </div>
    </div>
  )
}

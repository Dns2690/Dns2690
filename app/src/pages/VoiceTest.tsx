import { useEffect, useRef, useState } from 'react'
import TopBar from '../components/TopBar'
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
    // La lista suele llegar vacía en la primera llamada y poblarse después.
    const load = () => setVoices(window.speechSynthesis.getVoices())
    load()
    window.speechSynthesis.addEventListener('voiceschanged', load)
    return () => window.speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])

  async function update(patch: Partial<MindfulnessSettings>) {
    if (!settings) return
    const next = { ...settings, ...patch }
    setSettings(next)
    await saveMindfulnessSettings(next)
  }

  function preview(voice: SpeechSynthesisVoice) {
    window.speechSynthesis.cancel()
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
        <p className="p-6 text-center text-base text-gray-500">Cargando…</p>
      </div>
    )
  }

  const spanish = voices.filter((v) => v.lang.toLowerCase().startsWith('es'))
  const shown = showAll ? voices : spanish
  const selected = settings.voiceURI

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar title="Voz" back />

      <div className="flex flex-col gap-4 p-4">
        <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4">
          <p className="text-base font-medium text-violet-300">✓ Tu iPhone permite voz guiada</p>
          <p className="mt-1 text-base leading-relaxed text-gray-400">
            La prueba anterior confirmó que puede hablar desde temporizadores. Falta elegir una voz que valga la
            pena escuchar diez minutos seguidos.
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-base font-semibold text-gray-100">Para conseguir mejores voces</p>
          <p className="mt-2 text-base leading-relaxed text-gray-400">
            La voz que trae iOS de fábrica es la compacta, y suena robótica. Las buenas hay que bajarlas a mano:
          </p>
          <p className="mt-2 text-base leading-relaxed text-gray-300">
            Ajustes → Accesibilidad → <strong>Contenido hablado</strong> → Voces → Español → tocá una voz y bajá la
            versión <strong>Mejorada</strong> o <strong>Premium</strong>.
          </p>
          <p className="mt-2 text-base leading-relaxed text-gray-500">
            Pesan más de 100 MB cada una y hace falta wifi. Después volvé acá y recargá: si el navegador las expone,
            aparecen en la lista. Puede que no las muestre —eso depende de tu versión de iOS y no lo puedo saber
            desde acá.
          </p>
        </div>

        <label className="flex items-center justify-between rounded-2xl bg-white/5 p-4">
          <div className="min-w-0 flex-1 pr-3">
            <p className="text-base font-medium text-gray-100">Usar voz en las sesiones</p>
            <p className="text-sm text-gray-500">Si la apagás, la guía queda por texto y campanas</p>
          </div>
          <input
            type="checkbox"
            checked={settings.voiceEnabled ?? false}
            onChange={(e) => update({ voiceEnabled: e.target.checked })}
            className="h-5 w-5 shrink-0 accent-violet-400"
          />
        </label>

        <div className="rounded-2xl bg-white/5 p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-base font-semibold text-gray-100">Velocidad</p>
            <p className="text-base text-violet-300">{(settings.voiceRate ?? 0.85).toFixed(2)}×</p>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Más lento suena más calmo, y es el ajuste que más mejora una voz mediocre.
          </p>
          <input
            type="range"
            min="0.6"
            max="1.1"
            step="0.05"
            value={settings.voiceRate ?? 0.85}
            onChange={(e) => update({ voiceRate: Number(e.target.value) })}
            className="mt-3 w-full accent-violet-400"
          />
        </div>

        <div className="flex flex-col gap-2">
          <div className="flex items-baseline justify-between px-1">
            <p className="text-sm text-gray-500">
              {shown.length} {shown.length === 1 ? 'voz disponible' : 'voces disponibles'}
            </p>
            {voices.length > spanish.length && (
              <button onClick={() => setShowAll((v) => !v)} className="text-sm text-violet-400">
                {showAll ? 'Solo español' : `Ver todas (${voices.length})`}
              </button>
            )}
          </div>

          {shown.length === 0 && (
            <p className="rounded-2xl bg-white/5 p-4 text-base text-gray-500">
              Este navegador no está exponiendo voces todavía. Probá recargar la pantalla.
            </p>
          )}

          {shown.map((v) => (
            <div
              key={v.voiceURI}
              className={`flex items-center gap-3 rounded-xl p-3 ${
                selected === v.voiceURI ? 'bg-violet-400/15 ring-1 ring-violet-400' : 'bg-white/5'
              }`}
            >
              <button onClick={() => update({ voiceURI: v.voiceURI })} className="min-w-0 flex-1 text-left">
                <p className="text-base font-medium text-gray-100">{v.name}</p>
                <p className="text-sm text-gray-500">
                  {v.lang}
                  {v.localService ? ' · en el dispositivo' : ' · por red'}
                  {v.default ? ' · por defecto' : ''}
                </p>
              </button>
              <button
                onClick={() => preview(v)}
                className="shrink-0 rounded-lg bg-white/10 px-4 py-2 text-base text-gray-100 active:bg-white/20"
              >
                {speaking === v.voiceURI ? '▪' : '▶'}
              </button>
            </div>
          ))}
        </div>

        <p className="px-1 text-sm leading-relaxed text-gray-600">
          Si ninguna te convence, hay un camino mejor para una app personal: grabar tu propia voz una vez y que sea
          esa la que te guíe. Decímelo y lo construyo.
        </p>
      </div>
    </div>
  )
}

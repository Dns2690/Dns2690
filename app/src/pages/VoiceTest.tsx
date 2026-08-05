import { useRef, useState } from 'react'
import TopBar from '../components/TopBar'

/**
 * Diagnóstico de voz guiada.
 *
 * Las fuentes se contradicen sobre si iOS permite hablar desde un temporizador:
 * unas dicen que WebKit descarta en silencio todo `speak()` que no salga de un
 * gesto, otras que basta con el primer gesto para desbloquear la página. No se
 * puede resolver leyendo — hay que medirlo en el aparato.
 *
 * Cada prueba registra si el motor avisó que empezó a hablar. Si la prueba a
 * los 20 segundos arranca, la meditación guiada por voz es viable.
 */

type Result = 'pending' | 'running' | 'spoke' | 'silent' | 'error'

interface Probe {
  id: string
  label: string
  detail: string
  delayMs: number
}

const PROBES: Probe[] = [
  { id: 'direct', label: '1 · Al tocar', detail: 'Habla en el mismo gesto. Es la referencia: si esta falla, no hay voz posible.', delayMs: 0 },
  { id: 'short', label: '2 · A los 5 segundos', detail: 'Primer temporizador después del gesto.', delayMs: 5000 },
  { id: 'long', label: '3 · A los 20 segundos', detail: 'La prueba que importa: es la distancia real entre consignas.', delayMs: 20000 },
]

const PHRASES: Record<string, string> = {
  direct: 'Prueba uno. Si escuchás esto, la voz funciona al tocar.',
  short: 'Prueba dos. Cinco segundos después del gesto.',
  long: 'Prueba tres. Veinte segundos después. Si escuchás esto, la meditación guiada por voz es posible.',
}

export default function VoiceTest() {
  const [results, setResults] = useState<Record<string, Result>>({})
  const [voiceName, setVoiceName] = useState<string>('')
  const [supported] = useState(() => typeof window !== 'undefined' && 'speechSynthesis' in window)
  // iOS puede recolectar la utterance antes de que termine y perder sus
  // eventos, así que hay que mantener la referencia viva a mano.
  const keepAlive = useRef<SpeechSynthesisUtterance[]>([])
  const timers = useRef<number[]>([])

  function speak(id: string) {
    const u = new SpeechSynthesisUtterance(PHRASES[id])
    u.lang = 'es-ES'
    u.rate = 0.95
    const voices = window.speechSynthesis.getVoices()
    const es = voices.find((v) => v.lang.startsWith('es'))
    if (es) {
      u.voice = es
      setVoiceName(`${es.name} (${es.lang})`)
    }
    keepAlive.current.push(u)

    let started = false
    u.onstart = () => {
      started = true
      setResults((r) => ({ ...r, [id]: 'spoke' }))
    }
    u.onerror = () => setResults((r) => ({ ...r, [id]: 'error' }))
    // Si a los 2 s no arrancó, WebKit la descartó en silencio.
    const t = window.setTimeout(() => {
      if (!started) setResults((r) => ({ ...r, [id]: r[id] === 'spoke' ? 'spoke' : 'silent' }))
    }, 2000)
    timers.current.push(t)

    setResults((r) => ({ ...r, [id]: 'running' }))
    window.speechSynthesis.speak(u)
  }

  function runAll() {
    for (const t of timers.current) window.clearTimeout(t)
    timers.current = []
    keepAlive.current = []
    setResults({})
    window.speechSynthesis.cancel()

    for (const probe of PROBES) {
      if (probe.delayMs === 0) {
        speak(probe.id)
      } else {
        setResults((r) => ({ ...r, [probe.id]: 'pending' }))
        timers.current.push(window.setTimeout(() => speak(probe.id), probe.delayMs))
      }
    }
  }

  const badge: Record<Result, { text: string; className: string }> = {
    pending: { text: 'esperando', className: 'text-gray-500' },
    running: { text: 'hablando…', className: 'text-violet-300' },
    spoke: { text: '✓ sonó', className: 'text-violet-400 font-semibold' },
    silent: { text: '✕ mudo', className: 'text-amber-400 font-semibold' },
    error: { text: '✕ error', className: 'text-red-400 font-semibold' },
  }

  const done = PROBES.every((p) => ['spoke', 'silent', 'error'].includes(results[p.id]))
  const longWorks = results.long === 'spoke'

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar title="Prueba de voz" back />

      <div className="flex flex-col gap-4 p-4">
        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-base leading-relaxed text-gray-300">
            Esta pantalla mide si tu iPhone deja hablar a la app desde un temporizador. Es lo que decide si la
            meditación puede tener voz guiada.
          </p>
          <p className="mt-2 text-base leading-relaxed text-gray-500">
            Tocá Empezar, subí el volumen y esperá <strong>25 segundos sin salir de la pantalla</strong>. Vas a
            escuchar hasta tres frases.
          </p>
        </div>

        {!supported && (
          <p className="rounded-2xl bg-amber-500/10 p-4 text-base text-amber-300">
            Este navegador no expone síntesis de voz.
          </p>
        )}

        <button
          onClick={runAll}
          disabled={!supported}
          className="rounded-2xl bg-violet-500 py-4 text-lg font-semibold text-white active:bg-violet-400 disabled:opacity-40"
        >
          Empezar prueba
        </button>

        <div className="flex flex-col gap-2">
          {PROBES.map((p) => {
            const state = results[p.id] ?? 'pending'
            return (
              <div key={p.id} className="rounded-xl bg-white/5 p-4">
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-base font-medium text-gray-100">{p.label}</p>
                  <span className={`shrink-0 text-base ${badge[state].className}`}>{badge[state].text}</span>
                </div>
                <p className="mt-1 text-sm leading-relaxed text-gray-500">{p.detail}</p>
              </div>
            )
          })}
        </div>

        {voiceName && (
          <p className="px-1 text-sm text-gray-500">
            Voz elegida: <span className="text-gray-300">{voiceName}</span>
          </p>
        )}

        {done && (
          <div
            className={`rounded-2xl p-4 ${
              longWorks ? 'bg-violet-500/10' : 'bg-amber-500/10'
            }`}
          >
            <p className={`text-base font-semibold ${longWorks ? 'text-violet-300' : 'text-amber-300'}`}>
              {longWorks ? '✓ La voz guiada es viable' : '✕ La voz guiada no es viable en este dispositivo'}
            </p>
            <p className="mt-1 text-base leading-relaxed text-gray-400">
              {longWorks
                ? 'Tu iPhone deja hablar desde temporizadores. Pasame este resultado y agrego voz a las sesiones.'
                : 'Tu iPhone descarta el habla programada, así que una voz narrada se cortaría a mitad de sesión. La guía queda por texto y campanas.'}
            </p>
          </div>
        )}

        <p className="px-1 text-sm leading-relaxed text-gray-600">
          Importante: el resultado depende de que hayas escuchado las frases, no solo de lo que diga la pantalla. Si
          alguna figura como “sonó” pero no la oíste, avisame — significa que el motor miente sobre su estado.
        </p>
      </div>
    </div>
  )
}

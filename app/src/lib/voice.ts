import { setAmbientVolume } from './ambient'

/**
 * Voz guiada.
 *
 * Dos restricciones de iOS mandan sobre el diseño:
 *
 * 1. El primer `speak()` tiene que salir de un gesto real. Después de eso la
 *    página queda desbloqueada y los temporizadores sí funcionan — medido en
 *    dispositivo, porque la documentación se contradecía.
 * 2. iOS puede recolectar la utterance antes de que termine y perder sus
 *    eventos, así que hay que mantener la referencia viva a mano.
 */

let alive: SpeechSynthesisUtterance[] = []
let duckTo = 0
let duckFrom = 0

export function voiceSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window
}

export function findVoice(voiceURI?: string): SpeechSynthesisVoice | null {
  if (!voiceSupported()) return null
  const voices = window.speechSynthesis.getVoices()
  if (voiceURI) {
    const exact = voices.find((v) => v.voiceURI === voiceURI)
    if (exact) return exact
  }
  return voices.find((v) => v.lang.toLowerCase().startsWith('es')) ?? null
}

export interface VoiceOptions {
  enabled?: boolean
  voiceURI?: string
  rate?: number
  /** Volumen del ambiente, para bajarlo mientras habla y devolverlo después. */
  ambientVolume?: number
}

export function speakGuidance(text: string, opts: VoiceOptions): void {
  if (!opts.enabled || !voiceSupported() || !text.trim()) return

  const u = new SpeechSynthesisUtterance(text)
  const voice = findVoice(opts.voiceURI)
  if (voice) {
    u.voice = voice
    u.lang = voice.lang
  } else {
    u.lang = 'es-ES'
  }
  u.rate = opts.rate ?? 0.85
  u.pitch = 1

  // Bajamos el ambiente mientras habla: compiten por el mismo rango grave y la
  // voz se pierde si no.
  duckFrom = opts.ambientVolume ?? 0.55
  duckTo = duckFrom * 0.35
  const restore = () => {
    setAmbientVolume(duckFrom)
    alive = alive.filter((x) => x !== u)
  }
  u.onstart = () => setAmbientVolume(duckTo)
  u.onend = restore
  u.onerror = restore

  alive.push(u)
  window.speechSynthesis.speak(u)
}

export function cancelVoice(ambientVolume?: number): void {
  if (!voiceSupported()) return
  window.speechSynthesis.cancel()
  alive = []
  if (ambientVolume != null) setAmbientVolume(ambientVolume)
}

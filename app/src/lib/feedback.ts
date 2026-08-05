import type { KegelPhase } from './types'

/**
 * Señales no visuales del entrenador.
 *
 * En iOS la vibración no existe: Apple nunca implementó `navigator.vibrate` y
 * el truco del `<input type="checkbox" switch>` quedó parcheado en iOS 26.5,
 * donde solo un toque real dispara el háptico. Por eso el audio es el canal
 * principal y la vibración es una mejora extra para Android.
 */

let ctx: AudioContext | null = null

interface AudioSessionCapableNavigator extends Navigator {
  audioSession?: { type: string }
}

/**
 * Debe llamarse desde un gesto del usuario. Además de crear el contexto, marca
 * la sesión de audio como `playback` (Safari 16.4+) para que los tonos suenen
 * aunque el iPhone tenga el switch de silencio activado.
 */
export function unlockAudio(): void {
  if (ctx) {
    // Tras bloquear la pantalla o pasar a segundo plano, iOS deja el contexto
    // en 'suspended' (o 'interrupted' en WebKit). Hay que reanudarlo o los
    // tonos se pierden en silencio.
    if (ctx.state !== 'running') void ctx.resume()
    return
  }

  const Ctor: typeof AudioContext | undefined =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
  if (!Ctor) return

  try {
    const nav = navigator as AudioSessionCapableNavigator
    if (nav.audioSession) nav.audioSession.type = 'playback'
  } catch {
    // Navegadores sin Audio Session API: seguimos igual, solo respetará el silencio.
  }

  ctx = new Ctor()
  void ctx.resume()

  // Un buffer mudo termina de desbloquear la salida en iOS.
  const buffer = ctx.createBuffer(1, 1, 22050)
  const source = ctx.createBufferSource()
  source.buffer = buffer
  source.connect(ctx.destination)
  source.start(0)
}

export function closeAudio(): void {
  if (!ctx) return
  void ctx.close()
  ctx = null
}

/** Barrido de frecuencia con envolvente suave, para que no chasquee. */
function tone(fromHz: number, toHz: number, durationSec: number, peakGain = 0.18): void {
  if (!ctx || ctx.state === 'closed') return
  // Red de seguridad: si el contexto quedó suspendido por el sistema, este tono
  // se pierde igual, pero deja el contexto listo para los siguientes.
  if (ctx.state !== 'running') {
    void ctx.resume()
    return
  }
  const now = ctx.currentTime
  const osc = ctx.createOscillator()
  const gain = ctx.createGain()

  osc.type = 'sine'
  osc.frequency.setValueAtTime(fromHz, now)
  if (toHz !== fromHz) osc.frequency.linearRampToValueAtTime(toHz, now + durationSec)

  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(peakGain, now + 0.015)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + durationSec)

  osc.connect(gain)
  gain.connect(ctx.destination)
  osc.start(now)
  osc.stop(now + durationSec + 0.02)
}

const PHASE_VIBRATION: Record<KegelPhase, number[]> = {
  contract: [45],
  hold: [15],
  release: [25],
  rest: [],
}

export function vibrate(pattern: number[]): void {
  if (pattern.length === 0) return
  if (typeof navigator === 'undefined' || typeof navigator.vibrate !== 'function') return
  try {
    navigator.vibrate(pattern)
  } catch {
    // Algunos navegadores exponen la API pero la bloquean; no es crítico.
  }
}

export function supportsVibration(): boolean {
  return typeof navigator !== 'undefined' && typeof navigator.vibrate === 'function'
}

export interface CueOptions {
  sound: boolean
  vibration: boolean
}

export function cuePhase(phase: KegelPhase, opts: CueOptions): void {
  if (opts.sound) {
    switch (phase) {
      case 'contract':
        tone(440, 700, 0.22)
        break
      case 'hold':
        tone(700, 700, 0.1, 0.1)
        break
      case 'release':
        tone(700, 380, 0.26)
        break
      case 'rest':
        tone(300, 300, 0.14, 0.09)
        break
    }
  }
  if (opts.vibration) vibrate(PHASE_VIBRATION[phase])
}

export function cueCountdown(opts: CueOptions): void {
  if (opts.sound) tone(520, 520, 0.09, 0.12)
  if (opts.vibration) vibrate([20])
}

export function cueFinish(opts: CueOptions): void {
  if (opts.sound) {
    tone(523, 523, 0.16, 0.16)
    window.setTimeout(() => tone(659, 659, 0.16, 0.16), 150)
    window.setTimeout(() => tone(784, 784, 0.3, 0.18), 300)
  }
  if (opts.vibration) vibrate([80, 60, 80, 60, 160])
}

let wakeLock: WakeLockSentinel | null = null

/** Evita que la pantalla se apague a mitad de la sesión (iOS 16.4+, Android). */
export async function requestWakeLock(): Promise<void> {
  if (!('wakeLock' in navigator)) return
  try {
    wakeLock = await navigator.wakeLock.request('screen')
  } catch {
    // Se rechaza si la pestaña no está visible; no vale la pena molestar al usuario.
  }
}

export async function releaseWakeLock(): Promise<void> {
  if (!wakeLock) return
  try {
    await wakeLock.release()
  } catch {
    // Ya liberado por el navegador.
  }
  wakeLock = null
}

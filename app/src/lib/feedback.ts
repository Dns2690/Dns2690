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

let noiseBuffer: AudioBuffer | null = null

function getNoise(context: AudioContext): AudioBuffer {
  if (noiseBuffer) return noiseBuffer
  const length = Math.floor(context.sampleRate * 0.4)
  const buffer = context.createBuffer(1, length, context.sampleRate)
  const data = buffer.getChannelData(0)
  for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1
  noiseBuffer = buffer
  return buffer
}

interface ThumpOptions {
  /** Fundamental del cuerpo grave, en Hz. */
  freq: number
  /** Corte del filtro sobre el ruido: más bajo = más sordo. */
  cutoff: number
  duration: number
  gain: number
}

/**
 * Golpe sordo en vez de un pitido.
 *
 * Un barrido de seno agudo se lee como alarma y cansa en una sesión de varios
 * minutos. Esto combina un ruido filtrado paso-bajo (la parte "táctil", que es
 * lo que hace que se perciba como una vibración) con un seno grave que le da
 * cuerpo. El ruido además se reproduce bien en el parlante del teléfono, que
 * apenas responde por debajo de los 200 Hz.
 */
function thump({ freq, cutoff, duration, gain: peakGain }: ThumpOptions): void {
  if (!ctx || ctx.state === 'closed') return
  // Red de seguridad: si el contexto quedó suspendido por el sistema, este
  // golpe se pierde igual, pero deja el contexto listo para los siguientes.
  if (ctx.state !== 'running') {
    void ctx.resume()
    return
  }
  const now = ctx.currentTime

  const envelope = ctx.createGain()
  envelope.gain.setValueAtTime(0, now)
  envelope.gain.linearRampToValueAtTime(peakGain, now + 0.008)
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  envelope.connect(ctx.destination)

  const noise = ctx.createBufferSource()
  noise.buffer = getNoise(ctx)
  const lowpass = ctx.createBiquadFilter()
  lowpass.type = 'lowpass'
  lowpass.frequency.setValueAtTime(cutoff, now)
  lowpass.Q.value = 0.7
  noise.connect(lowpass)
  lowpass.connect(envelope)
  noise.start(now)
  noise.stop(now + duration + 0.02)

  const body = ctx.createOscillator()
  body.type = 'sine'
  body.frequency.setValueAtTime(freq, now)
  const bodyGain = ctx.createGain()
  bodyGain.gain.setValueAtTime(0.55, now)
  body.connect(bodyGain)
  bodyGain.connect(envelope)
  body.start(now)
  body.stop(now + duration + 0.02)
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
        thump({ freq: 95, cutoff: 460, duration: 0.15, gain: 0.3 })
        break
      case 'hold':
        // Apenas un roce: la fase de sostener no necesita marcarse fuerte.
        thump({ freq: 80, cutoff: 240, duration: 0.06, gain: 0.1 })
        break
      case 'release':
        thump({ freq: 62, cutoff: 300, duration: 0.11, gain: 0.19 })
        break
      case 'rest':
        thump({ freq: 55, cutoff: 220, duration: 0.09, gain: 0.11 })
        break
    }
  }
  if (opts.vibration) vibrate(PHASE_VIBRATION[phase])
}

/**
 * Un pulso del tren que simula la vibración. Corto y de poco volumen: lo que
 * hace el efecto no es cada golpe sino la repetición rápida, igual que un motor
 * háptico. Suelto no debería llamar la atención.
 */
export function pulseTick(intensity: number, opts: CueOptions): void {
  if (!opts.sound) return
  const v = Math.min(1, Math.max(0, intensity))
  thump({ freq: 70 + v * 30, cutoff: 260 + v * 180, duration: 0.045, gain: 0.07 + v * 0.11 })
}

/**
 * Cadencia del tren de pulsos, en milisegundos.
 *
 * Se acelera con la intensidad para que la rampa de fuerza se escuche además de
 * verse: en un Front Clamp, los pulsos apurándose dicen "seguí apretando".
 */
export function pulseIntervalMs(intensity: number): number {
  const v = Math.min(1, Math.max(0, intensity))
  return 165 - v * 75
}

export function cueCountdown(opts: CueOptions): void {
  if (opts.sound) thump({ freq: 110, cutoff: 520, duration: 0.09, gain: 0.22 })
  if (opts.vibration) vibrate([20])
}

export function cueFinish(opts: CueOptions): void {
  if (opts.sound) {
    thump({ freq: 80, cutoff: 420, duration: 0.13, gain: 0.26 })
    window.setTimeout(() => thump({ freq: 100, cutoff: 460, duration: 0.13, gain: 0.26 }), 170)
    window.setTimeout(() => thump({ freq: 130, cutoff: 520, duration: 0.28, gain: 0.3 }), 340)
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

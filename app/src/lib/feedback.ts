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

interface BuzzOptions {
  /** Fundamental en Hz. Cerca de 210 es donde suena un teléfono vibrando. */
  freq: number
  duration: number
  gain: number
  /** Cadencia de la modulación de amplitud: el "grano" del motor. */
  modHz?: number
  /** Profundidad de esa modulación, 0–1. */
  modDepth?: number
  /** Ruido agregado, para el traqueteo del aparato. */
  noise?: number
}

/**
 * Zumbido sintetizado a imagen de un motor háptico.
 *
 * Tres decisiones dan el parecido:
 *
 * 1. Fundamental cerca de 210 Hz. Un teléfono vibrando sobre una mesa tiene su
 *    pico de resonancia medido cerca de 233 Hz, y ese es el sonido que uno
 *    reconoce. La versión anterior usaba 70–100 Hz, por debajo de lo que el
 *    parlante del teléfono puede reproducir, así que se escuchaba sobre todo el
 *    ruido: un golpe seco en vez de un zumbido.
 * 2. Onda cuadrada, no senoidal. Los armónicos hacen que se lea como mecanismo
 *    y no como nota musical.
 * 3. Modulación de amplitud a ~55 Hz. Es lo que produce el "brrr" granulado; un
 *    tono de amplitud constante suena a zumbador, no a vibración.
 */
function buzz({
  freq,
  duration,
  gain: peakGain,
  modHz = 55,
  modDepth = 0.45,
  noise = 0.16,
}: BuzzOptions): void {
  if (!ctx || ctx.state === 'closed') return
  // Red de seguridad: si el contexto quedó suspendido por el sistema, este
  // pulso se pierde igual, pero deja el contexto listo para los siguientes.
  if (ctx.state !== 'running') {
    void ctx.resume()
    return
  }
  const now = ctx.currentTime
  const stopAt = now + duration + 0.02

  const envelope = ctx.createGain()
  envelope.gain.setValueAtTime(0, now)
  envelope.gain.linearRampToValueAtTime(peakGain, now + 0.006)
  envelope.gain.setValueAtTime(peakGain, now + duration * 0.6)
  envelope.gain.exponentialRampToValueAtTime(0.0001, now + duration)
  envelope.connect(ctx.destination)

  // Deja pasar la banda de la vibración y recorta la aspereza de la cuadrada.
  const band = ctx.createBiquadFilter()
  band.type = 'bandpass'
  band.frequency.setValueAtTime(freq * 1.25, now)
  band.Q.value = 1.6
  band.connect(envelope)

  // El LFO suma sobre el valor base, así la amplitud oscila sin cortarse.
  const modulated = ctx.createGain()
  modulated.gain.setValueAtTime(1 - modDepth, now)
  const lfo = ctx.createOscillator()
  lfo.type = 'sine'
  lfo.frequency.setValueAtTime(modHz, now)
  const lfoDepth = ctx.createGain()
  lfoDepth.gain.setValueAtTime(modDepth, now)
  lfo.connect(lfoDepth)
  lfoDepth.connect(modulated.gain)
  lfo.start(now)
  lfo.stop(stopAt)
  modulated.connect(band)

  const carrier = ctx.createOscillator()
  carrier.type = 'square'
  carrier.frequency.setValueAtTime(freq, now)
  const carrierGain = ctx.createGain()
  carrierGain.gain.setValueAtTime(0.45, now)
  carrier.connect(carrierGain)
  carrierGain.connect(modulated)
  carrier.start(now)
  carrier.stop(stopAt)

  if (noise > 0) {
    const rattle = ctx.createBufferSource()
    rattle.buffer = getNoise(ctx)
    const rattleGain = ctx.createGain()
    rattleGain.gain.setValueAtTime(noise, now)
    rattle.connect(rattleGain)
    rattleGain.connect(modulated)
    rattle.start(now)
    rattle.stop(stopAt)
  }
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
        buzz({ freq: 205, duration: 0.16, gain: 0.26 })
        break
      case 'hold':
        // Apenas un roce: la fase de sostener no necesita marcarse fuerte.
        buzz({ freq: 210, duration: 0.07, gain: 0.11 })
        break
      case 'release':
        buzz({ freq: 155, duration: 0.14, gain: 0.19, modHz: 45 })
        break
      case 'rest':
        buzz({ freq: 130, duration: 0.11, gain: 0.11, modHz: 38 })
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
  // 75ms de duración contra intervalos de 90–165ms: a intensidad alta los
  // pulsos casi se tocan y el zumbido se vuelve continuo, a intensidad baja se
  // separan. La densidad refuerza la rampa además de la cadencia.
  buzz({
    freq: 195 + v * 30,
    duration: 0.075,
    gain: 0.09 + v * 0.13,
    modHz: 50 + v * 15,
    modDepth: 0.5,
  })
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
  if (opts.sound) buzz({ freq: 225, duration: 0.09, gain: 0.24, modHz: 60 })
  if (opts.vibration) vibrate([20])
}

export function cueFinish(opts: CueOptions): void {
  if (opts.sound) {
    buzz({ freq: 165, duration: 0.14, gain: 0.26 })
    window.setTimeout(() => buzz({ freq: 200, duration: 0.14, gain: 0.26 }), 170)
    window.setTimeout(() => buzz({ freq: 240, duration: 0.3, gain: 0.3, modHz: 65 }), 340)
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

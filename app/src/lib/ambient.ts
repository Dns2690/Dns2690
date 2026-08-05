import { getAudioContext } from './feedback'

/**
 * Ambientes sonoros y campanas, generados en el navegador.
 *
 * Nada de archivos: un track ambiente de diez minutos son varios MB, y la app
 * entera pesa poco más que eso. Sintetizarlo cuesta cero bytes, no se repite
 * nunca y dura lo que dure la sesión.
 */

export type AmbientKind = 'none' | 'drone' | 'rain' | 'waves'

export const AMBIENTS: { id: AmbientKind; label: string; description: string }[] = [
  { id: 'drone', label: 'Drone', description: 'Un acorde sostenido que va derivando' },
  { id: 'rain', label: 'Lluvia', description: 'Ruido suave con densidad cambiante' },
  { id: 'waves', label: 'Olas', description: 'Respiración lenta del mar' },
  { id: 'none', label: 'Silencio', description: 'Solo las campanas' },
]

let noiseBuffer: AudioBuffer | null = null

function noise(ctx: AudioContext): AudioBuffer {
  if (noiseBuffer && noiseBuffer.sampleRate === ctx.sampleRate) return noiseBuffer
  const length = Math.floor(ctx.sampleRate * 4)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  // Ruido rosa aproximado (Voss-McCartney simplificado): el blanco puro suena
  // a estática de televisor, el rosa se parece a lluvia.
  let b0 = 0, b1 = 0, b2 = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99765 * b0 + white * 0.099
    b1 = 0.963 * b1 + white * 0.2965
    b2 = 0.57 * b2 + white * 1.0526
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.2
  }
  noiseBuffer = buffer
  return buffer
}

interface Voice {
  stop: (at: number) => void
}

let master: GainNode | null = null
let voices: Voice[] = []
let current: AmbientKind = 'none'

function lfo(ctx: AudioContext, target: AudioParam, hz: number, depth: number, base: number): Voice {
  const osc = ctx.createOscillator()
  osc.type = 'sine'
  osc.frequency.value = hz
  const gain = ctx.createGain()
  gain.gain.value = depth
  target.value = base
  osc.connect(gain)
  gain.connect(target)
  osc.start()
  return { stop: (at) => osc.stop(at) }
}

function buildDrone(ctx: AudioContext, out: GainNode): Voice[] {
  // Quinta justa con una tercera arriba: consonante y estable, sin tensión.
  const freqs = [110, 164.81, 220, 329.63]
  const made: Voice[] = []
  freqs.forEach((f, i) => {
    const osc = ctx.createOscillator()
    osc.type = i < 2 ? 'sine' : 'triangle'
    // Desafinar levemente cada voz produce un batido lento que evita que el
    // acorde suene sintético y quieto.
    osc.frequency.value = f * (1 + (i - 1.5) * 0.0012)

    const gain = ctx.createGain()
    gain.gain.value = 0
    made.push(lfo(ctx, gain.gain, 0.03 + i * 0.017, 0.055, 0.075 - i * 0.012))

    const lp = ctx.createBiquadFilter()
    lp.type = 'lowpass'
    lp.frequency.value = 700
    lp.Q.value = 0.5

    osc.connect(gain)
    gain.connect(lp)
    lp.connect(out)
    osc.start()
    made.push({ stop: (at) => osc.stop(at) })
  })
  return made
}

function buildRain(ctx: AudioContext, out: GainNode): Voice[] {
  const src = ctx.createBufferSource()
  src.buffer = noise(ctx)
  src.loop = true

  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.Q.value = 0.6
  const made = [lfo(ctx, lp.frequency, 0.05, 900, 2200)]

  const hp = ctx.createBiquadFilter()
  hp.type = 'highpass'
  hp.frequency.value = 300

  const gain = ctx.createGain()
  made.push(lfo(ctx, gain.gain, 0.08, 0.05, 0.2))

  src.connect(hp)
  hp.connect(lp)
  lp.connect(gain)
  gain.connect(out)
  src.start()
  made.push({ stop: (at) => src.stop(at) })
  return made
}

function buildWaves(ctx: AudioContext, out: GainNode): Voice[] {
  const src = ctx.createBufferSource()
  src.buffer = noise(ctx)
  src.loop = true

  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.Q.value = 0.7
  // Ciclo de ~11 s: el barrido del filtro acompaña al de volumen, así la ola
  // se abre y se cierra en brillo además de en fuerza.
  const made = [lfo(ctx, lp.frequency, 0.09, 700, 1100)]

  const gain = ctx.createGain()
  made.push(lfo(ctx, gain.gain, 0.09, 0.14, 0.17))

  src.connect(lp)
  lp.connect(gain)
  gain.connect(out)
  src.start()
  made.push({ stop: (at) => src.stop(at) })
  return made
}

export function startAmbient(kind: AmbientKind, volume = 0.6): void {
  const ctx = getAudioContext()
  if (!ctx) return
  stopAmbient()
  current = kind
  if (kind === 'none') return

  master = ctx.createGain()
  master.gain.setValueAtTime(0, ctx.currentTime)
  // Entrada de 3 s: que el ambiente aparezca sin sobresaltar.
  master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 3)
  master.connect(ctx.destination)

  if (kind === 'drone') voices = buildDrone(ctx, master)
  else if (kind === 'rain') voices = buildRain(ctx, master)
  else voices = buildWaves(ctx, master)
}

export function stopAmbient(fadeSeconds = 2): void {
  const ctx = getAudioContext()
  if (!ctx || !master) {
    voices = []
    master = null
    return
  }
  const end = ctx.currentTime + fadeSeconds
  master.gain.cancelScheduledValues(ctx.currentTime)
  master.gain.setValueAtTime(master.gain.value, ctx.currentTime)
  master.gain.linearRampToValueAtTime(0.0001, end)
  for (const v of voices) v.stop(end + 0.1)
  voices = []
  master = null
  current = 'none'
}

export function currentAmbient(): AmbientKind {
  return current
}

export function setAmbientVolume(volume: number): void {
  const ctx = getAudioContext()
  if (!ctx || !master) return
  master.gain.cancelScheduledValues(ctx.currentTime)
  master.gain.linearRampToValueAtTime(volume, ctx.currentTime + 0.3)
}

/**
 * Campana. Un metal golpeado no tiene armónicos enteros como una cuerda: sus
 * parciales caen en proporciones irregulares, y eso es justo lo que hace que se
 * oiga metálico en vez de a nota de órgano. Cada parcial además se apaga a su
 * propio ritmo — los agudos primero.
 */
export function bell(volume = 0.5, fundamental = 440): void {
  const ctx = getAudioContext()
  if (!ctx || ctx.state !== 'running') return
  const now = ctx.currentTime
  const partials = [
    { ratio: 1, gain: 1, decay: 6 },
    { ratio: 2.02, gain: 0.55, decay: 4.2 },
    { ratio: 2.98, gain: 0.36, decay: 3 },
    { ratio: 4.16, gain: 0.22, decay: 2.1 },
    { ratio: 5.43, gain: 0.14, decay: 1.5 },
    { ratio: 6.79, gain: 0.09, decay: 1 },
  ]

  for (const p of partials) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.setValueAtTime(fundamental * p.ratio, now)
    const g = ctx.createGain()
    g.gain.setValueAtTime(0, now)
    g.gain.linearRampToValueAtTime(p.gain * volume * 0.3, now + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, now + p.decay)
    osc.connect(g)
    g.connect(ctx.destination)
    osc.start(now)
    osc.stop(now + p.decay + 0.05)
  }
}

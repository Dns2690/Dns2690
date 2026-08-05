import { getAudioContext } from './feedback'

/**
 * Ambientes sonoros y campanas, generados en el navegador.
 *
 * Nada de archivos: un track ambiente de diez minutos son varios MB, y la app
 * entera pesa poco más que eso. Sintetizarlo cuesta cero bytes, no se repite
 * nunca y dura lo que dure la sesión.
 */

export type AmbientKind = 'none' | 'drone' | 'rain' | 'waves' | 'deep' | 'bowl' | 'fire'

export const AMBIENTS: { id: AmbientKind; label: string; description: string }[] = [
  { id: 'deep', label: 'Profundo', description: 'Ruido marrón, grave y envolvente' },
  { id: 'bowl', label: 'Cuenco', description: 'Cuenco tibetano sostenido' },
  { id: 'fire', label: 'Fuego', description: 'Brasas con chisporroteo' },
  { id: 'rain', label: 'Lluvia', description: 'Ruido suave con densidad cambiante' },
  { id: 'waves', label: 'Olas', description: 'Respiración lenta del mar' },
  { id: 'drone', label: 'Drone', description: 'Un acorde sostenido que va derivando' },
  { id: 'none', label: 'Silencio', description: 'Solo las campanas' },
]

let pinkBuffer: AudioBuffer | null = null
let brownBuffer: AudioBuffer | null = null

/**
 * Ruido rosa (Voss-McCartney simplificado). El blanco puro suena a estática de
 * televisor; el rosa cae 3 dB por octava y se parece a lluvia o a mar, que es
 * además el que mejor respaldo tiene en los estudios de sueño.
 */
function noise(ctx: AudioContext): AudioBuffer {
  if (pinkBuffer && pinkBuffer.sampleRate === ctx.sampleRate) return pinkBuffer
  const length = Math.floor(ctx.sampleRate * 4)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let b0 = 0, b1 = 0, b2 = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    b0 = 0.99765 * b0 + white * 0.099
    b1 = 0.963 * b1 + white * 0.2965
    b2 = 0.57 * b2 + white * 1.0526
    data[i] = (b0 + b1 + b2 + white * 0.1848) * 0.2
  }
  pinkBuffer = buffer
  return buffer
}

/**
 * Ruido marrón: cae 6 dB por octava, el doble de pronunciado que el rosa. Se
 * obtiene integrando ruido blanco. Es el más grave de los tres y el que más
 * suele elegirse para relajarse — suena a río lejano más que a estática.
 */
function brownNoise(ctx: AudioContext): AudioBuffer {
  if (brownBuffer && brownBuffer.sampleRate === ctx.sampleRate) return brownBuffer
  const length = Math.floor(ctx.sampleRate * 4)
  const buffer = ctx.createBuffer(1, length, ctx.sampleRate)
  const data = buffer.getChannelData(0)
  let last = 0
  for (let i = 0; i < length; i++) {
    const white = Math.random() * 2 - 1
    last = (last + 0.02 * white) / 1.02
    data[i] = last * 3.2
  }
  brownBuffer = buffer
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

function buildDeep(ctx: AudioContext, out: GainNode): Voice[] {
  const src = ctx.createBufferSource()
  src.buffer = brownNoise(ctx)
  src.loop = true

  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.Q.value = 0.5
  // Barrido muy lento y estrecho: da vida sin que se note el movimiento.
  const made = [lfo(ctx, lp.frequency, 0.02, 180, 620)]

  const gain = ctx.createGain()
  made.push(lfo(ctx, gain.gain, 0.014, 0.05, 0.5))

  src.connect(lp)
  lp.connect(gain)
  gain.connect(out)
  src.start()
  made.push({ stop: (at) => src.stop(at) })
  return made
}

function buildBowl(ctx: AudioContext, out: GainNode): Voice[] {
  // Parciales de un cuenco: como en la campana, no son armónicos enteros. Acá
  // se sostienen en vez de apagarse, y el batido entre pares casi afinados
  // produce el pulso lento característico.
  const fundamental = 136.1 // "nota Om", habitual en cuencos
  const partials = [
    { ratio: 1, gain: 0.5, beat: 0.18 },
    { ratio: 2.03, gain: 0.26, beat: 0.27 },
    { ratio: 3.01, gain: 0.14, beat: 0.41 },
    { ratio: 4.19, gain: 0.07, beat: 0.55 },
  ]
  const made: Voice[] = []
  for (const p of partials) {
    const osc = ctx.createOscillator()
    osc.type = 'sine'
    osc.frequency.value = fundamental * p.ratio
    const g = ctx.createGain()
    made.push(lfo(ctx, g.gain, p.beat, p.gain * 0.35, p.gain))
    osc.connect(g)
    g.connect(out)
    osc.start()
    made.push({ stop: (at) => osc.stop(at) })
  }
  return made
}

function buildFire(ctx: AudioContext, out: GainNode): Voice[] {
  const made: Voice[] = []

  // Base: el rumor grave de las brasas.
  const src = ctx.createBufferSource()
  src.buffer = brownNoise(ctx)
  src.loop = true
  const lp = ctx.createBiquadFilter()
  lp.type = 'lowpass'
  lp.frequency.value = 450
  const base = ctx.createGain()
  made.push(lfo(ctx, base.gain, 0.11, 0.08, 0.28))
  src.connect(lp)
  lp.connect(base)
  base.connect(out)
  src.start()
  made.push({ stop: (at) => src.stop(at) })

  // Chisporroteos: ráfagas cortas a intervalos irregulares. La irregularidad es
  // lo que lo hace creíble — a intervalo fijo suena a máquina.
  let timer = 0
  const crackle = () => {
    const now = ctx.currentTime
    const n = ctx.createBufferSource()
    n.buffer = pinkBuffer ?? noise(ctx)
    n.playbackRate.value = 1.5 + Math.random()
    const bp = ctx.createBiquadFilter()
    bp.type = 'bandpass'
    bp.frequency.value = 900 + Math.random() * 2200
    bp.Q.value = 2 + Math.random() * 3
    const g = ctx.createGain()
    const dur = 0.02 + Math.random() * 0.05
    g.gain.setValueAtTime(0, now)
    g.gain.linearRampToValueAtTime(0.05 + Math.random() * 0.14, now + 0.003)
    g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
    n.connect(bp)
    bp.connect(g)
    g.connect(out)
    n.start(now)
    n.stop(now + dur + 0.02)
    timer = window.setTimeout(crackle, 90 + Math.random() * 700)
  }
  timer = window.setTimeout(crackle, 300)
  made.push({ stop: () => window.clearTimeout(timer) })

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

  const builders: Record<Exclude<AmbientKind, 'none'>, (c: AudioContext, o: GainNode) => Voice[]> = {
    drone: buildDrone,
    rain: buildRain,
    waves: buildWaves,
    deep: buildDeep,
    bowl: buildBowl,
    fire: buildFire,
  }
  voices = builders[kind](ctx, master)
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

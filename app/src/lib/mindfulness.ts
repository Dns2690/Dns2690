import type { MindfulnessLevelId, MindfulnessSession, MindfulnessSegment } from './types'

/**
 * Currículo de meditación.
 *
 * La progresión sigue el arco del MBSR: se empieza aprendiendo a sostener la
 * atención en algo concreto (la respiración), y de a poco se amplía hacia el
 * cuerpo entero y hacia lo que aparezca. Las duraciones arrancan cortas a
 * propósito — la constancia importa más que la sesión larga.
 */

export interface BreathPattern {
  id: string
  label: string
  description: string
  /** Fases del ciclo, en segundos. Una fase de 0 no se muestra. */
  inhale: number
  holdIn: number
  exhale: number
  holdOut: number
  evidence?: string
}

export const BREATH_PATTERNS: BreathPattern[] = [
  {
    id: 'coherent',
    label: 'Coherente',
    description: '5,5 segundos inhalando, 5,5 exhalando',
    inhale: 5.5,
    holdIn: 0,
    exhale: 5.5,
    holdOut: 0,
    evidence:
      'Es el ritmo de resonancia cardíaca (~0,1 Hz). De todas las respiraciones estudiadas, es la que más aumenta la variabilidad de la frecuencia cardíaca, con efecto medible en la misma sesión.',
  },
  {
    id: 'calm',
    label: 'Calma',
    description: '4 inhalando, 6 exhalando',
    inhale: 4,
    holdIn: 0,
    exhale: 6,
    holdOut: 0,
    evidence:
      'Exhalar más largo que inhalar acentúa la activación parasimpática. Útil para bajar revoluciones.',
  },
  {
    id: '478',
    label: '4-7-8',
    description: '4 inhalando, 7 sosteniendo, 8 exhalando',
    inhale: 4,
    holdIn: 7,
    exhale: 8,
    holdOut: 0,
    evidence:
      'Muy difundida, pero con menos respaldo empírico que la respiración coherente al compararlas de forma directa.',
  },
  {
    id: 'box',
    label: 'Cuadrada',
    description: '4 en cada fase',
    inhale: 4,
    holdIn: 4,
    exhale: 4,
    holdOut: 4,
    evidence:
      'Popular en entrenamiento militar y deportivo. La evidencia clínica que la respalda es limitada.',
  },
]

export function getBreathPattern(id: string): BreathPattern {
  return BREATH_PATTERNS.find((p) => p.id === id) ?? BREATH_PATTERNS[0]
}

export function cycleSeconds(p: BreathPattern): number {
  return p.inhale + p.holdIn + p.exhale + p.holdOut
}

export interface MindfulnessLevel {
  id: MindfulnessLevelId
  label: string
  minutes: number
  rank: number
  summary: string
}

export const MINDFULNESS_LEVELS: MindfulnessLevel[] = [
  { id: 'beginner', label: 'Principiante', minutes: 5, rank: 0, summary: 'Atención a la respiración' },
  { id: 'basic', label: 'Básico', minutes: 10, rank: 1, summary: 'Respiración coherente y body scan' },
  { id: 'intermediate', label: 'Intermedio', minutes: 20, rank: 2, summary: 'Body scan completo y pensamientos' },
  { id: 'advanced', label: 'Avanzado', minutes: 30, rank: 3, summary: 'Atención abierta' },
  { id: 'expert', label: 'Experto', minutes: 45, rank: 4, summary: 'Atención abierta y metta' },
]

export function getLevel(id: MindfulnessLevelId): MindfulnessLevel {
  return MINDFULNESS_LEVELS.find((l) => l.id === id) ?? MINDFULNESS_LEVELS[0]
}

const SETTLE: MindfulnessSegment = {
  kind: 'settle',
  seconds: 45,
  title: 'Acomodate',
  guidance:
    'Sentate con la espalda derecha pero sin rigidez, los pies apoyados y las manos sueltas. Cerrá los ojos o bajá la mirada. No hay nada que lograr en los próximos minutos.',
}

const CLOSE: MindfulnessSegment = {
  kind: 'close',
  seconds: 45,
  title: 'Cierre',
  guidance:
    'Soltá la cuenta y la técnica. Quedate un momento sin hacer nada. Cuando quieras, movés los dedos, estirás un poco y abrís los ojos.',
}

/** Recorrido del body scan: el cursor de atención va bajando por el cuerpo. */
function bodyScanCues(seconds: number): { at: number; text: string }[] {
  const stops = [
    'Llevá la atención a la coronilla y la frente. Aflojá el entrecejo.',
    'Bajá a la mandíbula y el cuello. Soltá la lengua del paladar.',
    'Hombros y brazos. Dejá que caigan un poco más de lo que están.',
    'Pecho y espalda. Sentí cómo se mueven con cada respiración.',
    'Abdomen y caderas. Sin corregir nada, solo notando.',
    'Piernas, hasta los pies. Sentí el peso apoyado.',
    'Todo el cuerpo a la vez, como una sola cosa que respira.',
  ]
  const step = seconds / stops.length
  return stops.map((text, i) => ({ at: Math.round(i * step), text }))
}

export function buildSession(levelId: MindfulnessLevelId, breathId: string): MindfulnessSession {
  const level = getLevel(levelId)
  const pattern = getBreathPattern(breathId)
  const total = level.minutes * 60
  const segments: MindfulnessSegment[] = [SETTLE]
  const body = total - SETTLE.seconds - CLOSE.seconds

  if (levelId === 'beginner') {
    segments.push({
      kind: 'breath',
      seconds: body,
      title: 'Respiración',
      guidance:
        'Seguí el círculo con la respiración. Cuando notes que te fuiste con un pensamiento —y va a pasar— volvé al círculo. Ese volver es el ejercicio, no un fallo.',
      breathId: pattern.id,
    })
  } else if (levelId === 'basic') {
    const half = Math.round(body / 2)
    segments.push({
      kind: 'breath',
      seconds: half,
      title: 'Respiración coherente',
      guidance: 'Seguí el círculo. Que el aire entre y salga sin forzar, solo acompañando el ritmo.',
      breathId: pattern.id,
    })
    segments.push({
      kind: 'scan',
      seconds: body - half,
      title: 'Recorrido del cuerpo',
      guidance: 'Ahora soltá el ritmo y llevá la atención por el cuerpo, siguiendo las indicaciones.',
      cues: bodyScanCues(body - half),
    })
  } else {
    // Los niveles superiores todavía no tienen currículo propio: por ahora
    // extienden el básico. Se completan en la próxima etapa.
    const third = Math.round(body / 3)
    segments.push({
      kind: 'breath',
      seconds: third,
      title: 'Respiración coherente',
      guidance: 'Seguí el círculo. Que el aire entre y salga sin forzar.',
      breathId: pattern.id,
    })
    segments.push({
      kind: 'scan',
      seconds: third,
      title: 'Recorrido del cuerpo',
      guidance: 'Llevá la atención por el cuerpo, siguiendo las indicaciones.',
      cues: bodyScanCues(third),
    })
    segments.push({
      kind: 'open',
      seconds: body - third * 2,
      title: 'Atención abierta',
      guidance:
        'Dejá de dirigir la atención a algo en particular. Lo que aparezca —un sonido, una sensación, un pensamiento— se nota y se deja pasar, sin seguirlo.',
    })
  }

  segments.push(CLOSE)
  return { levelId, breathId: pattern.id, totalSeconds: total, segments }
}

export interface BreathPhase {
  kind: 'inhale' | 'holdIn' | 'exhale' | 'holdOut'
  label: string
  /** Intensidad del círculo al empezar y terminar la fase, 0–1. */
  from: number
  to: number
  seconds: number
}

/** Fases del ciclo, ya sin las de duración cero. */
export function breathPhases(p: BreathPattern): BreathPhase[] {
  const all: BreathPhase[] = [
    { kind: 'inhale', label: 'Inhalá', from: 0, to: 1, seconds: p.inhale },
    { kind: 'holdIn', label: 'Sostené', from: 1, to: 1, seconds: p.holdIn },
    { kind: 'exhale', label: 'Exhalá', from: 1, to: 0, seconds: p.exhale },
    { kind: 'holdOut', label: 'Vacío', from: 0, to: 0, seconds: p.holdOut },
  ]
  return all.filter((f) => f.seconds > 0)
}

/** Dónde cae `elapsed` dentro del ciclo respiratorio, en bucle. */
export function breathAt(p: BreathPattern, elapsedSeconds: number): { phase: BreathPhase; intensity: number } {
  const phases = breathPhases(p)
  const cycle = cycleSeconds(p)
  let t = elapsedSeconds % cycle
  for (const phase of phases) {
    if (t < phase.seconds) {
      const progress = phase.seconds > 0 ? t / phase.seconds : 1
      return { phase, intensity: phase.from + (phase.to - phase.from) * progress }
    }
    t -= phase.seconds
  }
  const last = phases[phases.length - 1]
  return { phase: last, intensity: last.to }
}

export function formatMinutes(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${String(s).padStart(2, '0')}`
}

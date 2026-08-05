import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import KegelGuide, { type KegelGuideHandle } from '../components/KegelGuide'
import {
  breathAt,
  buildSession,
  formatMinutes,
  getBreathPattern,
  getLevel,
} from '../lib/mindfulness'
import { bell, startAmbient, stopAmbient, type AmbientKind } from '../lib/ambient'
import { closeAudio, releaseWakeLock, requestWakeLock, unlockAudio } from '../lib/feedback'
import { cancelVoice, speakGuidance } from '../lib/voice'
import { getMindfulnessSettings, saveMindfulnessLog } from '../lib/store'
import { todayKey } from '../lib/kegel'
import type { MindfulnessSession as Session, MindfulnessSettings } from '../lib/types'

type Stage = 'loading' | 'preview' | 'running' | 'done'

const DEFAULTS: MindfulnessSettings = {
  levelId: 'beginner',
  breathId: 'coherent',
  ambient: 'drone',
  ambientVolume: 0.55,
  bells: true,
  voiceEnabled: false,
  voiceRate: 0.85,
}

export default function MindfulnessSession() {
  const navigate = useNavigate()
  const guideRef = useRef<KegelGuideHandle>(null)

  const [stage, setStage] = useState<Stage>('loading')
  const [settings, setSettings] = useState<MindfulnessSettings>(DEFAULTS)
  const [session, setSession] = useState<Session | null>(null)
  const [segmentIndex, setSegmentIndex] = useState(0)
  const [cueText, setCueText] = useState<string | null>(null)
  const [breathLabel, setBreathLabel] = useState('')
  const [remaining, setRemaining] = useState(0)
  const [paused, setPaused] = useState(false)
  const [elapsedMinutes, setElapsedMinutes] = useState(0)

  const settingsRef = useRef(settings)
  const sessionRef = useRef<Session | null>(null)
  const startedAtRef = useRef(0)
  const pausedAccumRef = useRef(0)
  const pauseStartedRef = useRef(0)
  const rafRef = useRef(0)
  const segIndexRef = useRef(0)
  const cueIndexRef = useRef(-1)
  const shownSecondRef = useRef(-1)
  const finishedRef = useRef(false)
  const voiceTimers = useRef<number[]>([])

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  useEffect(() => {
    let alive = true
    getMindfulnessSettings().then((stored) => {
      if (!alive) return
      const active = stored ?? DEFAULTS
      setSettings(active)
      const built = buildSession(active.levelId, active.breathId)
      setSession(built)
      sessionRef.current = built
      setRemaining(built.totalSeconds)
      setStage('preview')
    })
    return () => {
      alive = false
    }
  }, [])

  function say(text: string, delayMs = 0) {
    const s = settingsRef.current
    if (!s.voiceEnabled) return
    const fire = () =>
      speakGuidance(text, {
        enabled: true,
        voiceURI: s.voiceURI,
        rate: s.voiceRate,
        ambientVolume: s.ambientVolume,
      })
    // La campana y la voz se pisan si salen juntas; dejamos que suene primero.
    if (delayMs > 0) voiceTimers.current.push(window.setTimeout(fire, delayMs))
    else fire()
  }

  /** Segmento que contiene ese instante, y cuánto lleva dentro de él. */
  function locate(elapsed: number) {
    const s = sessionRef.current!
    let acc = 0
    for (let i = 0; i < s.segments.length; i++) {
      const seg = s.segments[i]
      if (elapsed < acc + seg.seconds) return { index: i, into: elapsed - acc, segment: seg }
      acc += seg.seconds
    }
    const last = s.segments.length - 1
    return { index: last, into: s.segments[last].seconds, segment: s.segments[last] }
  }

  const finish = useCallback(async (completed: boolean) => {
    if (finishedRef.current) return
    finishedRef.current = true
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0

    for (const t of voiceTimers.current) window.clearTimeout(t)
    voiceTimers.current = []
    cancelVoice()
    if (settingsRef.current.bells) bell(0.6, 396)
    stopAmbient(3)
    void releaseWakeLock()

    const elapsed = (performance.now() - startedAtRef.current - pausedAccumRef.current) / 1000
    const minutes = Math.max(1, Math.round(elapsed / 60))
    setElapsedMinutes(minutes)

    // Registramos aunque haya cortado antes: sentarse cinco minutos y parar
    // sigue siendo práctica, y esconderlo desalienta.
    await saveMindfulnessLog({
      date: todayKey(),
      completedAt: new Date().toISOString(),
      levelId: settingsRef.current.levelId,
      minutes,
      ambient: settingsRef.current.ambient,
    })
    setStage(completed ? 'done' : 'done')
  }, [])

  const frame = useCallback(() => {
    const s = sessionRef.current
    if (!s) return
    const elapsed = (performance.now() - startedAtRef.current - pausedAccumRef.current) / 1000

    if (elapsed >= s.totalSeconds) {
      void finish(true)
      return
    }

    const { index, into, segment } = locate(elapsed)

    if (index !== segIndexRef.current) {
      segIndexRef.current = index
      cueIndexRef.current = -1
      setSegmentIndex(index)
      setCueText(null)
      if (settingsRef.current.bells) bell(0.45)
      say(segment.guidance, settingsRef.current.bells ? 1400 : 200)
    }

    if (segment.cues) {
      let active = -1
      for (let i = 0; i < segment.cues.length; i++) if (into >= segment.cues[i].at) active = i
      if (active !== cueIndexRef.current) {
        cueIndexRef.current = active
        setCueText(active >= 0 ? segment.cues[active].text : null)
        if (active >= 0) say(segment.cues[active].text)
      }
    }

    if (segment.breathId) {
      const pattern = getBreathPattern(segment.breathId)
      const { phase, intensity } = breathAt(pattern, into)
      guideRef.current?.setIntensity(intensity)
      if (phase.label !== breathLabel) setBreathLabel(phase.label)
    } else {
      // Sin marcador respiratorio el círculo late muy despacio: acompaña sin
      // pedir que sigas un ritmo.
      guideRef.current?.setIntensity(0.35 + 0.25 * Math.sin((elapsed / 6) * Math.PI))
      if (breathLabel !== '') setBreathLabel('')
    }

    guideRef.current?.setProgress(elapsed / s.totalSeconds)

    const left = Math.ceil(s.totalSeconds - elapsed)
    if (left !== shownSecondRef.current) {
      shownSecondRef.current = left
      setRemaining(left)
    }

    rafRef.current = requestAnimationFrame(frame)
  }, [finish, breathLabel])

  useEffect(() => {
    if (stage !== 'running' || paused) return
    rafRef.current = requestAnimationFrame(frame)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [stage, paused, frame])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      for (const t of voiceTimers.current) window.clearTimeout(t)
      cancelVoice()
      stopAmbient(0.3)
      void releaseWakeLock()
      closeAudio()
    }
  }, [])

  function begin() {
    unlockAudio()
    void requestWakeLock()
    startAmbient(settings.ambient as AmbientKind, settings.ambientVolume)
    if (settings.bells) bell(0.6, 528)
    startedAtRef.current = performance.now()
    pausedAccumRef.current = 0
    segIndexRef.current = 0
    cueIndexRef.current = -1
    shownSecondRef.current = -1
    finishedRef.current = false
    setSegmentIndex(0)
    // Esta primera frase sale del toque en "Empezar": es el gesto que desbloquea
    // el habla para el resto de la sesión.
    const first = sessionRef.current?.segments[0]
    if (first) say(first.guidance, settings.bells ? 1400 : 300)
    setStage('running')
  }

  function togglePause() {
    if (paused) {
      unlockAudio()
      pausedAccumRef.current += performance.now() - pauseStartedRef.current
      setPaused(false)
      startAmbient(settingsRef.current.ambient as AmbientKind, settingsRef.current.ambientVolume)
      void requestWakeLock()
    } else {
      pauseStartedRef.current = performance.now()
      setPaused(true)
      cancelVoice()
      stopAmbient(1)
      void releaseWakeLock()
    }
  }

  if (stage === 'loading' || !session) {
    return <p className="p-6 text-center text-base text-gray-500">Preparando…</p>
  }

  const level = getLevel(session.levelId)
  const segment = session.segments[segmentIndex]

  if (stage === 'preview') {
    return (
      <div className="pt-safe flex flex-1 flex-col justify-between p-4 pb-8">
        <div>
          <button onClick={() => navigate('/mindfulness')} className="py-2 text-lg text-gray-400">
            ←
          </button>
          <div className="mt-4 rounded-2xl bg-violet-500/10 p-6 text-center">
            <p className="text-base text-violet-300">{level.label}</p>
            <p className="mt-1 text-4xl font-bold text-gray-100">{level.minutes} min</p>
            <p className="mt-1 text-base text-gray-400">{level.summary}</p>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            {session.segments.map((seg, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                <span className="w-12 shrink-0 text-base font-semibold text-violet-400">
                  {Math.round(seg.seconds / 60) || '<1'}′
                </span>
                <p className="text-base text-gray-300">{seg.title}</p>
              </div>
            ))}
          </div>

          <p className="mt-4 px-1 text-base leading-relaxed text-gray-500">
            Buscá un lugar donde no te interrumpan. La pantalla se mantiene encendida durante la sesión: en iPhone,
            si la bloqueás, el sonido se corta.
          </p>
        </div>

        <button
          onClick={begin}
          className="mt-6 rounded-2xl bg-violet-500 py-4 text-lg font-semibold text-white active:bg-violet-400"
        >
          Empezar
        </button>
      </div>
    )
  }

  if (stage === 'done') {
    return (
      <div className="pt-safe flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-5xl">🧘</p>
        <p className="text-2xl font-bold text-gray-100">
          {elapsedMinutes} {elapsedMinutes === 1 ? 'minuto' : 'minutos'}
        </p>
        <p className="text-base text-gray-500">Quedó registrado. Lo que cuenta es volver mañana.</p>
        <button
          onClick={() => navigate('/mindfulness')}
          className="mt-6 w-full rounded-2xl bg-violet-500 py-4 text-lg font-semibold text-white active:bg-violet-400"
        >
          Listo
        </button>
      </div>
    )
  }

  return (
    <div className="pt-safe flex flex-1 flex-col">
      <div className="px-6 pt-6 text-center">
        <p className="text-lg font-semibold text-violet-300">{segment.title}</p>
      </div>

      <div className="pt-safe flex flex-1 flex-col items-center justify-center">
        <KegelGuide ref={guideRef} mode="breath">
          {breathLabel ? (
            <p className="text-3xl font-semibold text-white">{breathLabel}</p>
          ) : (
            <p className="text-4xl font-bold tabular-nums text-white">{formatMinutes(remaining)}</p>
          )}
        </KegelGuide>

        <div className="mt-6 min-h-[112px] px-6 text-center">
          <p className="text-lg leading-relaxed text-gray-300">{cueText ?? segment.guidance}</p>
        </div>
      </div>

      <div className="px-6 pb-2 text-center text-base text-gray-600">
        {paused ? 'En pausa' : `Queda ${formatMinutes(remaining)}`}
      </div>

      <div className="flex gap-2 p-4">
        <button
          onClick={togglePause}
          className="flex-1 rounded-xl bg-white/10 py-4 text-lg font-medium text-gray-100 active:bg-white/20"
        >
          {paused ? 'Reanudar' : 'Pausar'}
        </button>
        <button
          onClick={() => finish(false)}
          className="flex-1 rounded-xl bg-white/10 py-4 text-lg font-medium text-gray-300 active:bg-white/20"
        >
          Terminar
        </button>
      </div>
    </div>
  )
}

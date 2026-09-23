import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import KegelGuide, { type KegelGuideHandle } from '../components/KegelGuide'
import TopBar from '../components/TopBar'
import Icon, { IconTile } from '../components/Icon'
import { Button, Placeholder, Row, Section } from '../components/ui'
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
    return <Placeholder>Preparando…</Placeholder>
  }

  const level = getLevel(session.levelId)
  const segment = session.segments[segmentIndex]

  if (stage === 'preview') {
    return (
      <div className="flex flex-1 flex-col pb-8">
        <TopBar title="Sesión" back />
        <div className="flex flex-col gap-7 pt-4">
          <div className="flex flex-col items-center px-8 text-center">
            <IconTile name="lotus" tone="mind" size="xl" />
            <p className="mt-4 text-[15px] font-semibold text-mind-400">{level.label}</p>
            <p className="mt-1 text-[56px] font-bold leading-none tracking-tight tabular-nums text-label">
              {level.minutes}
              <span className="ml-1 text-[22px] font-semibold text-label-2">min</span>
            </p>
            <p className="mt-2 text-[15px] text-label-2">{level.summary}</p>
          </div>

          <Section
            header="Recorrido"
            footer="Buscá un lugar donde no te interrumpan. La pantalla se mantiene encendida durante la sesión: en iPhone, si la bloqueás, el sonido se corta."
          >
            {session.segments.map((seg, i) => (
              <Row
                key={i}
                leading={
                  <span className="w-9 shrink-0 text-[17px] font-semibold tabular-nums text-mind-400">
                    {Math.round(seg.seconds / 60) || '<1'}′
                  </span>
                }
                sepInset={64}
                title={seg.title}
              />
            ))}
          </Section>

          <div className="px-4">
            <Button tone="mind" icon="play" onClick={begin}>
              Empezar
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (stage === 'done') {
    return (
      <div className="pt-safe flex flex-1 flex-col items-center justify-center px-8 text-center">
        <IconTile name="lotus" tone="mind" size="xl" />
        <p className="mt-5 text-[34px] font-bold leading-tight tracking-tight text-label">
          {elapsedMinutes} {elapsedMinutes === 1 ? 'minuto' : 'minutos'}
        </p>
        <p className="mt-2 text-[17px] text-label-2">Quedó registrado. Lo que cuenta es volver mañana.</p>
        <div className="mt-8 w-full max-w-xs">
          <Button tone="mind" onClick={() => navigate('/mindfulness')}>
            Listo
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-safe flex flex-1 flex-col">
      <p className="px-6 pt-4 text-center text-[17px] font-semibold text-mind-400">{segment.title}</p>

      <div className="flex flex-1 flex-col items-center justify-center">
        <KegelGuide ref={guideRef} mode="breath">
          {breathLabel ? (
            <p className="text-[34px] font-semibold text-label">{breathLabel}</p>
          ) : (
            <p className="text-[44px] font-bold tabular-nums text-label">{formatMinutes(remaining)}</p>
          )}
        </KegelGuide>

        <div className="mt-3 min-h-[96px] px-7 text-center">
          <p className="text-[18px] leading-relaxed text-label">{cueText ?? segment.guidance}</p>
        </div>
      </div>

      <div className="flex flex-col gap-2 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-2">
        <p className={`text-center text-[15px] tabular-nums ${paused ? 'font-semibold text-warn-400' : 'text-label-2'}`}>
          {paused ? 'En pausa' : `Quedan ${formatMinutes(remaining)}`}
        </p>
        <div className="flex gap-3">
          <button
            onClick={togglePause}
            className="flex h-[50px] flex-1 items-center justify-center gap-2 rounded-[14px] bg-cell-2 text-[17px] font-semibold text-label active:bg-press"
          >
            <Icon name={paused ? 'play' : 'pause'} size={18} />
            {paused ? 'Reanudar' : 'Pausar'}
          </button>
          <button
            onClick={() => finish(false)}
            className="flex h-[50px] flex-1 items-center justify-center rounded-[14px] bg-cell-2 text-[17px] font-semibold text-label active:bg-press"
          >
            Terminar
          </button>
        </div>
      </div>
    </div>
  )
}

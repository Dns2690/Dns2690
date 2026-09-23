import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
import Icon, { IconTile } from '../components/Icon'
import { Button, Placeholder, Row, Section } from '../components/ui'
import KegelGuide, { type KegelGuideHandle } from '../components/KegelGuide'
import SessionStrip, { type StripItem } from '../components/SessionStrip'
import {
  buildTimeline,
  exerciseMode,
  formatDuration,
  generateRoutine,
  getExercise,
  getLevel,
  intensityAt,
  phaseLabel,
  repsFor,
  REST_BETWEEN_ROUTINES_HOURS,
  timelineDurationMs,
  todayKey,
} from '../lib/kegel'
import {
  closeAudio,
  cueCountdown,
  cueFinish,
  cuePhase,
  pulseIntervalMs,
  pulseTick,
  releaseWakeLock,
  requestWakeLock,
  unlockAudio,
  vibrate,
} from '../lib/feedback'
import { getKegelSettings, listKegelSessions, saveKegelSession } from '../lib/store'
import type { KegelSettings, KegelTimelineEntry } from '../lib/types'

type Stage = 'loading' | 'preview' | 'countdown' | 'running' | 'done'

const DEFAULT_SETTINGS: KegelSettings = { levelId: 'beginner', sound: true, vibration: true }

export default function KegelSession() {
  const navigate = useNavigate()
  // Con `exerciseId` en la ruta corre un solo ejercicio, siempre en nivel
  // Principiante: es un banco de pruebas para depurarlos de a uno, así que no
  // cuenta como rutina ni respeta el descanso entre sesiones.
  const { exerciseId } = useParams()
  const isDemo = !!exerciseId
  const guideRef = useRef<KegelGuideHandle>(null)

  const [stage, setStage] = useState<Stage>('loading')
  const [settings, setSettings] = useState<KegelSettings>(DEFAULT_SETTINGS)
  const [exerciseIds, setExerciseIds] = useState<string[]>([])
  const [timeline, setTimeline] = useState<KegelTimelineEntry[]>([])
  const [entryIndex, setEntryIndex] = useState(0)
  const [stepRemaining, setStepRemaining] = useState(0)
  const [totalRemaining, setTotalRemaining] = useState(0)
  const [paused, setPaused] = useState(false)
  const [prepCount, setPrepCount] = useState(3)
  const [restWarning, setRestWarning] = useState<string | null>(null)
  const [showInfo, setShowInfo] = useState(false)
  const pausedByInfoRef = useRef(false)

  // Refs del reloj: el bucle no debe depender del ciclo de render.
  const settingsRef = useRef(settings)
  const timelineRef = useRef<KegelTimelineEntry[]>([])
  const startedAtRef = useRef(0)
  const pausedAccumRef = useRef(0)
  const pauseStartedRef = useRef(0)
  const rafRef = useRef(0)
  const cursorRef = useRef(0)
  const cuedRef = useRef(-1)
  const lastPulseRef = useRef(0)
  const shownSecondRef = useRef(-1)
  const finishedRef = useRef(false)

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [stored, sessions] = await Promise.all([getKegelSettings(), listKegelSessions()])
      if (!alive) return
      const active = stored ?? DEFAULT_SETTINGS
      setSettings(isDemo ? { ...active, levelId: 'beginner' } : active)

      const last = isDemo ? undefined : sessions[0]
      if (last) {
        const elapsedMs = Date.now() - new Date(last.completedAt).getTime()
        const requiredMs = REST_BETWEEN_ROUTINES_HOURS * 3600_000
        if (elapsedMs < requiredMs) {
          // Se redondea una sola vez, sobre los minutos totales: redondear el
          // resto de la hora por separado daba "1h 60m" con 1 h 59,7 min.
          const totalMinutes = Math.ceil((requiredMs - elapsedMs) / 60_000)
          const h = Math.floor(totalMinutes / 60)
          const m = totalMinutes % 60
          setRestWarning(h > 0 ? (m > 0 ? `${h} h ${m} min` : `${h} h`) : `${m} min`)
        }
      }

      const levelForRun = isDemo ? 'beginner' : active.levelId
      const ids = isDemo ? [exerciseId!] : generateRoutine(active.levelId)
      setExerciseIds(ids)
      const built = buildTimeline(ids, levelForRun)
      setTimeline(built)
      timelineRef.current = built
      setTotalRemaining(Math.round(timelineDurationMs(built) / 1000))
      setStage('preview')
    })()
    return () => {
      alive = false
    }
  }, [])

  const stopLoop = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
  }, [])

  const finish = useCallback(async () => {
    if (finishedRef.current) return
    finishedRef.current = true
    stopLoop()
    guideRef.current?.setIntensity(0)
    guideRef.current?.setProgress(1)
    cueFinish(settingsRef.current)
    void releaseWakeLock()

    // La demo no se registra: falsearía la meta diaria y la racha.
    if (isDemo) {
      setStage('done')
      return
    }

    const durationSeconds = Math.round(timelineDurationMs(timelineRef.current) / 1000)
    await saveKegelSession({
      date: todayKey(),
      completedAt: new Date().toISOString(),
      levelId: settingsRef.current.levelId,
      exerciseIds,
      durationSeconds,
    })
    setStage('done')
  }, [exerciseIds, stopLoop, isDemo])

  const frame = useCallback(() => {
    const tl = timelineRef.current
    const totalMs = timelineDurationMs(tl)
    const elapsed = performance.now() - startedAtRef.current - pausedAccumRef.current

    if (elapsed >= totalMs) {
      void finish()
      return
    }

    while (cursorRef.current < tl.length - 1 && elapsed >= tl[cursorRef.current].endMs) {
      cursorRef.current++
    }
    const entry = tl[cursorRef.current]
    const intensity = intensityAt(entry, elapsed)

    // Mientras el aro crece y se mantiene va un tren de pulsos cortos que imita
    // una vibración. En los Reverse Kegel no: ahí el trabajo es aflojar, y un
    // zumbido empujaría a apretar, que es justo lo contrario.
    const pulsing =
      entry.kind === 'exercise' &&
      exerciseMode(entry.exerciseId) === 'contract' &&
      (entry.step.phase === 'contract' || entry.step.phase === 'hold')

    if (cursorRef.current !== cuedRef.current) {
      cuedRef.current = cursorRef.current
      if (pulsing) {
        lastPulseRef.current = 0 // que el primer pulso salga ya
      } else {
        cuePhase(entry.step.phase, settingsRef.current)
      }
      setEntryIndex(cursorRef.current)
    }

    if (pulsing) {
      const now = performance.now()
      if (now - lastPulseRef.current >= pulseIntervalMs(intensity)) {
        lastPulseRef.current = now
        pulseTick(intensity, settingsRef.current)
        if (settingsRef.current.vibration) vibrate([18])
      }
    }

    guideRef.current?.setIntensity(intensity)
    // El anillo acompaña al número: ambos miden el bloque actual, no la rutina
    // entera. El total va aparte, en "Queda X:XX".
    const blockSpan = entry.blockEndMs - entry.blockStartMs
    guideRef.current?.setProgress(blockSpan > 0 ? (elapsed - entry.blockStartMs) / blockSpan : 0)

    // El número grande cuenta el bloque entero del ejercicio (45s → 0), no cada
    // micro-fase: reiniciarlo en cada contracción distrae del ritmo. Las fases
    // se siguen por la luz y el texto.
    const remaining = Math.max(0, Math.ceil((entry.blockEndMs - elapsed) / 1000))
    if (remaining !== shownSecondRef.current) {
      shownSecondRef.current = remaining
      setStepRemaining(remaining)
      setTotalRemaining(Math.ceil((totalMs - elapsed) / 1000))
    }

    rafRef.current = requestAnimationFrame(frame)
  }, [finish])

  function beginCountdown() {
    // Debe salir de un gesto real del usuario para que iOS habilite el audio.
    unlockAudio()
    void requestWakeLock()
    setRestWarning(null)
    setPrepCount(3)
    setStage('countdown')
  }

  useEffect(() => {
    if (stage !== 'countdown') return
    cueCountdown(settingsRef.current)
    const id = window.setInterval(() => {
      setPrepCount((c) => {
        if (c <= 1) {
          window.clearInterval(id)
          startedAtRef.current = performance.now()
          pausedAccumRef.current = 0
          cursorRef.current = 0
          cuedRef.current = -1
          shownSecondRef.current = -1
          finishedRef.current = false
          setStage('running')
          return 0
        }
        cueCountdown(settingsRef.current)
        return c - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [stage])

  useEffect(() => {
    if (stage !== 'running' || paused) return
    rafRef.current = requestAnimationFrame(frame)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [stage, paused, frame])

  // Si el usuario cambia de app, rAF se congela y al volver el tiempo saltaría.
  // Pausar es más honesto que descontar segundos que no entrenó.
  useEffect(() => {
    function onVisibility() {
      if (document.hidden && stage === 'running' && !paused) {
        pauseStartedRef.current = performance.now()
        setPaused(true)
      }
    }
    document.addEventListener('visibilitychange', onVisibility)
    return () => document.removeEventListener('visibilitychange', onVisibility)
  }, [stage, paused])

  useEffect(() => {
    return () => {
      stopLoop()
      void releaseWakeLock()
      closeAudio()
    }
  }, [stopLoop])

  function openInfo() {
    if (!paused) {
      pauseStartedRef.current = performance.now()
      pausedByInfoRef.current = true
      setPaused(true)
      void releaseWakeLock()
    }
    setShowInfo(true)
  }

  function closeInfo() {
    setShowInfo(false)
    // Solo reanudamos si la pausa la provocó abrir la descripción; si ya estaba
    // pausado a mano, se queda pausado.
    if (pausedByInfoRef.current) {
      pausedByInfoRef.current = false
      unlockAudio()
      pausedAccumRef.current += performance.now() - pauseStartedRef.current
      setPaused(false)
      void requestWakeLock()
    }
  }

  function togglePause() {
    if (paused) {
      pausedByInfoRef.current = false
      // "Reanudar" es un gesto del usuario, que es justo lo que iOS exige para
      // volver a habilitar el audio suspendido al bloquear la pantalla.
      unlockAudio()
      pausedAccumRef.current += performance.now() - pauseStartedRef.current
      setPaused(false)
      void requestWakeLock()
    } else {
      pauseStartedRef.current = performance.now()
      setPaused(true)
      void releaseWakeLock()
    }
  }

  function abandon() {
    if (!confirm(isDemo ? '¿Cortar la demo?' : '¿Terminar la rutina? No se va a registrar.')) return
    stopLoop()
    void releaseWakeLock()
    navigate('/kegel')
  }

  const level = getLevel(settings.levelId)

  const current = timeline[entryIndex]
  const stripItems: StripItem[] = []
  exerciseIds.forEach((id, i) => {
    if (i > 0) stripItems.push({ label: 'Descanso', isRest: true })
    stripItems.push({ label: getExercise(id)?.name ?? id, isRest: false })
  })
  // Los descansos ocupan las posiciones impares, así que el índice del tramo en
  // curso sale del índice de ejercicio y de si estamos en su descanso previo.
  const stripIndex = current
    ? current.kind === 'interRest'
      ? current.exerciseIndex * 2 + 1
      : current.exerciseIndex * 2
    : 0

  const demoExercise = exerciseId ? getExercise(exerciseId) : undefined
  const currentExercise = current ? getExercise(current.exerciseId) : undefined

  if (stage === 'loading') {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title={isDemo ? 'Demo' : 'Rutina'} back />
        <Placeholder>Preparando…</Placeholder>
      </div>
    )
  }

  if (stage === 'preview') {
    const totalSeconds = Math.round(timelineDurationMs(timeline) / 1000)
    return (
      <div className="flex flex-1 flex-col pb-8">
        <TopBar title={isDemo ? 'Demo' : 'Rutina'} back />
        <div className="flex flex-col gap-7 pt-4">
          {isDemo ? (
            <div className="flex flex-col items-center px-8 text-center">
              {demoExercise && <IconTile name={demoExercise.icon} tone="kegel" size="xl" />}
              <p className="mt-4 text-[28px] font-bold leading-tight tracking-tight text-label">{demoExercise?.name}</p>
              <p className="mt-1 text-[15px] font-semibold text-kegel-400">
                Demo · {formatDuration(totalSeconds)} · {level.label}
              </p>
              <p className="mt-4 text-[17px] leading-relaxed text-label">{demoExercise?.description}</p>
              <p className="mt-3 text-[13px] text-label-2">No cuenta para tu meta diaria ni para la racha.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center px-8 text-center">
              <p className="text-[15px] font-semibold text-kegel-400">{level.label}</p>
              <p className="mt-1 text-[56px] font-bold leading-none tracking-tight tabular-nums text-label">
                {formatDuration(totalSeconds)}
              </p>
              <p className="mt-2 text-[15px] text-label-2">{exerciseIds.length} ejercicios al azar</p>
            </div>
          )}

          {restWarning && (
            <Section>
              <div className="p-4">
                <div className="flex items-center gap-3">
                  <IconTile name="moon" tone="warn" />
                  <p className="text-[17px] font-semibold text-label">Descansá desde la rutina anterior</p>
                </div>
                <p className="mt-2 text-[15px] leading-snug text-label-2">
                  Conviene esperar al menos {REST_BETWEEN_ROUTINES_HOURS} horas entre entrenamientos para no
                  sobrecargar el piso pélvico. Faltan <span className="font-semibold text-warn-300">{restWarning}</span>.
                </p>
                <div className="mt-3">
                  <Button tone="warn" size="md" onClick={() => navigate('/kegel')}>
                    Tomar descanso
                  </Button>
                </div>
              </div>
            </Section>
          )}

          {!isDemo && (
            <Section header="Esta rutina">
              {exerciseIds.map((id, i) => {
                const ex = getExercise(id)
                if (!ex) return null
                return (
                  <Row
                    key={`${id}-${i}`}
                    icon={ex.icon}
                    tone="kegel"
                    title={ex.name}
                    subtitle={ex.description}
                    detail={<span className="text-[15px] tabular-nums">×{repsFor(ex, level)}</span>}
                  />
                )
              })}
            </Section>
          )}

          <div className="px-4">
            <Button tone="kegel" icon="play" onClick={beginCountdown}>
              {isDemo ? 'Probar' : restWarning ? 'Entrenar igual' : 'Empezar'}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (stage === 'countdown') {
    return (
      <div className="pt-safe flex flex-1 flex-col items-center justify-center gap-2">
        <p className="text-[17px] text-label-2">Preparate…</p>
        <p className="text-[120px] font-bold leading-none tabular-nums text-kegel-400">{prepCount}</p>
      </div>
    )
  }

  if (stage === 'done') {
    return (
      <div className="pt-safe flex flex-1 flex-col items-center justify-center px-8 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-kegel-500 text-black">
          <Icon name={isDemo ? 'search' : 'check'} size={40} strokeWidth={2.6} />
        </span>
        <p className="mt-5 text-[28px] font-bold leading-tight tracking-tight text-label">
          {isDemo ? `Demo de ${demoExercise?.name ?? ''}` : 'Rutina completada'}
        </p>
        <p className="mt-2 text-[15px] text-label-2">
          {exerciseIds.length} {exerciseIds.length === 1 ? 'ejercicio' : 'ejercicios'} ·{' '}
          {formatDuration(Math.round(timelineDurationMs(timeline) / 1000))} · {level.label}
        </p>
        <div className="mt-8 w-full max-w-xs">
          <Button tone="kegel" onClick={() => navigate('/kegel')}>
            Listo
          </Button>
        </div>
      </div>
    )
  }

  const isRest = current?.kind === 'interRest'

  return (
    <div className="pt-safe flex flex-1 flex-col">
      {stripItems.length > 1 && (
        <div className="pt-3">
          <SessionStrip items={stripItems} activeIndex={stripIndex} />
        </div>
      )}

      <div className="flex flex-1 flex-col items-center justify-center">
        <KegelGuide ref={guideRef} mode={current ? exerciseMode(current.exerciseId) : 'contract'}>
          <p className="text-[76px] font-bold leading-none tracking-tight tabular-nums text-label">{stepRemaining}</p>
          <p className="mt-2 text-[20px] font-semibold text-label">{current ? phaseLabel(current) : ''}</p>
        </KegelGuide>

        <div className="mt-4 px-6 text-center">
          {isRest ? (
            <p className="text-[22px] font-bold text-label">Descanso</p>
          ) : (
            <button
              onClick={openInfo}
              className="inline-flex items-center gap-2 rounded-xl px-3 py-1 active:bg-press"
              aria-label={`Cómo se hace ${currentExercise?.name ?? ''}`}
            >
              <span className="text-[22px] font-bold text-label">{currentExercise?.name ?? ''}</span>
              <Icon name="info" size={22} className="text-kegel-400" />
            </button>
          )}
          <p className="mt-1 text-[15px] text-label-2">
            {isRest
              ? 'Preparate para el próximo ejercicio'
              : current
                ? `Repetición ${current.repIndex + 1} de ${current.totalReps} · ejercicio ${current.exerciseIndex + 1} de ${exerciseIds.length}`
                : ''}
          </p>
          <p className="mt-1 text-[15px] tabular-nums text-label-2">Quedan {formatDuration(totalRemaining)}</p>
        </div>
      </div>

      {showInfo && currentExercise && (
        <div className="fixed inset-0 z-30 flex items-end bg-black/60" onClick={closeInfo}>
          <div
            className="max-h-[80vh] w-full overflow-y-auto rounded-t-[14px] bg-cell px-5 pt-2 pb-[calc(env(safe-area-inset-bottom)+1.25rem)]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Asa de la hoja, como en las hojas de iOS. */}
            <div className="mx-auto mb-4 h-[5px] w-9 rounded-full bg-label-3" />
            <div className="mb-4 flex items-center gap-3">
              <IconTile name={currentExercise.icon} tone="kegel" size="lg" />
              <div>
                <p className="text-[22px] font-bold leading-tight text-label">{currentExercise.name}</p>
                <p className="mt-0.5 flex items-center gap-1 text-[13px] font-semibold text-warn-400">
                  <Icon name="pause" size={12} />
                  Rutina en pausa
                </p>
              </div>
            </div>

            <p className="text-[17px] leading-relaxed text-label">{currentExercise.description}</p>

            {exerciseMode(currentExercise.id) === 'lengthen' && (
              <p className="mt-4 rounded-xl bg-[#da8fff]/15 p-3 text-[15px] leading-relaxed text-[#ecc4ff]">
                Este ejercicio es al revés que los demás: acá se afloja y se alarga, no se aprieta. Por eso la luz es
                lavanda y no azul.
              </p>
            )}

            <div className="mt-6">
              <Button tone="kegel" onClick={closeInfo}>
                Seguir
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col gap-2 px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)] pt-2">
        {paused && <p className="text-center text-[15px] font-semibold text-warn-400">En pausa</p>}
        <div className="flex gap-3">
          <button
            onClick={togglePause}
            className="flex h-[50px] flex-1 items-center justify-center gap-2 rounded-[14px] bg-cell-2 text-[17px] font-semibold text-label active:bg-press"
          >
            <Icon name={paused ? 'play' : 'pause'} size={18} />
            {paused ? 'Reanudar' : 'Pausar'}
          </button>
          <button
            onClick={abandon}
            className="flex h-[50px] flex-1 items-center justify-center rounded-[14px] bg-danger-500/20 text-[17px] font-semibold text-danger-400 active:bg-danger-500/30"
          >
            Terminar
          </button>
        </div>
      </div>
    </div>
  )
}

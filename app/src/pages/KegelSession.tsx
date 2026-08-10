import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar from '../components/TopBar'
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
          const left = requiredMs - elapsedMs
          const h = Math.floor(left / 3600_000)
          const m = Math.ceil((left % 3600_000) / 60_000)
          setRestWarning(h > 0 ? `${h}h ${m}m` : `${m}m`)
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
      <div className="pt-safe flex flex-1 flex-col">
        <TopBar title={isDemo ? 'Demo' : 'Rutina Kegel'} back />
        <p className="p-6 text-center text-sm text-gray-500">Preparando…</p>
      </div>
    )
  }

  if (stage === 'preview') {
    const totalSeconds = Math.round(timelineDurationMs(timeline) / 1000)
    return (
      <div className="flex flex-1 flex-col pb-6">
        <TopBar title={isDemo ? 'Demo' : 'Rutina Kegel'} back />
        <div className="flex flex-col gap-3 p-4">
          {isDemo ? (
            <div className="rounded-2xl bg-rose-500/10 p-4">
              <div className="flex items-center gap-3">
                <span className="text-3xl">{demoExercise?.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-lg font-bold text-gray-100">{demoExercise?.name}</p>
                  <p className="text-sm text-rose-300">
                    Demo · {formatDuration(totalSeconds)} · nivel {level.label}
                  </p>
                </div>
              </div>
              <p className="mt-3 text-base leading-relaxed text-gray-300">{demoExercise?.description}</p>
              <p className="mt-2 text-sm text-gray-500">No cuenta para tu meta diaria ni para la racha.</p>
            </div>
          ) : (
          <div className="rounded-2xl bg-white/5 p-4 text-center">
            <p className="text-sm text-gray-500">{level.label}</p>
            <p className="mt-1 text-3xl font-bold text-gray-100">{formatDuration(totalSeconds)}</p>
            <p className="mt-1 text-sm text-gray-500">{exerciseIds.length} ejercicios al azar</p>
          </div>
          )}

          {restWarning && (
            <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4">
              <p className="text-sm font-medium text-amber-300">🛋️ Descansá desde la rutina anterior</p>
              <p className="mt-1 text-sm text-gray-400">
                Se recomienda esperar al menos {REST_BETWEEN_ROUTINES_HOURS} horas entre entrenamientos para
                maximizar la eficacia y evitar sobrecargar el piso pélvico. Faltan{' '}
                <span className="font-medium text-amber-300">{restWarning}</span>.
              </p>
              <button
                onClick={() => navigate('/kegel')}
                className="mt-3 w-full rounded-lg bg-amber-500 py-2.5 text-sm font-medium text-[#0b0d12] active:bg-amber-400"
              >
                Tomar descanso
              </button>
            </div>
          )}

          <div className={`flex-col gap-2 ${isDemo ? 'hidden' : 'flex'}`}>
            {exerciseIds.map((id, i) => {
              const ex = getExercise(id)
              if (!ex) return null
              return (
                <div key={`${id}-${i}`} className="flex items-center gap-3 rounded-xl bg-white/5 p-3">
                  <span className="text-xl">{ex.icon}</span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-gray-100">{ex.name}</p>
                    <p className="truncate text-sm text-gray-500">{ex.description}</p>
                  </div>
                  <span className="shrink-0 text-sm text-gray-500">×{repsFor(ex, level)}</span>
                </div>
              )
            })}
          </div>

          <button
            onClick={beginCountdown}
            className="rounded-lg bg-rose-500 py-3 text-sm font-semibold text-[#0b0d12] active:bg-rose-400"
          >
            {isDemo ? 'Probar' : restWarning ? 'Entrenar igual' : 'Empezar'}
          </button>
        </div>
      </div>
    )
  }

  if (stage === 'countdown') {
    return (
      <div className="pt-safe flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-sm text-gray-400">Preparate…</p>
        <p className="text-7xl font-bold text-rose-400">{prepCount}</p>
      </div>
    )
  }

  if (stage === 'done') {
    return (
      <div className="pt-safe flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-5xl">{isDemo ? '🔍' : '✅'}</p>
        <p className="text-xl font-semibold text-gray-100">
          {isDemo ? `Demo de ${demoExercise?.name ?? ''}` : 'Rutina completada'}
        </p>
        <p className="text-sm text-gray-500">
          {exerciseIds.length} ejercicios · {formatDuration(Math.round(timelineDurationMs(timeline) / 1000))} ·{' '}
          {level.label}
        </p>
        <button
          onClick={() => navigate('/kegel')}
          className="mt-4 w-full rounded-lg bg-rose-500 py-3 text-sm font-semibold text-[#0b0d12] active:bg-rose-400"
        >
          Listo
        </button>
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

      <div className="px-4 pt-2 text-center">
        <p className="text-lg text-gray-300">Seguí el ritmo y las señales</p>
      </div>

      <div className="pt-safe flex flex-1 flex-col items-center justify-center">
        <KegelGuide ref={guideRef} mode={current ? exerciseMode(current.exerciseId) : 'contract'}>
          <p className="text-7xl font-bold tabular-nums leading-none text-white">{stepRemaining}</p>
          <p className="mt-2 text-xl font-semibold text-white">{current ? phaseLabel(current) : ''}</p>
        </KegelGuide>

        <div className="mt-4 text-center">
          {isRest ? (
            <p className="text-xl font-bold text-gray-100">Descanso</p>
          ) : (
            <button
              onClick={openInfo}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-1 active:bg-white/10"
            >
              <span className="text-xl font-bold text-gray-100">{currentExercise?.name ?? ''}</span>
              <span
                className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-sm font-bold text-rose-400"
                aria-hidden="true"
              >
                i
              </span>
            </button>
          )}
          <p className="mt-1 text-base text-gray-400">
            {isRest
              ? 'Preparate para el próximo ejercicio'
              : current
                ? `Repetición ${current.repIndex + 1} de ${current.totalReps} · ejercicio ${current.exerciseIndex + 1}/${exerciseIds.length}`
                : ''}
          </p>
          <p className="mt-2 text-base text-gray-500">Queda {formatDuration(totalRemaining)}</p>
        </div>
      </div>

      {showInfo && currentExercise && (
        <div className="fixed inset-0 z-30 flex items-end bg-black/70" onClick={closeInfo}>
          <div
            className="max-h-[80vh] w-full overflow-y-auto rounded-t-3xl bg-[#151922] p-5 pb-8"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mb-3 flex items-center gap-3">
              <span className="text-3xl">{currentExercise.icon}</span>
              <div>
                <p className="text-2xl font-bold text-gray-100">{currentExercise.name}</p>
                <p className="text-sm text-amber-400">Rutina en pausa</p>
              </div>
            </div>

            <p className="text-lg leading-relaxed text-gray-300">{currentExercise.description}</p>

            {exerciseMode(currentExercise.id) === 'lengthen' && (
              <p className="mt-3 rounded-xl bg-violet-500/10 p-3 text-base leading-relaxed text-violet-300">
                Este ejercicio es al revés que los demás: acá se afloja y se alarga, no se aprieta. Por eso la luz es
                violeta.
              </p>
            )}

            <button
              onClick={closeInfo}
              className="mt-5 w-full rounded-xl bg-rose-500 py-4 text-lg font-semibold text-[#0b0d12] active:bg-rose-400"
            >
              Seguir
            </button>
          </div>
        </div>
      )}

      {paused && (
        <p className="pb-2 text-center text-base font-medium text-amber-400">En pausa</p>
      )}

      <div className="flex gap-2 p-4">
        <button
          onClick={togglePause}
          className="flex-1 rounded-xl bg-white/10 py-4 text-lg font-semibold text-gray-100 active:bg-white/20"
        >
          {paused ? 'Reanudar' : 'Pausar'}
        </button>
        <button
          onClick={abandon}
          className="flex-1 rounded-xl bg-red-500/90 py-4 text-lg font-semibold text-white active:bg-red-500"
        >
          Terminar
        </button>
      </div>
    </div>
  )
}

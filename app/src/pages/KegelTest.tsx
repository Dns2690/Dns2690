import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import KegelGuide, { type KegelGuideHandle } from '../components/KegelGuide'
import { todayKey } from '../lib/kegel'
import {
  closeAudio,
  cueCountdown,
  cueFinish,
  cuePhase,
  releaseWakeLock,
  requestWakeLock,
  unlockAudio,
} from '../lib/feedback'
import { getKegelSettings, listKegelTests, saveKegelTest } from '../lib/store'
import type { KegelSettings, KegelTest as KegelTestEntry } from '../lib/types'

type Stage = 'intro' | 'countdown' | 'holding' | 'done'

const DEFAULT_SETTINGS: KegelSettings = { levelId: 'beginner', sound: true, vibration: true }

/** Escala de referencia para que el halo llegue al máximo cerca del minuto. */
const GLOW_FULL_SECONDS = 60

export default function KegelTest() {
  const navigate = useNavigate()
  const guideRef = useRef<KegelGuideHandle>(null)

  const [stage, setStage] = useState<Stage>('intro')
  const [settings, setSettings] = useState<KegelSettings>(DEFAULT_SETTINGS)
  const [previous, setPrevious] = useState<KegelTestEntry | null>(null)
  const [prepCount, setPrepCount] = useState(3)
  const [elapsed, setElapsed] = useState(0)
  const [result, setResult] = useState<number | null>(null)

  const settingsRef = useRef(settings)
  const startedAtRef = useRef(0)
  const rafRef = useRef(0)
  const shownRef = useRef(-1)

  useEffect(() => {
    settingsRef.current = settings
  }, [settings])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [stored, tests] = await Promise.all([getKegelSettings(), listKegelTests()])
      if (!alive) return
      if (stored) setSettings(stored)
      setPrevious(tests[0] ?? null)
    })()
    return () => {
      alive = false
    }
  }, [])

  const frame = useCallback(() => {
    const secs = (performance.now() - startedAtRef.current) / 1000
    const rounded = Math.floor(secs * 10) / 10
    if (rounded !== shownRef.current) {
      shownRef.current = rounded
      setElapsed(rounded)
    }
    guideRef.current?.setIntensity(Math.min(1, secs / GLOW_FULL_SECONDS))
    guideRef.current?.setProgress(Math.min(1, secs / GLOW_FULL_SECONDS))
    rafRef.current = requestAnimationFrame(frame)
  }, [])

  useEffect(() => {
    if (stage !== 'holding') return
    rafRef.current = requestAnimationFrame(frame)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      rafRef.current = 0
    }
  }, [stage, frame])

  useEffect(() => {
    if (stage !== 'countdown') return
    cueCountdown(settingsRef.current)
    const id = window.setInterval(() => {
      setPrepCount((c) => {
        if (c <= 1) {
          window.clearInterval(id)
          startedAtRef.current = performance.now()
          shownRef.current = -1
          cuePhase('contract', settingsRef.current)
          setStage('holding')
          return 0
        }
        cueCountdown(settingsRef.current)
        return c - 1
      })
    }, 1000)
    return () => window.clearInterval(id)
  }, [stage])

  useEffect(() => {
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
      void releaseWakeLock()
      closeAudio()
    }
  }, [])

  function begin() {
    unlockAudio()
    void requestWakeLock()
    setPrepCount(3)
    setStage('countdown')
  }

  async function release() {
    if (rafRef.current) cancelAnimationFrame(rafRef.current)
    rafRef.current = 0
    const seconds = Math.round(((performance.now() - startedAtRef.current) / 1000) * 10) / 10
    cueFinish(settingsRef.current)
    void releaseWakeLock()
    setResult(seconds)
    await saveKegelTest({ date: todayKey(), seconds })
    setStage('done')
  }

  if (stage === 'intro') {
    return (
      <div className="flex flex-1 flex-col pb-6">
        <TopBar title="Test de resistencia" back />
        <div className="flex flex-col gap-3 p-4">
          <div className="rounded-2xl bg-white/5 p-4">
            <p className="text-sm text-gray-300">
              Contraé el piso pélvico lo más fuerte que puedas y sostené <strong>todo el tiempo que aguantes</strong>.
              Cuando ya no puedas mantener la tensión, tocá <strong>Solté</strong>.
            </p>
            <p className="mt-2 text-sm text-gray-500">
              Es la medición real de tu avance. Repetila una vez por mes, en condiciones parecidas: mismo momento del
              día y sin haber entrenado justo antes.
            </p>
          </div>

          {previous && (
            <div className="rounded-2xl bg-white/5 p-4 text-center">
              <p className="text-sm text-gray-500">Tu último test</p>
              <p className="mt-1 text-2xl font-bold text-gray-100">
                {previous.seconds}
                <span className="ml-1 text-sm font-normal text-gray-500">s</span>
              </p>
            </div>
          )}

          <button
            onClick={begin}
            className="rounded-lg bg-cyan-500 py-3 text-sm font-semibold text-[#0b0d12] active:bg-cyan-400"
          >
            Empezar test
          </button>
        </div>
      </div>
    )
  }

  if (stage === 'countdown') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4">
        <p className="text-sm text-gray-400">Preparate…</p>
        <p className="text-7xl font-bold text-cyan-400">{prepCount}</p>
      </div>
    )
  }

  if (stage === 'done' && result != null) {
    const delta = previous ? Math.round((result - previous.seconds) * 10) / 10 : null
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
        <p className="text-5xl">🏔️</p>
        <p className="text-4xl font-bold text-gray-100">
          {result}
          <span className="ml-1 text-lg font-normal text-gray-500">s</span>
        </p>
        {delta != null && delta !== 0 && (
          <p className={`text-sm ${delta > 0 ? 'text-cyan-400' : 'text-amber-400'}`}>
            {delta > 0 ? '+' : ''}
            {delta}s respecto al test anterior
          </p>
        )}
        {delta === 0 && <p className="text-sm text-gray-500">Igual que el test anterior</p>}
        <div className="mt-4 flex w-full flex-col gap-2">
          <button
            onClick={() => navigate('/kegel/progreso')}
            className="w-full rounded-lg bg-cyan-500 py-3 text-sm font-semibold text-[#0b0d12] active:bg-cyan-400"
          >
            Ver mi progreso
          </button>
          <button
            onClick={() => navigate('/kegel')}
            className="w-full rounded-lg bg-white/10 py-3 text-sm font-medium text-gray-100 active:bg-white/20"
          >
            Volver
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col">
      <div className="px-4 pt-4 text-center">
        <p className="text-sm text-gray-400">Sostené la contracción</p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center">
        <KegelGuide ref={guideRef}>
          <p className="text-5xl font-bold tabular-nums text-gray-100">{elapsed.toFixed(1)}</p>
          <p className="mt-1 text-sm font-medium text-cyan-400">segundos</p>
        </KegelGuide>
      </div>

      <div className="p-4">
        <button
          onClick={release}
          className="w-full rounded-lg bg-red-500/90 py-4 text-base font-semibold text-white active:bg-red-500"
        >
          Solté
        </button>
      </div>
    </div>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import Icon, { IconTile } from '../components/Icon'
import { Button, Section } from '../components/ui'
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
      <div className="flex flex-1 flex-col pb-8">
        <TopBar title="Test" back />
        <div className="flex flex-col gap-7 pt-4">
          <div className="flex flex-col items-center px-8 text-center">
            <IconTile name="mountain" tone="kegel" size="xl" />
            <p className="mt-4 text-[28px] font-bold leading-tight tracking-tight text-label">Contracción máxima</p>
            <p className="mt-3 text-[17px] leading-relaxed text-label">
              Contraé el piso pélvico lo más fuerte que puedas y sostené <strong>todo el tiempo que aguantes</strong>.
              Cuando ya no puedas mantener la tensión, tocá <strong>Solté</strong>.
            </p>
            <p className="mt-3 text-[15px] leading-snug text-label-2">
              Es la medición real de tu avance. Repetila una vez por mes en condiciones parecidas: mismo momento del día
              y sin haber entrenado justo antes.
            </p>
          </div>

          {previous && (
            <Section>
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-[17px] text-label">Tu último test</span>
                <span className="text-[22px] font-bold tabular-nums text-label">
                  {previous.seconds}
                  <span className="ml-1 text-[15px] font-medium text-label-2">s</span>
                </span>
              </div>
            </Section>
          )}

          <div className="px-4">
            <Button tone="kegel" icon="play" onClick={begin}>
              Empezar test
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

  if (stage === 'done' && result != null) {
    const delta = previous ? Math.round((result - previous.seconds) * 10) / 10 : null
    return (
      <div className="pt-safe flex flex-1 flex-col items-center justify-center px-8 text-center">
        <IconTile name="mountain" tone="kegel" size="xl" />
        <p className="mt-5 text-[64px] font-bold leading-none tracking-tight tabular-nums text-label">
          {result}
          <span className="ml-1 text-[22px] font-semibold text-label-2">s</span>
        </p>
        {delta != null && delta !== 0 && (
          <p className={`mt-3 flex items-center gap-1 text-[17px] font-semibold ${delta > 0 ? 'text-kegel-400' : 'text-warn-400'}`}>
            <Icon name="arrow-up" size={18} strokeWidth={2.6} className={delta > 0 ? '' : 'rotate-180'} />
            {delta > 0 ? '+' : ''}
            {delta} s respecto al test anterior
          </p>
        )}
        {delta === 0 && <p className="mt-3 text-[17px] text-label-2">Igual que el test anterior</p>}
        <div className="mt-8 flex w-full max-w-xs flex-col gap-2.5">
          <Button tone="kegel" onClick={() => navigate('/kegel/progreso')}>
            Ver mi progreso
          </Button>
          <Button tone="gray" onClick={() => navigate('/kegel')}>
            Volver
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="pt-safe flex flex-1 flex-col">
      <p className="px-4 pt-4 text-center text-[17px] text-label-2">Sostené la contracción</p>

      <div className="flex flex-1 flex-col items-center justify-center">
        <KegelGuide ref={guideRef}>
          <p className="text-[56px] font-bold leading-none tabular-nums text-label">{elapsed.toFixed(1)}</p>
          <p className="mt-2 text-[15px] font-semibold text-kegel-400">segundos</p>
        </KegelGuide>
      </div>

      <div className="px-4 pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <button
          onClick={release}
          className="h-[56px] w-full rounded-[14px] bg-danger-500 text-[20px] font-bold text-black active:opacity-80"
        >
          Solté
        </button>
      </div>
    </div>
  )
}

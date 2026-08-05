import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import { BREATH_PATTERNS, getBreathPattern, MINDFULNESS_LEVELS } from '../lib/mindfulness'
import { AMBIENTS } from '../lib/ambient'
import { computeStreak, toDateKey, todayKey } from '../lib/kegel'
import { getMindfulnessSettings, listMindfulnessLogs, saveMindfulnessSettings } from '../lib/store'
import type { MindfulnessLevelId, MindfulnessLog, MindfulnessSettings } from '../lib/types'

const DEFAULTS: MindfulnessSettings = {
  levelId: 'beginner',
  breathId: 'coherent',
  ambient: 'drone',
  ambientVolume: 0.55,
  bells: true,
}

const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

export default function Mindfulness() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<MindfulnessSettings | null>(null)
  const [logs, setLogs] = useState<MindfulnessLog[] | null>(null)

  useEffect(() => {
    let alive = true
    Promise.all([getMindfulnessSettings(), listMindfulnessLogs()]).then(([s, l]) => {
      if (!alive) return
      setSettings(s ?? DEFAULTS)
      setLogs(l)
    })
    return () => {
      alive = false
    }
  }, [])

  const today = todayKey()

  const minutesByDate = useMemo(() => {
    const map: Record<string, number> = {}
    for (const l of logs ?? []) map[l.date] = (map[l.date] ?? 0) + l.minutes
    return map
  }, [logs])

  // La racha de Kegel pide 2 rutinas; acá alcanza con haber meditado.
  const countsByDate = useMemo(() => {
    const map: Record<string, number> = {}
    for (const d of Object.keys(minutesByDate)) map[d] = 2
    return map
  }, [minutesByDate])

  const streak = useMemo(() => computeStreak(countsByDate, today), [countsByDate, today])
  const totalMinutes = useMemo(() => (logs ?? []).reduce((s, l) => s + l.minutes, 0), [logs])
  const todayMinutes = minutesByDate[today] ?? 0

  const monthGrid = useMemo(() => {
    const now = new Date()
    const first = new Date(now.getFullYear(), now.getMonth(), 1)
    const days = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate()
    const leading = (first.getDay() + 6) % 7
    const cells: (string | null)[] = Array(leading).fill(null)
    for (let d = 1; d <= days; d++) cells.push(toDateKey(new Date(now.getFullYear(), now.getMonth(), d)))
    return cells
  }, [])

  async function update(patch: Partial<MindfulnessSettings>) {
    if (!settings) return
    const next = { ...settings, ...patch }
    setSettings(next)
    await saveMindfulnessSettings(next)
  }

  if (!settings || logs === null) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Mindfulness" />
        <p className="p-6 text-center text-base text-gray-500">Cargando…</p>
      </div>
    )
  }

  const pattern = getBreathPattern(settings.breathId)

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar
        title="Mindfulness"
        right={
          <Link to="/ajustes" className="rounded-lg px-2 py-1 text-lg active:bg-white/10" aria-label="Ajustes">
            ⚙️
          </Link>
        }
      />

      <div className="flex flex-col gap-3 p-4">
        <div className="rounded-2xl bg-white/5 p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-base text-gray-500">Hoy</p>
            {streak > 0 && <p className="text-base text-violet-400">🔥 {streak} {streak === 1 ? 'día' : 'días'}</p>}
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-100">
            {todayMinutes}
            <span className="text-base font-normal text-gray-500"> min meditados</span>
          </p>
        </div>

        <button
          onClick={() => navigate('/mindfulness/sesion')}
          className="rounded-2xl bg-violet-500 py-4 text-lg font-semibold text-white active:bg-violet-400"
        >
          Meditar
        </button>

        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-base font-semibold text-gray-100">Nivel</p>
          <div className="mt-3 flex flex-col gap-2">
            {MINDFULNESS_LEVELS.map((l) => (
              <button
                key={l.id}
                onClick={() => update({ levelId: l.id as MindfulnessLevelId })}
                className={`flex items-center gap-3 rounded-xl p-3 text-left ${
                  settings.levelId === l.id ? 'bg-violet-400/15 ring-1 ring-violet-400' : 'bg-white/5'
                }`}
              >
                <span
                  className={`w-12 shrink-0 text-lg font-bold ${
                    settings.levelId === l.id ? 'text-violet-300' : 'text-gray-500'
                  }`}
                >
                  {l.minutes}′
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-base font-medium text-gray-100">{l.label}</p>
                  <p className="text-sm text-gray-500">{l.summary}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-base font-semibold text-gray-100">Respiración</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {BREATH_PATTERNS.map((p) => (
              <button
                key={p.id}
                onClick={() => update({ breathId: p.id })}
                className={`rounded-xl p-3 text-left ${
                  settings.breathId === p.id ? 'bg-violet-400/15 ring-1 ring-violet-400' : 'bg-white/5'
                }`}
              >
                <p className="text-base font-medium text-gray-100">{p.label}</p>
                <p className="text-sm text-gray-500">{p.description}</p>
              </button>
            ))}
          </div>
          {pattern.evidence && (
            <p className="mt-3 text-sm leading-relaxed text-gray-500">{pattern.evidence}</p>
          )}
        </div>

        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-base font-semibold text-gray-100">Ambiente</p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            {AMBIENTS.map((a) => (
              <button
                key={a.id}
                onClick={() => update({ ambient: a.id })}
                className={`rounded-xl p-3 text-left ${
                  settings.ambient === a.id ? 'bg-violet-400/15 ring-1 ring-violet-400' : 'bg-white/5'
                }`}
              >
                <p className="text-base font-medium text-gray-100">{a.label}</p>
                <p className="text-sm text-gray-500">{a.description}</p>
              </button>
            ))}
          </div>
          <label className="mt-4 flex items-center justify-between py-1">
            <span className="text-base text-gray-200">🔔 Campanas</span>
            <input
              type="checkbox"
              checked={settings.bells}
              onChange={(e) => update({ bells: e.target.checked })}
              className="h-5 w-5 accent-violet-400"
            />
          </label>
          <p className="mt-1 text-sm leading-relaxed text-gray-500">
            Todo el sonido se genera en el teléfono: no hay archivos ni hace falta conexión.
          </p>
        </div>

        <div className="rounded-2xl bg-white/5 p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-base font-semibold text-gray-100">Tu práctica</p>
            <p className="text-base font-bold text-violet-300">{totalMinutes} min</p>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((d, i) => (
              <span key={i} className="text-center text-xs text-gray-600">
                {d}
              </span>
            ))}
            {monthGrid.map((key, i) => {
              if (!key) return <span key={`pad-${i}`} />
              const mins = minutesByDate[key] ?? 0
              const isToday = key === today
              return (
                <span
                  key={key}
                  className={`flex aspect-square items-center justify-center rounded-md text-xs ${
                    mins > 0 ? 'bg-violet-400 font-semibold text-[#0b0d12]' : 'bg-white/5 text-gray-600'
                  } ${isToday ? 'ring-1 ring-violet-400' : ''}`}
                >
                  {Number(key.slice(8))}
                </span>
              )
            })}
          </div>
        </div>

        <Link
          to="/mindfulness/voz"
          className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-4 active:bg-violet-500/20"
        >
          <p className="text-base font-medium text-violet-300">🎙️ Probar voz guiada</p>
          <p className="mt-1 text-sm leading-relaxed text-gray-400">
            Las fuentes se contradicen sobre si iOS permite hablar desde un temporizador. Esta prueba lo mide en tu
            teléfono en 25 segundos.
          </p>
        </Link>

        <p className="px-1 text-sm leading-relaxed text-gray-600">
          Por ahora la guía es por texto y campanas, no por voz: en iPhone el navegador descarta el habla programada, así que
          una voz narrada se cortaría a mitad de sesión. Leé la consigna, cerrá los ojos y dejá que las campanas
          marquen los cambios.
        </p>
      </div>
    </div>
  )
}

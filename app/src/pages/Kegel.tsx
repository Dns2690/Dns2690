import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import TopBar from '../components/TopBar'
import {
  ADHERENCE_WINDOW_DAYS,
  computeStats,
  computeStreak,
  DAILY_ROUTINE_GOAL,
  getLevel,
  KEGEL_EXERCISES,
  LEVEL_UP_WINDOW_DAYS,
  MAX_HOLD_TEST_INTERVAL_DAYS,
  shouldSuggestLevelUp,
  toDateKey,
  todayKey,
} from '../lib/kegel'
import { getKegelSettings, listKegelSessions, listKegelTests, saveKegelSettings } from '../lib/store'
import type { KegelSession, KegelSettings, KegelTest } from '../lib/types'

const DEFAULT_SETTINGS: KegelSettings = { levelId: 'beginner', sound: true, vibration: true }
const WEEKDAYS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']

function daysBetween(fromIso: string, to: Date): number {
  const from = new Date(fromIso + 'T00:00:00')
  return Math.floor((to.getTime() - from.getTime()) / 86_400_000)
}

export default function Kegel() {
  const navigate = useNavigate()
  const [settings, setSettings] = useState<KegelSettings | null>(null)
  const [sessions, setSessions] = useState<KegelSession[] | null>(null)
  const [tests, setTests] = useState<KegelTest[]>([])

  useEffect(() => {
    let alive = true
    ;(async () => {
      const [s, sess, t] = await Promise.all([getKegelSettings(), listKegelSessions(), listKegelTests()])
      if (!alive) return
      setSettings(s ?? DEFAULT_SETTINGS)
      setSessions(sess)
      setTests(t)
    })()
    return () => {
      alive = false
    }
  }, [])

  const countsByDate = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const s of sessions ?? []) counts[s.date] = (counts[s.date] ?? 0) + 1
    return counts
  }, [sessions])

  const today = todayKey()
  const todayCount = countsByDate[today] ?? 0
  const streak = useMemo(() => computeStreak(countsByDate, today), [countsByDate, today])
  const stats = useMemo(() => computeStats(countsByDate, today), [countsByDate, today])

  const suggestedLevel = useMemo(() => {
    if (!settings) return null
    if (settings.levelUpDismissedAt && daysBetween(settings.levelUpDismissedAt, new Date()) < LEVEL_UP_WINDOW_DAYS) {
      return null
    }
    return shouldSuggestLevelUp(countsByDate, today, settings.levelId)
  }, [countsByDate, settings, today])

  const lastTest = tests[0] ?? null
  const testDue = !lastTest || daysBetween(lastTest.date, new Date()) >= MAX_HOLD_TEST_INTERVAL_DAYS

  const monthGrid = useMemo(() => {
    const now = new Date()
    const year = now.getFullYear()
    const month = now.getMonth()
    const first = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    // getDay() da 0 para domingo; la grilla arranca en lunes.
    const leading = (first.getDay() + 6) % 7
    const cells: (string | null)[] = Array(leading).fill(null)
    for (let d = 1; d <= daysInMonth; d++) cells.push(toDateKey(new Date(year, month, d)))
    return cells
  }, [])

  async function applyLevelUp(accept: boolean) {
    if (!settings) return
    const next: KegelSettings = accept
      ? { ...settings, levelId: suggestedLevel!, levelUpDismissedAt: undefined }
      : { ...settings, levelUpDismissedAt: today }
    setSettings(next)
    await saveKegelSettings(next)
  }

  if (!settings || sessions === null) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Kegel" />
        <p className="p-6 text-center text-sm text-gray-500">Cargando…</p>
      </div>
    )
  }

  const level = getLevel(settings.levelId)
  const monthLabel = new Date().toLocaleDateString('es', { month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar
        title="Kegel"
        right={
          <Link to="/ajustes" className="rounded-lg px-2 py-1 text-lg active:bg-white/10" aria-label="Ajustes">
            ⚙️
          </Link>
        }
      />

      <div className="flex flex-col gap-3 p-4">
        <div className="rounded-2xl bg-white/5 p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-gray-500">Hoy · nivel {level.label}</p>
            {streak > 0 && <p className="text-sm text-rose-400">🔥 {streak} {streak === 1 ? 'día' : 'días'}</p>}
          </div>
          <p className="mt-1 text-2xl font-bold text-gray-100">
            {todayCount}
            <span className="text-base font-normal text-gray-500"> / {DAILY_ROUTINE_GOAL} rutinas</span>
          </p>
          <div className="mt-3 flex gap-1.5">
            {Array.from({ length: DAILY_ROUTINE_GOAL }).map((_, i) => (
              <div
                key={i}
                className={`h-1.5 flex-1 rounded-full ${i < todayCount ? 'bg-rose-400' : 'bg-white/10'}`}
              />
            ))}
          </div>
        </div>

        <button
          onClick={() => navigate('/kegel/rutina')}
          className="rounded-lg bg-rose-500 py-3 text-sm font-semibold text-[#0b0d12] active:bg-rose-400"
        >
          Iniciar rutina
        </button>

        {suggestedLevel && (
          <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 p-4">
            <p className="text-sm font-medium text-rose-300">🚀 Venís cumpliendo la meta</p>
            <p className="mt-1 text-sm text-gray-400">
              Cumpliste tu objetivo la mayoría de los últimos {LEVEL_UP_WINDOW_DAYS} días. ¿Subimos a{' '}
              {getLevel(suggestedLevel).label}?
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={() => applyLevelUp(true)}
                className="flex-1 rounded-lg bg-rose-500 py-2 text-sm font-medium text-[#0b0d12] active:bg-rose-400"
              >
                Subir
              </button>
              <button
                onClick={() => applyLevelUp(false)}
                className="flex-1 rounded-lg bg-white/10 py-2 text-sm font-medium text-gray-100 active:bg-white/20"
              >
                Quedarme
              </button>
            </div>
          </div>
        )}

        {testDue && (
          <Link
            to="/kegel/test"
            className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-4 active:bg-amber-500/20"
          >
            <p className="text-sm font-medium text-amber-300">🏔️ Toca el test mensual</p>
            <p className="mt-1 text-sm text-gray-400">
              {lastTest
                ? `Pasaron ${daysBetween(lastTest.date, new Date())} días desde el último. Medí tu contracción máxima para ver el avance real.`
                : 'Medí cuánto aguantás una contracción máxima. Es tu punto de partida.'}
            </p>
          </Link>
        )}

        <div className="rounded-2xl bg-white/5 p-4">
          <div className="flex items-baseline justify-between">
            <p className="text-sm text-gray-400 first-letter:uppercase">{monthLabel}</p>
            <p className="text-sm text-gray-600">{DAILY_ROUTINE_GOAL} rutinas = día completo</p>
          </div>
          <div className="mt-3 grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((d, i) => (
              <span key={i} className="text-center text-xs text-gray-600">
                {d}
              </span>
            ))}
            {monthGrid.map((key, i) => {
              if (!key) return <span key={`pad-${i}`} />
              const count = countsByDate[key] ?? 0
              const isToday = key === today
              const day = Number(key.slice(8))
              const fill =
                count >= DAILY_ROUTINE_GOAL
                  ? 'bg-rose-400 text-[#0b0d12] font-semibold'
                  : count > 0
                    ? 'bg-rose-400/30 text-gray-100'
                    : 'bg-white/5 text-gray-600'
              return (
                <span
                  key={key}
                  className={`flex aspect-square items-center justify-center rounded-md text-sm ${fill} ${
                    isToday ? 'ring-1 ring-rose-400' : ''
                  }`}
                >
                  {day}
                </span>
              )
            })}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Link to="/kegel/progreso" className="rounded-xl bg-white/5 p-3 active:bg-white/10">
            <p className="text-sm text-gray-400">📈 Progreso</p>
            <p className="mt-1 text-lg font-semibold text-gray-100">
              {lastTest ? lastTest.seconds : '—'}
              <span className="ml-1 text-sm font-normal text-gray-500">s</span>
            </p>
            <p className="text-sm text-gray-500">contracción máxima</p>
          </Link>
          <Link to="/kegel/test" className="rounded-xl bg-white/5 p-3 active:bg-white/10">
            <p className="text-sm text-gray-400">🏔️ Test</p>
            <p className="mt-1 text-lg font-semibold text-gray-100">Medir</p>
            <p className="text-sm text-gray-500">contracción máxima</p>
          </Link>
        </div>

        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-lg font-bold text-gray-100">📋 Tu entrenamiento</p>

          <div className="mt-3 grid grid-cols-2 gap-3">
            {[
              { value: stats.trainingDays, label: 'Días entrenados' },
              { value: stats.sessions, label: 'Rutinas totales' },
              { value: stats.streak, label: 'Días seguidos' },
              { value: tests.length, label: 'Tests hechos' },
            ].map((tile) => (
              <div key={tile.label} className="rounded-xl bg-white/5 p-4 text-center">
                <p className="text-3xl font-bold text-white">{tile.value}</p>
                <p className="mt-1 text-sm text-gray-400">{tile.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-3 rounded-xl bg-white/5 p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-base text-gray-300">Días entrenados</p>
              <p className="text-lg font-bold text-white">{stats.adherencePercent}%</p>
            </div>
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full"
                style={{
                  width: `${stats.adherencePercent}%`,
                  background: 'linear-gradient(to right, #0e7490, #22d3ee)',
                }}
              />
            </div>
            <div className="mt-1.5 flex justify-between text-sm text-gray-600">
              <span>0</span>
              <span>últimos {ADHERENCE_WINDOW_DAYS} días</span>
              <span>100</span>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="px-1 text-sm text-gray-500">Ejercicios</p>
          {KEGEL_EXERCISES.map((ex) => {
            const locked = getLevel(ex.minLevel).rank > level.rank
            return (
              <div
                key={ex.id}
                className={`flex items-center gap-3 rounded-xl bg-white/5 p-3 ${locked ? 'opacity-50' : ''}`}
              >
                <span className="text-xl">{ex.icon}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-gray-100">{ex.name}</p>
                  <p className="text-sm text-gray-500">{ex.description}</p>
                </div>
                {locked && (
                  <span className="shrink-0 text-sm text-gray-500">
                    {getLevel(ex.minLevel).label}
                  </span>
                )}
              </div>
            )
          })}
        </div>

        <p className="px-1 text-sm leading-relaxed text-gray-600">
          Los ejercicios de piso pélvico son seguros y de práctica habitual, pero si sentís dolor o molestia
          persistente, consultá con un kinesiólogo de piso pélvico. Esta app guía el ritmo, no reemplaza criterio
          clínico.
        </p>
      </div>
    </div>
  )
}

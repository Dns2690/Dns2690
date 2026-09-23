import { useEffect, useMemo, useState } from 'react'
import TopBar, { BarButton } from '../components/TopBar'
import Icon, { IconTile } from '../components/Icon'
import { Button, Placeholder, Row, Section, Stat } from '../components/ui'
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
        <TopBar title="Kegel" back="Bienestar" large />
        <Placeholder>Cargando…</Placeholder>
      </div>
    )
  }

  const level = getLevel(settings.levelId)
  const monthLabel = new Date().toLocaleDateString('es', { month: 'long', year: 'numeric' })

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar title="Kegel" back="Bienestar" large right={<BarButton icon="gear" label="Ajustes" to="/ajustes" />} />

      <div className="flex flex-col gap-7">
        <div className="px-4">
          <div className="rounded-2xl bg-cell p-4">
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-semibold text-kegel-400">Hoy · {level.label}</p>
              {streak > 0 && (
                <p className="flex items-center gap-1 text-[15px] font-semibold text-label">
                  <Icon name="flame" size={17} className="text-kegel-400" />
                  {streak} {streak === 1 ? 'día' : 'días'}
                </p>
              )}
            </div>
            <p className="mt-1 text-[34px] font-bold leading-tight tracking-tight tabular-nums text-label">
              {todayCount}
              <span className="text-[20px] font-semibold text-label-2"> de {DAILY_ROUTINE_GOAL} rutinas</span>
            </p>
            <div className="mt-3 flex gap-1.5">
              {Array.from({ length: DAILY_ROUTINE_GOAL }).map((_, i) => (
                <div key={i} className={`h-1.5 flex-1 rounded-full ${i < todayCount ? 'bg-kegel-500' : 'bg-cell-2'}`} />
              ))}
            </div>
            <div className="mt-4">
              <Button tone="kegel" icon="play" to="/kegel/rutina">
                Iniciar rutina
              </Button>
            </div>
          </div>
        </div>

        {suggestedLevel && (
          <Section>
            <div className="p-4">
              <div className="flex items-center gap-3">
                <IconTile name="arrow-up" tone="kegel" />
                <p className="text-[17px] font-semibold text-label">Venís cumpliendo la meta</p>
              </div>
              <p className="mt-2 text-[15px] leading-snug text-label-2">
                Cumpliste tu objetivo la mayoría de los últimos {LEVEL_UP_WINDOW_DAYS} días. ¿Subimos a{' '}
                {getLevel(suggestedLevel).label}?
              </p>
              <div className="mt-3 flex gap-2">
                <Button tone="kegel" size="md" onClick={() => applyLevelUp(true)}>
                  Subir
                </Button>
                <Button tone="gray" size="md" onClick={() => applyLevelUp(false)}>
                  Quedarme
                </Button>
              </div>
            </div>
          </Section>
        )}

        {testDue && (
          <Section>
            <Row
              to="/kegel/test"
              icon="mountain"
              tone="warn"
              title="Toca el test mensual"
              wrap
              subtitle={
                lastTest
                  ? `Pasaron ${daysBetween(lastTest.date, new Date())} días desde el último. Medí tu contracción máxima.`
                  : 'Medí cuánto aguantás una contracción máxima. Es tu punto de partida.'
              }
            />
          </Section>
        )}

        <Section header={monthLabel} footer={`Día completo = ${DAILY_ROUTINE_GOAL} rutinas.`}>
          <div className="grid grid-cols-7 gap-y-1.5 p-3">
            {WEEKDAYS.map((d, i) => (
              <span key={i} className="pb-1 text-center text-[13px] font-semibold text-label-3">
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
                  ? 'bg-kegel-500 text-black font-semibold'
                  : count > 0
                    ? 'bg-kegel-500/25 text-label'
                    : isToday
                      ? 'text-kegel-400 font-semibold'
                      : 'text-label-2'
              return (
                <span key={key} className="flex justify-center">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-[17px] tabular-nums ${fill} ${
                      isToday && count < DAILY_ROUTINE_GOAL ? 'ring-2 ring-kegel-500 ring-inset' : ''
                    }`}
                  >
                    {day}
                  </span>
                </span>
              )
            })}
          </div>
        </Section>

        <Section header="Contracción máxima">
          <Row
            to="/kegel/progreso"
            icon="trend"
            tone="kegel"
            title="Progreso"
            detail={lastTest ? `${lastTest.seconds} s` : '—'}
          />
          <Row to="/kegel/test" icon="mountain" tone="kegel" title="Hacer el test" />
        </Section>

        <Section header="Tu entrenamiento">
          <div className="p-4">
            <div className="grid grid-cols-2 gap-x-4 gap-y-5">
              <Stat label="Días entrenados" value={stats.trainingDays} />
              <Stat label="Rutinas" value={stats.sessions} />
              <Stat label="Días seguidos" value={stats.streak} />
              <Stat label="Tests" value={tests.length} />
            </div>
            <div className="mt-5">
              <div className="flex items-baseline justify-between">
                <p className="text-[15px] text-label">Constancia</p>
                <p className="text-[17px] font-semibold tabular-nums text-label">{stats.adherencePercent}%</p>
              </div>
              <div className="mt-2 h-2 overflow-hidden rounded-full bg-cell-2">
                <div className="h-full rounded-full bg-kegel-500" style={{ width: `${stats.adherencePercent}%` }} />
              </div>
              <p className="mt-1.5 text-[13px] text-label-2">Días entrenados de los últimos {ADHERENCE_WINDOW_DAYS}.</p>
            </div>
          </div>
        </Section>

        <Section
          header="Ejercicios"
          footer="Tocá uno para probarlo solo, en nivel Principiante. Los ejercicios de piso pélvico son seguros y de práctica habitual, pero si sentís dolor o molestia persistente, consultá con un kinesiólogo de piso pélvico."
        >
          {KEGEL_EXERCISES.map((ex) => {
            const locked = getLevel(ex.minLevel).rank > level.rank
            return (
              // Tocar un ejercicio lo corre solo, en nivel Principiante. Sirve
              // para depurarlos de a uno, así que los bloqueados también se
              // pueden probar.
              <Row
                key={ex.id}
                to={`/kegel/demo/${ex.id}`}
                icon={ex.icon}
                tone={locked ? 'gray' : 'kegel'}
                title={
                  <span className="flex items-center gap-2">
                    {ex.name}
                    {locked && (
                      <span className="rounded-md bg-cell-2 px-1.5 py-px text-[12px] font-medium text-label-2">
                        {getLevel(ex.minLevel).label}
                      </span>
                    )}
                  </span>
                }
                subtitle={ex.description}
                wrap
              />
            )
          })}
        </Section>
      </div>
    </div>
  )
}

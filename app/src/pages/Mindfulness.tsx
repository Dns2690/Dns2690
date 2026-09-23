import { useEffect, useMemo, useState } from 'react'
import TopBar, { BarButton } from '../components/TopBar'
import Icon from '../components/Icon'
import { Button, Placeholder, Row, Section, Stat, Toggle } from '../components/ui'
import { BREATH_PATTERNS, getBreathPattern, getLevel, MINDFULNESS_LEVELS } from '../lib/mindfulness'
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
        <TopBar title="Mindfulness" back="Bienestar" large />
        <Placeholder>Cargando…</Placeholder>
      </div>
    )
  }

  const pattern = getBreathPattern(settings.breathId)
  const level = getLevel(settings.levelId)
  const check = <Icon name="check" size={20} strokeWidth={2.6} className="shrink-0 text-mind-400" />

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar title="Mindfulness" back="Bienestar" large right={<BarButton icon="gear" label="Ajustes" to="/ajustes" />} />

      <div className="flex flex-col gap-7">
        <div className="px-4">
          <div className="rounded-2xl bg-cell p-4">
            <div className="flex gap-4">
              <Stat label="Hoy" value={<>{todayMinutes}<span className="ml-1 text-[15px] font-medium text-label-2">min</span></>} />
              <Stat
                label="Racha"
                value={
                  <span className="flex items-center gap-1">
                    {streak}
                    <Icon name="flame" size={20} className={streak > 0 ? 'text-mind-400' : 'text-label-3'} />
                  </span>
                }
              />
              <Stat label="Total" value={<>{totalMinutes}<span className="ml-1 text-[15px] font-medium text-label-2">min</span></>} />
            </div>
            <div className="mt-4">
              <Button tone="mind" icon="play" to="/mindfulness/sesion">
                Meditar {level.minutes} minutos
              </Button>
            </div>
          </div>
        </div>

        <Section header="Nivel">
          {MINDFULNESS_LEVELS.map((l) => (
            <Row
              key={l.id}
              onClick={() => update({ levelId: l.id as MindfulnessLevelId })}
              leading={
                <span className="w-9 shrink-0 text-[17px] font-semibold tabular-nums text-mind-400">{l.minutes}′</span>
              }
              sepInset={64}
              title={l.label}
              subtitle={l.summary}
              trailing={settings.levelId === l.id ? check : undefined}
            />
          ))}
        </Section>

        <Section header="Respiración" footer={pattern.evidence}>
          {BREATH_PATTERNS.map((p) => (
            <Row
              key={p.id}
              onClick={() => update({ breathId: p.id })}
              title={p.label}
              subtitle={p.description}
              trailing={settings.breathId === p.id ? check : undefined}
            />
          ))}
        </Section>

        <Section header="Ambiente" footer="Todo el sonido se genera en el teléfono: no hay archivos ni hace falta conexión.">
          {AMBIENTS.map((a) => (
            <Row
              key={a.id}
              onClick={() => update({ ambient: a.id })}
              title={a.label}
              subtitle={a.description}
              trailing={settings.ambient === a.id ? check : undefined}
            />
          ))}
        </Section>

        <Section>
          <Row
            icon="bell"
            tone="mind"
            title="Campanas"
            trailing={<Toggle tone="mind" label="Campanas" checked={settings.bells} onChange={(v) => update({ bells: v })} />}
          />
          <Row
            to="/mindfulness/voz"
            icon="mic"
            tone="mind"
            title="Voz guiada"
            detail={settings.voiceEnabled ? 'Activada' : 'Desactivada'}
          />
        </Section>

        <Section header="Tu práctica" footer={`${totalMinutes} minutos meditados en total.`}>
          <div className="grid grid-cols-7 gap-y-1.5 p-3">
            {WEEKDAYS.map((d, i) => (
              <span key={i} className="pb-1 text-center text-[13px] font-semibold text-label-3">
                {d}
              </span>
            ))}
            {monthGrid.map((key, i) => {
              if (!key) return <span key={`pad-${i}`} />
              const mins = minutesByDate[key] ?? 0
              const isToday = key === today
              return (
                <span key={key} className="flex justify-center">
                  <span
                    className={`flex h-9 w-9 items-center justify-center rounded-full text-[17px] tabular-nums ${
                      mins > 0
                        ? 'bg-mind-500 font-semibold text-black'
                        : isToday
                          ? 'font-semibold text-mind-400 ring-2 ring-mind-500 ring-inset'
                          : 'text-label-2'
                    }`}
                  >
                    {Number(key.slice(8))}
                  </span>
                </span>
              )
            })}
          </div>
        </Section>
      </div>
    </div>
  )
}

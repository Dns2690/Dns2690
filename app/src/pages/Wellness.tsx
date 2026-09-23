import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar, { BarButton } from '../components/TopBar'
import Icon, { IconTile } from '../components/Icon'
import { Placeholder } from '../components/ui'
import { loadActivity, type ActivityByDate } from '../lib/activity'
import { DAILY_ROUTINE_GOAL, getLevel, todayKey } from '../lib/kegel'
import { getKegelSettings, getMindfulnessSettings } from '../lib/store'
import { getLevel as getMindLevel } from '../lib/mindfulness'
import { MODULE_THEMES } from '../lib/theme'
import type { KegelSettings, MindfulnessSettings } from '../lib/types'

/**
 * Plano secundario: Kegel y Mindfulness.
 *
 * La app es de ejercicios; estos dos módulos siguen enteros pero detrás de una
 * sola puerta, para que la portada no compita consigo misma. Cada uno se
 * presenta con su color, que es el que va a tener todo adentro.
 */
export default function Wellness() {
  const [activity, setActivity] = useState<ActivityByDate | null>(null)
  const [kegel, setKegel] = useState<KegelSettings | null>(null)
  const [mind, setMind] = useState<MindfulnessSettings | null>(null)

  useEffect(() => {
    let alive = true
    void (async () => {
      const [a, k, m] = await Promise.all([loadActivity(), getKegelSettings(), getMindfulnessSettings()])
      if (!alive) return
      setActivity(a)
      setKegel(k ?? null)
      setMind(m ?? null)
    })()
    return () => {
      alive = false
    }
  }, [])

  const today = todayKey()
  const todayActivity = useMemo(() => (activity ? activity[today] : undefined), [activity, today])

  const header = <TopBar title="Bienestar" large right={<BarButton icon="gear" label="Ajustes" to="/ajustes" />} />

  if (!activity) {
    return (
      <div className="flex flex-1 flex-col">
        {header}
        <Placeholder>Cargando…</Placeholder>
      </div>
    )
  }

  const kegelToday = todayActivity?.kegel ?? 0
  const mindToday = todayActivity?.mindfulness ?? 0

  const cards = [
    {
      to: '/kegel',
      theme: MODULE_THEMES.kegel,
      kicker: kegel ? getLevel(kegel.levelId).label : 'Piso pélvico',
      big: `${kegelToday}/${DAILY_ROUTINE_GOAL}`,
      caption: 'rutinas hoy',
      progress: Math.min(1, kegelToday / DAILY_ROUTINE_GOAL),
      done: kegelToday >= DAILY_ROUTINE_GOAL,
    },
    {
      to: '/mindfulness',
      theme: MODULE_THEMES.mindfulness,
      kicker: mind ? getMindLevel(mind.levelId).label : 'Meditación guiada',
      big: String(mindToday),
      caption: mindToday === 1 ? 'sesión hoy' : 'sesiones hoy',
      progress: mindToday > 0 ? 1 : 0,
      done: mindToday > 0,
    },
  ]

  return (
    <div className="flex flex-1 flex-col pb-8">
      {header}

      <div className="flex flex-col gap-3 px-4">
        {cards.map((c) => (
          <Link key={c.to} to={c.to} className="rounded-2xl bg-cell p-4 active:bg-press">
            <div className="flex items-center gap-3">
              <IconTile name={c.theme.icon} tone={c.theme.tone} size="md" />
              <div className="min-w-0 flex-1">
                <p className="text-[20px] font-bold leading-tight text-label">{c.theme.label}</p>
                <p className="text-[15px] text-label-2">{c.kicker}</p>
              </div>
              {c.done ? (
                <span
                  className="flex h-7 w-7 items-center justify-center rounded-full text-black"
                  style={{ background: c.theme.hex }}
                  aria-label="completado"
                >
                  <Icon name="check" size={16} strokeWidth={3} />
                </span>
              ) : (
                <Icon name="chevron-right" size={18} strokeWidth={2.4} className="text-label-3" />
              )}
            </div>
            <div className="mt-4 flex items-end justify-between gap-4">
              <p className="text-[28px] font-bold leading-none tabular-nums text-label">
                {c.big}
                <span className="ml-1.5 text-[15px] font-medium text-label-2">{c.caption}</span>
              </p>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-cell-2">
              <div className="h-full rounded-full" style={{ width: `${c.progress * 100}%`, background: c.theme.hex }} />
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'
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
 * sola puerta, para que la portada no compita consigo misma.
 */
export default function Wellness() {
  const [activity, setActivity] = useState<ActivityByDate | null>(null)
  const [kegel, setKegel] = useState<KegelSettings | null>(null)
  const [mind, setMind] = useState<MindfulnessSettings | null>(null)

  useEffect(() => {
    let alive = true
    void (async () => {
      const [a, k, m] = await Promise.all([
        loadActivity(),
        getKegelSettings(),
        getMindfulnessSettings(),
      ])
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

  if (!activity) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Bienestar" />
        <p className="p-6 text-center text-base text-gray-500">Cargando…</p>
      </div>
    )
  }

  const kegelToday = todayActivity?.kegel ?? 0
  const mindToday = todayActivity?.mindfulness ?? 0

  const cards = [
    {
      to: '/kegel',
      theme: MODULE_THEMES.kegel,
      status: `${kegelToday} de ${DAILY_ROUTINE_GOAL} rutinas hoy${
        kegel ? ` · ${getLevel(kegel.levelId).label}` : ''
      }`,
      done: kegelToday >= DAILY_ROUTINE_GOAL,
    },
    {
      to: '/mindfulness',
      theme: MODULE_THEMES.mindfulness,
      status: mindToday
        ? `${mindToday} ${mindToday === 1 ? 'sesión' : 'sesiones'} hoy`
        : `Todavía no meditaste${mind ? ` · ${getMindLevel(mind.levelId).label}` : ''}`,
      done: mindToday > 0,
    },
  ]

  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar
        title="Bienestar"
        right={
          <Link
            to="/ajustes"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-lg text-gray-300 active:bg-white/10"
            aria-label="Ajustes"
          >
            ⚙️
          </Link>
        }
      />

      <div className="flex flex-col gap-2 p-4">
        {cards.map((c) => (
          <Link
            key={c.to}
            to={c.to}
            className="flex items-center gap-4 rounded-2xl bg-white/5 p-4 active:bg-white/10"
          >
            <span
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl text-2xl"
              style={{ background: `${c.theme.textHex}1f` }}
            >
              {c.theme.icon}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-lg font-semibold text-gray-100">{c.theme.label}</p>
              <p className="truncate text-base text-gray-500">{c.status}</p>
            </div>
            {c.done ? (
              <span className="text-xl" style={{ color: c.theme.textHex }} aria-label="completado">
                ✓
              </span>
            ) : (
              <span className="text-gray-600">›</span>
            )}
          </Link>
        ))}
      </div>
    </div>
  )
}

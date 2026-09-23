import { useEffect, useMemo, useState } from 'react'
import TopBar from '../components/TopBar'
import { Placeholder, Row, Section } from '../components/ui'
import { listSessions } from '../lib/store'
import type { WorkoutSession } from '../lib/types'

function monthLabel(iso: string): string {
  return new Date(iso).toLocaleDateString('es', { month: 'long', year: 'numeric' })
}

function weekdayShort(iso: string): string {
  return new Date(iso).toLocaleDateString('es', { weekday: 'short' }).replace('.', '')
}

export default function History() {
  const [sessions, setSessions] = useState<WorkoutSession[] | null>(null)

  useEffect(() => {
    listSessions().then(setSessions)
  }, [])

  // Agrupadas por mes, como la lista de Actividad de iOS.
  const groups = useMemo(() => {
    const out: { month: string; items: WorkoutSession[] }[] = []
    for (const s of sessions ?? []) {
      const m = monthLabel(s.startedAt)
      if (out.at(-1)?.month !== m) out.push({ month: m, items: [] })
      out.at(-1)!.items.push(s)
    }
    return out
  }, [sessions])

  return (
    <div className="flex flex-1 flex-col pb-8">
      <TopBar title="Historial" back="Ejercicios" large />

      {sessions === null && <Placeholder>Cargando…</Placeholder>}
      {sessions?.length === 0 && <Placeholder>Todavía no registraste entrenamientos.</Placeholder>}

      <div className="flex flex-col gap-7">
        {groups.map((g) => (
          <Section key={g.month} header={g.month}>
            {g.items.map((s) => {
              const totalSets = s.exercises.reduce((acc, se) => acc + se.sets.filter((set) => set.done).length, 0)
              return (
                <Row
                  key={s.id}
                  to={`/historial/${s.id}`}
                  leading={
                    <span className="flex w-10 shrink-0 flex-col items-center leading-none">
                      <span className="text-[11px] font-semibold uppercase text-fit-400">{weekdayShort(s.startedAt)}</span>
                      <span className="mt-0.5 text-[20px] font-semibold tabular-nums text-label">
                        {new Date(s.startedAt).getDate()}
                      </span>
                    </span>
                  }
                  title={<span className="capitalize">{s.routineName}</span>}
                  subtitle={`${s.exercises.length} ${s.exercises.length === 1 ? 'ejercicio' : 'ejercicios'} · ${totalSets} ${totalSets === 1 ? 'serie' : 'series'}`}
                  sepInset={68}
                  detail={
                    !s.finishedAt ? (
                      <span className="rounded-full bg-warn-500/20 px-2 py-0.5 text-[13px] font-medium text-warn-300">
                        En curso
                      </span>
                    ) : undefined
                  }
                />
              )
            })}
          </Section>
        ))}
      </div>
    </div>
  )
}

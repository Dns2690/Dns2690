import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import TopBar, { BarTextButton } from '../components/TopBar'
import ExercisePicker from '../components/ExercisePicker'
import Icon from '../components/Icon'
import { Button, Placeholder, Row, Section } from '../components/ui'
import { getExercise, imageUrl } from '../lib/exercises'
import { getSession, listSessions, saveSession } from '../lib/store'
import {
  formatKg,
  lastPerformance,
  parseReps,
  setHints,
  suggestLoad,
  type LastPerformance,
  type LoadSuggestion,
  type SetHint,
} from '../lib/progression'
import { addExerciseToSession, addSet, removeExercise, replaceExerciseInSession, updateSet } from '../lib/workout'
import type { SessionExercise, SetLog, WorkoutSession as Session } from '../lib/types'

interface RestTimerState {
  exerciseIndex: number
  secondsLeft: number
}

function formatTime(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60)
  const s = totalSeconds % 60
  return `${m}:${s.toString().padStart(2, '0')}`
}

const cellInput =
  'h-9 w-full rounded-lg bg-cell-2 px-2 text-center text-[17px] font-medium tabular-nums text-label placeholder:text-label-3 focus:outline-none focus:ring-2 focus:ring-fit-500'

export default function WorkoutSession() {
  const { sessionId = '' } = useParams()
  const navigate = useNavigate()
  const [session, setSession] = useState<Session | null | undefined>(undefined)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [swapIndex, setSwapIndex] = useState<number | null>(null)
  const [restTimer, setRestTimer] = useState<RestTimerState | null>(null)
  const [history, setHistory] = useState<Session[]>([])

  useEffect(() => {
    getSession(sessionId).then((s) => setSession(s ?? null))
    listSessions().then(setHistory)
  }, [sessionId])

  /**
   * Por ejercicio: qué hiciste la última vez, si toca subir el peso y qué se
   * precarga en cada serie. Se recalcula del historial; lo único que se guarda
   * en la sesión es la decisión sobre la sugerencia.
   */
  const guidance = useMemo(() => {
    if (!session) return []
    return session.exercises.map((se) => {
      const ex = getExercise(se.exerciseId)
      const last = lastPerformance(history, se.exerciseId, session.id)
      const target = parseReps(se.targetReps)
      const suggestion = ex ? suggestLoad(last, target, se.sets.length, ex.equipment) : null
      const accepted = se.loadChoice === 'accept' ? suggestion : null
      return { last, suggestion, hints: setHints(se.sets.length, last, target, accepted) }
    })
  }, [session, history])

  useEffect(() => {
    if (!restTimer) return
    if (restTimer.secondsLeft <= 0) {
      if (navigator.vibrate) navigator.vibrate([200, 100, 200])
      const t = setTimeout(() => setRestTimer(null), 1500)
      return () => clearTimeout(t)
    }
    const t = setTimeout(() => setRestTimer((r) => (r ? { ...r, secondsLeft: r.secondsLeft - 1 } : r)), 1000)
    return () => clearTimeout(t)
  }, [restTimer])

  async function persist(next: Session) {
    setSession(next)
    await saveSession(next)
  }

  function chooseLoad(exIdx: number, choice: 'accept' | 'ignore') {
    if (!session) return
    persist({
      ...session,
      exercises: session.exercises.map((e, i) => (i === exIdx ? { ...e, loadChoice: choice } : e)),
    })
  }

  function toggleSetDone(exIdx: number, setIdx: number, se: SessionExercise, set: SetLog, hint?: SetHint) {
    if (!session) return
    const nextDone = !set.done
    // Marcar una serie sin escribir nada la da por hecha con lo precargado:
    // repetir lo de la última vez tiene que costar un solo toque.
    const patch: Partial<SetLog> = { done: nextDone }
    if (nextDone && hint) {
      if (set.weight == null && hint.weight != null) patch.weight = hint.weight
      if (set.reps == null && hint.reps != null) patch.reps = hint.reps
    }
    persist(updateSet(session, exIdx, setIdx, patch))
    if (nextDone && se.restSeconds) {
      setRestTimer({ exerciseIndex: exIdx, secondsLeft: se.restSeconds })
    } else if (!nextDone && restTimer?.exerciseIndex === exIdx) {
      setRestTimer(null)
    }
  }

  async function handleFinish() {
    if (!session) return
    await persist({ ...session, finishedAt: new Date().toISOString() })
    if (session.programMeta) {
      navigate(`/programas/${session.programMeta.programId}`, { replace: true })
    } else {
      navigate(`/historial/${session.id}`, { replace: true })
    }
  }

  if (session === undefined || session === null) {
    return (
      <div className="flex flex-1 flex-col">
        <TopBar title="Entrenamiento" back />
        <Placeholder>{session === undefined ? 'Cargando…' : 'No se encontró el entrenamiento.'}</Placeholder>
      </div>
    )
  }

  const swapExercise = swapIndex != null ? getExercise(session.exercises[swapIndex].exerciseId) : null

  return (
    <div className="flex flex-1 flex-col pb-32">
      <TopBar
        title={session.routineName}
        back
        right={
          <BarTextButton bold onClick={handleFinish}>
            Terminar
          </BarTextButton>
        }
      />

      <div className="flex flex-col gap-6 pt-4">
        {session.exercises.map((se, exIdx) => {
          const ex = getExercise(se.exerciseId)
          if (!ex) return null
          const { last, suggestion, hints } = guidance[exIdx] ?? { last: null, suggestion: null, hints: [] }
          return (
            <section key={exIdx} className="px-4">
              <div className="overflow-hidden rounded-xl bg-cell">
                <div className="flex items-center gap-3 p-3 pl-4">
                  <button
                    type="button"
                    onClick={() => navigate(`/ejercicio/${ex.id}`)}
                    className="shrink-0 active:opacity-60"
                    aria-label={`Ver ${ex.name}`}
                  >
                    <img src={imageUrl(ex)} alt="" className="h-12 w-12 rounded-lg bg-white object-cover" />
                  </button>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[17px] font-semibold capitalize text-label">{ex.name}</p>
                    {(se.targetReps || se.restSeconds) && (
                      <p className="truncate text-[13px] text-fit-400">
                        {se.sets.length} × {se.targetReps ?? '?'}
                        {se.restSeconds ? ` · descanso ${se.restSeconds} s` : ''}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setSwapIndex(exIdx)}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-label-2 active:bg-press"
                    aria-label="Cambiar ejercicio"
                  >
                    <Icon name="repeat" size={20} />
                  </button>
                  <button
                    onClick={() => persist(removeExercise(session, exIdx))}
                    className="flex h-9 w-9 items-center justify-center rounded-full text-label-2 active:bg-press"
                    aria-label="Quitar ejercicio"
                  >
                    <Icon name="trash" size={19} />
                  </button>
                </div>

                <LoadGuidance
                  last={last}
                  suggestion={suggestion}
                  choice={se.loadChoice}
                  onChoose={(c) => chooseLoad(exIdx, c)}
                />

                {se.note && (
                  <p className="mx-4 mb-3 rounded-lg bg-fit-500/12 px-3 py-2 text-[13px] leading-snug text-fit-200">{se.note}</p>
                )}

                <div className="grid grid-cols-[2rem_1fr_1fr_2.25rem] items-center gap-x-2.5 gap-y-1.5 px-4 pb-3">
                  <span className="text-center text-[11px] font-semibold uppercase text-label-2">Serie</span>
                  <span className="text-center text-[11px] font-semibold uppercase text-label-2">Kg</span>
                  <span className="text-center text-[11px] font-semibold uppercase text-label-2">Reps</span>
                  <span />
                  {se.sets.map((set, setIdx) => (
                    <div key={setIdx} className="contents">
                      <span className={`text-center text-[17px] font-semibold tabular-nums ${set.done ? 'text-fit-400' : 'text-label-2'}`}>
                        {set.setNumber}
                      </span>
                      <input
                        type="number"
                        inputMode="decimal"
                        aria-label={`Peso serie ${set.setNumber}`}
                        placeholder={hints[setIdx]?.weight != null ? formatKg(hints[setIdx].weight!) : '–'}
                        value={set.weight ?? ''}
                        onChange={(e) =>
                          persist(
                            updateSet(session, exIdx, setIdx, {
                              weight: e.target.value === '' ? null : Number(e.target.value),
                            }),
                          )
                        }
                        className={cellInput}
                      />
                      <input
                        type="number"
                        inputMode="numeric"
                        aria-label={`Repeticiones serie ${set.setNumber}`}
                        placeholder={hints[setIdx]?.reps != null ? String(hints[setIdx].reps) : '–'}
                        value={set.reps ?? ''}
                        onChange={(e) =>
                          persist(
                            updateSet(session, exIdx, setIdx, {
                              reps: e.target.value === '' ? null : Number(e.target.value),
                            }),
                          )
                        }
                        className={cellInput}
                      />
                      <button
                        onClick={() => toggleSetDone(exIdx, setIdx, se, set, hints[setIdx])}
                        aria-label={set.done ? `Desmarcar serie ${set.setNumber}` : `Marcar serie ${set.setNumber}`}
                        aria-pressed={set.done}
                        className={`flex h-9 w-9 items-center justify-center rounded-full transition-colors ${
                          set.done ? 'bg-fit-500 text-black' : 'bg-cell-2 text-label-3'
                        }`}
                      >
                        <Icon name="check" size={18} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => persist(addSet(session, exIdx))}
                  className="hairline-t flex h-11 w-full items-center justify-center gap-1.5 text-[15px] font-semibold text-fit-400 active:bg-press"
                >
                  <Icon name="plus" size={16} strokeWidth={2.6} />
                  Agregar serie
                </button>
              </div>
            </section>
          )
        })}

        <Section>
          <Row
            onClick={() => setPickerOpen(true)}
            leading={
              <span className="flex h-[22px] w-[22px] shrink-0 items-center justify-center rounded-full bg-fit-500 text-black">
                <Icon name="plus" size={14} strokeWidth={3} />
              </span>
            }
            title={<span className="text-fit-400">Agregar ejercicio</span>}
          />
        </Section>

        <div className="px-4">
          <Button onClick={handleFinish} icon="check">
            Finalizar entrenamiento
          </Button>
        </div>
      </div>

      {pickerOpen && (
        <ExercisePicker
          onSelect={(e) => {
            persist(addExerciseToSession(session, e.id))
            setPickerOpen(false)
          }}
          onClose={() => setPickerOpen(false)}
        />
      )}

      {swapIndex != null && (
        <ExercisePicker
          title={swapExercise ? `Cambiar ${swapExercise.name}` : 'Cambiar ejercicio'}
          initialBodyPart={swapExercise?.body_part}
          onSelect={(e) => {
            persist(replaceExerciseInSession(session, swapIndex, e.id))
            setSwapIndex(null)
          }}
          onClose={() => setSwapIndex(null)}
        />
      )}

      {/* Flota encima de la barra de pestañas, como el mini reproductor de
          Música: taparla dejaría sin navegación mientras corre el descanso. */}
      {restTimer && (
        <div className="fixed inset-x-0 bottom-[calc(49px+env(safe-area-inset-bottom))] z-30 mx-auto w-full max-w-[560px] px-3 pb-2">
          <div className="material flex items-center gap-3 rounded-2xl px-4 py-3 shadow-[0_8px_30px_rgba(0,0,0,0.5)]">
            <Icon name="stopwatch" size={24} className="shrink-0 text-fit-400" />
            <div className="min-w-0 flex-1">
              <p className="text-[13px] text-label-2">{restTimer.secondsLeft <= 0 ? 'Descanso terminado' : 'Descanso'}</p>
              <p className="text-[28px] font-bold leading-none tabular-nums text-label">
                {formatTime(Math.max(0, restTimer.secondsLeft))}
              </p>
            </div>
            <button
              onClick={() => setRestTimer((r) => (r ? { ...r, secondsLeft: r.secondsLeft + 15 } : r))}
              className="h-[34px] rounded-full bg-cell-2 px-3.5 text-[15px] font-semibold text-label active:bg-press"
            >
              +15 s
            </button>
            <button
              onClick={() => setRestTimer(null)}
              className="h-[34px] rounded-full bg-fit-500 px-3.5 text-[15px] font-semibold text-black active:bg-fit-600"
            >
              Saltar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Lo que hiciste la última vez y, si corresponde, la sugerencia de subir. La
 * sugerencia se acepta o se ignora; una vez decidida queda una línea con lo
 * que se eligió, sin volver a insistir.
 */
function LoadGuidance({
  last,
  suggestion,
  choice,
  onChoose,
}: {
  last: LastPerformance | null
  suggestion: LoadSuggestion | null
  choice?: 'accept' | 'ignore'
  onChoose: (choice: 'accept' | 'ignore') => void
}) {
  if (!last) return null
  const summary = last.sets.map((s) => (s.weight ? `${formatKg(s.weight)}×${s.reps}` : `${s.reps}`)).join(' · ')
  const when = new Date(last.date).toLocaleDateString('es', { day: 'numeric', month: 'short' })

  return (
    <div className="mx-4 mb-3 flex flex-col gap-2">
      <p className="text-[13px] text-label-2">
        Última vez ({when}): <span className="tabular-nums text-label">{summary}</span>
      </p>
      {suggestion && !choice && (
        <div className="rounded-xl bg-fit-500/12 p-3">
          <div className="flex items-start gap-2.5">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-fit-500 text-black">
              <Icon name="arrow-up" size={14} strokeWidth={2.8} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[15px] font-semibold text-label">Subí a {formatKg(suggestion.to)} kg</p>
              <p className="text-[13px] leading-snug text-label-2">{suggestion.reason}. Te toca más peso.</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              onClick={() => onChoose('accept')}
              className="h-[34px] flex-1 rounded-full bg-fit-500 text-[15px] font-semibold text-black active:bg-fit-600"
            >
              Aplicar
            </button>
            <button
              onClick={() => onChoose('ignore')}
              className="h-[34px] flex-1 rounded-full bg-cell-2 text-[15px] font-semibold text-label active:bg-press"
            >
              Ahora no
            </button>
          </div>
        </div>
      )}
      {suggestion && choice === 'accept' && (
        <p className="flex items-center gap-1.5 text-[13px] font-semibold text-fit-400">
          <Icon name="arrow-up" size={14} strokeWidth={2.8} />
          Objetivo de hoy: {formatKg(suggestion.to)} kg
        </p>
      )}
    </div>
  )
}

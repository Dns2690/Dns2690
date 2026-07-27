import { createStore, get, set, del, keys } from 'idb-keyval'
import type { Routine, WorkoutSession } from './types'

const store = createStore('mis-ejercicios', 'data')

const ROUTINE_PREFIX = 'routine:'
const SESSION_PREFIX = 'session:'

function uid(): string {
  return crypto.randomUUID()
}

export async function listRoutines(): Promise<Routine[]> {
  const allKeys = (await keys(store)) as string[]
  const routines = await Promise.all(
    allKeys.filter((k) => k.startsWith(ROUTINE_PREFIX)).map((k) => get<Routine>(k, store)),
  )
  return routines
    .filter((r): r is Routine => !!r)
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
}

export async function getRoutine(id: string): Promise<Routine | undefined> {
  return get<Routine>(ROUTINE_PREFIX + id, store)
}

export async function saveRoutine(routine: Omit<Routine, 'id' | 'createdAt' | 'updatedAt'> & Partial<Pick<Routine, 'id' | 'createdAt'>>): Promise<Routine> {
  const now = new Date().toISOString()
  const id = routine.id ?? uid()
  const existing = routine.id ? await getRoutine(routine.id) : undefined
  const full: Routine = {
    id,
    name: routine.name,
    exercises: routine.exercises,
    createdAt: existing?.createdAt ?? routine.createdAt ?? now,
    updatedAt: now,
  }
  await set(ROUTINE_PREFIX + id, full, store)
  return full
}

export async function deleteRoutine(id: string): Promise<void> {
  await del(ROUTINE_PREFIX + id, store)
}

export async function listSessions(): Promise<WorkoutSession[]> {
  const allKeys = (await keys(store)) as string[]
  const sessions = await Promise.all(
    allKeys.filter((k) => k.startsWith(SESSION_PREFIX)).map((k) => get<WorkoutSession>(k, store)),
  )
  return sessions
    .filter((s): s is WorkoutSession => !!s)
    .sort((a, b) => b.startedAt.localeCompare(a.startedAt))
}

export async function getSession(id: string): Promise<WorkoutSession | undefined> {
  return get<WorkoutSession>(SESSION_PREFIX + id, store)
}

export async function saveSession(session: WorkoutSession): Promise<void> {
  await set(SESSION_PREFIX + session.id, session, store)
}

export async function deleteSession(id: string): Promise<void> {
  await del(SESSION_PREFIX + id, store)
}

export function newSessionId(): string {
  return uid()
}

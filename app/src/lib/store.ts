import { createStore, get, set, del, keys } from 'idb-keyval'
import type {
  KegelSession,
  KegelSettings,
  KegelTest,
  MeasurementEntry,
  Profile,
  Routine,
  WorkoutSession,
} from './types'

export const store = createStore('mis-ejercicios', 'data')

const ROUTINE_PREFIX = 'routine:'
const SESSION_PREFIX = 'session:'
const MEASUREMENT_PREFIX = 'measurement:'
const KEGEL_SESSION_PREFIX = 'kegelsession:'
const KEGEL_TEST_PREFIX = 'kegeltest:'
const KEGEL_SETTINGS_KEY = 'kegelsettings'
const PROFILE_KEY = 'profile'

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

export async function listMeasurements(): Promise<MeasurementEntry[]> {
  const allKeys = (await keys(store)) as string[]
  const entries = await Promise.all(
    allKeys.filter((k) => k.startsWith(MEASUREMENT_PREFIX)).map((k) => get<MeasurementEntry>(k, store)),
  )
  return entries
    .filter((e): e is MeasurementEntry => !!e)
    .sort((a, b) => b.date.localeCompare(a.date))
}

export async function getMeasurement(id: string): Promise<MeasurementEntry | undefined> {
  return get<MeasurementEntry>(MEASUREMENT_PREFIX + id, store)
}

export async function saveMeasurement(
  entry: Omit<MeasurementEntry, 'id'> & Partial<Pick<MeasurementEntry, 'id'>>,
): Promise<MeasurementEntry> {
  const id = entry.id ?? uid()
  const full: MeasurementEntry = { ...entry, id }
  await set(MEASUREMENT_PREFIX + id, full, store)
  return full
}

export async function deleteMeasurement(id: string): Promise<void> {
  await del(MEASUREMENT_PREFIX + id, store)
}

export async function listKegelSessions(): Promise<KegelSession[]> {
  const allKeys = (await keys(store)) as string[]
  const sessions = await Promise.all(
    allKeys.filter((k) => k.startsWith(KEGEL_SESSION_PREFIX)).map((k) => get<KegelSession>(k, store)),
  )
  return sessions
    .filter((s): s is KegelSession => !!s)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
}

export async function saveKegelSession(session: Omit<KegelSession, 'id'>): Promise<KegelSession> {
  const full: KegelSession = { ...session, id: uid() }
  await set(KEGEL_SESSION_PREFIX + full.id, full, store)
  return full
}

export async function listKegelTests(): Promise<KegelTest[]> {
  const allKeys = (await keys(store)) as string[]
  const tests = await Promise.all(
    allKeys.filter((k) => k.startsWith(KEGEL_TEST_PREFIX)).map((k) => get<KegelTest>(k, store)),
  )
  return tests.filter((t): t is KegelTest => !!t).sort((a, b) => b.date.localeCompare(a.date))
}

export async function saveKegelTest(test: Omit<KegelTest, 'id'>): Promise<KegelTest> {
  const full: KegelTest = { ...test, id: uid() }
  await set(KEGEL_TEST_PREFIX + full.id, full, store)
  return full
}

export async function deleteKegelTest(id: string): Promise<void> {
  await del(KEGEL_TEST_PREFIX + id, store)
}

export async function getKegelSettings(): Promise<KegelSettings | undefined> {
  return get<KegelSettings>(KEGEL_SETTINGS_KEY, store)
}

export async function saveKegelSettings(settings: KegelSettings): Promise<void> {
  await set(KEGEL_SETTINGS_KEY, settings, store)
}

export async function getProfile(): Promise<Profile | undefined> {
  return get<Profile>(PROFILE_KEY, store)
}

export async function saveProfile(profile: Profile): Promise<void> {
  await set(PROFILE_KEY, profile, store)
}

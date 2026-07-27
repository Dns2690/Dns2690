import { entries, set, clear } from 'idb-keyval'
import { store } from './store'

export interface BackupFile {
  app: 'mis-ejercicios'
  version: 1
  exportedAt: string
  data: Record<string, unknown>
}

export async function exportBackup(): Promise<BackupFile> {
  const all = await entries(store)
  const data: Record<string, unknown> = {}
  for (const [k, v] of all) data[String(k)] = v
  return { app: 'mis-ejercicios', version: 1, exportedAt: new Date().toISOString(), data }
}

export async function importBackup(file: unknown): Promise<number> {
  if (!file || typeof file !== 'object' || !('data' in file) || typeof (file as BackupFile).data !== 'object') {
    throw new Error('El archivo no tiene el formato esperado.')
  }
  const { data } = file as BackupFile
  const entriesToImport = Object.entries(data)
  for (const [k, v] of entriesToImport) {
    await set(k, v, store)
  }
  return entriesToImport.length
}

export async function clearAllData(): Promise<void> {
  await clear(store)
}

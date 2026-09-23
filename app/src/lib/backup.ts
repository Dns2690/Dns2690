import { entries, set, clear } from 'idb-keyval'
import { store } from './store'

export interface BackupFile {
  app: 'mis-ejercicios'
  version: 1
  exportedAt: string
  data: Record<string, unknown>
}

/**
 * Claves que no viajan en el respaldo: son estado momentáneo del editor, no
 * registros. Restaurarlas en otro teléfono haría aparecer el aviso de "algo sin
 * guardar" de la nada.
 */
const SKIP_PREFIXES = ['routinedraft:']

export async function exportBackup(): Promise<BackupFile> {
  const all = await entries(store)
  const data: Record<string, unknown> = {}
  for (const [k, v] of all) {
    const key = String(k)
    if (SKIP_PREFIXES.some((p) => key.startsWith(p))) continue
    data[key] = v
  }
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

import type { MeasurementComputed, MeasurementEntry, Profile } from './types'

export interface MetricConfig {
  key: 'weightKg' | 'chestCm' | 'waistCm' | 'hipsCm' | 'armCm' | 'legCm' | 'neckCm'
  label: string
  unit: string
  icon: string
}

export const METRICS: MetricConfig[] = [
  { key: 'weightKg', label: 'Peso', unit: 'kg', icon: '⚖️' },
  { key: 'hipsCm', label: 'Glúteos', unit: 'cm', icon: '🍑' },
  { key: 'waistCm', label: 'Cintura', unit: 'cm', icon: '📏' },
  { key: 'chestCm', label: 'Pecho', unit: 'cm', icon: '📏' },
  { key: 'legCm', label: 'Pierna', unit: 'cm', icon: '📏' },
  { key: 'armCm', label: 'Brazo', unit: 'cm', icon: '📏' },
  { key: 'neckCm', label: 'Cuello', unit: 'cm', icon: '📏' },
]

export function metricSeries(entries: MeasurementEntry[], key: MetricConfig['key']): { date: string; value: number }[] {
  return entries
    .filter((e) => e[key] != null)
    .map((e) => ({ date: e.date, value: e[key] as number }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

export interface DerivedMetricConfig {
  key: keyof MeasurementComputed
  label: string
  unit: string
  icon: string
  precision: number
}

export const DERIVED_METRICS: DerivedMetricConfig[] = [
  { key: 'bodyFatPercent', label: '% Grasa corporal', unit: '%', icon: '🔥', precision: 1 },
  { key: 'bmi', label: 'IMC', unit: '', icon: '📊', precision: 1 },
  { key: 'waistHipRatio', label: 'Cintura/Cadera', unit: '', icon: '📐', precision: 2 },
]

export function derivedSeries(
  entries: MeasurementEntry[],
  key: DerivedMetricConfig['key'],
): { date: string; value: number }[] {
  return entries
    .filter((e) => e.computed?.[key] != null)
    .map((e) => ({ date: e.date, value: e.computed![key] as number }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

function log10(x: number): number {
  return Math.log(x) / Math.LN10
}

function round1(n: number): number {
  return Math.round(n * 10) / 10
}

/**
 * Fórmula Navy (US Navy body fat method): solo necesita cinta métrica.
 * Hombres: cintura y cuello. Mujeres: cintura, cadera y cuello.
 * Requiere altura y sexo cargados en el perfil.
 */
export function computeDerived(
  entry: Pick<MeasurementEntry, 'waistCm' | 'hipsCm' | 'neckCm' | 'weightKg'>,
  profile: Profile | null,
): MeasurementComputed {
  const heightCm = profile?.heightCm ?? null
  const sex = profile?.sex ?? null
  const { waistCm, hipsCm, neckCm, weightKg } = entry

  let bodyFatPercent: number | null = null
  if (heightCm && waistCm && neckCm && sex) {
    if (sex === 'male' && waistCm - neckCm > 0) {
      const denom = 1.0324 - 0.19077 * log10(waistCm - neckCm) + 0.15456 * log10(heightCm)
      bodyFatPercent = 495 / denom - 450
    } else if (sex === 'female' && hipsCm && waistCm + hipsCm - neckCm > 0) {
      const denom = 1.29579 - 0.35004 * log10(waistCm + hipsCm - neckCm) + 0.22100 * log10(heightCm)
      bodyFatPercent = 495 / denom - 450
    }
    if (bodyFatPercent != null) {
      bodyFatPercent = round1(bodyFatPercent)
      if (bodyFatPercent < 2 || bodyFatPercent > 70) bodyFatPercent = null
    }
  }

  let bmi: number | null = null
  if (heightCm && weightKg) {
    const h = heightCm / 100
    bmi = round1(weightKg / (h * h))
  }

  let fatMassKg: number | null = null
  let leanMassKg: number | null = null
  if (bodyFatPercent != null && weightKg) {
    fatMassKg = round1(weightKg * (bodyFatPercent / 100))
    leanMassKg = round1(weightKg - fatMassKg)
  }

  let waistHipRatio: number | null = null
  if (waistCm && hipsCm) {
    waistHipRatio = Math.round((waistCm / hipsCm) * 100) / 100
  }

  return { bodyFatPercent, bmi, leanMassKg, fatMassKg, waistHipRatio }
}

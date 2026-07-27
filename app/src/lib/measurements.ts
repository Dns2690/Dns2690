import type { MeasurementEntry } from './types'

export interface MetricConfig {
  key: 'weightKg' | 'chestCm' | 'waistCm' | 'hipsCm' | 'armCm' | 'legCm'
  label: string
  unit: string
  icon: string
}

export const METRICS: MetricConfig[] = [
  { key: 'weightKg', label: 'Peso', unit: 'kg', icon: '⚖️' },
  { key: 'chestCm', label: 'Pecho', unit: 'cm', icon: '📏' },
  { key: 'waistCm', label: 'Cintura', unit: 'cm', icon: '📏' },
  { key: 'hipsCm', label: 'Glúteos', unit: 'cm', icon: '📏' },
  { key: 'armCm', label: 'Brazo', unit: 'cm', icon: '📏' },
  { key: 'legCm', label: 'Pierna', unit: 'cm', icon: '📏' },
]

export function metricSeries(entries: MeasurementEntry[], key: MetricConfig['key']): { date: string; value: number }[] {
  return entries
    .filter((e) => e[key] != null)
    .map((e) => ({ date: e.date, value: e[key] as number }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

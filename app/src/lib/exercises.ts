import raw from '../data/exercises.json'
import type { Exercise } from './types'

export const exercises = raw as Exercise[]

const byId = new Map(exercises.map((e) => [e.id, e]))

export function getExercise(id: string): Exercise | undefined {
  return byId.get(id)
}

const MEDIA_BASE = 'https://raw.githubusercontent.com/hasaneyldrm/exercises-dataset/main/'

export function imageUrl(e: Pick<Exercise, 'image'>): string {
  return MEDIA_BASE + e.image
}

export function gifUrl(e: Pick<Exercise, 'gif_url'>): string {
  return MEDIA_BASE + e.gif_url
}

export const BODY_PART_LABELS: Record<string, string> = {
  back: 'Espalda',
  cardio: 'Cardio',
  chest: 'Pecho',
  'lower arms': 'Antebrazos',
  'lower legs': 'Piernas (inferior)',
  neck: 'Cuello',
  shoulders: 'Hombros',
  'upper arms': 'Brazos',
  'upper legs': 'Piernas (superior)',
  waist: 'Abdomen',
}

export const EQUIPMENT_LABELS: Record<string, string> = {
  assisted: 'Asistido',
  band: 'Banda',
  barbell: 'Barra',
  'body weight': 'Peso corporal',
  'bosu ball': 'Bosu',
  cable: 'Polea',
  dumbbell: 'Mancuerna',
  'elliptical machine': 'Elíptica',
  'ez barbell': 'Barra Z',
  hammer: 'Hammer',
  kettlebell: 'Kettlebell',
  'leverage machine': 'Máquina de palanca',
  'medicine ball': 'Balón medicinal',
  'olympic barbell': 'Barra olímpica',
  'resistance band': 'Banda de resistencia',
  roller: 'Rodillo',
  rope: 'Cuerda',
  'skierg machine': 'SkiErg',
  'sled machine': 'Trineo',
  'smith machine': 'Máquina Smith',
  'stability ball': 'Balón de estabilidad',
  'stationary bike': 'Bicicleta fija',
  'stepmill machine': 'Escaladora',
  tire: 'Neumático',
  'trap bar': 'Barra hexagonal',
  'upper body ergometer': 'Ergómetro de brazos',
  weighted: 'Con peso',
  'wheel roller': 'Rueda abdominal',
}

export function bodyPartLabel(v: string): string {
  return BODY_PART_LABELS[v] ?? v
}

export function equipmentLabel(v: string): string {
  return EQUIPMENT_LABELS[v] ?? v
}

export const ALL_BODY_PARTS = Array.from(new Set(exercises.map((e) => e.body_part))).sort((a, b) =>
  bodyPartLabel(a).localeCompare(bodyPartLabel(b), 'es'),
)

export const ALL_EQUIPMENT = Array.from(new Set(exercises.map((e) => e.equipment))).sort((a, b) =>
  equipmentLabel(a).localeCompare(equipmentLabel(b), 'es'),
)

export interface ExerciseFilters {
  query?: string
  bodyPart?: string
  equipment?: string
}

export function filterExercises({ query, bodyPart, equipment }: ExerciseFilters): Exercise[] {
  const q = query?.trim().toLowerCase()
  return exercises.filter((e) => {
    if (bodyPart && e.body_part !== bodyPart) return false
    if (equipment && e.equipment !== equipment) return false
    if (q && !(e.name.toLowerCase().includes(q) || e.target.toLowerCase().includes(q))) return false
    return true
  })
}

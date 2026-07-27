import type { ProgramInfo } from '../../lib/types'
import { YEAR1 } from './year1'
import { FULLBODY_GYM } from './fullbodyGym'
import { LEGS_GLUTES_GYM } from './legsGlutesGym'
export { WEEKS_PER_MONTH } from './shared'

export const PROGRAMS: ProgramInfo[] = [YEAR1, FULLBODY_GYM, LEGS_GLUTES_GYM]

export function getProgramInfo(id: string): ProgramInfo | undefined {
  return PROGRAMS.find((p) => p.id === id)
}

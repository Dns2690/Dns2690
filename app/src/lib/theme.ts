import type { IconName, Tone } from '../components/Icon'

export type ModuleId = 'fitness' | 'kegel' | 'mindfulness'

export interface ModuleTheme {
  id: ModuleId
  label: string
  icon: IconName
  tone: Tone
  /** Acento de UI: botones, íconos, tinte. */
  hex: string
  /** Versión para texto sobre negro o sobre celda. */
  textHex: string
  /** Escalón para marcas de datos (gráficos, tira de constancia). */
  dataHex: string
  text: string
  strongText: string
  solid: string
  solidActive: string
  softBg: string
  softBorder: string
  ring: string
  dot: string
}

/**
 * Un tono por módulo, en dos roles.
 *
 * El acento es el color de la interfaz: el verde neón de ejercicios da 15.7:1
 * sobre negro, el azul de Kegel 5.8:1 y el morado de meditación 6.0:1, y el
 * glifo negro de los íconos tiene ese mismo contraste encima de cada uno.
 *
 * Los datos usan otro escalón del mismo tono, validado con los tres juntos
 * sobre #000: dentro de la banda de luminosidad y con el peor par bajo
 * daltonismo en ΔE 10.4 (el mínimo es 8). Los acentos no sirven para eso: el
 * azul y el morado de iOS se confunden en protanopía (ΔE 4.3), y el neón,
 * como marca de datos, encandila al lado de los otros.
 */
export const MODULE_THEMES: Record<ModuleId, ModuleTheme> = {
  fitness: {
    id: 'fitness',
    label: 'Ejercicios',
    icon: 'dumbbell',
    tone: 'fit',
    hex: '#3cff73',
    textHex: '#3cff73',
    dataHex: '#16af49',
    text: 'text-fit-400',
    strongText: 'text-fit-300',
    solid: 'bg-fit-500',
    solidActive: 'active:bg-fit-600',
    softBg: 'bg-fit-500/12',
    softBorder: 'border-fit-500/30',
    ring: 'ring-fit-400',
    dot: 'bg-fit-400',
  },
  kegel: {
    id: 'kegel',
    label: 'Kegel',
    icon: 'pulse',
    tone: 'kegel',
    hex: '#0a84ff',
    textHex: '#409cff',
    dataHex: '#085dc7',
    text: 'text-kegel-400',
    strongText: 'text-kegel-300',
    solid: 'bg-kegel-500',
    solidActive: 'active:bg-kegel-600',
    softBg: 'bg-kegel-500/15',
    softBorder: 'border-kegel-500/30',
    ring: 'ring-kegel-400',
    dot: 'bg-kegel-400',
  },
  mindfulness: {
    id: 'mindfulness',
    label: 'Mindfulness',
    icon: 'lotus',
    tone: 'mind',
    hex: '#bf5af2',
    textHex: '#c77ef4',
    dataHex: '#b95dfc',
    text: 'text-mind-400',
    strongText: 'text-mind-300',
    solid: 'bg-mind-500',
    solidActive: 'active:bg-mind-600',
    softBg: 'bg-mind-500/15',
    softBorder: 'border-mind-500/30',
    ring: 'ring-mind-400',
    dot: 'bg-mind-400',
  },
}

/**
 * Módulo al que pertenece una ruta, para teñir el menú y las cabeceras.
 *
 * La portada '/' es de ejercicios: la app se dedica a eso. '/bienestar' no tiene
 * módulo propio porque es solo la puerta a los otros dos.
 */
export function moduleForPath(pathname: string): ModuleId | null {
  if (pathname.startsWith('/kegel')) return 'kegel'
  if (pathname.startsWith('/mindfulness')) return 'mindfulness'
  if (
    pathname === '/' ||
    pathname.startsWith('/biblioteca') ||
    pathname.startsWith('/ejercicio/') ||
    pathname.startsWith('/programas') ||
    pathname.startsWith('/rutinas') ||
    pathname.startsWith('/entrenar') ||
    pathname.startsWith('/historial')
  ) {
    return 'fitness'
  }
  return null
}

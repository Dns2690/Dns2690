export type ModuleId = 'fitness' | 'kegel' | 'mindfulness'

export interface ModuleTheme {
  id: ModuleId
  label: string
  icon: string
  /** Color de marca del módulo, validado contra la superficie oscura. */
  hex: string
  /** Versión clara del mismo tono, para texto sobre fondo casi negro. */
  textHex: string
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
 * Un tono por módulo.
 *
 * Los tres colores base salieron de validar la paleta contra la superficie real
 * de la app (#0b0d12): quedan dentro de la misma banda de luminosidad —así
 * ningún módulo se ve más "fuerte" que otro— y su separación mínima bajo
 * daltonismo es ΔE 13.9 en protanopía, muy por encima del piso de 8.
 *
 * El texto usa el escalón 400 del mismo tono: sobre un fondo casi negro, el
 * color de relleno queda demasiado apagado para leerse cómodo. Lo que
 * identifica al módulo es el tono, no el escalón exacto.
 */
export const MODULE_THEMES: Record<ModuleId, ModuleTheme> = {
  fitness: {
    id: 'fitness',
    label: 'Ejercicios',
    icon: '🏋️',
    hex: '#0891b2',
    textHex: '#22d3ee',
    text: 'text-cyan-400',
    strongText: 'text-cyan-300',
    solid: 'bg-cyan-500',
    solidActive: 'active:bg-cyan-400',
    softBg: 'bg-cyan-500/10',
    softBorder: 'border-cyan-500/30',
    ring: 'ring-cyan-400',
    dot: 'bg-cyan-400',
  },
  kegel: {
    id: 'kegel',
    label: 'Kegel',
    icon: '🌊',
    hex: '#f43f5e',
    textHex: '#fb7185',
    text: 'text-rose-400',
    strongText: 'text-rose-300',
    solid: 'bg-rose-500',
    solidActive: 'active:bg-rose-400',
    softBg: 'bg-rose-500/10',
    softBorder: 'border-rose-500/30',
    ring: 'ring-rose-400',
    dot: 'bg-rose-400',
  },
  mindfulness: {
    id: 'mindfulness',
    label: 'Mindfulness',
    icon: '🧘',
    hex: '#8b5cf6',
    textHex: '#a78bfa',
    text: 'text-violet-400',
    strongText: 'text-violet-300',
    solid: 'bg-violet-500',
    solidActive: 'active:bg-violet-400',
    softBg: 'bg-violet-500/10',
    softBorder: 'border-violet-500/30',
    ring: 'ring-violet-400',
    dot: 'bg-violet-400',
  },
}

/** Módulo al que pertenece una ruta, para teñir el menú y las cabeceras. */
export function moduleForPath(pathname: string): ModuleId | null {
  if (pathname.startsWith('/kegel')) return 'kegel'
  if (pathname.startsWith('/mindfulness')) return 'mindfulness'
  if (
    pathname.startsWith('/ejercicios') ||
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

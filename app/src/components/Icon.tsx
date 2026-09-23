import type { ReactNode } from 'react'

/**
 * Set de íconos propio de Soma.
 *
 * Todos comparten la misma gramática, que es lo que los hace verse como una
 * familia y no como emojis sueltos: grilla de 24, trazo de 2, remates y uniones
 * redondeados, y el dibujo dentro de 3–21 para que tengan el mismo peso óptico.
 * Los pocos rellenos (play, destello, puntos) son formas que a trazo se verían
 * flacas a tamaño chico.
 */
const GLYPHS = {
  // ── Navegación y acciones ──────────────────────────────────────────────────
  'chevron-right': <path d="M9.5 5.5 16 12l-6.5 6.5" />,
  'chevron-left': <path d="M14.5 5.5 8 12l6.5 6.5" />,
  'chevron-down': <path d="M5.5 9.5 12 16l6.5-6.5" />,
  plus: <path d="M12 5v14M5 12h14" />,
  close: <path d="M6.5 6.5l11 11M17.5 6.5l-11 11" />,
  check: <path d="M5 12.5 9.5 17 19 7" />,
  trash: <path d="M4 7h16M9.5 7V4.5h5V7M6.5 7l1 12.5h9l1-12.5M10.2 11v5M13.8 11v5" />,
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m15.5 15.5 4.5 4.5" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5.5" />
      <circle cx="12" cy="7.6" r="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  gear: (
    <>
      <path d="M18.40 9.42L20.83 10.28L20.83 13.72L18.40 14.58L18.35 14.70L19.46 17.03L17.03 19.46L14.70 18.35L14.58 18.40L13.72 20.83L10.28 20.83L9.42 18.40L9.30 18.35L6.97 19.46L4.54 17.03L5.65 14.70L5.60 14.58L3.17 13.72L3.17 10.28L5.60 9.42L5.65 9.30L4.54 6.97L6.97 4.54L9.30 5.65L9.42 5.60L10.28 3.17L13.72 3.17L14.58 5.60L14.70 5.65L17.03 4.54L19.46 6.97L18.35 9.30Z" />
      <circle cx="12" cy="12" r="2.8" />
    </>
  ),
  edit: <path d="M4 20h4L19 9l-4-4L4 16v4ZM13.5 6.5l4 4" />,
  share: <path d="M12 14.5V3.5M7.5 8 12 3.5 16.5 8M7 11H5.5v9.5h13V11H17" />,
  download: <path d="M12 3.5v11M7.5 10 12 14.5 16.5 10M5 20h14" />,
  repeat: <path d="M4.5 11V9.5A3.5 3.5 0 0 1 8 6h11.5M16.5 3l3 3-3 3M19.5 13v1.5A3.5 3.5 0 0 1 16 18H4.5M7.5 21l-3-3 3-3" />,
  play: <path d="M8 5.2v13.6a.8.8 0 0 0 1.2.7l10.6-6.8a.8.8 0 0 0 0-1.4L9.2 4.5A.8.8 0 0 0 8 5.2Z" fill="currentColor" stroke="none" />,
  pause: (
    <>
      <rect x="6.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none" />
      <rect x="13.5" y="5" width="4" height="14" rx="1.2" fill="currentColor" stroke="none" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.2 2" />
    </>
  ),
  calendar: (
    <>
      <rect x="4" y="5" width="16" height="15" rx="3" />
      <path d="M4 10h16M8.5 3v4M15.5 3v4" />
    </>
  ),
  user: (
    <>
      <circle cx="12" cy="8.5" r="3.8" />
      <path d="M4.8 20.2a7.2 7.2 0 0 1 14.4 0" />
    </>
  ),
  'arrow-up': <path d="M12 19.5v-15M6 10.5l6-6 6 6" />,

  // ── Secciones de ejercicios ────────────────────────────────────────────────
  dumbbell: (
    <>
      <rect x="5.2" y="6.5" width="3.3" height="11" rx="1.2" />
      <rect x="15.5" y="6.5" width="3.3" height="11" rx="1.2" />
      <path d="M8.5 12h7M2.8 9.8v4.4M21.2 9.8v4.4" />
    </>
  ),
  kettlebell: (
    <path d="M6.2 14.2a5.8 5.8 0 0 1 11.6 0c0 2.4-.7 4.4-1.7 6.1H7.9c-1-1.7-1.7-3.7-1.7-6.1ZM8.2 9.8 7.4 6.9A1.6 1.6 0 0 1 9 4.8h6a1.6 1.6 0 0 1 1.6 2.1l-.8 2.9" />
  ),
  list: (
    <>
      <path d="M9.5 6.5h10M9.5 12h10M9.5 17.5h10" />
      <circle cx="5" cy="6.5" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="5" cy="12" r="1.3" fill="currentColor" stroke="none" />
      <circle cx="5" cy="17.5" r="1.3" fill="currentColor" stroke="none" />
    </>
  ),
  stopwatch: (
    <>
      <circle cx="12" cy="13.5" r="7.5" />
      <path d="M12 13.5V9.5M9.5 2.8h5M12 2.8V6M18 6.5l1.6-1.6" />
    </>
  ),
  target: (
    <>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.6" fill="currentColor" stroke="none" />
    </>
  ),
  book: <path d="M12 6.5C10 5 7.5 4.5 3.5 4.5v13.5c4 0 6.5.5 8.5 2 2-1.5 4.5-2 8.5-2V4.5c-4 0-6.5.5-8.5 2ZM12 6.5V20" />,
  bars: <path d="M5 20v-6M10 20V9M15 20v-4M20 20V5" />,
  trend: <path d="M3.5 17.5 9 12l4 3.5L20.5 7M15 7h5.5v5.5" />,
  flame: (
    <path d="M12 2.8c1 3.3 6.5 6 6.5 11.4a6.5 6.5 0 0 1-13 0c0-3 1.5-5.2 3.4-6.8.1 2.3 1 3.7 2.3 4.3-.3-3.7-.3-6.3.8-8.9ZM12 21a2.7 2.7 0 0 1-2.7-2.7c0-1.9 1.6-2.9 2.7-4.6 1.1 1.7 2.7 2.7 2.7 4.6A2.7 2.7 0 0 1 12 21Z" />
  ),
  trophy: (
    <>
      <path d="M7.5 4h9v4.5a4.5 4.5 0 0 1-9 0V4ZM7.5 6.2H5.2a2.8 2.8 0 0 0 3 3.4M16.5 6.2h2.3a2.8 2.8 0 0 1-3 3.4" />
      <path d="M12 13v3.5M8.5 20.5h7M9.5 16.5h5l.5 4h-6l.5-4Z" />
    </>
  ),
  sparkle: (
    <path
      d="M12 2.5c.7 5 3.5 7.8 9.5 9.5-6 1.7-8.8 4.5-9.5 9.5-.7-5-3.5-7.8-9.5-9.5 6-1.7 8.8-4.5 9.5-9.5Z"
      fill="currentColor"
      stroke="none"
    />
  ),

  // ── Bienestar ───────────────────────────────────────────────────────────────
  leaf: <path d="M19.5 4.5C10.5 4.5 4.5 9 4.5 16c0 1.4.3 2.6.8 3.7M19.5 4.5c0 9.5-5 15.5-12 15.5-.9 0-1.6-.1-2.2-.3M5.3 19.7C8.3 15 11.7 12 16 9.5" />,
  pulse: (
    <>
      <circle cx="12" cy="12" r="2.4" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="5.8" />
      <circle cx="12" cy="12" r="9.2" strokeOpacity="0.55" />
    </>
  ),
  lotus: (
    <path d="M12 20c-3.8 0-7.8-2.4-8.8-6.6 3.2 0 6.3 1.7 8.8 6.6Zm0 0c3.8 0 7.8-2.4 8.8-6.6-3.2 0-6.3 1.7-8.8 6.6Zm0 0c-2.6-2.6-3.6-5.7-3-9.8C10.3 8 12 6.5 12 4.5c0 2 1.7 3.5 3 5.7.6 4.1-.4 7.2-3 9.8Z" />
  ),
  wind: <path d="M3 9h11.5A2.5 2.5 0 1 0 12 6.5M3 13h15a2.5 2.5 0 1 1-2.5 2.5M3 17h7" />,
  moon: <path d="M19.5 14.5A8 8 0 1 1 9.5 4.5a6.5 6.5 0 0 0 10 10Z" />,
  bell: <path d="M6 16v-5a6 6 0 0 1 12 0v5l1.5 2.2h-15L6 16ZM10 20.5a2.1 2.1 0 0 0 4 0" />,
  mic: (
    <>
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M9 21h6" />
    </>
  ),
  speaker: <path d="M4 9.5h3.5L12 5.5v13l-4.5-4H4v-5ZM15.5 9a4 4 0 0 1 0 6M18.2 6.3a7.8 7.8 0 0 1 0 11.4" />,
  music: (
    <>
      <path d="M9 18V6l10.5-2v12" />
      <circle cx="6.5" cy="18" r="2.5" />
      <circle cx="17" cy="16" r="2.5" />
    </>
  ),
  vibrate: (
    <>
      <rect x="8" y="4" width="8" height="16" rx="2.2" />
      <path d="M4.8 9v6M19.2 9v6M2 10.5v3M22 10.5v3" />
    </>
  ),

  // ── Ejercicios de Kegel ─────────────────────────────────────────────────────
  key: (
    <>
      <circle cx="8" cy="15.5" r="4" />
      <path d="m11 12.5 8.5-8.5M16 7.5l2.2 2.2M13.8 9.7l1.6 1.6" />
    </>
  ),
  hourglass: <path d="M6.5 3.5h11M6.5 20.5h11M8 3.5c0 5 8 5 8 8.5s-8 3.5-8 8.5M16 3.5c0 5-8 5-8 8.5s8 3.5 8 8.5" />,
  clamp: <path d="M3.5 12h6M7 8.8 10 12l-3 3.2M20.5 12h-6M17 8.8 14 12l3 3.2M12 4.5v15" />,
  wave: <path d="M2.5 12c1.6-3.2 3.2-3.2 4.8 0s3.2 3.2 4.8 0 3.2-3.2 4.8 0 3.2 3.2 4.8 0" />,
  bolt: <path d="M13.5 2.8 5 13.5h6.2L10.5 21.2 19 10.5h-6.2l.7-7.7Z" />,
  steps: <path d="M3.5 19.5h4.5v-4h4v-4h4v-4h4.5" />,
  mountain: <path d="M2.8 19.5 9.5 8l4 6.8 2.6-3.6 5.1 8.3H2.8Z" />,
  shield: <path d="M12 3 19.5 6v5.5c0 4.5-3 8-7.5 9.5-4.5-1.5-7.5-5-7.5-9.5V6L12 3Z" />,
  infinity: <path d="M12 12c-2-3-3.5-4-5.5-4a4 4 0 0 0 0 8c2 0 3.5-1 5.5-4s3.5-4 5.5-4a4 4 0 0 1 0 8c-2 0-3.5-1-5.5-4Z" />,
  elevator: (
    <>
      <rect x="4" y="3" width="16" height="18" rx="3" />
      <path d="m9 10.5 3-3 3 3M9 13.5l3 3 3-3" />
    </>
  ),

  // ── Medidas ─────────────────────────────────────────────────────────────────
  scale: (
    <>
      <rect x="3.5" y="4" width="17" height="16" rx="4" />
      <path d="M8.3 10a5 5 0 0 1 7.4 0M12 11.8l1.6-2.4" />
    </>
  ),
  tape: (
    <>
      <rect x="3" y="5.5" width="13" height="13" rx="3.5" />
      <circle cx="9.5" cy="12" r="2.3" />
      <path d="M16 15.5h5v-2.5" />
    </>
  ),
  ruler: <path d="M3.5 16.5 16.5 3.5l4 4-13 13-4-4ZM7 13l2 2M10 10l2 2M13 7l2 2" />,
  ratio: (
    <>
      <path d="M5 12h14" />
      <circle cx="12" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      <circle cx="12" cy="17.5" r="1.5" fill="currentColor" stroke="none" />
    </>
  ),
} satisfies Record<string, ReactNode>

export type IconName = keyof typeof GLYPHS

export default function Icon({
  name,
  size = 24,
  className,
  strokeWidth = 2,
  label,
}: {
  name: IconName
  size?: number
  className?: string
  strokeWidth?: number
  /** Si está, el ícono se anuncia; si no, es decorativo y se oculta al lector. */
  label?: string
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {GLYPHS[name]}
    </svg>
  )
}

export type Tone = 'fit' | 'kegel' | 'mind' | 'gray' | 'warn' | 'danger'

const TILE_BG: Record<Tone, string> = {
  fit: 'bg-fit-500',
  kegel: 'bg-kegel-500',
  mind: 'bg-mind-500',
  gray: 'bg-[#8e8e93]',
  warn: 'bg-warn-500',
  danger: 'bg-danger-500',
}

const TILE_SIZE = {
  // 29 pt es el tamaño exacto de los íconos de Ajustes en iOS.
  sm: { box: 29, glyph: 18, radius: 7 },
  md: { box: 36, glyph: 21, radius: 9 },
  lg: { box: 48, glyph: 28, radius: 12 },
  xl: { box: 64, glyph: 36, radius: 15 },
}

/**
 * Glifo negro sobre un cuadrado redondeado del color del módulo, como los
 * íconos de Ajustes de iOS. El negro es a propósito: sobre el verde neón da
 * 15.7:1 y sobre el azul y el morado cerca de 6:1, más que el blanco.
 */
export function IconTile({
  name,
  tone = 'fit',
  size = 'sm',
  className = '',
}: {
  name: IconName
  tone?: Tone
  size?: keyof typeof TILE_SIZE
  className?: string
}) {
  const s = TILE_SIZE[size]
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center text-black ${TILE_BG[tone]} ${className}`}
      style={{ width: s.box, height: s.box, borderRadius: s.radius }}
      aria-hidden
    >
      <Icon name={name} size={s.glyph} strokeWidth={2.2} />
    </span>
  )
}

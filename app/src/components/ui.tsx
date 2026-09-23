import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import Icon, { IconTile, type IconName, type Tone } from './Icon'

/*
 * Piezas de interfaz con la anatomía de UIKit.
 *
 * Las medidas no son aproximadas: filas de 44 pt mínimo, celdas agrupadas con
 * esquinas de 12 y 16 pt de margen, separadores de medio punto que arrancan
 * donde arranca el texto (no en el borde), botones grandes de 50 pt con
 * esquinas de 14, switch de 51×31. Es lo que hace que algo "se sienta iOS".
 */

// ── Listas agrupadas ──────────────────────────────────────────────────────────

export function Section({
  header,
  footer,
  children,
  className = '',
}: {
  header?: ReactNode
  footer?: ReactNode
  children: ReactNode
  className?: string
}) {
  return (
    <section className={`px-4 ${className}`}>
      {header && <h2 className="px-4 pb-1.5 text-[13px] uppercase tracking-wide text-label-2">{header}</h2>}
      <div className="ios-list overflow-hidden rounded-xl bg-cell">{children}</div>
      {footer && <p className="px-4 pt-1.5 text-[13px] leading-snug text-label-2">{footer}</p>}
    </section>
  )
}

interface RowProps {
  title: ReactNode
  subtitle?: ReactNode
  /** Valor a la derecha, en gris (como "Principiante ›" en Ajustes). */
  detail?: ReactNode
  icon?: IconName
  tone?: Tone
  /** Contenido propio a la izquierda en lugar del ícono (una miniatura, un número). */
  leading?: ReactNode
  /** Control a la derecha en lugar del chevron (un switch). */
  trailing?: ReactNode
  to?: string
  onClick?: () => void
  chevron?: boolean
  destructive?: boolean
  disabled?: boolean
  /** Dónde arranca el separador de arriba, si el contenido propio no mide lo estándar. */
  sepInset?: number
  /** Deja el subtítulo en hasta dos líneas en vez de cortarlo en una. */
  wrap?: boolean
}

export function Row({
  title,
  subtitle,
  detail,
  icon,
  tone = 'fit',
  leading,
  trailing,
  to,
  onClick,
  chevron,
  destructive,
  disabled,
  sepInset,
  wrap,
}: RowProps) {
  const interactive = !!(to || onClick) && !disabled
  const showChevron = chevron ?? (!!to && !trailing)
  const hasLeading = !!(icon || leading)

  const body = (
    <>
      {icon && <IconTile name={icon} tone={tone} />}
      {leading}
      <div className="min-w-0 flex-1 py-[11px]">
        <p
          className={`truncate text-[17px] leading-[22px] ${
            destructive ? 'text-danger-400' : disabled ? 'text-label-3' : 'text-label'
          }`}
        >
          {title}
        </p>
        {subtitle && (
          <p className={`mt-0.5 text-[15px] leading-5 text-label-2 ${wrap ? 'line-clamp-2' : 'truncate'}`}>{subtitle}</p>
        )}
      </div>
      {detail !== undefined && <span className="shrink-0 text-[17px] text-label-2">{detail}</span>}
      {trailing}
      {showChevron && <Icon name="chevron-right" size={18} strokeWidth={2.4} className="-mr-1 shrink-0 text-label-3" />}
    </>
  )

  const className = `flex min-h-11 w-full items-center gap-3 px-4 text-left ${
    interactive ? 'active:bg-press' : ''
  } ${disabled ? 'pointer-events-none' : ''}`
  // El separador arranca donde arranca el texto: después del ícono si lo hay.
  const inset = sepInset ?? (hasLeading ? (leading ? 76 : 58) : 16)
  const style = { ['--sep-inset' as string]: `${inset}px` }

  if (to && !disabled) {
    return (
      <Link to={to} className={className} style={style}>
        {body}
      </Link>
    )
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} disabled={disabled} className={className} style={style}>
        {body}
      </button>
    )
  }
  return (
    <div className={className} style={style}>
      {body}
    </div>
  )
}

// ── Botones ───────────────────────────────────────────────────────────────────

const FILLED: Record<Tone, string> = {
  fit: 'bg-fit-500 text-black active:bg-fit-600',
  kegel: 'bg-kegel-500 text-black active:bg-kegel-600',
  mind: 'bg-mind-500 text-black active:bg-mind-600',
  gray: 'bg-cell-2 text-label active:bg-press',
  warn: 'bg-warn-500 text-black active:opacity-80',
  danger: 'bg-danger-500 text-black active:opacity-80',
}

const TINTED: Record<Tone, string> = {
  fit: 'bg-fit-500/15 text-fit-400 active:bg-fit-500/25',
  kegel: 'bg-kegel-500/20 text-kegel-300 active:bg-kegel-500/30',
  mind: 'bg-mind-500/20 text-mind-300 active:bg-mind-500/30',
  gray: 'bg-cell-2 text-label active:bg-press',
  warn: 'bg-warn-500/20 text-warn-300 active:bg-warn-500/30',
  danger: 'bg-danger-500/20 text-danger-400 active:bg-danger-500/30',
}

const PLAIN: Record<Tone, string> = {
  fit: 'text-fit-400',
  kegel: 'text-kegel-400',
  mind: 'text-mind-400',
  gray: 'text-label-2',
  warn: 'text-warn-400',
  danger: 'text-danger-400',
}

const SIZES = {
  lg: 'h-[50px] rounded-[14px] px-5 text-[17px] font-semibold',
  md: 'h-11 rounded-xl px-4 text-[17px] font-semibold',
  sm: 'h-[30px] rounded-full px-3.5 text-[15px] font-semibold',
}

export function Button({
  children,
  variant = 'filled',
  tone = 'fit',
  size = 'lg',
  icon,
  full = true,
  to,
  onClick,
  disabled,
  type = 'button',
  className = '',
}: {
  children: ReactNode
  variant?: 'filled' | 'tinted' | 'plain'
  tone?: Tone
  size?: keyof typeof SIZES
  icon?: IconName
  full?: boolean
  to?: string
  onClick?: () => void
  disabled?: boolean
  type?: 'button' | 'submit'
  className?: string
}) {
  const skin = variant === 'filled' ? FILLED[tone] : variant === 'tinted' ? TINTED[tone] : PLAIN[tone]
  const cls = `inline-flex items-center justify-center gap-2 transition-[background-color,opacity] ${
    variant === 'plain' ? `${size === 'sm' ? 'text-[15px]' : 'text-[17px]'} active:opacity-50` : SIZES[size]
  } ${full && variant !== 'plain' ? 'w-full' : ''} ${skin} disabled:opacity-35 disabled:pointer-events-none ${className}`
  const content = (
    <>
      {icon && <Icon name={icon} size={size === 'sm' ? 16 : 20} strokeWidth={2.3} />}
      {children}
    </>
  )
  if (to && !disabled) {
    return (
      <Link to={to} className={cls}>
        {content}
      </Link>
    )
  }
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={cls}>
      {content}
    </button>
  )
}

// ── Control segmentado ────────────────────────────────────────────────────────

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  label,
}: {
  options: { value: T; label: string }[]
  value: T
  onChange: (value: T) => void
  label?: string
}) {
  return (
    <div role="radiogroup" aria-label={label} className="flex rounded-[9px] bg-[#767680]/25 p-[2px]">
      {options.map((o) => {
        const selected = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.value)}
            className={`h-7 min-w-0 flex-1 truncate rounded-[7px] px-2 text-[13px] font-semibold transition-colors ${
              selected ? 'bg-[#636366] text-label shadow-[0_3px_8px_rgba(0,0,0,0.12),0_3px_1px_rgba(0,0,0,0.04)]' : 'text-label'
            }`}
          >
            {o.label}
          </button>
        )
      })}
    </div>
  )
}

// ── Switch ────────────────────────────────────────────────────────────────────

const SWITCH_ON: Record<Tone, string> = {
  fit: 'bg-fit-500',
  kegel: 'bg-kegel-500',
  mind: 'bg-mind-500',
  gray: 'bg-[#8e8e93]',
  warn: 'bg-warn-500',
  danger: 'bg-danger-500',
}

export function Toggle({
  checked,
  onChange,
  tone = 'fit',
  label,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  tone?: Tone
  label: string
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative h-[31px] w-[51px] shrink-0 rounded-full transition-colors duration-200 ${
        checked ? SWITCH_ON[tone] : 'bg-[#39393d]'
      }`}
    >
      <span
        className={`absolute top-[2px] left-[2px] h-[27px] w-[27px] rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.15),0_3px_1px_rgba(0,0,0,0.06)] transition-transform duration-200 ${
          checked ? 'translate-x-5' : ''
        }`}
      />
    </button>
  )
}

// ── Búsqueda y selección ──────────────────────────────────────────────────────

/** Barra de búsqueda de iOS: relleno gris translúcido, lupa y 36 pt de alto. */
export function SearchField({
  value,
  onChange,
  placeholder = 'Buscar',
  autoFocus,
}: {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  autoFocus?: boolean
}) {
  return (
    <label className="flex h-9 items-center gap-1.5 rounded-[10px] bg-[#767680]/25 px-2 text-label-2">
      <Icon name="search" size={17} strokeWidth={2.3} />
      <input
        type="search"
        value={value}
        autoFocus={autoFocus}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="min-w-0 flex-1 bg-transparent text-[17px] text-label placeholder:text-label-2 focus:outline-none [&::-webkit-search-cancel-button]:hidden"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          aria-label="Borrar búsqueda"
          className="flex h-5 w-5 items-center justify-center rounded-full bg-label-2 text-black"
        >
          <Icon name="close" size={12} strokeWidth={3} />
        </button>
      )}
    </label>
  )
}

/**
 * Selector con forma de pastilla. Por debajo es un <select> nativo, así que en
 * el iPhone abre la rueda del sistema, que es justamente lo que se espera.
 */
export function SelectPill({
  value,
  onChange,
  options,
  label,
  active,
}: {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  label: string
  /** Resalta la pastilla cuando hay un filtro aplicado. */
  active?: boolean
}) {
  const current = options.find((o) => o.value === value)?.label ?? label
  return (
    <label
      className={`relative inline-flex h-8 shrink-0 items-center gap-1 rounded-full pl-3.5 pr-2.5 text-[15px] font-medium ${
        active ? 'bg-fit-500 text-black' : 'bg-cell-2 text-label'
      }`}
    >
      <span className="max-w-[40vw] truncate">{current}</span>
      <Icon name="chevron-down" size={14} strokeWidth={2.6} />
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={label}
        className="absolute inset-0 cursor-pointer opacity-0"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  )
}

// ── Otros ─────────────────────────────────────────────────────────────────────

/** Círculo con iniciales, como el avatar de Contactos. */
export function Avatar({ name, size = 36 }: { name?: string | null; size?: number }) {
  const initials =
    (name ?? '')
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? '')
      .join('') || '·'
  return (
    <span
      className="inline-flex shrink-0 items-center justify-center rounded-full bg-gradient-to-b from-[#a5a5aa] to-[#848489] font-semibold text-white"
      style={{ width: size, height: size, fontSize: size * 0.42 }}
      aria-hidden
    >
      {initials}
    </span>
  )
}

/** Pantalla vacía o de carga, centrada y discreta. */
export function Placeholder({ children }: { children: ReactNode }) {
  return <p className="px-8 py-12 text-center text-[15px] leading-snug text-label-2">{children}</p>
}

/** Cifra destacada con su rótulo, para tarjetas de resumen. */
export function Stat({ value, label, tone }: { value: ReactNode; label: ReactNode; tone?: Tone }) {
  return (
    <div className="min-w-0 flex-1">
      <p className="text-[13px] font-semibold uppercase tracking-wide text-label-2">{label}</p>
      <p className={`mt-0.5 text-[28px] font-bold leading-tight tracking-tight tabular-nums ${tone ? PLAIN[tone] : 'text-label'}`}>
        {value}
      </p>
    </div>
  )
}

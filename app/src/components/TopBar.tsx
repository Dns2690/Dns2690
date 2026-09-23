import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Icon, { type IconName } from './Icon'
import { moduleForPath } from '../lib/theme'

const TINT = {
  fitness: 'text-fit-400',
  kegel: 'text-kegel-400',
  mindfulness: 'text-mind-400',
} as const

/**
 * Barra de navegación de iOS.
 *
 * Con `large`, el título va grande debajo de la barra y la barra queda
 * transparente; al hacer scroll y taparse el título grande, aparece el título
 * chico centrado y la barra toma el material translúcido con su línea fina.
 * Sin `large` es la barra compacta de las pantallas de detalle.
 *
 * El tinte (flecha de volver, acciones) sigue al módulo de la ruta, así una
 * pantalla de Kegel no tiene una flecha verde.
 */
export default function TopBar({
  title,
  back,
  right,
  large = false,
  subtitle,
}: {
  title: string
  /** `true` muestra solo la flecha; un texto la acompaña con ese rótulo. */
  back?: boolean | string
  right?: ReactNode
  large?: boolean
  /** Línea chica sobre el título grande, como la fecha en la app Fitness. */
  subtitle?: string
}) {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const tint = TINT[moduleForPath(pathname) ?? 'fitness']

  const titleRef = useRef<HTMLHeadingElement>(null)
  const [collapsed, setCollapsed] = useState(!large)

  useEffect(() => {
    if (!large || !titleRef.current) return
    const observer = new IntersectionObserver(
      ([entry]) => setCollapsed(!entry.isIntersecting),
      // Descuenta la barra: el título grande "se va" cuando pasa por debajo de
      // ella, no cuando sale de la pantalla.
      { rootMargin: '-52px 0px 0px 0px', threshold: 0 },
    )
    observer.observe(titleRef.current)
    return () => observer.disconnect()
  }, [large])

  return (
    <>
      <header
        className={`sticky top-0 z-20 pt-[env(safe-area-inset-top)] transition-[background-color,box-shadow] duration-200 ${
          collapsed ? 'material hairline-b' : 'bg-black'
        }`}
      >
        <div className="relative flex h-11 items-center px-2">
          <div className="flex min-w-0 flex-1 items-center">
            {back && (
              <button
                onClick={() => navigate(-1)}
                className={`flex h-11 items-center gap-0.5 pr-2 active:opacity-50 ${tint}`}
                aria-label="Volver"
              >
                <Icon name="chevron-left" size={26} strokeWidth={2.4} />
                {typeof back === 'string' && <span className="-ml-0.5 text-[17px]">{back}</span>}
              </button>
            )}
          </div>
          <p
            className={`pointer-events-none absolute inset-x-24 truncate text-center text-[17px] font-semibold text-label transition-opacity duration-200 ${
              collapsed ? 'opacity-100' : 'opacity-0'
            }`}
            aria-hidden={large ? true : undefined}
          >
            {title}
          </p>
          <div className={`flex min-w-0 flex-1 items-center justify-end ${tint}`}>{right}</div>
        </div>
      </header>
      {large && (
        <div className="px-4 pb-3">
          {subtitle && (
            <p className="text-[13px] font-semibold uppercase tracking-wide text-label-2">{subtitle}</p>
          )}
          <h1 ref={titleRef} className="text-[34px] font-bold leading-[41px] tracking-[-0.02em] text-label">
            {title}
          </h1>
        </div>
      )}
    </>
  )
}

/** Botón de ícono para el lado derecho de la barra; toma el tinte del módulo. */
export function BarButton({
  icon,
  label,
  onClick,
  to,
}: {
  icon: IconName
  label: string
  onClick?: () => void
  to?: string
}) {
  const className = 'flex h-11 w-11 items-center justify-center active:opacity-50'
  if (to) {
    return (
      <Link to={to} className={className} aria-label={label}>
        <Icon name={icon} size={24} />
      </Link>
    )
  }
  return (
    <button onClick={onClick} className={className} aria-label={label}>
      <Icon name={icon} size={24} />
    </button>
  )
}

/** Acción de texto en la barra ("Listo", "Guardar"), en el tinte del módulo. */
export function BarTextButton({
  children,
  onClick,
  disabled,
  bold,
}: {
  children: ReactNode
  onClick: () => void
  disabled?: boolean
  bold?: boolean
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`h-11 px-2 text-[17px] active:opacity-50 disabled:opacity-30 ${bold ? 'font-semibold' : ''}`}
    >
      {children}
    </button>
  )
}

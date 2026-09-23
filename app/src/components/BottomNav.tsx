import { Link, useLocation } from 'react-router-dom'
import Icon, { type IconName } from './Icon'

interface NavItem {
  to: string
  label: string
  icon: IconName
  /** Rutas que dejan esta pestaña encendida, además de la propia. */
  owns: string[]
}

/**
 * Barra de pestañas de iOS: material translúcido, glifos de 25 pt y rótulos
 * de 10 pt.
 *
 * Tres pestañas de ejercicios y una para el resto. La portada es directamente
 * la de ejercicios —la app se dedica a eso—, así que no hay "Inicio" aparte.
 * Como en cualquier app de iOS hay un solo tinte, el verde: Bienestar se
 * enciende en verde igual que las demás aunque adentro todo sea azul y morado.
 */
const items: NavItem[] = [
  { to: '/', label: 'Ejercicios', icon: 'dumbbell', owns: ['/biblioteca', '/ejercicio/', '/programas', '/historial'] },
  { to: '/rutinas', label: 'Rutinas', icon: 'list', owns: ['/plan'] },
  { to: '/entrenar', label: 'Entrenar', icon: 'stopwatch', owns: [] },
  { to: '/bienestar', label: 'Bienestar', icon: 'leaf', owns: ['/kegel', '/mindfulness'] },
]

function isActive(item: NavItem, pathname: string): boolean {
  // La portada solo coincide exacta: como es '/', cualquier prefijo la
  // encendería en toda la app.
  if (item.to === '/' ? pathname === '/' : pathname.startsWith(item.to)) return true
  return item.owns.some((p) => pathname.startsWith(p))
}

export default function BottomNav() {
  const { pathname } = useLocation()

  return (
    <nav className="material hairline-t sticky bottom-0 z-20 flex pb-[env(safe-area-inset-bottom)]">
      {items.map((item) => {
        const active = isActive(item, pathname)
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={active ? 'page' : undefined}
            className={`flex h-[49px] flex-1 flex-col items-center justify-center gap-[3px] pt-1 ${
              active ? 'text-fit-400' : 'text-[#8e8e93]'
            }`}
          >
            <Icon name={item.icon} size={25} strokeWidth={active ? 2.2 : 1.9} />
            <span className="text-[10px] font-medium leading-none tracking-[0.01em]">{item.label}</span>
          </Link>
        )
      })}
    </nav>
  )
}

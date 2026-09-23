import { Link, useLocation } from 'react-router-dom'
import { MODULE_THEMES, type ModuleId } from '../lib/theme'

interface NavItem {
  to: string
  label: string
  icon: string
  module: ModuleId | null
  /** Rutas que dejan esta pestaña encendida, además de la propia. */
  owns: string[]
}

/**
 * Tres pestañas de ejercicios y una para el resto.
 *
 * La portada es directamente la de ejercicios —la app se dedica a eso—, así que
 * no hay pestaña "Inicio" aparte. Kegel y Mindfulness comparten la última,
 * Bienestar, que queda encendida mientras estés dentro de cualquiera de los dos.
 */
const items: NavItem[] = [
  {
    to: '/',
    label: 'Ejercicios',
    icon: '🏋️',
    module: 'fitness',
    owns: ['/biblioteca', '/ejercicio/', '/programas', '/historial'],
  },
  { to: '/rutinas', label: 'Rutinas', icon: '📋', module: 'fitness', owns: [] },
  { to: '/entrenar', label: 'Entrenar', icon: '⏱️', module: 'fitness', owns: [] },
  { to: '/bienestar', label: 'Bienestar', icon: '🌿', module: null, owns: ['/kegel', '/mindfulness'] },
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
    <nav className="sticky bottom-0 z-20 flex border-t border-white/10 bg-[#0b0d12]/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      {items.map((item) => {
        const active = isActive(item, pathname)
        return (
          <Link
            key={item.to}
            to={item.to}
            aria-current={active ? 'page' : undefined}
            className="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs"
            // El activo toma el color de su módulo: la app se tiñe según dónde
            // estás parado, sin necesidad de leer la etiqueta.
            style={{
              color: active ? (item.module ? MODULE_THEMES[item.module].textHex : '#e5e7eb') : '#9ca3af',
            }}
          >
            <span className="text-lg leading-none">{item.icon}</span>
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}

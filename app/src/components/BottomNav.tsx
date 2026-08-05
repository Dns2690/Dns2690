import { NavLink } from 'react-router-dom'
import { MODULE_THEMES, type ModuleId } from '../lib/theme'

const items: { to: string; label: string; icon: string; end: boolean; module: ModuleId | null }[] = [
  { to: '/', label: 'Inicio', icon: '🏠', end: true, module: null },
  { to: '/ejercicios', label: 'Ejercicios', icon: '🏋️', end: false, module: 'fitness' },
  { to: '/kegel', label: 'Kegel', icon: '🌊', end: false, module: 'kegel' },
  { to: '/mindfulness', label: 'Mindfulness', icon: '🧘', end: false, module: 'mindfulness' },
]

export default function BottomNav() {
  return (
    <nav
      className="sticky bottom-0 z-20 flex border-t border-white/10 bg-[#0b0d12]/95 backdrop-blur pb-[env(safe-area-inset-bottom)]"
    >
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className="flex flex-1 flex-col items-center gap-0.5 py-2 text-xs"
          // El activo toma el color de su módulo: la app se tiñe según dónde
          // estás parado, sin necesidad de leer la etiqueta.
          style={({ isActive }) => ({
            color: isActive
              ? item.module
                ? MODULE_THEMES[item.module].textHex
                : '#e5e7eb'
              : '#9ca3af',
          })}
        >
          <span className="text-lg leading-none">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

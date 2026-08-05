import { NavLink } from 'react-router-dom'

const items = [
  { to: '/', label: 'Inicio', icon: '🏠', end: true },
  { to: '/ejercicios', label: 'Ejercicios', icon: '🏋️', end: false },
  { to: '/kegel', label: 'Kegel', icon: '🌊', end: false },
  { to: '/mindfulness', label: 'Mindfulness', icon: '🧘', end: false },
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
          className={({ isActive }) =>
            `flex flex-1 flex-col items-center gap-0.5 py-2 text-xs ${
              isActive ? 'text-cyan-400' : 'text-gray-400'
            }`
          }
        >
          <span className="text-lg leading-none">{item.icon}</span>
          {item.label}
        </NavLink>
      ))}
    </nav>
  )
}

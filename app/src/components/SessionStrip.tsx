import { useEffect, useRef } from 'react'

export interface StripItem {
  label: string
  isRest: boolean
}

/**
 * Tira horizontal con la secuencia de la rutina.
 *
 * Durante el ejercicio no hay forma de saber qué viene después sin salirse, y
 * eso desconcentra. La tira muestra el orden completo y se desliza sola para
 * centrar el tramo en curso, que va resaltado; lo ya hecho queda tenue y lo que
 * falta, en gris medio.
 */
export default function SessionStrip({
  items,
  activeIndex,
}: {
  items: StripItem[]
  activeIndex: number
}) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const el = containerRef.current?.children[activeIndex] as HTMLElement | undefined
    // `block: 'nearest'` evita que centrar horizontalmente arrastre también el
    // scroll vertical de la página.
    el?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [activeIndex])

  return (
    <div
      ref={containerRef}
      className="flex items-center gap-2 overflow-x-auto px-[45%] py-1"
      aria-label="Secuencia de la rutina"
    >
      {items.map((item, i) => {
        const active = i === activeIndex
        const done = i < activeIndex
        return (
          <span
            key={i}
            aria-current={active ? 'step' : undefined}
            className={`shrink-0 whitespace-nowrap rounded-full px-3 py-1.5 text-sm transition-colors ${
              active
                ? 'bg-kegel-500 font-semibold text-black'
                : done
                  ? 'text-label-3'
                  : item.isRest
                    ? 'text-label-3'
                    : 'text-label-2'
            }`}
          >
            {item.label}
          </span>
        )
      })}
    </div>
  )
}

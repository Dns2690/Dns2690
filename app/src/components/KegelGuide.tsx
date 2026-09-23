import { forwardRef, useImperativeHandle, useRef, type ReactNode } from 'react'

export interface KegelGuideHandle {
  /** Intensidad de contracción 0–1. */
  setIntensity: (value: number) => void
  /** Avance del bloque actual 0–1. */
  setProgress: (value: number) => void
}

const RADIUS = 96
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Guía visual de contracción.
 *
 * El disco crece y se satura proporcionalmente a la intensidad del paso, así
 * marca la *rampa* de fuerza y no solo el momento de apretar. Es deliberadamente
 * grande y opaco: durante el ejercicio se mira de reojo, y un halo sutil no se
 * registra con la vista periférica.
 *
 * La animación se escribe directo en el DOM desde el bucle de reproducción en
 * vez de pasar por estado de React: a 60 cuadros por segundo, re-renderizar el
 * árbol desincronizaría la luz del número.
 */
/**
 * Contraer es azul (el color de Kegel) y alargar es lavanda. No es decoración:
 * confundir un Reverse Kegel con uno normal invierte el efecto del ejercicio,
 * así que la diferencia tiene que verse de un vistazo, también para un
 * daltónico. Por eso no es el morado de iOS: contra el azul se confunde en
 * protanopía (ΔE 4.3); el lavanda, más claro, separa ΔE 9.3.
 *
 * La respiración de Mindfulness usa el morado del módulo: ahí no hay azul al
 * lado con el que confundirlo, y la familia violeta significa "aflojar" en
 * toda la app.
 */
const MODE_GRADIENT: Record<'contract' | 'lengthen' | 'breath', string> = {
  contract:
    'radial-gradient(circle, rgba(94,170,255,0.95) 0%, rgba(10,132,255,0.85) 42%, rgba(0,88,208,0.45) 66%, rgba(10,132,255,0) 78%)',
  lengthen:
    'radial-gradient(circle, rgba(236,196,255,0.95) 0%, rgba(218,143,255,0.85) 42%, rgba(176,98,230,0.45) 66%, rgba(218,143,255,0) 78%)',
  breath:
    'radial-gradient(circle, rgba(212,154,246,0.9) 0%, rgba(191,90,242,0.72) 44%, rgba(140,50,200,0.38) 68%, rgba(191,90,242,0) 80%)',
}

const KegelGuide = forwardRef<
  KegelGuideHandle,
  { children: ReactNode; mode?: 'contract' | 'lengthen' | 'breath' }
>(function KegelGuide({ children, mode = 'contract' }, ref) {
  const discRef = useRef<HTMLDivElement>(null)
  const arcRef = useRef<SVGCircleElement>(null)
  const dotRef = useRef<SVGCircleElement>(null)

  useImperativeHandle(ref, () => ({
    setIntensity(value: number) {
      const v = Math.min(1, Math.max(0, value))
      if (discRef.current) {
        discRef.current.style.transform = `scale(${0.52 + v * 0.62})`
        discRef.current.style.opacity = String(0.1 + v * 0.9)
      }
    },
    setProgress(value: number) {
      const v = Math.min(1, Math.max(0, value))
      if (arcRef.current) {
        arcRef.current.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - v))
      }
      if (dotRef.current) {
        // El SVG está rotado -90°, así que el ángulo 0 cae arriba.
        const angle = 2 * Math.PI * v
        dotRef.current.setAttribute('cx', String(100 + RADIUS * Math.cos(angle)))
        dotRef.current.setAttribute('cy', String(100 + RADIUS * Math.sin(angle)))
      }
    },
  }))

  return (
    <div className="relative flex h-[330px] w-full items-center justify-center">
      <div
        ref={discRef}
        aria-hidden="true"
        className="absolute h-[330px] w-[330px] rounded-full"
        style={{
          background: MODE_GRADIENT[mode],
          transform: 'scale(0.52)',
          opacity: 0.1,
          willChange: 'transform, opacity',
        }}
      />

      <svg viewBox="0 0 200 200" className="absolute h-[212px] w-[212px] -rotate-90" aria-hidden="true">
        <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#ffffff" strokeOpacity={0.22} strokeWidth={1.5} />
        <circle
          ref={arcRef}
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          stroke="#ffffff"
          strokeOpacity={0.75}
          strokeWidth={4}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          style={{ willChange: 'stroke-dashoffset' }}
        />
        <circle ref={dotRef} cx={100} cy={100 - RADIUS} r={6} fill="#ffffff" />
      </svg>

      <div className="relative flex h-[184px] w-[184px] flex-col items-center justify-center rounded-full bg-black text-center">
        {children}
      </div>
    </div>
  )
})

export default KegelGuide

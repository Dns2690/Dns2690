import { forwardRef, useImperativeHandle, useRef, type ReactNode } from 'react'

export interface KegelGuideHandle {
  /** Intensidad de contracción 0–1. */
  setIntensity: (value: number) => void
  /** Avance total de la rutina 0–1. */
  setProgress: (value: number) => void
}

const RADIUS = 92
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

/**
 * Guía visual de contracción. El halo crece y se ilumina proporcionalmente a la
 * intensidad del paso actual, así marca la *rampa* de fuerza y no solo el
 * momento de apretar.
 *
 * La animación se escribe directo en el DOM desde el bucle de reproducción en
 * vez de pasar por estado de React: a 60 cuadros por segundo, re-renderizar el
 * árbol desincronizaría la luz del número.
 */
const KegelGuide = forwardRef<KegelGuideHandle, { children: ReactNode }>(function KegelGuide(
  { children },
  ref,
) {
  const glowRef = useRef<HTMLDivElement>(null)
  const coreRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef<SVGCircleElement>(null)

  useImperativeHandle(ref, () => ({
    setIntensity(value: number) {
      const v = Math.min(1, Math.max(0, value))
      if (glowRef.current) {
        glowRef.current.style.transform = `scale(${0.68 + v * 0.5})`
        glowRef.current.style.opacity = String(0.22 + v * 0.78)
      }
      if (coreRef.current) {
        coreRef.current.style.borderColor = `rgba(34, 211, 238, ${0.12 + v * 0.68})`
      }
    },
    setProgress(value: number) {
      const v = Math.min(1, Math.max(0, value))
      if (progressRef.current) {
        progressRef.current.style.strokeDashoffset = String(CIRCUMFERENCE * (1 - v))
      }
    },
  }))

  return (
    <div className="relative flex h-[300px] w-full items-center justify-center">
      <div
        ref={glowRef}
        aria-hidden="true"
        className="absolute h-[300px] w-[300px] rounded-full blur-2xl"
        style={{
          background:
            'radial-gradient(circle, rgba(34,211,238,0.62) 0%, rgba(34,211,238,0.26) 45%, rgba(34,211,238,0) 70%)',
          transform: 'scale(0.68)',
          opacity: 0.22,
          willChange: 'transform, opacity',
        }}
      />

      <svg
        viewBox="0 0 200 200"
        className="absolute h-[200px] w-[200px] -rotate-90"
        aria-hidden="true"
      >
        <circle cx="100" cy="100" r={RADIUS} fill="none" stroke="#ffffff" strokeOpacity={0.08} strokeWidth={2} />
        <circle
          ref={progressRef}
          cx="100"
          cy="100"
          r={RADIUS}
          fill="none"
          stroke="#22d3ee"
          strokeWidth={2}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={CIRCUMFERENCE}
          style={{ willChange: 'stroke-dashoffset' }}
        />
      </svg>

      <div
        ref={coreRef}
        className="relative flex h-[170px] w-[170px] flex-col items-center justify-center rounded-full border-2 bg-[#0b0d12]/85 text-center"
        style={{ borderColor: 'rgba(34, 211, 238, 0.12)' }}
      >
        {children}
      </div>
    </div>
  )
})

export default KegelGuide

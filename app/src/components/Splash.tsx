import { useEffect, useState } from 'react'
import Icon from './Icon'
import SomaMark from './SomaMark'

const GITHUB_PATH =
  'M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.26 5.68.42.36.78 1.08.78 2.18 0 1.58-.01 2.85-.01 3.24 0 .3.2.66.79.55A11.5 11.5 0 0 0 23.5 12c0-6.27-5.23-11.5-11.5-11.5Z'

/**
 * Presentación de 4 segundos: los tres arcos de la marca se dibujan, aparece
 * el nombre y al final la firma. Negro puro, como el resto de la app.
 */
export default function Splash({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 3400)
    const t2 = setTimeout(onDone, 4000)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDone])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center overflow-hidden bg-black transition-opacity duration-[600ms] ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <SomaMark size={112} animated />

      <p
        className="mt-6 text-[44px] font-bold leading-none tracking-[-0.03em] text-label opacity-0"
        style={{ animation: 'splash-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) 1.2s forwards' }}
      >
        Soma
      </p>

      <div
        className="mt-4 flex items-center gap-1.5 text-[13px] text-label-2 opacity-0"
        style={{ animation: 'splash-in 0.6s ease-out 1.8s forwards' }}
      >
        <span>By</span>
        <svg viewBox="0 0 24 24" width={14} height={14} fill="currentColor" aria-hidden="true">
          <path d={GITHUB_PATH} />
        </svg>
        <span>Dns2690</span>
        <span className="text-label-3">+</span>
        <span
          className="flex h-4 w-4 items-center justify-center text-fit-400"
          style={{ animation: 'splash-glow 1.8s ease-in-out 2.4s infinite' }}
          aria-hidden="true"
        >
          <Icon name="sparkle" size={13} />
        </span>
        <span>AI</span>
      </div>
    </div>
  )
}

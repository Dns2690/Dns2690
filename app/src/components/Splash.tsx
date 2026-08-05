import { useEffect, useState } from 'react'

const GITHUB_PATH =
  'M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.26 5.68.42.36.78 1.08.78 2.18 0 1.58-.01 2.85-.01 3.24 0 .3.2.66.79.55A11.5 11.5 0 0 0 23.5 12c0-6.27-5.23-11.5-11.5-11.5Z'

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
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-3 overflow-hidden bg-[#0b0d12] transition-opacity duration-[600ms] ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className="absolute h-64 w-64 rounded-full bg-cyan-500/10 blur-3xl"
        style={{ animation: 'splash-glow-bg 2.4s ease-in-out infinite' }}
        aria-hidden="true"
      />

      <div
        className="relative opacity-0"
        style={{ animation: 'splash-pop 0.7s cubic-bezier(0.34,1.56,0.64,1) 0.3s forwards' }}
      >
        {/* El degradado recorre los tres colores de módulo: el nombre
            representa el conjunto, no una de sus partes. */}
        <p className="bg-gradient-to-r from-cyan-400 via-rose-400 to-violet-400 bg-clip-text text-5xl font-extrabold tracking-tight text-transparent">
          Soma
        </p>
      </div>

      <div
        className="relative flex items-center gap-1.5 opacity-0"
        style={{ animation: 'splash-in 0.6s ease-out 1.2s forwards' }}
      >
        <span className="text-xs text-gray-500">By</span>
        <svg viewBox="0 0 24 24" width={14} height={14} fill="#9ca3af" aria-hidden="true">
          <path d={GITHUB_PATH} />
        </svg>
        <span className="text-xs text-gray-400">Dns2690</span>
        <span className="text-xs text-gray-600">+</span>
        <span
          className="flex h-4 w-4 items-center justify-center rounded-full bg-cyan-400/10 text-[10px] leading-none text-cyan-400"
          style={{ animation: 'splash-glow 1.8s ease-in-out 1.8s infinite' }}
          aria-hidden="true"
        >
          ✦
        </span>
        <span className="text-xs text-gray-400">AI</span>
      </div>
    </div>
  )
}

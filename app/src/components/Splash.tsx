import { useEffect, useState } from 'react'

const GITHUB_PATH =
  'M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.57.1.78-.25.78-.55 0-.27-.01-1.16-.02-2.11-3.2.7-3.88-1.36-3.88-1.36-.53-1.33-1.29-1.69-1.29-1.69-1.05-.72.08-.71.08-.71 1.17.08 1.78 1.2 1.78 1.2 1.03 1.77 2.71 1.26 3.37.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.2-1.49 3.17-1.18 3.17-1.18.64 1.59.24 2.76.12 3.05.74.8 1.19 1.83 1.19 3.09 0 4.42-2.7 5.4-5.26 5.68.42.36.78 1.08.78 2.18 0 1.58-.01 2.85-.01 3.24 0 .3.2.66.79.55A11.5 11.5 0 0 0 23.5 12c0-6.27-5.23-11.5-11.5-11.5Z'

export default function Splash({ onDone }: { onDone: () => void }) {
  const [leaving, setLeaving] = useState(false)

  useEffect(() => {
    const t1 = setTimeout(() => setLeaving(true), 2100)
    const t2 = setTimeout(onDone, 2600)
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
    }
  }, [onDone])

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center gap-7 bg-[#0b0d12] transition-opacity duration-500 ${
        leaving ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div
        className="flex items-center gap-2 opacity-0"
        style={{ animation: 'splash-in 0.6s ease-out 0.15s forwards' }}
      >
        <svg viewBox="0 0 24 24" width={20} height={20} fill="#9ca3af" aria-hidden="true">
          <path d={GITHUB_PATH} />
        </svg>
        <span className="text-sm text-gray-400">Dns2690</span>
        <span className="mx-0.5 text-gray-600">×</span>
        <span className="text-base leading-none text-cyan-400" aria-hidden="true">
          ✦
        </span>
        <span className="text-sm text-gray-400">Claude</span>
      </div>

      <div
        className="text-center opacity-0"
        style={{ animation: 'splash-pop 0.6s cubic-bezier(0.34,1.56,0.64,1) 0.85s forwards' }}
      >
        <p className="bg-gradient-to-r from-cyan-300 to-cyan-500 bg-clip-text text-4xl font-extrabold tracking-tight text-transparent">
          WorkoutOS
        </p>
        <p className="mt-1 text-xs text-gray-500">tu entrenamiento, todo el año</p>
      </div>
    </div>
  )
}

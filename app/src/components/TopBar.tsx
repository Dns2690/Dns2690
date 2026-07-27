import { useNavigate } from 'react-router-dom'

export default function TopBar({ title, back }: { title: string; back?: boolean }) {
  const navigate = useNavigate()
  return (
    <header className="sticky top-0 z-20 flex items-center gap-2 border-b border-white/10 bg-[#0b0d12]/95 px-4 py-3 pt-[calc(env(safe-area-inset-top)+0.75rem)] backdrop-blur">
      {back && (
        <button
          onClick={() => navigate(-1)}
          className="-ml-1 flex h-8 w-8 items-center justify-center rounded-full text-lg text-gray-300 active:bg-white/10"
          aria-label="Volver"
        >
          ←
        </button>
      )}
      <h1 className="truncate text-lg font-semibold text-gray-100">{title}</h1>
    </header>
  )
}

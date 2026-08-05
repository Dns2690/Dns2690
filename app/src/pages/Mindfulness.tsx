import { Link } from 'react-router-dom'
import TopBar from '../components/TopBar'

const LEVELS = [
  { label: 'Principiante', minutes: 5, practice: 'Atención a la respiración' },
  { label: 'Básico', minutes: 10, practice: 'Respiración coherente + body scan' },
  { label: 'Intermedio', minutes: 20, practice: 'Body scan completo · etiquetar pensamientos' },
  { label: 'Avanzado', minutes: 30, practice: 'Atención abierta' },
  { label: 'Experto', minutes: 45, practice: 'Atención abierta + metta' },
]

export default function Mindfulness() {
  return (
    <div className="flex flex-1 flex-col pb-6">
      <TopBar
        title="Mindfulness"
        right={
          <Link
            to="/ajustes"
            className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full text-lg text-gray-300 active:bg-white/10"
            aria-label="Ajustes"
          >
            ⚙️
          </Link>
        }
      />

      <div className="flex flex-col gap-4 p-4">
        <div className="flex flex-col items-center rounded-2xl bg-violet-500/10 p-6 text-center">
          <span className="text-5xl">🧘</span>
          <p className="mt-3 text-xl font-bold text-violet-300">En construcción</p>
          <p className="mt-2 text-base leading-relaxed text-gray-400">
            Meditación guiada con marcador de respiración, ambientes sonoros y campanas — todo generado en el
            teléfono, sin archivos ni conexión.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="px-1 text-sm text-gray-500">Los niveles que vienen</p>
          {LEVELS.map((l) => (
            <div key={l.label} className="flex items-center gap-3 rounded-xl bg-white/5 p-4 opacity-60">
              <span className="w-14 shrink-0 text-lg font-bold text-violet-400">{l.minutes}′</span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-gray-100">{l.label}</p>
                <p className="text-sm text-gray-500">{l.practice}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white/5 p-4">
          <p className="text-base font-semibold text-gray-100">🌬️ Respiración coherente</p>
          <p className="mt-1 text-base leading-relaxed text-gray-400">
            La práctica base va a ser respirar a 5,5 por minuto: 5 segundos inhalando, 5 exhalando. Es el ritmo de
            resonancia cardíaca, el que más sube la variabilidad de la frecuencia cardíaca con efecto medible en la
            misma sesión.
          </p>
        </div>
      </div>
    </div>
  )
}

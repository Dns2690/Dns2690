import { Link } from 'react-router-dom'
import type { Exercise } from '../lib/types'
import { bodyPartLabel, equipmentLabel, imageUrl } from '../lib/exercises'

export default function ExerciseCard({ exercise }: { exercise: Exercise }) {
  return (
    <Link
      to={`/ejercicio/${exercise.id}`}
      className="flex items-center gap-3 rounded-xl bg-white/5 p-2 active:bg-white/10"
    >
      <img
        src={imageUrl(exercise)}
        alt=""
        loading="lazy"
        width={56}
        height={56}
        className="h-14 w-14 flex-shrink-0 rounded-lg bg-white/10 object-cover"
      />
      <div className="min-w-0">
        <p className="truncate text-sm font-medium capitalize text-gray-100">{exercise.name}</p>
        <p className="truncate text-xs text-gray-400">
          {bodyPartLabel(exercise.body_part)} · {equipmentLabel(exercise.equipment)}
        </p>
      </div>
    </Link>
  )
}

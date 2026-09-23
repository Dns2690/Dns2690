/**
 * La marca de Soma: tres arcos, uno por módulo. El exterior es el de
 * ejercicios, más grueso y en verde, porque la app se dedica a eso; los de
 * adentro son Kegel y meditación. Es el mismo dibujo que el ícono de la app.
 *
 * Con `animated`, cada arco se dibuja de a uno (para el splash).
 */
const ARCS = [
  { d: 'M 50 10.5 A 39.5 39.5 0 1 1 30.25 84.2', color: '#3cff73', width: 9, delay: 0 },
  { d: 'M 50 21 A 29 29 0 1 1 24.79 64.34', color: '#0a84ff', width: 7, delay: 0.25 },
  { d: 'M 50 31.5 A 18.5 18.5 0 0 1 50 68.5', color: '#bf5af2', width: 7, delay: 0.5 },
]

export default function SomaMark({ size = 96, animated = false }: { size?: number; animated?: boolean }) {
  return (
    <svg viewBox="0 0 100 100" width={size} height={size} aria-hidden="true">
      {/* Los arcos abren hacia la izquierda: su caja va de x=21 a x=94. Se
          corren 6 unidades para que el conjunto quede centrado a la vista. */}
      <g fill="none" strokeLinecap="round" transform="translate(-6 0)">
        {ARCS.map((a) => (
          <path
            key={a.d}
            d={a.d}
            stroke={a.color}
            strokeWidth={a.width}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={animated ? 1 : 0}
            style={
              animated
                ? { opacity: 0, animation: `splash-draw 0.9s cubic-bezier(0.65,0,0.35,1) ${0.2 + a.delay}s forwards` }
                : undefined
            }
          />
        ))}
      </g>
    </svg>
  )
}

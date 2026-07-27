import type { ProgramInfo, ProgramMonth } from '../../lib/types'

/**
 * "Piernas y glúteos con equipo": programa de 52 semanas / 3 sesiones por
 * semana con equipo de gimnasio, pensado para quien quiere priorizar tren
 * inferior (glúteo, pierna) sin dejar de entrenar el resto del cuerpo. Cada
 * sesión tiene 3 ejercicios de tren inferior y 2 de tren superior/core para
 * mantener el equilibrio. Progresión: meses 1-2 máquinas, meses 3-4
 * mancuernas, meses 5-6 Smith y kettlebell, meses 7-12 barra (peso muerto
 * rumano, hip thrust cargado, peso muerto sumo) con más intensidad.
 */
const MONTHS: ProgramMonth[] = [
  {
    month: 1,
    title: 'La base de pierna y glúteo',
    focus: 'Aprender los movimientos con máquinas guiadas',
    description:
      'Empezamos con máquinas: guían el recorrido así podés concentrarte en sentir el glúteo y la pierna trabajando, sin preocuparte por el equilibrio con peso libre todavía.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Piernas y glúteos I',
        exercises: [
          { exerciseId: '0739', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0597', sets: 3, reps: '15', restSeconds: 60 },
          { exerciseId: '0599', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0577', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0872', sets: 2, reps: '12', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Piernas y glúteos II',
        exercises: [
          { exerciseId: '0585', sets: 3, reps: '12', restSeconds: 60 },
          { exerciseId: '0598', sets: 3, reps: '15', restSeconds: 60 },
          { exerciseId: '0196', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0861', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0276', sets: 2, reps: '8 por lado', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Piernas y glúteos III',
        exercises: [
          { exerciseId: '0739', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0597', sets: 3, reps: '15', restSeconds: 60 },
          { exerciseId: '0594', sets: 3, reps: '15', restSeconds: 45 },
          { exerciseId: '0577', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0687', sets: 2, reps: '12 (total)', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 2,
    title: 'Más volumen',
    focus: 'Mismos ejercicios, más series y repeticiones',
    description:
      'Seguimos con máquinas pero subiendo el volumen, para que el mes que viene el salto a mancuernas se sienta natural.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Piernas y glúteos I',
        exercises: [
          { exerciseId: '0739', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0597', sets: 3, reps: '18', restSeconds: 60 },
          { exerciseId: '0599', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0577', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0872', sets: 3, reps: '15', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Piernas y glúteos II',
        exercises: [
          { exerciseId: '0585', sets: 3, reps: '15', restSeconds: 60 },
          { exerciseId: '0598', sets: 3, reps: '18', restSeconds: 60 },
          { exerciseId: '0196', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0861', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0276', sets: 3, reps: '10 por lado', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Piernas y glúteos III',
        exercises: [
          { exerciseId: '0739', sets: 3, reps: '18', restSeconds: 75 },
          { exerciseId: '0597', sets: 3, reps: '18', restSeconds: 60 },
          { exerciseId: '0594', sets: 3, reps: '18', restSeconds: 45 },
          { exerciseId: '0577', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0687', sets: 3, reps: '15 (total)', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 3,
    title: 'Mancuernas',
    focus: 'Sentadilla goblet y primer trabajo de cadera cargado',
    description:
      'Las mancuernas suman equilibrio y control a los movimientos. Empezamos también a cargar el puente de glúteo con una barra liviana.',
    weeks: 5,
    days: [
      {
        day: 1,
        name: 'Día A · Piernas y glúteos I',
        exercises: [
          { exerciseId: '1760', sets: 3, reps: '12', restSeconds: 75 },
          {
            exerciseId: '1409',
            sets: 3,
            reps: '12',
            restSeconds: 75,
            note: 'Empezá con poco peso en la cadera para sentir bien el glúteo antes de cargar más.',
          },
          { exerciseId: '0599', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0289', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '0872', sets: 3, reps: '15', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Piernas y glúteos II',
        exercises: [
          { exerciseId: '0431', sets: 3, reps: '10 por pierna', restSeconds: 75 },
          { exerciseId: '0597', sets: 3, reps: '15', restSeconds: 60 },
          { exerciseId: '0196', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0861', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0464', sets: 2, reps: '8 por lado', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Piernas y glúteos III',
        exercises: [
          { exerciseId: '1760', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '1409', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0585', sets: 3, reps: '15', restSeconds: 60 },
          { exerciseId: '0289', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0687', sets: 3, reps: '15 (total)', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 4,
    title: 'Consolidando mancuernas',
    focus: 'Sumamos zancada y peso muerto rumano',
    description:
      'Con la sentadilla goblet y el puente de glúteo ya cómodos, sumamos zancada con mancuernas y la primera bisagra de cadera cargada.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Piernas y glúteos I',
        exercises: [
          { exerciseId: '1760', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '1409', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '1459', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0289', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0872', sets: 3, reps: '15', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Piernas y glúteos II',
        exercises: [
          { exerciseId: '0431', sets: 3, reps: '12 por pierna', restSeconds: 75 },
          { exerciseId: '0336', sets: 3, reps: '10 por pierna', restSeconds: 75 },
          { exerciseId: '0597', sets: 3, reps: '18', restSeconds: 60 },
          { exerciseId: '0861', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0276', sets: 3, reps: '10 por lado', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Piernas y glúteos III',
        exercises: [
          { exerciseId: '1760', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '1409', sets: 3, reps: '18', restSeconds: 75 },
          { exerciseId: '1459', sets: 3, reps: '15', restSeconds: 90 },
          { exerciseId: '0289', sets: 3, reps: '15', restSeconds: 90 },
          { exerciseId: '0464', sets: 3, reps: '10 por lado', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 5,
    title: 'Smith machine y kettlebell',
    focus: 'Sumamos sentadilla sumo y potencia de cadera',
    description:
      'La sentadilla sumo en Smith machine enfatiza glúteo e interno de muslo. El kettlebell swing suma potencia de cadera — un movimiento distinto a todo lo hecho hasta ahora.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Piernas y glúteos I',
        exercises: [
          { exerciseId: '3142', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '1409', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '1757', sets: 3, reps: '10 por pierna', restSeconds: 90 },
          { exerciseId: '0405', sets: 3, reps: '10', restSeconds: 75 },
          { exerciseId: '0872', sets: 3, reps: '18', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Piernas y glúteos II',
        exercises: [
          { exerciseId: '0431', sets: 3, reps: '12 por pierna', restSeconds: 75 },
          { exerciseId: '0549', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0597', sets: 3, reps: '18', restSeconds: 60 },
          { exerciseId: '0861', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0687', sets: 3, reps: '18 (total)', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Piernas y glúteos III',
        exercises: [
          { exerciseId: '3142', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '1409', sets: 3, reps: '15', restSeconds: 90 },
          { exerciseId: '1757', sets: 3, reps: '12 por pierna', restSeconds: 90 },
          { exerciseId: '0289', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0464', sets: 3, reps: '12 por lado', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 6,
    title: 'Cadera fuerte',
    focus: 'El hip thrust cargado como eje',
    description:
      'Pasamos el puente de glúteo a la versión con la espalda alta apoyada en el banco — el hip thrust — que permite cargar mucho más peso de forma segura.',
    weeks: 5,
    days: [
      {
        day: 1,
        name: 'Día A · Piernas y glúteos I',
        exercises: [
          { exerciseId: '3142', sets: 3, reps: '12', restSeconds: 90 },
          {
            exerciseId: '3562',
            sets: 3,
            reps: '10',
            restSeconds: 90,
            note: 'Es el hip thrust cargado: apoyá la espalda alta en el banco y empujá con los talones.',
          },
          { exerciseId: '1459', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0405', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0872', sets: 3, reps: '18', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Piernas y glúteos II',
        exercises: [
          { exerciseId: '0336', sets: 3, reps: '12 por pierna', restSeconds: 75 },
          { exerciseId: '0549', sets: 3, reps: '18', restSeconds: 75 },
          { exerciseId: '0597', sets: 4, reps: '15', restSeconds: 60 },
          { exerciseId: '0861', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0687', sets: 3, reps: '18 (total)', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Piernas y glúteos III',
        exercises: [
          { exerciseId: '3142', sets: 3, reps: '15', restSeconds: 90 },
          { exerciseId: '3562', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '1757', sets: 3, reps: '12 por pierna', restSeconds: 90 },
          { exerciseId: '0289', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0464', sets: 3, reps: '12 por lado', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 7,
    title: 'Barra',
    focus: 'Peso muerto rumano con barra',
    description:
      'La peso muerto rumana con barra permite cargar más que la versión con mancuernas. Es el movimiento que más glúteo e isquiotibial trabaja de todo el programa.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Piernas y glúteos I',
        exercises: [
          { exerciseId: '0085', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '3562', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '3142', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0289', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '0872', sets: 4, reps: '18', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Piernas y glúteos II',
        exercises: [
          { exerciseId: '0114', sets: 3, reps: '8 por pierna', restSeconds: 90 },
          { exerciseId: '0549', sets: 3, reps: '18', restSeconds: 75 },
          { exerciseId: '0597', sets: 4, reps: '15', restSeconds: 60 },
          { exerciseId: '0861', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0464', sets: 3, reps: '12 por lado', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Piernas y glúteos III',
        exercises: [
          { exerciseId: '0085', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '3562', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '3142', sets: 3, reps: '15', restSeconds: 90 },
          { exerciseId: '0405', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0687', sets: 4, reps: '18 (total)', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 8,
    title: 'Consolidación con barra',
    focus: 'Cuarta serie en los movimientos principales',
    description:
      'Peso muerto rumano y hip thrust pasan a cuatro series. Es más volumen total — si te queda larga la sesión, priorizá los dos primeros ejercicios de cada día.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Piernas y glúteos I',
        exercises: [
          { exerciseId: '0085', sets: 4, reps: '10', restSeconds: 90 },
          { exerciseId: '3562', sets: 4, reps: '10', restSeconds: 90 },
          { exerciseId: '3142', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0289', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0872', sets: 4, reps: '18', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Piernas y glúteos II',
        exercises: [
          { exerciseId: '0114', sets: 3, reps: '10 por pierna', restSeconds: 90 },
          { exerciseId: '0549', sets: 3, reps: '20', restSeconds: 75 },
          { exerciseId: '0597', sets: 4, reps: '15', restSeconds: 60 },
          { exerciseId: '0861', sets: 4, reps: '12', restSeconds: 75 },
          { exerciseId: '0464', sets: 4, reps: '12 por lado', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Piernas y glúteos III',
        exercises: [
          { exerciseId: '0085', sets: 4, reps: '12', restSeconds: 90 },
          { exerciseId: '3562', sets: 4, reps: '12', restSeconds: 90 },
          { exerciseId: '3142', sets: 3, reps: '15', restSeconds: 90 },
          { exerciseId: '0405', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0687', sets: 4, reps: '18 (total)', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 9,
    title: 'Peso muerto sumo',
    focus: 'El movimiento con más énfasis en glúteo e interno de muslo',
    description:
      'El sumo abre la postura y pone más trabajo en glúteo e interno de muslo que el peso muerto convencional. Priorizá la técnica sobre el peso las primeras semanas.',
    weeks: 5,
    days: [
      {
        day: 1,
        name: 'Día A · Piernas y glúteos I',
        exercises: [
          {
            exerciseId: '0117',
            sets: 3,
            reps: '6',
            restSeconds: 120,
            note: 'El sumo pone más énfasis en glúteo e interno de muslo que el peso muerto convencional.',
          },
          { exerciseId: '3562', sets: 4, reps: '10', restSeconds: 90 },
          { exerciseId: '3142', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0289', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0872', sets: 4, reps: '20', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Piernas y glúteos II',
        exercises: [
          { exerciseId: '0114', sets: 3, reps: '10 por pierna', restSeconds: 90 },
          { exerciseId: '0549', sets: 4, reps: '15', restSeconds: 75 },
          { exerciseId: '0597', sets: 4, reps: '18', restSeconds: 60 },
          { exerciseId: '0861', sets: 4, reps: '12', restSeconds: 75 },
          { exerciseId: '0464', sets: 4, reps: '15 por lado', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Piernas y glúteos III',
        exercises: [
          { exerciseId: '0117', sets: 3, reps: '8', restSeconds: 120 },
          { exerciseId: '3562', sets: 4, reps: '12', restSeconds: 90 },
          { exerciseId: '1459', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0405', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0687', sets: 4, reps: '20 (total)', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 10,
    title: 'Más carga',
    focus: 'Sumo y hip thrust, más peso',
    description:
      'Con la técnica del sumo ya afianzada, es momento de subir el peso de forma más notoria tanto ahí como en el hip thrust.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Piernas y glúteos I',
        exercises: [
          { exerciseId: '0117', sets: 4, reps: '6', restSeconds: 120 },
          { exerciseId: '3562', sets: 4, reps: '10', restSeconds: 90 },
          { exerciseId: '3142', sets: 4, reps: '10', restSeconds: 90 },
          { exerciseId: '0289', sets: 4, reps: '10', restSeconds: 90 },
          { exerciseId: '0872', sets: 4, reps: '20', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Piernas y glúteos II',
        exercises: [
          { exerciseId: '0114', sets: 4, reps: '8 por pierna', restSeconds: 90 },
          { exerciseId: '0549', sets: 4, reps: '18', restSeconds: 75 },
          { exerciseId: '0597', sets: 4, reps: '18', restSeconds: 60 },
          { exerciseId: '0861', sets: 4, reps: '12', restSeconds: 75 },
          { exerciseId: '0464', sets: 4, reps: '15 por lado', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Piernas y glúteos III',
        exercises: [
          { exerciseId: '0117', sets: 4, reps: '8', restSeconds: 120 },
          { exerciseId: '3562', sets: 4, reps: '12', restSeconds: 90 },
          { exerciseId: '1459', sets: 4, reps: '12', restSeconds: 90 },
          { exerciseId: '0405', sets: 4, reps: '10', restSeconds: 75 },
          { exerciseId: '0687', sets: 4, reps: '20 (total)', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 11,
    title: 'Rendimiento',
    focus: 'Volumen alto en los movimientos principales',
    description:
      'Diez meses de trabajo en glúteo y pierna ya construyeron una base sólida. Este mes empuja el volumen para preparar el pico de fuerza del mes 12.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Piernas y glúteos I',
        exercises: [
          { exerciseId: '0117', sets: 4, reps: '6', restSeconds: 120 },
          { exerciseId: '3562', sets: 4, reps: '8', restSeconds: 100 },
          { exerciseId: '3142', sets: 4, reps: '10', restSeconds: 90 },
          { exerciseId: '0289', sets: 4, reps: '10', restSeconds: 90 },
          { exerciseId: '0872', sets: 5, reps: '20', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Piernas y glúteos II',
        exercises: [
          { exerciseId: '0114', sets: 4, reps: '8 por pierna', restSeconds: 90 },
          { exerciseId: '0549', sets: 4, reps: '20', restSeconds: 75 },
          { exerciseId: '0597', sets: 4, reps: '18', restSeconds: 60 },
          { exerciseId: '0861', sets: 4, reps: '12', restSeconds: 75 },
          { exerciseId: '0464', sets: 4, reps: '15 por lado', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Piernas y glúteos III',
        exercises: [
          { exerciseId: '0117', sets: 4, reps: '8', restSeconds: 120 },
          { exerciseId: '3562', sets: 4, reps: '10', restSeconds: 100 },
          { exerciseId: '1459', sets: 4, reps: '12', restSeconds: 90 },
          { exerciseId: '0405', sets: 4, reps: '10', restSeconds: 75 },
          { exerciseId: '0687', sets: 5, reps: '20 (total)', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 12,
    title: 'Pico y cierre del año',
    focus: 'El mes más exigente',
    description:
      'Bajamos las repeticiones y subimos el peso en sumo y hip thrust. En la última sesión, comparás lo que levantás hoy contra el mes 6, cuando cargaste la barra en la cadera por primera vez.',
    weeks: 5,
    days: [
      {
        day: 1,
        name: 'Día A · Piernas y glúteos I',
        exercises: [
          { exerciseId: '0117', sets: 5, reps: '5', restSeconds: 150 },
          { exerciseId: '3562', sets: 5, reps: '6', restSeconds: 120 },
          { exerciseId: '3142', sets: 4, reps: '8', restSeconds: 90 },
          { exerciseId: '0289', sets: 4, reps: '10', restSeconds: 90 },
          { exerciseId: '0872', sets: 5, reps: '20', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Piernas y glúteos II',
        exercises: [
          { exerciseId: '0114', sets: 4, reps: '8 por pierna', restSeconds: 90 },
          { exerciseId: '0549', sets: 4, reps: '20', restSeconds: 75 },
          { exerciseId: '0597', sets: 5, reps: '18', restSeconds: 60 },
          { exerciseId: '0861', sets: 4, reps: '12', restSeconds: 75 },
          { exerciseId: '0464', sets: 5, reps: '15 por lado', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Piernas y glúteos III (cierre del año)',
        exercises: [
          {
            exerciseId: '0117',
            sets: 5,
            reps: '5',
            restSeconds: 150,
            note: 'Última sesión del año: anotá el peso en el peso muerto sumo y en el hip thrust y comparalo con el mes 6. Ese salto es tu año de piernas y glúteos.',
          },
          { exerciseId: '3562', sets: 5, reps: '6', restSeconds: 120 },
          { exerciseId: '1459', sets: 4, reps: '12', restSeconds: 90 },
          { exerciseId: '0549', sets: 4, reps: '20', restSeconds: 75 },
          { exerciseId: '0687', sets: 5, reps: '20 (total)', restSeconds: 45 },
        ],
      },
    ],
  },
]

export const LEGS_GLUTES_GYM: ProgramInfo = {
  id: 'legs-glutes-gym',
  name: 'Piernas y glúteos con equipo',
  tagline: 'Foco en pierna y glúteo sin descuidar el resto del cuerpo',
  icon: '🍑',
  equipment: 'Gimnasio: máquinas, Smith, mancuernas, barra y kettlebell',
  months: MONTHS,
}

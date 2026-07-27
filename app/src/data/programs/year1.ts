import type { ProgramInfo, ProgramMonth } from '../../lib/types'

/**
 * "Año 1": programa de 52 semanas / 3 sesiones por semana (156 sesiones) pensado
 * para una persona 100% sedentaria. Progresión mensual: meses 1-4 solo peso
 * corporal, meses 5-8 suman mancuernas (o cualquier peso casero equivalente),
 * meses 9-12 pasan a una división empuje/tracción/pierna con mayor intensidad.
 * Los IDs de ejercicio corresponden a src/data/exercises.json.
 */
const MONTHS: ProgramMonth[] = [
  {
    month: 1,
    title: 'Cimientos',
    focus: 'Aprender a moverse bien, sin apuro',
    description:
      'El objetivo de este mes no es esforzarte al máximo: es que tu cuerpo se acostumbre a moverse tres veces por semana y que la técnica sea sólida. Series cortas, descansos largos. Si algo se siente demasiado, hacé menos repeticiones — lo importante es no faltar a la sesión.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Cuerpo completo I',
        exercises: [
          {
            exerciseId: '0659',
            sets: 2,
            reps: '8',
            restSeconds: 60,
            note: 'Evaluación inicial: antes de arrancar, contá cuántas flexiones seguidas te salen con buena técnica y anotalo — lo vas a repetir en el mes 12.',
          },
          { exerciseId: '1685', sets: 2, reps: '10', restSeconds: 60 },
          { exerciseId: '3013', sets: 2, reps: '10', restSeconds: 60 },
          { exerciseId: '0276', sets: 2, reps: '8 por lado', restSeconds: 45 },
          { exerciseId: '3166', sets: 2, reps: '10', restSeconds: 60 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Cuerpo completo II',
        exercises: [
          { exerciseId: '0493', sets: 2, reps: '8', restSeconds: 60 },
          { exerciseId: '2368', sets: 2, reps: '8 por pierna', restSeconds: 60 },
          { exerciseId: '3561', sets: 2, reps: '8 por lado', restSeconds: 60 },
          { exerciseId: '3016', sets: 2, reps: '8', restSeconds: 45 },
          { exerciseId: '2298', sets: 2, reps: '8', restSeconds: 60 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Cuerpo completo III',
        exercises: [
          { exerciseId: '0659', sets: 2, reps: '10', restSeconds: 60 },
          { exerciseId: '1685', sets: 2, reps: '10', restSeconds: 60 },
          { exerciseId: '3013', sets: 2, reps: '12', restSeconds: 60 },
          { exerciseId: '0687', sets: 2, reps: '10 (total)', restSeconds: 45 },
          {
            exerciseId: '3636',
            sets: 2,
            reps: '20 seg',
            restSeconds: 45,
            note: 'Cardio suave para cerrar: ritmo cómodo, sin llegar a agitarte.',
          },
        ],
      },
    ],
  },
  {
    month: 2,
    title: 'Consistencia',
    focus: 'Sumar repeticiones sin cambiar los ejercicios',
    description:
      'Repetimos los mismos movimientos del mes 1 pero con más repeticiones y series. La consistencia (no faltar) importa más que la intensidad. Si las 3 sesiones semanales ya se sienten cómodas, es la señal correcta para pasar al mes 3.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Cuerpo completo I',
        exercises: [
          { exerciseId: '0659', sets: 3, reps: '10', restSeconds: 60 },
          { exerciseId: '1685', sets: 2, reps: '12', restSeconds: 60 },
          { exerciseId: '3013', sets: 2, reps: '12', restSeconds: 60 },
          { exerciseId: '0276', sets: 2, reps: '10 por lado', restSeconds: 45 },
          { exerciseId: '3166', sets: 2, reps: '12', restSeconds: 60 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Cuerpo completo II',
        exercises: [
          { exerciseId: '0493', sets: 2, reps: '10', restSeconds: 60 },
          { exerciseId: '2368', sets: 2, reps: '10 por pierna', restSeconds: 60 },
          { exerciseId: '3561', sets: 2, reps: '10 por lado', restSeconds: 60 },
          { exerciseId: '3016', sets: 2, reps: '10', restSeconds: 45 },
          { exerciseId: '2298', sets: 2, reps: '10', restSeconds: 60 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Cuerpo completo III',
        exercises: [
          { exerciseId: '0659', sets: 2, reps: '12', restSeconds: 60 },
          { exerciseId: '1685', sets: 2, reps: '12', restSeconds: 60 },
          { exerciseId: '3013', sets: 2, reps: '15', restSeconds: 60 },
          { exerciseId: '0687', sets: 2, reps: '12 (total)', restSeconds: 45 },
          { exerciseId: '0630', sets: 2, reps: '20 seg, ritmo lento', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 3,
    title: 'Progreso',
    focus: 'Tercera serie y primeras flexiones completas',
    description:
      'Agregamos una tercera serie a cada ejercicio y probamos la flexión completa (apoyada solo en manos y pies) por primera vez, con pocas repeticiones. Si todavía no te sale, seguí con la inclinada un poco más — no hay apuro.',
    weeks: 5,
    days: [
      {
        day: 1,
        name: 'Día A · Cuerpo completo I',
        exercises: [
          { exerciseId: '0493', sets: 3, reps: '10', restSeconds: 60 },
          { exerciseId: '2368', sets: 3, reps: '10 por pierna', restSeconds: 60 },
          { exerciseId: '3561', sets: 3, reps: '12 por lado', restSeconds: 60 },
          { exerciseId: '3016', sets: 3, reps: '12', restSeconds: 45 },
          { exerciseId: '2298', sets: 3, reps: '10', restSeconds: 60 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Cuerpo completo II',
        exercises: [
          {
            exerciseId: '0662',
            sets: 2,
            reps: '6',
            restSeconds: 75,
            note: 'Primera vez con la flexión completa: si no llegás a 6 con buena forma, hacé las que puedas.',
          },
          { exerciseId: '1685', sets: 3, reps: '12', restSeconds: 60 },
          { exerciseId: '3013', sets: 3, reps: '15', restSeconds: 60 },
          { exerciseId: '0872', sets: 2, reps: '10', restSeconds: 45 },
          { exerciseId: '3166', sets: 3, reps: '12', restSeconds: 60 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Cuerpo completo III',
        exercises: [
          { exerciseId: '0493', sets: 3, reps: '12', restSeconds: 60 },
          { exerciseId: '2368', sets: 3, reps: '12 por pierna', restSeconds: 60 },
          { exerciseId: '0687', sets: 3, reps: '12 (total)', restSeconds: 45 },
          { exerciseId: '0630', sets: 3, reps: '25 seg', restSeconds: 45 },
          { exerciseId: '0464', sets: 2, reps: '8 por lado', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 4,
    title: 'Fuerza base',
    focus: 'Más volumen y la flexión completa como estándar',
    description:
      'La flexión completa pasa a ser el ejercicio de empuje principal. Subimos el volumen general y metemos zancadas caminando, que exigen más equilibrio y coordinación que las variantes que veníamos haciendo.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Cuerpo completo I',
        exercises: [
          { exerciseId: '0662', sets: 3, reps: '8', restSeconds: 75 },
          { exerciseId: '2368', sets: 3, reps: '12 por pierna', restSeconds: 60 },
          { exerciseId: '3561', sets: 3, reps: '15 por lado', restSeconds: 60 },
          { exerciseId: '0872', sets: 3, reps: '12', restSeconds: 45 },
          { exerciseId: '2298', sets: 3, reps: '12', restSeconds: 60 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Cuerpo completo II',
        exercises: [
          { exerciseId: '0493', sets: 3, reps: '15', restSeconds: 60 },
          { exerciseId: '1460', sets: 3, reps: '10 por pierna', restSeconds: 60 },
          { exerciseId: '3013', sets: 3, reps: '15', restSeconds: 60 },
          { exerciseId: '0464', sets: 3, reps: '10 por lado', restSeconds: 45 },
          { exerciseId: '3166', sets: 3, reps: '15', restSeconds: 60 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Cuerpo completo III',
        exercises: [
          { exerciseId: '0662', sets: 3, reps: '10', restSeconds: 75 },
          { exerciseId: '2368', sets: 3, reps: '15 por pierna', restSeconds: 60 },
          { exerciseId: '0687', sets: 3, reps: '15 (total)', restSeconds: 45 },
          { exerciseId: '0630', sets: 3, reps: '30 seg', restSeconds: 45 },
          { exerciseId: '3636', sets: 3, reps: '20 seg', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 5,
    title: 'Con peso',
    focus: 'Primer contacto con las mancuernas',
    description:
      'A partir de acá sumamos mancuernas para seguir progresando (el peso corporal solo ya no alcanza para exigir más). Si no tenés mancuernas en casa, usá botellas de agua, bidones o una mochila con libros con un agarre parecido.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Cuerpo completo I',
        exercises: [
          { exerciseId: '1760', sets: 3, reps: '10', restSeconds: 75, note: 'Sin mancuernas: hacé sentadillas búlgaras (split squats) con más repeticiones.' },
          { exerciseId: '1459', sets: 3, reps: '10', restSeconds: 75 },
          { exerciseId: '0662', sets: 3, reps: '10', restSeconds: 75 },
          { exerciseId: '2298', sets: 3, reps: '12', restSeconds: 60 },
          { exerciseId: '0872', sets: 3, reps: '12', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Cuerpo completo II',
        exercises: [
          { exerciseId: '0293', sets: 3, reps: '10', restSeconds: 75 },
          { exerciseId: '0493', sets: 3, reps: '15', restSeconds: 60 },
          { exerciseId: '1460', sets: 3, reps: '10 por pierna', restSeconds: 60 },
          { exerciseId: '0405', sets: 3, reps: '10', restSeconds: 75 },
          { exerciseId: '0464', sets: 3, reps: '10 por lado', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Cuerpo completo III',
        exercises: [
          { exerciseId: '1760', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0662', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0630', sets: 3, reps: '30 seg', restSeconds: 45 },
          { exerciseId: '0687', sets: 3, reps: '15 (total)', restSeconds: 45 },
          { exerciseId: '1459', sets: 3, reps: '12', restSeconds: 75 },
        ],
      },
    ],
  },
  {
    month: 6,
    title: 'Volumen',
    focus: 'Más series, más repeticiones, nuevos movimientos',
    description:
      'Consolidamos el trabajo con mancuernas subiendo el volumen, y sumamos dos movimientos nuevos: elevación de piernas colgado (o su versión más simple) y transporte cargado, que exige agarre y core al mismo tiempo.',
    weeks: 5,
    days: [
      {
        day: 1,
        name: 'Día A · Cuerpo completo I',
        exercises: [
          { exerciseId: '1760', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '1459', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0662', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0293', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0872', sets: 3, reps: '15', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Cuerpo completo II',
        exercises: [
          { exerciseId: '0327', sets: 3, reps: '10', restSeconds: 75 },
          { exerciseId: '0493', sets: 3, reps: '15', restSeconds: 60 },
          { exerciseId: '1460', sets: 3, reps: '12 por pierna', restSeconds: 60 },
          { exerciseId: '0405', sets: 3, reps: '12', restSeconds: 75 },
          {
            exerciseId: '0472',
            sets: 2,
            reps: '6',
            restSeconds: 60,
            note: 'Necesita una barra fija. Sin barra: reemplazá por una serie extra de abdominales.',
          },
        ],
      },
      {
        day: 3,
        name: 'Día C · Cuerpo completo III',
        exercises: [
          { exerciseId: '1760', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0662', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0630', sets: 3, reps: '40 seg', restSeconds: 45 },
          { exerciseId: '0687', sets: 3, reps: '20 (total)', restSeconds: 45 },
          { exerciseId: '2133', sets: 2, reps: '30 seg', restSeconds: 60 },
        ],
      },
    ],
  },
  {
    month: 7,
    title: 'Intensidad',
    focus: 'Cuarta serie y primeros ejercicios de potencia',
    description:
      'Subimos a 4 series en los ejercicios principales y metemos el primer trabajo de potencia (sentadilla con salto) — ya llevás medio año entrenando, tu cuerpo está preparado para exigencias más altas.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Cuerpo completo I',
        exercises: [
          { exerciseId: '1760', sets: 4, reps: '10', restSeconds: 75 },
          { exerciseId: '1459', sets: 4, reps: '10', restSeconds: 75 },
          { exerciseId: '0289', sets: 3, reps: '10', restSeconds: 75 },
          { exerciseId: '0293', sets: 3, reps: '10', restSeconds: 75 },
          { exerciseId: '0872', sets: 3, reps: '15', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Cuerpo completo II',
        exercises: [
          { exerciseId: '0410', sets: 3, reps: '8 por pierna', restSeconds: 75 },
          { exerciseId: '0327', sets: 3, reps: '10', restSeconds: 75 },
          { exerciseId: '0314', sets: 3, reps: '10', restSeconds: 75 },
          { exerciseId: '0405', sets: 3, reps: '10', restSeconds: 75 },
          { exerciseId: '0472', sets: 3, reps: '8', restSeconds: 60 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Cuerpo completo III',
        exercises: [
          { exerciseId: '2812', sets: 3, reps: '8 por pierna', restSeconds: 75 },
          { exerciseId: '0662', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0514', sets: 3, reps: '8', restSeconds: 60, note: 'Primera vez con salto: aterrizá suave, con las rodillas blandas.' },
          { exerciseId: '2133', sets: 3, reps: '30 seg', restSeconds: 60 },
          { exerciseId: '0687', sets: 3, reps: '20 (total)', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 8,
    title: 'Consolidación',
    focus: 'Afinar técnica en cargas ya conocidas',
    description:
      'Sin ejercicios nuevos: el objetivo es afianzar la técnica en 4 series con las cargas del mes 7, y sumar una variante de empuje más exigente (flexión diamante) para preparar el cambio de estructura del mes que viene.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Cuerpo completo I',
        exercises: [
          { exerciseId: '1760', sets: 4, reps: '12', restSeconds: 75 },
          { exerciseId: '1459', sets: 4, reps: '12', restSeconds: 75 },
          { exerciseId: '0289', sets: 4, reps: '10', restSeconds: 75 },
          { exerciseId: '0293', sets: 4, reps: '10', restSeconds: 75 },
          { exerciseId: '0472', sets: 3, reps: '10', restSeconds: 60 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Cuerpo completo II',
        exercises: [
          { exerciseId: '0410', sets: 3, reps: '10 por pierna', restSeconds: 75 },
          { exerciseId: '0327', sets: 4, reps: '10', restSeconds: 75 },
          { exerciseId: '0314', sets: 4, reps: '10', restSeconds: 75 },
          { exerciseId: '0334', sets: 3, reps: '12', restSeconds: 60 },
          { exerciseId: '0872', sets: 3, reps: '15', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Cuerpo completo III',
        exercises: [
          { exerciseId: '2812', sets: 3, reps: '10 por pierna', restSeconds: 75 },
          { exerciseId: '0283', sets: 3, reps: '8', restSeconds: 75 },
          { exerciseId: '0514', sets: 3, reps: '10', restSeconds: 60 },
          { exerciseId: '2133', sets: 3, reps: '40 seg', restSeconds: 60 },
          { exerciseId: '0687', sets: 3, reps: '20 (total)', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 9,
    title: 'División: empuje / tracción / pierna',
    focus: 'Un día por grupo muscular, más especialización',
    description:
      'Ya no repetimos cuerpo completo: cada día se enfoca en un patrón (empuje, tracción o pierna) para poder sumar más ejercicios por grupo sin alargar la sesión. Es el mismo cambio que hacen los gimnasios con alumnos intermedios.',
    weeks: 5,
    days: [
      {
        day: 1,
        name: 'Día A · Empuje',
        exercises: [
          { exerciseId: '0662', sets: 4, reps: '12', restSeconds: 75 },
          { exerciseId: '0289', sets: 4, reps: '10', restSeconds: 75 },
          { exerciseId: '0405', sets: 4, reps: '10', restSeconds: 75 },
          { exerciseId: '0283', sets: 3, reps: '8', restSeconds: 60 },
          { exerciseId: '0814', sets: 3, reps: '10', restSeconds: 60 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Tracción',
        exercises: [
          { exerciseId: '0499', sets: 4, reps: '10', restSeconds: 75 },
          { exerciseId: '0293', sets: 4, reps: '10', restSeconds: 75 },
          { exerciseId: '0327', sets: 3, reps: '10', restSeconds: 75 },
          { exerciseId: '0970', sets: 3, reps: '6', restSeconds: 90, note: 'Opcional si tenés banda elástica. Si no, sumá una serie extra de remo.' },
          { exerciseId: '0406', sets: 3, reps: '12', restSeconds: 60 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Pierna + core',
        exercises: [
          { exerciseId: '1760', sets: 4, reps: '12', restSeconds: 75 },
          { exerciseId: '1459', sets: 4, reps: '12', restSeconds: 75 },
          { exerciseId: '0336', sets: 3, reps: '10 por pierna', restSeconds: 75 },
          { exerciseId: '0472', sets: 3, reps: '10', restSeconds: 60 },
          { exerciseId: '1373', sets: 3, reps: '15', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 10,
    title: 'Especialización',
    focus: 'Más intensidad dentro de la misma división',
    description:
      'Seguimos con empuje / tracción / pierna pero con más repeticiones y cargas más exigentes. Si un ejercicio con mancuerna ya se siente liviano, es momento de conseguir un par más pesado.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Empuje',
        exercises: [
          { exerciseId: '0662', sets: 4, reps: '15', restSeconds: 75 },
          { exerciseId: '0314', sets: 4, reps: '10', restSeconds: 75 },
          { exerciseId: '0426', sets: 4, reps: '10', restSeconds: 75 },
          { exerciseId: '0283', sets: 3, reps: '10', restSeconds: 60 },
          { exerciseId: '0814', sets: 3, reps: '12', restSeconds: 60 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Tracción',
        exercises: [
          { exerciseId: '0499', sets: 4, reps: '12', restSeconds: 75 },
          { exerciseId: '0293', sets: 4, reps: '12', restSeconds: 75 },
          { exerciseId: '0327', sets: 4, reps: '10', restSeconds: 75 },
          { exerciseId: '0970', sets: 3, reps: '8', restSeconds: 90 },
          { exerciseId: '0406', sets: 3, reps: '15', restSeconds: 60 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Pierna + core',
        exercises: [
          { exerciseId: '1760', sets: 4, reps: '15', restSeconds: 75 },
          { exerciseId: '1757', sets: 3, reps: '8 por pierna', restSeconds: 75 },
          { exerciseId: '0336', sets: 3, reps: '12 por pierna', restSeconds: 75 },
          { exerciseId: '0472', sets: 3, reps: '12', restSeconds: 60 },
          { exerciseId: '2963', sets: 3, reps: '10', restSeconds: 60 },
        ],
      },
    ],
  },
  {
    month: 11,
    title: 'Rendimiento',
    focus: 'Potencia, transporte cargado y cardio de intensidad',
    description:
      'Sumamos burpees y más trabajo de potencia. Ya pasaron 10 meses: el cuerpo que era sedentario ahora tolera perfectamente el esfuerzo cardiovascular alto — se nota en cómo bajan las pulsaciones entre series.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Empuje + potencia',
        exercises: [
          { exerciseId: '0662', sets: 4, reps: '15', restSeconds: 60 },
          { exerciseId: '0289', sets: 4, reps: '12', restSeconds: 75 },
          { exerciseId: '0426', sets: 4, reps: '12', restSeconds: 75 },
          { exerciseId: '0283', sets: 4, reps: '10', restSeconds: 60 },
          { exerciseId: '1160', sets: 3, reps: '8', restSeconds: 60 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Tracción + core',
        exercises: [
          { exerciseId: '0499', sets: 4, reps: '15', restSeconds: 60 },
          { exerciseId: '0293', sets: 4, reps: '12', restSeconds: 75 },
          { exerciseId: '0970', sets: 4, reps: '8', restSeconds: 90 },
          { exerciseId: '0406', sets: 4, reps: '15', restSeconds: 60 },
          { exerciseId: '2963', sets: 3, reps: '12', restSeconds: 60 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Pierna + cardio',
        exercises: [
          { exerciseId: '1760', sets: 4, reps: '15', restSeconds: 60 },
          { exerciseId: '1757', sets: 3, reps: '10 por pierna', restSeconds: 75 },
          { exerciseId: '0514', sets: 4, reps: '10', restSeconds: 60 },
          { exerciseId: '2133', sets: 4, reps: '40 seg', restSeconds: 60 },
          { exerciseId: '0630', sets: 3, reps: '45 seg', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 12,
    title: 'Graduación',
    focus: 'El mes más exigente — y el cierre del primer año',
    description:
      'El último tramo. Máxima carga del programa y, en la última sesión, repetís la evaluación del mes 1 para ver en números cuánto cambiaste en un año. Después de este mes, ya no sos una persona sedentaria: sos alguien que entrena.',
    weeks: 5,
    days: [
      {
        day: 1,
        name: 'Día A · Empuje',
        exercises: [
          { exerciseId: '0662', sets: 4, reps: '20', restSeconds: 60 },
          { exerciseId: '0289', sets: 4, reps: '12', restSeconds: 75 },
          { exerciseId: '0426', sets: 4, reps: '12', restSeconds: 75 },
          { exerciseId: '0283', sets: 4, reps: '12', restSeconds: 60 },
          { exerciseId: '1160', sets: 4, reps: '10', restSeconds: 60 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Tracción',
        exercises: [
          { exerciseId: '0499', sets: 4, reps: '20', restSeconds: 60 },
          { exerciseId: '0293', sets: 4, reps: '12', restSeconds: 75 },
          {
            exerciseId: '0970',
            sets: 4,
            reps: '10',
            restSeconds: 90,
            note: 'Si ya llegás cómodo a 10, probá una dominada completa sin banda.',
          },
          { exerciseId: '0406', sets: 4, reps: '15', restSeconds: 60 },
          { exerciseId: '2963', sets: 4, reps: '12', restSeconds: 60 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Pierna + evaluación final',
        exercises: [
          { exerciseId: '1760', sets: 4, reps: '20', restSeconds: 60 },
          { exerciseId: '1757', sets: 3, reps: '12 por pierna', restSeconds: 75 },
          { exerciseId: '0514', sets: 4, reps: '12', restSeconds: 60 },
          { exerciseId: '2133', sets: 4, reps: '45 seg', restSeconds: 60 },
          {
            exerciseId: '0662',
            sets: 1,
            reps: 'AMRAP',
            restSeconds: 0,
            note: 'Evaluación final: repetí el test de flexiones del mes 1 y compará el número. Ese progreso es tu año 1.',
          },
        ],
      },
    ],
  },
]

export const YEAR1: ProgramInfo = {
  id: 'year1',
  name: 'Año 1',
  tagline: 'De sedentario a entrenar solo, sin equipo',
  icon: '🎯',
  equipment: 'Sin equipo al inicio, mancuernas caseras desde el mes 5',
  months: MONTHS,
}

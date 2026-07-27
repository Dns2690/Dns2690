import type { ProgramInfo, ProgramMonth } from '../../lib/types'

/**
 * "Cuerpo completo con equipo": programa de 52 semanas / 3 sesiones por semana
 * pensado para alguien con acceso a gimnasio que quiere aprovechar el equipo
 * (no es progresión de peso corporal). Cuerpo completo en cada sesión, todo
 * el año. Progresión: meses 1-2 máquinas guiadas, meses 3-4 mancuernas y
 * Smith machine, meses 5-6 primeras barras, meses 7-12 barra como eje
 * (sentadilla, banca, remo, peso muerto) con más series e intensidad.
 */
const MONTHS: ProgramMonth[] = [
  {
    month: 1,
    title: 'Conociendo las máquinas',
    focus: 'Aprender los movimientos con el equipo más seguro del gimnasio',
    description:
      'Las máquinas guían el recorrido y reducen el riesgo mientras aprendés a moverte con equipo de gimnasio. Series moderadas, foco en sentir el músculo trabajando antes de pensar en el peso.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Cuerpo completo I',
        exercises: [
          { exerciseId: '0739', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0577', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0861', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0196', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0872', sets: 2, reps: '12', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Cuerpo completo II',
        exercises: [
          { exerciseId: '2287', sets: 3, reps: '10 por pierna', restSeconds: 75 },
          { exerciseId: '1350', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0673', sets: 3, reps: '10', restSeconds: 75 },
          { exerciseId: '0599', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0276', sets: 2, reps: '8 por lado', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Cuerpo completo III',
        exercises: [
          { exerciseId: '0585', sets: 3, reps: '12', restSeconds: 60 },
          { exerciseId: '1299', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0861', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0594', sets: 3, reps: '15', restSeconds: 45 },
          { exerciseId: '0687', sets: 2, reps: '12 (total)', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 2,
    title: 'Sumando series',
    focus: 'Más volumen con los mismos movimientos',
    description:
      'Mismos ejercicios que el mes 1, más series y repeticiones. El objetivo es que termines el mes moviéndote con soltura en cada máquina antes de sumar barra libre.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Cuerpo completo I',
        exercises: [
          { exerciseId: '0739', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0577', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0861', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0196', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0872', sets: 3, reps: '12', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Cuerpo completo II',
        exercises: [
          { exerciseId: '2287', sets: 3, reps: '12 por pierna', restSeconds: 75 },
          { exerciseId: '1350', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0673', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0599', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0276', sets: 3, reps: '10 por lado', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Cuerpo completo III',
        exercises: [
          { exerciseId: '0585', sets: 3, reps: '15', restSeconds: 60 },
          { exerciseId: '1299', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0861', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0594', sets: 3, reps: '18', restSeconds: 45 },
          { exerciseId: '0687', sets: 3, reps: '15 (total)', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 3,
    title: 'Mancuernas y Smith machine',
    focus: 'Primer contacto con carga libre guiada',
    description:
      'La máquina Smith mantiene la barra en un riel, así que es un buen puente entre las máquinas y la barra libre. Sumamos mancuernas para los movimientos de empuje y bisagra de cadera.',
    weeks: 5,
    days: [
      {
        day: 1,
        name: 'Día A · Cuerpo completo I',
        exercises: [
          { exerciseId: '0770', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '0289', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '0861', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '1459', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '0872', sets: 3, reps: '15', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Cuerpo completo II',
        exercises: [
          { exerciseId: '2287', sets: 3, reps: '12 por pierna', restSeconds: 75 },
          { exerciseId: '2330', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '1350', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0599', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0464', sets: 2, reps: '8 por lado', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Cuerpo completo III',
        exercises: [
          { exerciseId: '0770', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0289', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '1459', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0594', sets: 3, reps: '15', restSeconds: 45 },
          { exerciseId: '0687', sets: 3, reps: '15 (total)', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 4,
    title: 'Consolidando Smith machine',
    focus: 'Más carga, misma técnica',
    description:
      'Seguimos con Smith machine y mancuernas, apuntando a que la técnica se vuelva automática antes de pasar a la barra libre completa el mes que viene.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Cuerpo completo I',
        exercises: [
          { exerciseId: '0770', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0289', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0861', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '1459', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0334', sets: 3, reps: '12', restSeconds: 60 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Cuerpo completo II',
        exercises: [
          { exerciseId: '2287', sets: 3, reps: '15 por pierna', restSeconds: 75 },
          { exerciseId: '2330', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '1350', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0599', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0872', sets: 3, reps: '15', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Cuerpo completo III',
        exercises: [
          { exerciseId: '0770', sets: 3, reps: '15', restSeconds: 90 },
          { exerciseId: '0289', sets: 3, reps: '15', restSeconds: 90 },
          { exerciseId: '1459', sets: 3, reps: '15', restSeconds: 90 },
          { exerciseId: '0594', sets: 3, reps: '18', restSeconds: 45 },
          { exerciseId: '0464', sets: 3, reps: '10 por lado', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 5,
    title: 'Primera vez con barra libre',
    focus: 'Sentadilla, banca y remo con barra',
    description:
      'La barra libre exige más estabilidad que la Smith machine. Empezá con poco peso — incluso la barra sola — hasta que la técnica se sienta sólida en las tres posiciones.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Cuerpo completo I',
        exercises: [
          {
            exerciseId: '0043',
            sets: 3,
            reps: '8',
            restSeconds: 90,
            note: 'Empezá con la barra vacía o poco peso para afinar la técnica antes de cargarla.',
          },
          { exerciseId: '0025', sets: 3, reps: '8', restSeconds: 90 },
          { exerciseId: '0027', sets: 3, reps: '8', restSeconds: 90 },
          { exerciseId: '1459', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '0872', sets: 3, reps: '15', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Cuerpo completo II',
        exercises: [
          { exerciseId: '0770', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '2330', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '0861', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0599', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0687', sets: 3, reps: '15 (total)', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Cuerpo completo III',
        exercises: [
          { exerciseId: '0043', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '0025', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '0027', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '0594', sets: 3, reps: '15', restSeconds: 45 },
          { exerciseId: '0464', sets: 3, reps: '10 por lado', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 6,
    title: 'Barra y hombro',
    focus: 'Sumamos el press militar',
    description:
      'Con sentadilla, banca y remo ya más cómodos, sumamos el press de hombro con barra para completar los cuatro movimientos base del entrenamiento con pesas.',
    weeks: 5,
    days: [
      {
        day: 1,
        name: 'Día A · Cuerpo completo I',
        exercises: [
          { exerciseId: '0043', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '0025', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '0027', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '0091', sets: 3, reps: '8', restSeconds: 90 },
          { exerciseId: '0872', sets: 3, reps: '15', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Cuerpo completo II',
        exercises: [
          { exerciseId: '0770', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '2330', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0861', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '1459', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0599', sets: 3, reps: '12', restSeconds: 75 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Cuerpo completo III',
        exercises: [
          { exerciseId: '0043', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0025', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0027', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0091', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '0687', sets: 3, reps: '18 (total)', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 7,
    title: 'Cuarta serie',
    focus: 'Más volumen en los movimientos principales',
    description:
      'Sentadilla, banca y remo pasan a cuatro series. Es más tiempo bajo tensión — si una sesión se te hace larga, priorizá los primeros tres ejercicios.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Cuerpo completo I',
        exercises: [
          { exerciseId: '0043', sets: 4, reps: '8', restSeconds: 90 },
          { exerciseId: '0025', sets: 4, reps: '8', restSeconds: 90 },
          { exerciseId: '0027', sets: 4, reps: '8', restSeconds: 90 },
          { exerciseId: '0091', sets: 3, reps: '8', restSeconds: 90 },
          { exerciseId: '0872', sets: 3, reps: '15', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Cuerpo completo II',
        exercises: [
          { exerciseId: '0085', sets: 3, reps: '8', restSeconds: 90 },
          { exerciseId: '2330', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '0577', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0599', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0464', sets: 3, reps: '10 por lado', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Cuerpo completo III',
        exercises: [
          { exerciseId: '0043', sets: 4, reps: '10', restSeconds: 90 },
          { exerciseId: '0025', sets: 4, reps: '10', restSeconds: 90 },
          { exerciseId: '0027', sets: 4, reps: '10', restSeconds: 90 },
          { exerciseId: '0095', sets: 3, reps: '12', restSeconds: 60 },
          { exerciseId: '0687', sets: 3, reps: '18 (total)', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 8,
    title: 'Fuerza en marcha',
    focus: 'Cargas más pesadas, accesorios de brazo',
    description:
      'Los tres levantamientos principales ya están asentados. Sumamos trabajo directo de tríceps y bíceps para completar el desarrollo del tren superior.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Cuerpo completo I',
        exercises: [
          { exerciseId: '0043', sets: 4, reps: '10', restSeconds: 100 },
          { exerciseId: '0025', sets: 4, reps: '10', restSeconds: 100 },
          { exerciseId: '0027', sets: 4, reps: '10', restSeconds: 100 },
          { exerciseId: '0091', sets: 4, reps: '8', restSeconds: 90 },
          { exerciseId: '0872', sets: 3, reps: '18', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Cuerpo completo II',
        exercises: [
          { exerciseId: '0085', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '2330', sets: 4, reps: '10', restSeconds: 90 },
          { exerciseId: '0577', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0241', sets: 3, reps: '12', restSeconds: 60 },
          { exerciseId: '0464', sets: 3, reps: '12 por lado', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Cuerpo completo III',
        exercises: [
          { exerciseId: '0043', sets: 4, reps: '12', restSeconds: 100 },
          { exerciseId: '0025', sets: 4, reps: '12', restSeconds: 100 },
          { exerciseId: '0027', sets: 4, reps: '12', restSeconds: 100 },
          { exerciseId: '0031', sets: 3, reps: '10', restSeconds: 60 },
          { exerciseId: '0687', sets: 3, reps: '18 (total)', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 9,
    title: 'Peso muerto completo',
    focus: 'Sumamos el cuarto grande levantamiento',
    description:
      'Con la técnica de bisagra de cadera ya trabajada en la peso muerto rumana, pasamos al peso muerto completo desde el piso. Priorizá la forma sobre el número en la barra.',
    weeks: 5,
    days: [
      {
        day: 1,
        name: 'Día A · Cuerpo completo I',
        exercises: [
          { exerciseId: '0043', sets: 4, reps: '8', restSeconds: 100 },
          { exerciseId: '0025', sets: 4, reps: '8', restSeconds: 100 },
          {
            exerciseId: '0032',
            sets: 3,
            reps: '6',
            restSeconds: 120,
            note: 'El peso muerto exige más técnica que los demás: priorizá la forma sobre el peso.',
          },
          { exerciseId: '0091', sets: 3, reps: '8', restSeconds: 90 },
          { exerciseId: '0872', sets: 3, reps: '18', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Cuerpo completo II (descarga)',
        exercises: [
          { exerciseId: '0770', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '2330', sets: 4, reps: '10', restSeconds: 90 },
          { exerciseId: '0577', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0599', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0464', sets: 3, reps: '12 por lado', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Cuerpo completo III',
        exercises: [
          { exerciseId: '0043', sets: 4, reps: '10', restSeconds: 100 },
          { exerciseId: '0025', sets: 4, reps: '10', restSeconds: 100 },
          { exerciseId: '0032', sets: 3, reps: '8', restSeconds: 120 },
          { exerciseId: '0027', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '0687', sets: 3, reps: '20 (total)', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 10,
    title: 'Más carga',
    focus: 'Los cuatro grandes, más peso',
    description:
      'Sentadilla, banca, peso muerto y remo llevan diez meses de trabajo. Es el momento de empezar a subir el peso de forma más notoria en cada sesión.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Cuerpo completo I',
        exercises: [
          { exerciseId: '0043', sets: 4, reps: '8', restSeconds: 100 },
          { exerciseId: '0047', sets: 4, reps: '8', restSeconds: 100 },
          { exerciseId: '0032', sets: 4, reps: '6', restSeconds: 120 },
          { exerciseId: '3017', sets: 3, reps: '8', restSeconds: 90 },
          { exerciseId: '0872', sets: 4, reps: '15', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Cuerpo completo II (descarga)',
        exercises: [
          { exerciseId: '0770', sets: 3, reps: '12', restSeconds: 90 },
          { exerciseId: '2330', sets: 4, reps: '10', restSeconds: 90 },
          { exerciseId: '0091', sets: 3, reps: '10', restSeconds: 90 },
          { exerciseId: '0599', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0464', sets: 3, reps: '12 por lado', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Cuerpo completo III',
        exercises: [
          { exerciseId: '0043', sets: 4, reps: '10', restSeconds: 100 },
          { exerciseId: '0047', sets: 4, reps: '10', restSeconds: 100 },
          { exerciseId: '0032', sets: 4, reps: '8', restSeconds: 120 },
          { exerciseId: '0027', sets: 4, reps: '10', restSeconds: 90 },
          { exerciseId: '0687', sets: 4, reps: '15 (total)', restSeconds: 45 },
        ],
      },
    ],
  },
  {
    month: 11,
    title: 'Potencia y volumen alto',
    focus: 'Sumamos trabajo explosivo',
    description:
      'El kettlebell swing suma potencia de cadera a lo que ya construiste con la barra. Volumen alto en los cuatro grandes levantamientos.',
    weeks: 4,
    days: [
      {
        day: 1,
        name: 'Día A · Cuerpo completo I',
        exercises: [
          { exerciseId: '0043', sets: 4, reps: '8', restSeconds: 100 },
          { exerciseId: '0025', sets: 4, reps: '8', restSeconds: 100 },
          { exerciseId: '0032', sets: 4, reps: '6', restSeconds: 120 },
          { exerciseId: '0549', sets: 3, reps: '15', restSeconds: 75 },
          { exerciseId: '0872', sets: 4, reps: '18', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Cuerpo completo II',
        exercises: [
          { exerciseId: '0114', sets: 3, reps: '8 por pierna', restSeconds: 90 },
          { exerciseId: '2330', sets: 4, reps: '10', restSeconds: 90 },
          { exerciseId: '0091', sets: 4, reps: '8', restSeconds: 90 },
          { exerciseId: '0599', sets: 4, reps: '12', restSeconds: 75 },
          { exerciseId: '0464', sets: 4, reps: '12 por lado', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Cuerpo completo III',
        exercises: [
          { exerciseId: '0043', sets: 4, reps: '10', restSeconds: 100 },
          { exerciseId: '0025', sets: 4, reps: '10', restSeconds: 100 },
          { exerciseId: '0032', sets: 4, reps: '8', restSeconds: 120 },
          { exerciseId: '0027', sets: 4, reps: '10', restSeconds: 90 },
          { exerciseId: '0549', sets: 3, reps: '20', restSeconds: 75 },
        ],
      },
    ],
  },
  {
    month: 12,
    title: 'Pico de fuerza',
    focus: 'El mes más exigente — y el cierre del año',
    description:
      'Bajamos las repeticiones y subimos el peso en los cuatro grandes levantamientos. En la última sesión, comparás lo que levantás hoy contra el mes 5, cuando agarraste la barra por primera vez.',
    weeks: 5,
    days: [
      {
        day: 1,
        name: 'Día A · Cuerpo completo I',
        exercises: [
          { exerciseId: '0043', sets: 5, reps: '5', restSeconds: 120 },
          { exerciseId: '0025', sets: 5, reps: '5', restSeconds: 120 },
          { exerciseId: '0032', sets: 4, reps: '5', restSeconds: 150 },
          { exerciseId: '0091', sets: 4, reps: '6', restSeconds: 100 },
          { exerciseId: '0872', sets: 4, reps: '20', restSeconds: 45 },
        ],
      },
      {
        day: 2,
        name: 'Día B · Cuerpo completo II',
        exercises: [
          { exerciseId: '0114', sets: 3, reps: '10 por pierna', restSeconds: 90 },
          { exerciseId: '2330', sets: 4, reps: '10', restSeconds: 90 },
          { exerciseId: '0577', sets: 3, reps: '12', restSeconds: 75 },
          { exerciseId: '0599', sets: 4, reps: '12', restSeconds: 75 },
          { exerciseId: '0464', sets: 4, reps: '15 por lado', restSeconds: 45 },
        ],
      },
      {
        day: 3,
        name: 'Día C · Cuerpo completo III (cierre del año)',
        exercises: [
          {
            exerciseId: '0043',
            sets: 5,
            reps: '5',
            restSeconds: 120,
            note: 'Última sesión del año: anotá bien el peso en sentadilla, banca y peso muerto y comparalo con el mes 5. Ese salto es tu año de gimnasio.',
          },
          { exerciseId: '0025', sets: 5, reps: '5', restSeconds: 120 },
          { exerciseId: '0032', sets: 4, reps: '5', restSeconds: 150 },
          { exerciseId: '0549', sets: 3, reps: '20', restSeconds: 75 },
          { exerciseId: '0687', sets: 4, reps: '20 (total)', restSeconds: 45 },
        ],
      },
    ],
  },
]

export const FULLBODY_GYM: ProgramInfo = {
  id: 'fullbody-gym',
  name: 'Cuerpo completo con equipo',
  tagline: 'Full body todo el año, aprovechando máquinas y barra del gimnasio',
  icon: '🏋️',
  equipment: 'Gimnasio: máquinas, Smith, mancuernas y barra',
  months: MONTHS,
}

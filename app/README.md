# WorkoutOS

PWA personal (uso individual, no comercial) para explorar ejercicios de gimnasio, armar
rutinas propias, seguir programas guiados de 1 año, registrar entrenamientos (peso,
repeticiones, historial) y llevar mediciones corporales.

Los datos de ejercicios (1324 ejercicios, instrucciones en español) provienen de
[hasaneyldrm/exercises-dataset](https://github.com/hasaneyldrm/exercises-dataset)
(MIT). Las imágenes y GIFs se cargan directamente desde ese repositorio (no se
redistribuyen) y son © Gym visual — https://gymvisual.com/, tal como exige la
licencia del dataset.

Toda la información de rutinas y entrenamientos se guarda localmente en el
dispositivo (IndexedDB), no hay backend ni cuentas.

## Desarrollo

```bash
npm install
npm run dev
```

## Build

```bash
npm run build   # genera dist/ (app + service worker)
npm run preview # sirve dist/ para probarlo como PWA
```

## Instalar en el celular

Serví la carpeta `dist/` en cualquier hosting estático con HTTPS (GitHub Pages,
Netlify, Vercel, Cloudflare Pages) y abrí la URL desde el navegador del celular.
Usá "Agregar a pantalla de inicio" / "Instalar app" — no requiere publicarla en
ninguna tienda de aplicaciones.

## Actualizar el dataset

Los datos vienen recortados a español en `src/data/exercises.json`
(generado a partir de `data/exercises.json` del repo original, quedándose solo
con el campo `es` de instrucciones para reducir tamaño). Para regenerarlos,
descargá el JSON original y quedate con los campos usados en
`src/lib/types.ts`.

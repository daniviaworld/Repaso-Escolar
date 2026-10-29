# Danivia School — web

Versión web de la app de Android, con las mismas pantallas, las mismas pieles
(Infantil y Primaria), el mismo Dani, los mismos juegos, **el mismo motor de
preguntas** y **la misma base de datos**.

## Dónde van estos archivos

En la **raíz** del repositorio `daniviaworld/Repaso-Escolar`, encima de los que
haya. No en una subcarpeta: GitHub Pages sirve el `index.html` de la raíz, así
que una copia dentro de `nueva/` no la ve nadie.

## Qué hay aquí

| archivo | qué es |
|---|---|
| `index.html` | la página; solo carga los demás |
| `piel.css` | las pieles de Infantil y Primaria, y el modo oscuro |
| `datos.js` | cursos y materias, copiados de `Subject.kt` y `Course.kt` |
| `dani.js` | Dani dibujado en canvas y el catálogo de su tienda |
| `sonido.js` | pitidos, vibración, voz y el sonido de las preguntas de Música |
| `motor-js.js` | **el motor de la app**, compilado de Kotlin a JavaScript |
| `motor.js` | el enchufe entre la web y el motor, y cómo se corrigen las respuestas |
| `app.js` | perfiles, alta de alumno, cuadernos, temas, preguntas y resultado |
| `extras.js` | progreso, logros, tienda, familias, reto semanal, fallos, PIN y diploma |
| `juegos.js` | los diez juegos, incluido el contrarreloj |
| `minijuegos.js` | los nueve minijuegos premio del final de sesión |
| `nube.js` | sincronización con Firestore, traducida de `CloudSync.kt` |
| `manifest.json` | lo que necesita el móvil para instalarla como una app |
| `sw.js` | el trabajador de fondo: hace que funcione sin internet |
| `icono-192.png` / `icono-512.png` | el icono, el mismo de Google Play |
| `cabecera.jpg` | la imagen de Google Play, que encabeza el diploma |

## El motor es el mismo que el de la app

`motor-js.js` no está escrito a mano: es el motor de Kotlin de la app
(`BankEngine.kt` y los generadores) compilado a JavaScript con Gradle. Las
preguntas no están escritas dos veces, así que un cambio en el motor de la app
llega a la web recompilando, sin tocar nada más.

**Al recompilar el motor** (`gradlew jsBrowserProductionWebpack` en la carpeta
`motor-js` del proyecto de Android), el archivo que sale en
`build/dist/js/productionExecutable/motor-js.js` se sube aquí encima del que
hay. Sin eso, la web sigue funcionando pero con el motor anterior.

Comprobado antes de publicar:

- 219.200 preguntas generadas desde la web sobre los 548 temas: ninguna vacía,
  ninguna sin respuesta, ninguna respuesta que falte entre sus opciones,
  ningún tema que el motor se salte.
- Las cinco materias de banco (E. Física, Sociales, Valores, Valencià y English
  de Infantil) dan exactamente las mismas preguntas que la app, una por una.
- Las materias que se generan con números dan los mismos totales; solo cambia el
  orden en que salen, que es aleatorio por diseño.

## La base de datos es la misma que la de la app

`nube.js` es la traducción de `data/repo/CloudSync.kt`: escribe en la colección
`students` del proyecto `danivia-school`, con el documento llamado
`installId_profileId` y los mismos veinte campos, así que los alumnos de la web
salen en `danivia-admin.html` junto a los de la app, sin tocar el panel.

- Se entra en **anónimo**, como la app. Las reglas de Firestore no se han tocado.
- Como mucho **una escritura cada 8 segundos por alumno**.
- Los clientes escriben pero no leen: el progreso de verdad vive en el navegador
  del niño y Firestore es el reflejo para el panel.
- Sin internet, la web funciona entera y la sincronización falla en silencio.
- En el panel, los alumnos de la web llevan `appVersion: web-2.0`; los de la app,
  `kotlin-1.0`.

La `apiKey` que aparece en `nube.js` no es un secreto: las claves web de Firebase
van a la vista en cualquier web, es así por diseño. Lo que protege los datos son
las reglas de Firestore.

## Se instala y funciona sin internet

La web es una PWA: en el móvil o la tablet sale *"Añadir a pantalla de inicio"* y a
partir de ahí se abre como una app más, a pantalla completa y con su icono.

La primera vez que se abre con conexión, `sw.js` se guarda los 17 archivos. Desde
entonces **abre y se puede repasar sin internet**: el motor va dentro y el progreso
siempre ha vivido en el navegador. Lo único que espera a que vuelva la red es la
sincronización con el panel, que se reintenta sola.

Comprobado en un navegador de verdad: se instala, se corta la conexión, la web abre
igual y sigue generando preguntas.

### Al subir una versión nueva

No hace falta hacer nada especial: la página se pide siempre a la red primero, y los
demás archivos se renuevan solos en la siguiente visita.

Aun así, cuando cambies **varios archivos a la vez**, cambia también la fecha de esta
línea de `sw.js`:

    const VERSION = 'danivia-2026-10-29c';

Con eso el navegador tira la copia entera y se la vuelve a guardar de golpe, en vez de
ir archivo por archivo. Es la diferencia entre que la clase vea lo nuevo hoy o mañana.

## Letra grande

Un interruptor en la Zona Familias que agranda TODA la app —texto y botones—, no
solo las letras. Está hecho con `zoom` sobre el `body` (ver el final de `piel.css`)
porque las pantallas tienen las medidas en píxeles una a una: tocarlas de una en una
sería garantizar que alguna se queda sin crecer. Comprobado que no aparece barra de
desplazamiento horizontal.

## Repaso de ayer

Volver a preguntar lo que acabas de fallar hace diez minutos no enseña casi nada: la
respuesta sigue fresca y se contesta de memoria corta. Lo que fija es volver a verlo
**al día siguiente**. Por eso, cuando hay tres o más fallos de días anteriores, la
tarjeta de la pantalla de cuadernos cambia a "Repaso de ayer" y la sesión se monta
SOLO con esos, de la más antigua a la más reciente. Si no, sigue apareciendo la de
"Repasa tus fallos" de siempre, a partir de cinco.

## Lo que la app tiene y la web no

- **Recordatorio diario.** Una página web no puede avisar cuando está cerrada sin
  montar un servidor de notificaciones. Se queda en la app.

## Probar en local

No hace falta servidor: se puede abrir `index.html` directamente en el navegador.
Si se abre como archivo, el progreso no se guarda entre sesiones (los navegadores
no dejan guardar datos a las páginas abiertas con `file://`); sirviéndola desde
GitHub Pages sí se guarda.

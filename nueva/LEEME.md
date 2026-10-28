# Danivia School — web

Versión web de la app de Android, con las mismas pantallas, las mismas pieles
(Infantil y Primaria), el mismo Dani, los mismos juegos, **el mismo motor de
preguntas** y **la misma base de datos**.

## Qué hay aquí

| archivo | qué es |
|---|---|
| `index.html` | la página; solo carga los demás |
| `piel.css` | las pieles de Infantil y Primaria, y el modo oscuro |
| `datos.js` | cursos y materias, copiados de `Subject.kt` y `Course.kt` |
| `dani.js` | Dani dibujado en canvas y el catálogo de su tienda |
| `motor-js.js` | **el motor de la app**, compilado de Kotlin a JavaScript |
| `motor.js` | el enchufe entre la web y el motor (unas pocas líneas) |
| `app.js` | perfiles, alta de alumno, cuadernos, temas, preguntas y resultado |
| `extras.js` | progreso, logros, tienda, zona de familias, reto semanal, fallos |
| `juegos.js` | los diez juegos, incluido el contrarreloj |
| `minijuegos.js` | los nueve minijuegos premio del final de sesión |
| `nube.js` | sincronización con Firestore, traducida de `CloudSync.kt` |

## El motor es el mismo que el de la app

`motor-js.js` no está escrito a mano: es el motor de Kotlin de la app
(`BankEngine.kt` y los generadores) compilado a JavaScript con Gradle. Las
preguntas no están escritas dos veces, así que un cambio en el motor de la app
llega a la web recompilando, sin tocar nada más.

Comprobado antes de publicar:

- 219.200 preguntas generadas desde la web sobre los 548 temas: ninguna vacía,
  ninguna sin respuesta, ninguna respuesta que falte entre sus opciones,
  ningún tema que el motor se salte.
- Las cinco materias de banco (E. Física, Sociales, Valores, Valencià y English
  de Infantil) dan exactamente las mismas preguntas que la app, una por una.
- Las materias que se generan con números (mates, lengua…) dan los mismos
  totales; solo cambia el orden en que salen, que es aleatorio por diseño.

### Para recompilarlo cuando cambie el motor de la app

En la carpeta `motor-js` del proyecto de Android:

    gradlew jsBrowserProductionWebpack

y el archivo resultante (`build/dist/js/productionExecutable/motor-js.js`) se
copia aquí encima del que hay.

## La base de datos es la misma que la de la app

`nube.js` es la traducción de `data/repo/CloudSync.kt`: escribe en la colección
`students` del proyecto `danivia-school`, con el documento llamado
`installId_profileId` y **los mismos veinte campos**, así que los alumnos de la
web salen en `danivia-admin.html` junto a los de la app, sin tocar el panel.

- Se entra en **anónimo**, como la app. Las reglas de Firestore no se han
  tocado: tal y como estaban ya dejan escribir a la web.
- Como mucho **una escritura cada 8 segundos por alumno**, igual que la app.
- Los clientes escriben pero no leen: el progreso de verdad vive en el
  navegador del niño y Firestore es el reflejo para el panel.
- Sin internet, la web funciona **entera**: la sincronización falla en
  silencio y el niño no se entera de nada.
- En el panel, los alumnos de la web se distinguen por el campo `appVersion`,
  que pone `web-2.0` (los de la app ponen `kotlin-1.0`).

La `apiKey` que aparece en `nube.js` no es un secreto: las claves web de
Firebase van a la vista en cualquier web, es así por diseño. Lo que protege los
datos son las reglas de Firestore.

## Lo que todavía no está

- PIN familiar.
- Lectura automática de las preguntas (el botón 🔈 sí funciona, y en las de
  comprensión lectora lee también el texto).

## Probar en local

No hace falta servidor: se puede abrir `index.html` directamente en el
navegador. Si se abre como archivo, el progreso no se guarda entre sesiones
(los navegadores no dejan guardar datos a las páginas abiertas con `file://`);
sirviéndola desde GitHub Pages sí se guarda.

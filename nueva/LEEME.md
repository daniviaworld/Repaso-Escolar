# Danivia School — web

Versión web de la app de Android, con las mismas pantallas, las mismas pieles
(Infantil y Primaria), el mismo Dani y los mismos juegos.

## Qué hay aquí

| archivo | qué es |
|---|---|
| `index.html` | la página; solo carga los demás |
| `piel.css` | las pieles de Infantil y Primaria, y el modo oscuro |
| `datos.js` | cursos y materias, copiados de `Subject.kt` y `Course.kt` |
| `dani.js` | Dani dibujado en canvas y el catálogo de su tienda |
| `app.js` | perfiles, cuadernos, camino de temas, preguntas y resultado |
| `extras.js` | progreso, logros, tienda, zona de familias, reto semanal, fallos |
| `juegos.js` | los diez juegos, incluido el contrarreloj |
| `minijuegos.js` | los nueve minijuegos premio del final de sesión |
| `motor-provisional.js` | **ANDAMIO**: cuatro preguntas de muestra por materia |

## Lo importante: el motor es provisional

`motor-provisional.js` NO es el motor de verdad. El bueno es el de Kotlin
(317.963 preguntas distintas), y se compilará a JavaScript para que la web y la
app sirvan exactamente las mismas preguntas sin escribirlas dos veces.

El contrato ya está fijado, así que enchufarlo será sustituir ese archivo:

    generaPregunta(materiaId, cursoId, tema) -> { texto, tipo, opciones[], respuesta, ... }
    temasDe(materiaId) -> [string]

## Lo que todavía no está

- El motor de verdad (lo anterior).
- Sincronización con Firestore, para que el panel de control vea también a los
  alumnos que usan la web.
- PIN familiar.
- Lectura automática de las preguntas (el botón 🔈 sí funciona).

## Probar en local

No hace falta servidor: se puede abrir `index.html` directamente en el
navegador. Si se abre como archivo, el progreso no se guarda entre sesiones
(los navegadores no dejan guardar datos a las páginas abiertas con `file://`);
sirviéndola desde GitHub Pages sí se guarda.

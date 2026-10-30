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
| `fiesta.js` | la estrella que vuela al contador y el confeti del final |
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
| `nunito-*.woff2` | la letra, metida en el propio sitio (72 KB entre las cuatro) |
| `diagnostico.html` | medidor para un móvil que vaya lento; no se enlaza desde la app |

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

    const VERSION = 'danivia-2026-10-29d';

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

## Lo que se hizo para que entre por los ojos a un niño

**Se mueve.** Antes todo aparecía de golpe. Ahora los botones se hunden al pulsarlos,
la respuesta correcta da un salto, la que falla se sacude, las tarjetas entran
escalonadas y la barra de progreso se llena en vez de saltar. Todo en CSS, sin
librerías, y respetando a quien tenga pedido en su móvil que no se mueva nada.

**La estrella vuela.** Al acertar sale una estrella de donde ha respondido y viaja
hasta el contador, que da un respingo. El contador está también DENTRO de la sesión:
verlas subir mientras responde es la mitad de la gracia.

**Hay confeti.** Al terminar con dos o tres estrellas. Un pleno sin celebrar es un
pleno desperdiciado.

**La letra es redonda** (Nunito). La del sistema es la misma que usan el correo y los
ajustes: correcta y adulta.

**El camino es un tablero.** Era una lista de temas uno debajo de otro, y resulta que
es la pantalla donde el niño elige qué hacer. Ahora es un tablero con cielo, sol,
nubes y hierba, y una senda de tierra que serpentea entre las casillas. Cada casilla
lleva su **aro de progreso** alrededor (sin números: se ve cuánto lleva de cada tema),
las dominadas van en dorado con ★, las que no ha tocado con el borde discontinuo, y
la que le toca con un halo que late y su cartel de **TE TOCA**. Al final, la meta.

**Tocar una casilla entra DIRECTO al ejercicio.** Antes abría una ficha y había que
dar un segundo toque. Un niño no quiere configurar nada: quiere jugar. Cuántas
preguntas se elige una vez arriba y se recuerda para la próxima.

**Dani sale en el inicio** y dice algo útil: la materia que lleva sin tocar, la racha
que puede perder hoy, los fallos de ayer. Nunca riñe.

**La tienda se abre tocando las estrellas**, y sale un punto rojo cuando ya le llega
para algo que no tiene. Antes estaba escondida en Progreso, siendo la mejor mecánica
que tiene la app.

## Que vaya suelta en un móvil

Medido en un navegador de verdad con el procesador frenado cuatro veces, que es
más o menos un móvil modesto. De tocar a ver el cambio:

| | antes | ahora |
|---|---|---|
| tocar un cuaderno → se ve el camino | 203 ms | 141 ms |
| tocar una casilla → se ve la pregunta | — | 50 ms |
| **responder, la primera vez** | **295 ms** | **37 ms** |
| responder, las siguientes | 38 ms | 37 ms |

Lo que lo causaba y cómo se arregló:

- **El primer pitido costaba 174 ms.** Crear el motor de sonido del navegador es
  caro y se hacía en la primera respuesta, justo con el niño esperando. Ahora se
  prepara en el primer toque que da en la pantalla, sea donde sea.
- **`background-attachment: fixed`** en el fondo de Primaria. En el móvil obliga a
  repintar el fondo entero en cada fotograma del desplazamiento. Fuera.
- **Dos animaciones infinitas** (las rayas de la senda moviéndose y el halo hecho
  con sombras) repintaban zonas grandes sesenta veces por segundo aunque nadie
  tocara nada. Las rayas se han quedado quietas y el halo se hace ahora con un
  círculo que escala y se desvanece, que lo lleva la tarjeta gráfica.
- **`touch-action: manipulation`** en todo lo que se pulsa: le dice al navegador
  que aquí no hay doble toque para ampliar, así que no espera a ver si viene un
  segundo dedo antes de responder.
- **Las animaciones de entrada se repetían en cada repintado**: tocabas cualquier
  cosa y las diez tarjetas volvían a entrar una a una. Ahora solo cuando la
  pantalla cambia de verdad.

Desplazando: 60 fotogramas por segundo en el inicio y en el camino, con el
procesador frenado cuatro y seis veces, sin tirones.

## La nube NO se toca mientras el niño responde

Estuvo mal hecho unos días: `guardaTodo()` sincronizaba con Firestore, y
`guardaTodo()` se llama en CADA respuesta. Tenía un freno de 8 segundos, pero 8
segundos es lo que tarda un niño en contestar dos o tres preguntas: o sea que a
partir de la tercera empezaba a escribir en la nube en mitad de la sesión. En un
ordenador con fibra no se nota; en un móvil con mala cobertura, cada escritura se
come el hilo principal y el botón tarda en marcarse.

La app de Android nunca hizo eso: sincroniza al TERMINAR la sesión (ver
`finishQuiz` en `GameViewModel.kt`). Ahora la web hace lo mismo: al acabar una
sesión, al crear un alumno, al cambiar de alumno y al cambiar de curso. Y la
prueba `prueba-nube.js` comprueba que responder cinco preguntas seguidas no
escribe ni una vez.

## Primero se marca, después se trabaja

Al responder se hacía todo de golpe —apuntar, guardar, repintar la pantalla— y el
color de la respuesta se veía AL FINAL. Si algo de eso costaba, el niño miraba un
botón que no reaccionaba y volvía a tocar.

Ahora el botón se pinta al instante, a mano, y el resto se hace en el fotograma
siguiente. El trabajo es el mismo; lo que cambia es que ya no se ve.

## Si un móvil va lento: diagnostico.html

Se abre `…/nueva/diagnostico.html` EN ESE MÓVIL y se pulsa Medir. Hace el mismo
trabajo que la web al responder una pregunta y cronometra cada paso en ese
aparato: generar la pregunta, montar la pantalla, guardar, dibujar a Dani, el
sonido, los fotogramas por segundo y el peor parón. Más el modelo de pantalla,
los núcleos, la memoria y el tipo de conexión. No toca el progreso de nadie.

## Lo que la app tiene y la web no

- **Recordatorio diario.** Una página web no puede avisar cuando está cerrada sin
  montar un servidor de notificaciones. Se queda en la app.

## Probar en local

No hace falta servidor: se puede abrir `index.html` directamente en el navegador.
Si se abre como archivo, el progreso no se guarda entre sesiones (los navegadores
no dejan guardar datos a las páginas abiertas con `file://`); sirviéndola desde
GitHub Pages sí se guarda.

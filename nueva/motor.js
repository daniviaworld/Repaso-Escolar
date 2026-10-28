/* ===================================================================
   EL MOTOR DE VERDAD.
   Sustituye a motor-provisional.js. No genera nada por su cuenta: todo
   lo hace motor-js.js, que es el motor de Kotlin de la app compilado a
   JavaScript. Aquí solo se adapta la llamada.

   El motor pide siempre el curso; la web, en muchos sitios, solo sabe
   la materia. Por eso aquí se rellena con el curso del alumno que esté
   usando la app en ese momento.
   =================================================================== */

function motorListo() {
  return typeof globalThis.motorDanivia !== 'undefined';
}

function cursoDelAlumno() {
  const a = (typeof alumnoActual === 'function') ? alumnoActual() : null;
  return a ? a.curso : 'p3';
}

function temasDe(materiaId, cursoId) {
  if (!motorListo()) return ['General'];
  return Array.from(globalThis.motorDanivia.temasDe(materiaId, cursoId || cursoDelAlumno()));
}

function generaPregunta(materiaId, cursoId, tema) {
  const q = globalThis.motorDanivia.generaPregunta(materiaId, cursoId || cursoDelAlumno(), tema || null);
  return {
    texto: q.texto,
    tipo: q.tipo,                       // 'MC' (opciones) o 'INPUT' (escribir)
    opciones: Array.from(q.opciones || []),
    respuesta: q.respuesta,
    etiqueta: q.etiqueta,
    visual: q.visual || '',
    explicacion: q.explicacion,
    lectura: q.lectura,                 // texto de comprensión lectora, si lo hay
    materia: q.materia,
    tema: q.tema
  };
}

/**
 * Compara lo que ha escrito el niño con la respuesta buena.
 *
 * Es tolerante a propósito: ignora mayúsculas, tildes, espacios de sobra y
 * acepta la coma o el punto decimal indistintamente. Un niño que escribe
 * "2,5" cuando la respuesta es "2.5" sabe la respuesta, y marcársela mal
 * sería enseñarle que la app es injusta.
 */
function respuestaEscritaVale(escrito, correcta) {
  const limpia = t => String(t).trim().toLowerCase()
    .replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i').replace(/ó/g,'o').replace(/ú/g,'u')
    .replace(/,/g, '.');
  return limpia(escrito) === limpia(correcta);
}

/** Se llama al cambiar de alumno: la memoria anti-repetición vive dentro del motor. */
function olvidarRecientes() {
  if (motorListo()) globalThis.motorDanivia.olvidarRecientes();
}

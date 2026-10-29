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
    tema: q.tema,
    // Cómo hay que corregir si es de escribir, tal y como lo decide el motor.
    // Se dejan tal cual (sin convertir a true/false) a propósito: si el motor es
    // anterior a este cambio no las manda, y "no las manda" tiene que poder
    // distinguirse de "dice que no". Ver respuestaEscritaVale.
    ignoraMayusculas: q.ignoraMayusculas,
    esDecimal: q.esDecimal,
    // Notas a tocar en las preguntas de Música (lista de [frecuencia, duración]).
    audio: q.audio ? Array.from(q.audio).map(n => Array.from(n)) : null
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
function respuestaEscritaVale(escrito, correcta, pregunta) {
  const q = pregunta || {};

  // Preguntas de decimales: se comparan como NÚMEROS, así "40,20", "40.2" y "40,2"
  // valen igual y un cero de más no le cuesta un punto a nadie. Es exactamente lo
  // que hace mismoNumero() en el motor de la app.
  const aNumero = t => {
    const v = String(t).trim().replace(/\s/g, '').replace('−', '-').replace(',', '.');
    return /^-?\d+(\.\d+)?$/.test(v) ? parseFloat(v) : null;
  };
  if (q.esDecimal) {
    const x = aNumero(escrito), y = aNumero(correcta);
    return x !== null && y !== null && Math.abs(x - y) < 1e-7;
  }

  // Si las dos son números (una cuenta normal), también se comparan como números:
  // escribir "07" donde la respuesta es "7" no es un error de matemáticas.
  const x = aNumero(escrito), y = aNumero(correcta);
  if (x !== null && y !== null) return Math.abs(x - y) < 1e-7;

  // Y si no, texto. Las mayúsculas y las tildes solo se ignoran cuando la pregunta
  // dice que se pueden ignorar: en un ejercicio de acentuación, la tilde ES la
  // pregunta, y darla por buena sería enseñar lo contrario de lo que se repasa.
  // Si el motor compilado es anterior a este cambio no manda la pista, y entonces
  // se es indulgente: más vale dar por buena una tilde de menos que suspender a un
  // niño por culpa de un archivo sin recompilar.
  const ignora = (q.ignoraMayusculas === undefined) ? true : !!q.ignoraMayusculas;
  const limpia = t => {
    let v = String(t).trim();
    if (ignora) {
      v = v.toLowerCase()
        .replace(/á/g,'a').replace(/é/g,'e').replace(/í/g,'i').replace(/ó/g,'o').replace(/ú/g,'u');
    }
    return v;
  };
  return limpia(escrito) === limpia(correcta);
}

/** Se llama al cambiar de alumno: la memoria anti-repetición vive dentro del motor. */
function olvidarRecientes() {
  if (motorListo()) globalThis.motorDanivia.olvidarRecientes();
}

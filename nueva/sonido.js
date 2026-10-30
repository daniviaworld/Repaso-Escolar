/* ===================================================================
   SONIDO Y VIBRACIÓN — lo que hacía AudioPlayer.kt en la app.

   La app pita al acertar y al fallar, y vibra un poco. La web no hacía
   ninguna de las dos cosas, y se notaba: la misma pregunta respondida
   en el móvil y en el ordenador no se sentía igual.

   No se descarga ningún archivo de sonido: los pitidos se generan con
   el propio navegador (WebAudio), así que no pesan nada y no hay nada
   que esperar.
   =================================================================== */

let _audio = null;

/**
 * EL PRIMER PITIDO COSTABA 170 MILISEGUNDOS.
 *
 * Crear el motor de sonido del navegador es caro, y se hacía en la primera
 * respuesta: justo en el peor momento, con el niño esperando a ver si ha
 * acertado. Medido en un móvil modesto: 174 ms la primera vez, 1 ms las demás.
 *
 * Se prepara en el primer toque que da en la pantalla, sea donde sea. Tiene que
 * ser dentro de un toque de verdad porque los navegadores no dejan crear sonido
 * de otra forma, y para entonces ya no hay nada esperando.
 */
try {
  window.addEventListener('pointerdown', () => { contextoAudio(); }, { once: true, passive: true });
} catch (e) { /* ni eso puede romper nada */ }

/** El navegador no deja crear sonido hasta que el usuario toca algo; por eso se crea tarde. */
function contextoAudio() {
  try {
    if (!_audio) _audio = new (window.AudioContext || window.webkitAudioContext)();
    if (_audio.state === 'suspended') _audio.resume();
    return _audio;
  } catch (e) { return null; }
}

/**
 * Toca una secuencia de notas, cada una {freq, dur} en hercios y segundos.
 *
 * Es la misma función que playSequence() en AudioPlayer.kt, con el mismo silencio
 * de 0,14 s entre notas, para que una pregunta de Música suene IGUAL en el móvil
 * y en el ordenador. Si no suenan igual, la respuesta puede no ser la misma.
 */
function tocaSecuencia(notas, aunqueEsteApagado) {
  if (!notas || !notas.length) return;
  if (!estado.sonido && !aunqueEsteApagado) return;
  const ctx = contextoAudio();
  if (!ctx) return;
  try {
    let t = ctx.currentTime + 0.05;
    notas.forEach(n => {
      const freq = Array.isArray(n) ? n[0] : n.freq;
      const dur = Array.isArray(n) ? n[1] : n.dur;
      const osc = ctx.createOscillator();
      const vol = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t);
      // Entra y sale suave: cortar una onda en seco suena a chasquido.
      vol.gain.setValueAtTime(0.0001, t);
      vol.gain.exponentialRampToValueAtTime(0.25, t + 0.012);
      vol.gain.setValueAtTime(0.25, t + dur - 0.012);
      vol.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      osc.connect(vol); vol.connect(ctx.destination);
      osc.start(t); osc.stop(t + dur + 0.01);
      t += dur + 0.14;
    });
  } catch (e) { /* sin sonido no pasa nada */ }
}

/** El pitido de acertar o fallar. Las mismas notas que beep() en la app. */
function pita(acierto) {
  if (acierto) tocaSecuencia([[660, 0.10], [880, 0.18]]);
  else tocaSecuencia([[220, 0.22]]);
}

/**
 * El sonido de una pregunta de Música.
 *
 * Suena aunque el interruptor de Sonido esté apagado: sin él la pregunta no se
 * puede responder, no es un adorno. El interruptor apaga los pitidos, no el
 * ejercicio.
 */
function tocaPregunta(q) {
  if (q && q.audio && q.audio.length) tocaSecuencia(q.audio, true);
}

/** Vibración corta al acertar, doble al fallar. Solo en móviles que la tengan. */
function vibra(acierto) {
  if (!estado.vibrar) return;
  try { if (navigator.vibrate) navigator.vibrate(acierto ? 35 : [0, 40, 40, 40]); } catch (e) {}
}

/** Lee un texto en alto. La usa el botón 🔈 y la voz automática. */
function leeTexto(texto) {
  try {
    const voz = new SpeechSynthesisUtterance(texto);
    voz.lang = 'es-ES';
    speechSynthesis.cancel();
    speechSynthesis.speak(voz);
  } catch (e) { /* algunos navegadores no tienen voz */ }
}

function callaVoz() { try { speechSynthesis.cancel(); } catch (e) {} }

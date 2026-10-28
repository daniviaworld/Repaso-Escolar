/* ===================================================================
   SINCRONIZACIÓN CON FIRESTORE
   Traducción exacta de data/repo/CloudSync.kt. Escribe en la MISMA
   colección "students" con los MISMOS campos que la app de Android y
   que la web antigua, para que danivia-admin.html los vea sin tocar
   ni una línea del panel ni de las reglas de Firestore.

   Reglas de la casa (no cambiarlas sin querer):
   - Se entra en anónimo. Las reglas exigen estar identificado para
     escribir, pero no leer: el progreso de verdad vive en el
     navegador del niño, esto es solo el reflejo para el panel.
   - El documento se llama installId_profileId, como manda la regla.
   - Si no hay internet, o Firebase no carga, la web sigue funcionando
     entera: aquí no se lanza ningún error hacia fuera.
   =================================================================== */

const CONFIG_FIREBASE = {
  apiKey: "AIzaSyCNe7h2OX5yu3a-Adt48gXPA29D3OrTW8s",
  authDomain: "danivia-school.firebaseapp.com",
  projectId: "danivia-school",
  storageBucket: "danivia-school.firebasestorage.app",
  messagingSenderId: "397698140157",
  appId: "1:397698140157:web:5738640d6191bce1fe3b94"
};

let nubeDb = null, nubeAuth = null, nubeEntrando = false;
const ultimoEnvio = {};   // profileId -> momento del último envío

function nubeArranca() {
  try {
    if (typeof firebase === 'undefined') return;     // sin conexión: ni se intenta
    firebase.initializeApp(CONFIG_FIREBASE);
    nubeAuth = firebase.auth();
    nubeDb = firebase.firestore();
    entraEnAnonimo();
  } catch (e) { nubeDb = null; }
}

function entraEnAnonimo(luego) {
  if (!nubeAuth) return;
  if (nubeAuth.currentUser) { if (luego) luego(); return; }
  if (nubeEntrando) return;
  nubeEntrando = true;
  nubeAuth.signInAnonymously()
    .then(() => { nubeEntrando = false; if (luego) luego(); })
    .catch(() => { nubeEntrando = false; });   // sin conexión: todo sigue local
}

/** El mismo identificador de dispositivo que guarda la app en sus preferencias. */
function idDeInstalacion() {
  try {
    let id = localStorage.getItem('install_id');
    if (!id) {
      id = 'inst_' + Date.now().toString(36) + '_' +
           Math.floor(100000 + Math.random() * 900000).toString(36);
      localStorage.setItem('install_id', id);
    }
    return id;
  } catch (e) { return 'inst_sin_memoria'; }
}

/**
 * Sube el progreso de un alumno. Como mucho una escritura cada 8 segundos por
 * alumno, igual que CloudSync.kt: si no, cada respuesta sería una escritura.
 */
function sincronizaNube(a) {
  try {
    if (!a || !nubeDb) return;
    const ahora = Date.now();
    if (ultimoEnvio[a.id] && ahora - ultimoEnvio[a.id] < 8000) return;

    if (!nubeAuth || !nubeAuth.currentUser) { entraEnAnonimo(() => sincronizaNube(a)); return; }
    ultimoEnvio[a.id] = ahora;

    const curso = cursoPorId(a.curso);
    if (!curso) return;

    const totalDone = sumaHechas(a), totalOk = sumaAciertos(a);

    // Temas flojos: los mismos que marca la app (4 respuestas mínimo, por debajo del 80%).
    const weakTopics = [];
    Object.keys(a.stats || {}).forEach(materia => {
      const temas = (a.stats[materia] || {}).temas || {};
      Object.keys(temas).forEach(tema => {
        const v = temas[tema];
        if (v.hechas >= 4) {
          const pct = Math.round(v.ok * 100 / v.hechas);
          if (pct < 80) weakTopics.push({ subj: materia, topic: tema, done: v.hechas, ok: v.ok, pct });
        }
      });
    });
    weakTopics.sort((x, y) => x.pct - y.pct);

    const bySubject = {};
    materiasDe(curso).forEach(m => {
      const st = a.stats[m.id];
      if (st && st.hechas > 0) bySubject[m.id] = { name: m.nombre, ico: m.icono, done: st.hechas, ok: st.ok };
    });

    const h = (a.historial || [])[0];
    const lastSession = h ? { d: h.d, s: h.s || '', ok: h.ok, n: h.n } : null;

    const doc = {
      installId: idDeInstalacion(),
      profileId: a.id,
      name: a.nombre,
      avatar: a.avatar,
      courseId: curso.id,
      courseName: curso.nombre,
      stage: curso.etapa === 'infantil' ? 'inf' : 'pri',
      stars: a.estrellas || 0,
      streak: racha(a),
      gamesPlayed: a.juegos || 0,
      totalDone: totalDone,
      totalOk: totalOk,
      accuracy: totalDone > 0 ? Math.round(totalOk * 100 / totalDone) : 0,
      badgeCount: LOGROS.filter(l => l.test(a)).length,
      weakTopics: weakTopics.slice(0, 5),
      bySubject: bySubject,
      lastSession: lastSession,
      updatedAtMs: ahora,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
      appVersion: 'web-2.0'
    };

    nubeDb.collection('students')
      .doc(idDeInstalacion() + '_' + a.id)
      .set(doc, { merge: true })
      .catch(() => { delete ultimoEnvio[a.id]; });   // ya se reintentará en la siguiente
  } catch (e) { /* la nube nunca puede romper la sesión del niño */ }
}

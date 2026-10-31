/* ===================================================================
   CARRERA DE CÁLCULO — dos jugadores en la misma pantalla.

   QUÉ ES. La pantalla partida por la mitad. Cada jugador tiene su
   pregunta y sus cuatro botones, y el de arriba los ve del derecho
   porque su mitad está girada 180º: los dos se sientan enfrente con
   la tablet en medio, como un juego de mesa. Gana quien llegue antes
   a la meta.

   POR QUÉ. En clase y en casa es donde más se usa: dos niños, un
   aparato. Y no inventa preguntas nuevas, saca las del motor de
   siempre según el curso del alumno, así que mientras compiten están
   repasando lo suyo.

   SOLO O ACOMPAÑADO. Si no hay con quién, la mitad de arriba la juega
   la app, con una velocidad acorde al curso.

   UN SOLO RELOJ. Todo lo que pasa con el tiempo (la cuenta atrás, el
   castigo por fallar, el turno de la app) cuelga del mismo intervalo
   de un segundo, J.reloj, que es el que cierraJuego() ya sabe parar.
   Con varios temporizadores sueltos uno se queda corriendo por detrás
   y acaba ralentizando la web entera.
   =================================================================== */

/* Cuántos aciertos hacen falta para ganar y cuánto tarda la app en
   contestar (en segundos), según la etapa. */
function carreraAjustes(lvl) {
  if (lvl < 2) return { meta: 5, rival: [4, 7], acierta: 0.70 };   // Infantil
  if (lvl < 4) return { meta: 7, rival: [4, 6], acierta: 0.78 };   // 1º y 2º
  if (lvl < 6) return { meta: 8, rival: [3, 5], acierta: 0.84 };   // 3º y 4º
  return          { meta: 10, rival: [3, 5], acierta: 0.88 };      // 5º y 6º
}

const CARRERA_FICHAS = ['🐢', '🐇', '🦊', '🐸', '🐧', '🦄'];

function juegoCarrera() {
  const a = alumnoActual();
  const curso = cursoPorId(a.curso);
  const color = JUEGOS.find(x => x.id === 'carrera').color;

  if (J.juego !== 'carrera') {
    nuevoJuego({ juego:'carrera', fase:'inicio', modo:null, ...carreraAjustes(curso.lvl) });
  }

  /* ----- Elegir con quién ----- */
  if (J.fase === 'inicio') {
    app().innerHTML = marcoJuego('carrera', 'Carrera de cálculo', null, null, `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;
                  align-items:center;text-align:center;max-width:330px">
        <div style="font-size:62px">🏁</div>
        <h2 style="font-size:26px;font-weight:900;margin:8px 0 6px">Carrera de cálculo</h2>
        <p style="font-size:14px;opacity:.68;line-height:1.5;margin:0">
          Gana quien acierte <strong>${J.meta}</strong> preguntas de
          ${escapaHtml(curso.nombre)} antes.</p>
        <button onclick="arrancaCarrera('dos')" style="margin-top:24px;width:100%;background:${color};
                color:#fff;border:none;border-radius:20px;padding:17px;font-weight:900;font-size:18px;
                cursor:pointer;font:inherit;font-weight:900;box-shadow:0 5px 0 rgba(0,0,0,.22)">
          👥 Dos jugadores</button>
        <small style="opacity:.6;margin-top:7px;line-height:1.4">
          La pantalla se parte en dos. Poned la tablet en medio y sentaos enfrente.</small>
        <button onclick="arrancaCarrera('app')" style="margin-top:18px;width:100%;
                background:var(--tarjeta);color:var(--tinta);border:none;border-radius:20px;padding:15px;
                cursor:pointer;font:inherit;font-weight:800;font-size:16px;
                box-shadow:0 4px 0 rgba(11,42,74,.16)">🤖 Yo contra la app</button>
      </div>`);
    return;
  }

  /* ----- Cuenta atrás ----- */
  if (J.fase === 'cuenta') {
    const t = J.cuenta;
    app().innerHTML = marcoJuego('carrera', 'Carrera de cálculo', null, null, `
      <div style="flex:1;display:grid;place-items:center">
        <div style="font-size:${t ? 110 : 62}px;font-weight:900;color:${color};line-height:1">
          ${t || '¡YA!'}</div>
      </div>`);
    return;
  }

  /* ----- Final ----- */
  if (J.fase === 'fin') {
    const gana = J.jug[0].puntos >= J.meta;
    const rival = J.modo === 'app' ? 'La app' : 'El jugador de arriba';
    app().innerHTML = marcoJuego('carrera', 'Carrera de cálculo', null, null, `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;
                  align-items:center;text-align:center">
        <div style="font-size:66px">${gana ? '🏆' : '🏁'}</div>
        <h2 style="font-size:27px;font-weight:900;margin:10px 0 4px">
          ${gana ? '¡Has ganado!' : rival + ' ha ganado'}</h2>
        <p style="font-size:16px;opacity:.72;margin:0;font-weight:800">
          ${J.jug[0].ficha} ${J.jug[0].puntos} — ${J.jug[1].puntos} ${J.jug[1].ficha}</p>
        ${J.premio ? `<div class="pastilla" style="background:#FFC93C4D;margin-top:16px;
             font-weight:900;font-size:17px">⭐ +${J.premio} estrellas</div>`
          : `<p style="font-size:13px;opacity:.55;margin-top:14px">¡Otra y la ganas!</p>`}
        <div style="display:flex;gap:12px;margin-top:24px">
          <button onclick="arrancaCarrera('${J.modo}')" style="background:${color};color:#fff;border:none;
                  border-radius:18px;padding:15px 26px;cursor:pointer;font:inherit;font-weight:900;
                  font-size:16px;box-shadow:0 4px 0 rgba(0,0,0,.2)">Otra 🔁</button>
          <button onclick="cierraJuego()" style="background:var(--tarjeta);color:var(--tinta);border:none;
                  border-radius:18px;padding:15px 26px;cursor:pointer;font:inherit;font-weight:800;
                  font-size:16px">Salir</button>
        </div>
      </div>`);
    if (gana) confeti(2);
    return;
  }

  /* ----- La carrera ----- */
  // Se dibuja sin marcoJuego: aquí la pantalla es de los dos jugadores entera,
  // y una cabecera arriba solo le robaría sitio al de arriba (y del revés).
  app().innerHTML = `
    <div style="position:fixed;inset:0;display:flex;flex-direction:column;background:${color}1A">
      ${mitadCarrera(1, color)}
      ${pistaCarrera(color)}
      ${mitadCarrera(0, color)}
    </div>`;
}

/** La barrita del centro con las dos fichas avanzando y el botón de salir. */
function pistaCarrera(color) {
  const barra = k => {
    const j = J.jug[k];
    const pct = Math.round(j.puntos / J.meta * 100);
    return `
      <div style="height:22px;flex:none;border-radius:50px;background:rgba(255,255,255,.28);
                  position:relative">
        <div style="position:absolute;inset:0 ${100 - pct}% 0 0;background:#FFC93C;
                    border-radius:50px;transition:right .25s"></div>
        <span style="position:absolute;top:50%;
                     left:calc(11px + (100% - 22px) * ${(pct / 100).toFixed(3)});
                     transform:translate(-50%,-50%);font-size:18px;line-height:1;
                     transition:left .25s">${j.ficha}</span>
      </div>`;
  };
  return `
    <div style="background:${color};color:#fff;padding:7px 10px;display:flex;align-items:center;gap:9px">
      <button onclick="cierraJuego()" style="border:none;border-radius:50%;cursor:pointer;font:inherit;
              background:rgba(255,255,255,.22);color:#fff;padding:7px 10px;font-size:14px">✕</button>
      <div style="flex:1;display:flex;flex-direction:column;gap:5px">
        ${barra(1)}
        ${barra(0)}
      </div>
      <strong style="font-size:15px;font-weight:900;white-space:nowrap">
        ${J.jug[1].puntos}–${J.jug[0].puntos}</strong>
    </div>`;
}

/** Una mitad de la pantalla. La de arriba (k=1) va girada 180º. */
function mitadCarrera(k, color) {
  const j = J.jug[k];
  const arriba = k === 1;
  const q = j.pregunta;

  let dentro;
  if (j.bloqueado > 0) {
    dentro = `
      <div style="flex:1;display:grid;place-items:center;text-align:center">
        <div>
          <div style="font-size:42px">😵</div>
          <strong style="font-size:17px;color:#D93B3B">¡Fallo!</strong>
          <div style="font-size:13px;opacity:.6;margin-top:3px">Esperas ${j.bloqueado}…</div>
        </div>
      </div>`;
  } else if (J.modo === 'app' && arriba) {
    dentro = `
      <div style="flex:1;display:grid;place-items:center;text-align:center">
        <div>
          <div style="font-size:44px">🤖</div>
          <strong style="font-size:16px;opacity:.7">La app está pensando…</strong>
        </div>
      </div>`;
  } else {
    const botones = q.opciones.map(o => {
      let fondo = 'var(--tarjeta)', tinta = 'var(--tinta)';
      if (j.tocada) {
        if (o === q.respuesta) { fondo = '#3DDC97'; tinta = '#fff'; }
        else if (o === j.tocada) { fondo = '#FF6B6B'; tinta = '#fff'; }
        else fondo = 'rgba(255,255,255,.5)';
      }
      return `<button onclick="respondeCarrera(${k},'${String(o).replace(/'/g, "\\'")}')"
            style="background:${fondo};color:${tinta};border:none;border-radius:14px;padding:8px;
                   font:inherit;font-weight:900;font-size:17px;cursor:pointer;min-height:50px;
                   box-shadow:${j.tocada ? 'none' : '0 3px 0 rgba(11,42,74,.16)'}">${o}</button>`;
    }).join('');
    dentro = `
      <div style="background:var(--tarjeta);border-radius:16px;padding:12px;text-align:center;
                  box-shadow:0 2px 6px rgba(0,0,0,.12)">
        <div style="font-size:18px;font-weight:900;line-height:1.25">${q.texto}</div>
        ${q.visual ? `<div style="font-size:24px;margin-top:4px">${q.visual}</div>` : ''}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:9px">${botones}</div>`;
  }

  return `
    <div style="flex:1;min-height:0;display:flex;flex-direction:column;justify-content:center;
                padding:10px 14px;overflow:hidden;${arriba ? 'transform:rotate(180deg);' : ''}">
      <div style="display:flex;align-items:center;gap:7px;margin-bottom:7px;font-size:12px;
                  font-weight:900;color:var(--tinta-suave)">
        <span style="font-size:18px">${j.ficha}</span>
        <span>${j.nombre}</span>
        <span style="flex:1"></span>
        <span>${j.puntos}/${J.meta}</span>
      </div>
      ${dentro}
    </div>`;
}


/* ===================== Movimiento de la partida ===================== */

function arrancaCarrera(modo) {
  const a = alumnoActual();
  const curso = cursoPorId(a.curso);
  const aj = carreraAjustes(curso.lvl);
  // Dos fichas distintas, al azar, para que no sea siempre la misma carrera.
  const fichas = CARRERA_FICHAS.slice().sort(() => Math.random() - 0.5);

  clearInterval(J.reloj);
  J = {
    juego:'carrera', fase:'cuenta', modo, cuenta:3, premio:0, ...aj,
    jug: [
      { nombre: a.nombre, ficha: fichas[0], puntos:0, fallos:0, pregunta:null, tocada:null, bloqueado:0 },
      { nombre: modo === 'app' ? 'La app' : 'Jugador 2', ficha: fichas[1],
        puntos:0, fallos:0, pregunta:null, tocada:null, bloqueado:0 }
    ],
    turnoApp: 0
  };
  nuevaPreguntaCarrera(0);
  nuevaPreguntaCarrera(1);
  pinta();

  J.reloj = setInterval(() => {
    // Red de seguridad: si el niño ya se fue a otra pantalla, el reloj se para solo.
    if (juegoActivo !== 'carrera') return clearInterval(J.reloj);
    tictacCarrera();
  }, 1000);
}

function tictacCarrera() {
  if (J.fase === 'cuenta') {
    J.cuenta--;
    if (J.cuenta < 0) { J.fase = 'jugando'; J.turnoApp = azarEntre(J.rival[0], J.rival[1]); }
    pinta();
    return;
  }
  if (J.fase !== 'jugando') return;

  let repintar = false;

  // El castigo por fallar: unos segundos sin poder contestar. Es mejor freno que
  // restar puntos, que a esta edad desmoraliza y hace abandonar la partida.
  J.jug.forEach(j => {
    if (j.bloqueado > 0) {
      j.bloqueado--;
      if (j.bloqueado === 0) { j.tocada = null; nuevaPreguntaCarrera(J.jug.indexOf(j)); }
      repintar = true;
    }
  });

  if (J.modo === 'app' && J.jug[1].bloqueado === 0) {
    J.turnoApp--;
    if (J.turnoApp <= 0) {
      const j = J.jug[1];
      if (Math.random() < J.acierta) {
        j.puntos++;
        if (j.puntos >= J.meta) return terminaCarrera();
        nuevaPreguntaCarrera(1);
      } else {
        j.fallos++;
        j.bloqueado = 2;
      }
      J.turnoApp = azarEntre(J.rival[0], J.rival[1]);
      repintar = true;
    }
  }

  if (repintar) pinta();
}

function azarEntre(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }

function nuevaPreguntaCarrera(k) {
  const a = alumnoActual();
  const materias = materiasDe(cursoPorId(a.curso));
  const m = materias[Math.floor(Math.random() * materias.length)];
  const temas = temasDe(m.id);
  J.jug[k].pregunta = generaPregunta(m.id, a.curso, temas[Math.floor(Math.random() * temas.length)]);
  J.jug[k].tocada = null;
}

function respondeCarrera(k, dada) {
  const j = J.jug[k];
  if (J.fase !== 'jugando' || j.tocada || j.bloqueado > 0) return;
  const bien = dada === j.pregunta.respuesta;
  j.tocada = dada;
  pita(bien); vibra(bien);

  if (bien) {
    j.puntos++;
    if (j.puntos >= J.meta) { pinta(); return terminaCarrera(); }
    // Se deja ver un instante el botón en verde y sigue: sin esa pausa el niño
    // no llega a ver si acertó, solo ve que la pregunta cambia sola.
    pinta();
    setTimeout(() => {
      if (juegoActivo !== 'carrera' || J.fase !== 'jugando') return;
      nuevaPreguntaCarrera(k);
      pinta();
    }, 420);
  } else {
    j.fallos++;
    j.bloqueado = 2;          // los dos segundos los descuenta el reloj de arriba
    pinta();
  }
}

function terminaCarrera() {
  clearInterval(J.reloj);
  J.fase = 'fin';
  const a = alumnoActual();
  // Solo puntúa el alumno del perfil (la mitad de abajo), y solo si gana: así
  // las estrellas siguen significando algo y no se consiguen perdiendo.
  if (J.jug[0].puntos >= J.meta) {
    J.premio = Math.max(3, J.meta - J.jug[0].fallos);
    a.estrellas += J.premio;
    a.estrellasTotal = (a.estrellasTotal || 0) + J.premio;
  }
  guardaTodo();
  pinta();
}

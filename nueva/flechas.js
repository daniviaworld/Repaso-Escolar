/* ===================================================================
   FLECHAS — 60 niveles.

   CÓMO SE JUEGA. Un tablero lleno de flechas. Tocas una y sale
   disparada hacia donde apunta... pero solo si tiene el camino libre
   hasta el borde. Si hay otra flecha en medio, se queda bloqueada y
   tiembla. Hay que ir vaciando el tablero en el orden correcto.

   POR QUÉ FUNCIONA PARA NIÑOS. Se entiende sin leer instrucciones: se
   toca una flecha y se ve lo que pasa. Y la dificultad sube sola con el
   tamaño del tablero y la cantidad de flechas, así que el mismo juego
   le vale a un niño de Infantil y a uno de 6º.

   =========================================================
   LO IMPORTANTE: NI SE ATASCA NI SE PIERDE. Y NO ES SUERTE.
   =========================================================

   El tablero se construye AL REVÉS. Se parte de un tablero vacío y se
   van AÑADIENDO flechas una a una, cada una en una casilla libre y
   apuntando a una dirección cuyo camino al borde esté despejado de las
   flechas puestas hasta ese momento. Si se quitan en el orden inverso
   al que se pusieron, cada una encuentra su camino libre. O sea: el
   tablero nace con una solución dentro.

   Y hay algo más fuerte. Llamemos o1, o2, ... oN al orden en que se
   quitan. Por construcción, el camino de oj está libre de oj+1...oN.
   Entonces, en cualquier momento de la partida, la flecha que quede
   con el índice más bajo tiene por delante solo flechas de índice más
   alto, que por definición no están en su camino: SIEMPRE hay al menos
   una flecha que puede salir. Y quitar flechas nunca bloquea a otra,
   solo despeja.

   Conclusión: el niño no puede dejar el tablero en una posición muerta
   haga lo que haga, y siempre acabará vaciándolo. El reto no es no
   perder, es verlo a la primera: lo que se mide son los toques
   fallidos. Esto está comprobado en prueba-flechas-motor.js jugando
   miles de partidas a lo loco.
   =================================================================== */

/* Las ocho direcciones: símbolo y hacia dónde avanza (columna, fila). */
const FLECHA_DIRS = {
  ar: { ico:'↑', dx: 0, dy:-1, color:'#FF6B6B' },
  ab: { ico:'↓', dx: 0, dy: 1, color:'#12B5E5' },
  iz: { ico:'←', dx:-1, dy: 0, color:'#FFC93C' },
  de: { ico:'→', dx: 1, dy: 0, color:'#3DDC97' },
  ai: { ico:'↖', dx:-1, dy:-1, color:'#9B7BFF' },
  ad: { ico:'↗', dx: 1, dy:-1, color:'#FF9F68' },
  bi: { ico:'↙', dx:-1, dy: 1, color:'#26C6DA' },
  bd: { ico:'↘', dx: 1, dy: 1, color:'#F06292' }
};
const FLECHA_RECTAS = ['ar', 'ab', 'iz', 'de'];
const FLECHA_TODAS = ['ar', 'ab', 'iz', 'de', 'ai', 'ad', 'bi', 'bd'];

const FLECHA_NIVELES = 60;

/**
 * Qué tablero toca en cada nivel. La cuesta sube por tres sitios a la vez:
 * tablero más grande, más flechas y, a partir del 31, diagonales.
 */
function flechaNivel(n) {
  // El tope de cada tramo NO es "las casillas que caben": es la cantidad que se
  // ha medido que sale siempre bien (prueba-flechas-motor.js). Por encima de
  // ahí, la construcción se queda sin sitio donde colocar la última flecha y el
  // nivel saldría más corto de lo anunciado. Se deja margen a propósito.
  let lado, cuantas, diagonales = false, tope;
  if (n <= 6)       { lado = 4; cuantas = 3 + n;                 tope = 13; }
  else if (n <= 16) { lado = 5; cuantas = 9 + (n - 6) * 1.2;     tope = 21; }
  else if (n <= 30) { lado = 6; cuantas = 18 + (n - 16) * 0.8;   tope = 29; }
  else if (n <= 45) { lado = 6; cuantas = 20 + (n - 30) * 0.8;   tope = 32; diagonales = true; }
  else              { lado = 7; cuantas = 28 + (n - 45) * 0.9;   tope = 42; diagonales = true; }
  cuantas = Math.min(Math.round(cuantas), tope);
  return { lado, cuantas, diagonales };
}

/** ¿Tiene la flecha de la casilla i el camino libre hasta el borde? */
function flechaSale(tablero, lado, i, dir) {
  const d = FLECHA_DIRS[dir];
  let c = (i % lado) + d.dx, f = Math.floor(i / lado) + d.dy;
  while (c >= 0 && c < lado && f >= 0 && f < lado) {
    if (tablero[f * lado + c]) return false;
    c += d.dx; f += d.dy;
  }
  return true;
}

/**
 * Construye el tablero al revés (ver la explicación de arriba).
 * Devuelve también el orden de colocación, que invertido es la solución.
 */
function generaFlechas(lado, cuantas, diagonales) {
  const dirs = diagonales ? FLECHA_TODAS : FLECHA_RECTAS;
  const tablero = new Array(lado * lado).fill(null);
  const orden = [];
  let intentos = 0;
  const tope = cuantas * 300 + 500;

  while (orden.length < cuantas && intentos < tope) {
    intentos++;
    const libres = [];
    for (let k = 0; k < tablero.length; k++) if (!tablero[k]) libres.push(k);
    if (!libres.length) break;
    const i = libres[Math.floor(Math.random() * libres.length)];

    // De las direcciones posibles, las que salen limpias desde ahí ahora mismo.
    const valen = dirs.filter(d => flechaSale(tablero, lado, i, d));
    if (!valen.length) continue;

    tablero[i] = valen[Math.floor(Math.random() * valen.length)];
    orden.push(i);
  }

  return { tablero, lado, orden, completo: orden.length === cuantas };
}


/* =========================== EL JUEGO =========================== */

function juegoFlechas() {
  const a = alumnoActual();
  // El progreso del juego vive en la ficha del alumno, como las estrellas:
  // así cada hermano tiene el suyo y se mantiene de un día para otro.
  if (!a.flechas) a.flechas = { nivel: 1, records: {} };
  const color = JUEGOS.find(x => x.id === 'flechas').color;

  if (J.juego !== 'flechas') {
    nuevoJuego({ juego:'flechas', fase:'mapa', nivel: 0, volando: null, historial: [] });
  }

  /* ----- El mapa de niveles ----- */
  if (J.fase === 'mapa') {
    const alcanzado = Math.min(a.flechas.nivel, FLECHA_NIVELES);
    const hechos = Object.keys(a.flechas.records).length;
    const perfectos = Object.values(a.flechas.records).filter(r => r === 0).length;

    // Por tramos y no los sesenta de golpe: una pared de candados iguales
    // desanima y no dice nada. Así se ve el camino y lo que viene después.
    const TRAMOS = [
      { de: 1,  a: 6,  nombre:'Primeros pasos',   pie:'tablero de 4×4' },
      { de: 7,  a: 16, nombre:'Se complica',      pie:'tablero de 5×5' },
      { de: 17, a: 30, nombre:'Tableros grandes', pie:'tablero de 6×6' },
      { de: 31, a: 45, nombre:'Diagonales',       pie:'flechas en diagonal' },
      { de: 46, a: 60, nombre:'Experto',          pie:'7×7 con diagonales' }
    ];

    const bloques = TRAMOS.map(t => {
      let casillas = '';
      for (let n = t.de; n <= t.a; n++) {
        const abierto = n <= alcanzado;
        const rec = a.flechas.records[n];
        const perfecto = rec === 0;
        const siguiente = n === alcanzado && rec === undefined;
        casillas += `
          <button ${abierto ? `onclick="empiezaFlechas(${n})"` : 'disabled'}
            style="aspect-ratio:1;border:none;border-radius:15px;cursor:${abierto ? 'pointer' : 'default'};
                   font:inherit;font-weight:900;font-size:16px;display:grid;place-items:center;
                   background:${perfecto ? '#FFC93C'
                              : rec !== undefined ? color
                              : abierto ? 'var(--tarjeta)' : 'rgba(11,42,74,.05)'};
                   color:${perfecto ? '#0B2A4A'
                          : rec !== undefined ? '#fff'
                          : abierto ? 'var(--tinta)' : 'var(--tinta-suave)'};
                   opacity:${abierto ? 1 : .4};
                   box-shadow:${siguiente ? '0 0 0 3px ' + color : abierto ? '0 3px 0 rgba(11,42,74,.16)' : 'none'}">
            ${perfecto ? '★' : n}
          </button>`;
      }
      const abiertoElTramo = alcanzado >= t.de;
      return `
        <div style="margin-top:16px">
          <div style="display:flex;align-items:baseline;gap:7px;margin-bottom:7px;
                      opacity:${abiertoElTramo ? 1 : .45}">
            <strong style="font-size:14px;font-weight:900">${t.nombre}</strong>
            <small style="font-size:11px;color:var(--tinta-suave)">${t.pie}</small>
          </div>
          <div style="display:grid;grid-template-columns:repeat(5,1fr);gap:8px">${casillas}</div>
        </div>`;
    }).join('');

    const terminado = hechos >= FLECHA_NIVELES;
    app().innerHTML = marcoJuego('flechas', 'Flechas',
      `${hechos}/${FLECHA_NIVELES}`,
      'Toca una flecha para lanzarla. Solo sale si tiene el camino libre.', `
      <div style="width:100%;max-width:340px">

        <button onclick="empiezaFlechas(${alcanzado})"
                style="width:100%;border:none;border-radius:20px;padding:16px;cursor:pointer;
                       font:inherit;background:${color};color:#fff;text-align:left;display:flex;
                       align-items:center;gap:14px;box-shadow:0 5px 0 rgba(0,0,0,.22)">
          <span style="font-size:30px">🎯</span>
          <span style="flex:1">
            <strong style="display:block;font-size:19px;font-weight:900">
              ${terminado ? 'Volver a jugar' : 'Nivel ' + alcanzado}</strong>
            <small style="font-size:12px;opacity:.85">
              ${terminado ? 'Ya los has pasado todos' : 'Seguir por donde ibas'}</small>
          </span>
          <span style="font-size:22px">▶</span>
        </button>

        ${perfectos ? `<div style="margin-top:10px;font-size:12px;font-weight:800;
             color:var(--tinta-suave);text-align:center">
             ★ ${perfectos} ${perfectos === 1 ? 'nivel clavado sin fallar' : 'niveles clavados sin fallar'}</div>` : ''}

        ${bloques}
        <div style="height:24px"></div>
      </div>`);
    return;
  }

  /* ----- Nivel superado ----- */
  if (J.fase === 'fin') {
    const rec = a.flechas.records[J.nivel];
    const ultimo = J.nivel >= FLECHA_NIVELES;
    app().innerHTML = marcoJuego('flechas', `Nivel ${J.nivel}`, null, null, `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;
                  align-items:center;text-align:center">
        <div style="font-size:64px">${J.fallos === 0 ? '🎯' : '✅'}</div>
        <h2 style="font-size:27px;font-weight:900;margin:10px 0 4px">
          ${J.fallos === 0 ? '¡Perfecto!' : '¡Nivel superado!'}</h2>
        <p style="font-size:15px;opacity:.7;margin:0">
          ${J.fallos === 0 ? 'Ni un toque fallido'
            : J.fallos + (J.fallos === 1 ? ' toque fallido' : ' toques fallidos')}
          ${rec !== undefined && rec < J.fallos ? ` · tu récord: ${rec}` : ''}</p>
        ${J.premio ? `<div class="pastilla" style="background:#FFC93C4D;margin-top:16px;
             font-weight:900;font-size:17px">⭐ +${J.premio} estrellas</div>` : ''}
        <div style="display:flex;gap:10px;margin-top:24px;flex-wrap:wrap;justify-content:center">
          ${ultimo ? '' : `<button onclick="empiezaFlechas(${J.nivel + 1})"
                  style="background:${color};color:#fff;border:none;border-radius:18px;padding:15px 24px;
                  cursor:pointer;font:inherit;font-weight:900;font-size:16px;
                  box-shadow:0 4px 0 rgba(0,0,0,.2)">Nivel ${J.nivel + 1} ▶</button>`}
          <button onclick="empiezaFlechas(${J.nivel})" style="background:var(--tarjeta);color:var(--tinta);
                  border:none;border-radius:18px;padding:15px 20px;cursor:pointer;font:inherit;
                  font-weight:800;font-size:15px">Repetir 🔁</button>
          <button onclick="mapaFlechas()" style="background:var(--tarjeta);color:var(--tinta);
                  border:none;border-radius:18px;padding:15px 20px;cursor:pointer;font:inherit;
                  font-weight:800;font-size:15px">Niveles</button>
        </div>
        ${ultimo ? `<p style="margin-top:20px;font-size:15px;font-weight:900;color:${color}">
             🏆 ¡Has terminado los ${FLECHA_NIVELES} niveles!</p>` : ''}
      </div>`);
    confeti(J.fallos === 0 ? 2 : 1);
    return;
  }

  /* ----- Jugando ----- */
  const lado = J.lado;
  const hueco = lado > 6 ? 5 : 7;
  const celda = Math.min(Math.floor((330 - hueco * (lado - 1)) / lado), 62);

  const casillas = J.tablero.map((dir, i) => {
    if (!dir) return `<span style="width:${celda}px;height:${celda}px;border-radius:14px;
          background:rgba(11,42,74,.05)"></span>`;
    const d = FLECHA_DIRS[dir];
    const marcada = J.pista && J.pista.includes(i);
    return `<button id="f${i}" onclick="tocaFlecha(${i})"
          style="width:${celda}px;height:${celda}px;padding:0;border:none;cursor:pointer;font:inherit;
                 border-radius:14px;background:${d.color};color:#fff;display:grid;place-items:center;
                 font-size:${Math.round(celda * .56)}px;font-weight:900;line-height:1;
                 box-shadow:0 3px 0 rgba(0,0,0,.18)${marcada ? ',0 0 0 4px #0B2A4A' : ''}">${d.ico}</button>`;
  }).join('');

  const quedan = J.tablero.filter(x => x).length;

  app().innerHTML = marcoJuego('flechas', `Nivel ${J.nivel}`,
    `<span id="marcador-flechas">${quedan} · ✗${J.fallos}</span>`,
    'Solo sale si tiene el camino libre hasta el borde', `

    <div style="display:grid;grid-template-columns:repeat(${lado},${celda}px);gap:${hueco}px;
                padding:12px;background:var(--tarjeta);border-radius:20px;
                box-shadow:0 2px 8px rgba(0,0,0,.12)">${casillas}</div>

    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin-top:14px;
                width:100%;max-width:330px">
      <button onclick="pistaFlechas()" ${J.pistas ? '' : 'disabled'}
              style="border:none;border-radius:14px;padding:13px;cursor:pointer;font:inherit;
              font-weight:900;font-size:14px;background:#FFC93C;color:#0B2A4A;
              opacity:${J.pistas ? 1 : .45};box-shadow:0 3px 0 rgba(11,42,74,.16)">💡 ${J.pistas}</button>
      <button onclick="empiezaFlechas(${J.nivel})"
              style="border:none;border-radius:14px;padding:13px;cursor:pointer;font:inherit;
              font-weight:800;font-size:14px;background:var(--tarjeta);color:var(--tinta);
              box-shadow:0 3px 0 rgba(11,42,74,.16)">🔁 Otra vez</button>
      <button onclick="mapaFlechas()"
              style="border:none;border-radius:14px;padding:13px;cursor:pointer;font:inherit;
              font-weight:800;font-size:14px;background:var(--tarjeta);color:var(--tinta);
              box-shadow:0 3px 0 rgba(11,42,74,.16)">Niveles</button>
    </div>
    <div style="height:16px"></div>`);
}

function mapaFlechas() {
  J.fase = 'mapa';
  J.volando = null;
  J.pista = null;
  pinta();
}

function empiezaFlechas(n) {
  const cfg = flechaNivel(n);
  let g = generaFlechas(cfg.lado, cfg.cuantas, cfg.diagonales);
  // Si una construcción se queda corta por mala suerte en los huecos, se repite.
  // Nunca se rebaja el nivel sin avisar: se insiste hasta tenerlo completo.
  for (let k = 0; k < 12 && !g.completo; k++) g = generaFlechas(cfg.lado, cfg.cuantas, cfg.diagonales);

  J = { juego:'flechas', fase:'jugando', nivel:n, lado:cfg.lado,
        tablero:g.tablero, total:g.orden.length,
        fallos:0, pistas:3, premio:0, volando:null, pista:null, historial:[] };
  pinta();
}

/** Repinta SOLO el marcador: tras un toque fallido no hace falta más. */
function actualizaMarcadorFlechas() {
  const m = document.getElementById('marcador-flechas');
  if (m) m.textContent = `${J.tablero.filter(x => x).length} · ✗${J.fallos}`;
}

function tocaFlecha(i) {
  if (J.fase !== 'jugando' || J.volando !== null) return;   // una flecha en vuelo a la vez
  const dir = J.tablero[i];
  if (!dir) return;

  if (!flechaSale(J.tablero, J.lado, i, dir)) {
    J.fallos++;
    const el = document.getElementById('f' + i);
    if (el) { el.classList.remove('falla'); void el.offsetWidth; el.classList.add('falla'); }
    pita(false); vibra(false);
    actualizaMarcadorFlechas();
    return;
  }

  // Sale. Se mueve SOLO ese botón (transform y opacidad, que no obligan al
  // navegador a recalcular la página entera) en vez de repintar el tablero.
  J.volando = i;
  if (J.pista) J.pista = null;
  const d = FLECHA_DIRS[dir];
  const el = document.getElementById('f' + i);
  if (el) {
    el.style.transition = 'transform .22s ease-in, opacity .22s ease-in';
    el.style.transform = `translate(${d.dx * 420}px, ${d.dy * 420}px)`;
    el.style.opacity = '0';
  }
  pita(true); vibra(true);

  setTimeout(() => {
    // Red de seguridad: si entretanto se salió del juego o se reinició el nivel,
    // esto ya no pinta nada y se abandona sin tocar el estado nuevo.
    if (juegoActivo !== 'flechas' || J.juego !== 'flechas' || J.volando !== i) return;
    J.historial.push({ i, dir });
    J.tablero[i] = null;
    J.volando = null;
    if (!J.tablero.some(x => x)) return terminaFlechas();
    pinta();
  }, 220);
}

/** La pista resalta las flechas que pueden salir AHORA. Tres por nivel. */
function pistaFlechas() {
  if (!J.pistas || J.fase !== 'jugando') return;
  J.pistas--;
  J.pista = J.tablero
    .map((dir, i) => (dir && flechaSale(J.tablero, J.lado, i, dir)) ? i : -1)
    .filter(i => i >= 0);
  pita(true);
  pinta();
}

function terminaFlechas() {
  J.fase = 'fin';
  const a = alumnoActual();
  if (!a.flechas) a.flechas = { nivel: 1, records: {} };

  const primera = a.flechas.records[J.nivel] === undefined;
  const anterior = a.flechas.records[J.nivel];
  if (primera || J.fallos < anterior) a.flechas.records[J.nivel] = J.fallos;
  if (J.nivel >= a.flechas.nivel) a.flechas.nivel = Math.min(J.nivel + 1, FLECHA_NIVELES);

  // La primera vez paga el nivel entero; repetirlo da poco, para que las
  // estrellas no se saquen repitiendo el nivel 1 cincuenta veces.
  J.premio = primera
    ? Math.max(3, 6 + Math.floor(J.nivel / 5) - J.fallos)
    : (J.fallos === 0 && J.fallos < anterior ? 2 : 0);

  if (J.premio) {
    a.estrellas += J.premio;
    a.estrellasTotal = (a.estrellasTotal || 0) + J.premio;
  }
  guardaTodo();
  pinta();
}

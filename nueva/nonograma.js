/* ===================================================================
   DIBUJO ESCONDIDO (nonograma / japonés de pintar).

   QUÉ ES. Una cuadrícula vacía con números en los bordes. Cada número
   dice cuántas casillas seguidas hay que pintar en esa fila o columna.
   Deduciendo cuáles van pintadas, al final aparece un dibujo.

   POR QUÉ ESTE JUEGO. Es el hermano del sudoku: la misma deducción
   pura, pero el premio no es "has acabado", es un dibujo que aparece.
   A los peques eso les engancha mucho más que un tablero de números.

   LO IMPORTANTE: NUNCA HAY QUE ADIVINAR. Antes de ofrecer un dibujo se
   comprueba con el solucionador de aquí abajo (nonoResoluble) que se
   puede sacar entero razonando fila a fila y columna a columna. Un
   nonograma que obliga a probar y rectificar es frustrante para un
   adulto; para un niño de 8 años es sencillamente un juego roto.
   =================================================================== */

/* El último dibujo jugado, para no repetirlo dos veces seguidas. */
let nonoAnterior = null;

/* Los dibujos, en texto: # es casilla pintada, . es casilla vacía.
   Se escriben a mano porque un dibujo al azar no se reconoce: la
   gracia es que al terminar el niño diga "¡es un gato!". */
const NONO_DIBUJOS = {

  5: [
    { nombre:'Corazón', ico:'❤️', arte:[
      '.#.#.',
      '#####',
      '#####',
      '.###.',
      '..#..'] },
    { nombre:'Estrella', ico:'⭐', arte:[
      '..#..',
      '#####',
      '.###.',
      '.#.#.',
      '#...#'] },
    { nombre:'Casa', ico:'🏠', arte:[
      '..#..',
      '.###.',
      '#####',
      '#...#',
      '#.#.#'] },
    { nombre:'Árbol', ico:'🌲', arte:[
      '..#..',
      '.###.',
      '#####',
      '..#..',
      '..#..'] },
    { nombre:'Cruz', ico:'➕', arte:[
      '..#..',
      '..#..',
      '#####',
      '..#..',
      '..#..'] },
    { nombre:'Taza', ico:'☕', arte:[
      '.....',
      '####.',
      '#..##',
      '####.',
      '.....'] },
    { nombre:'Luna', ico:'🌙', arte:[
      '.###.',
      '##...',
      '##...',
      '##...',
      '.###.'] },
    { nombre:'Rombo', ico:'💎', arte:[
      '..#..',
      '.###.',
      '#####',
      '.###.',
      '..#..'] },
    { nombre:'Barco', ico:'⛵', arte:[
      '..#..',
      '..##.',
      '..#..',
      '#####',
      '.###.'] },
    { nombre:'Montaña', ico:'⛰️', arte:[
      '.....',
      '..#..',
      '.###.',
      '#####',
      '#####'] },
    { nombre:'Copa', ico:'🏆', arte:[
      '#####',
      '.###.',
      '..#..',
      '..#..',
      '#####'] },
    { nombre:'Pajarita', ico:'🎀', arte:[
      '#...#',
      '##.##',
      '#####',
      '##.##',
      '#...#'] },
    { nombre:'Pez', ico:'🐟', arte:[
      '.....',
      '.###.',
      '#####',
      '.###.',
      '.....'] }
  ],

  8: [
    { nombre:'Gato', ico:'🐱', arte:[
      '#......#',
      '##....##',
      '########',
      '##.##.##',
      '########',
      '#.####.#',
      '.######.',
      '..####..'] },
    { nombre:'Seta', ico:'🍄', arte:[
      '..####..',
      '.######.',
      '########',
      '########',
      '...##...',
      '...##...',
      '...##...',
      '..####..'] },
    { nombre:'Manzana', ico:'🍎', arte:[
      '...#.##.',
      '...####.',
      '.######.',
      '########',
      '########',
      '########',
      '.######.',
      '..#..#..'] },
    { nombre:'Barco', ico:'⛵', arte:[
      '...#....',
      '...##...',
      '...###..',
      '...####.',
      '...#....',
      '########',
      '.######.',
      '..####..'] },
    { nombre:'Corazón', ico:'❤️', arte:[
      '.##..##.',
      '########',
      '########',
      '########',
      '.######.',
      '..####..',
      '...##...',
      '........'] },
    { nombre:'Llave', ico:'🔑', arte:[
      '.####...',
      '.#..#...',
      '.####...',
      '..##....',
      '..##....',
      '..###...',
      '..##....',
      '..###...'] },
    { nombre:'Copa', ico:'🏆', arte:[
      '########',
      '.######.',
      '.######.',
      '..####..',
      '...##...',
      '...##...',
      '..####..',
      '.######.'] },
    { nombre:'Pato', ico:'🦆', arte:[
      '....##..',
      '...####.',
      '...#.##.',
      '...###..',
      '.#####..',
      '########',
      '.######.',
      '..####..'] }
  ],

  10: [
    { nombre:'Mariposa', ico:'🦋', arte:[
      '##......##',
      '####..####',
      '##########',
      '.###..###.',
      '...####...',
      '...####...',
      '.###..###.',
      '##########',
      '####..####',
      '##......##'] },
    { nombre:'Flor', ico:'🌸', arte:[
      '.##....##.',
      '####..####',
      '.##.##.##.',
      '...####...',
      '..######..',
      '...####...',
      '.##.##.##.',
      '####..####',
      '.##....##.',
      '....##....'] },
    { nombre:'Fantasma', ico:'👻', arte:[
      '...####...',
      '..######..',
      '.########.',
      '.##.##.##.',
      '.########.',
      '.########.',
      '.########.',
      '.########.',
      '.########.',
      '.#.#.#.#.#'] },
    { nombre:'Corazón', ico:'❤️', arte:[
      '.##....##.',
      '####..####',
      '##########',
      '##########',
      '##########',
      '.########.',
      '..######..',
      '...####...',
      '....##....',
      '..........'] },
    { nombre:'Casa', ico:'🏠', arte:[
      '....##....',
      '...####...',
      '..######..',
      '.########.',
      '##########',
      '.##.##.##.',
      '.##.##.##.',
      '.##.##.##.',
      '.##....##.',
      '.##....##.'] },
    { nombre:'Helado', ico:'🍦', arte:[
      '...####...',
      '..######..',
      '.########.',
      '.########.',
      '..######..',
      '..######..',
      '...####...',
      '...####...',
      '....##....',
      '....##....'] },
    { nombre:'Pingüino', ico:'🐧', arte:[
      '...####...',
      '..##..##..',
      '..######..',
      '...####...',
      '..######..',
      '.###..###.',
      '.##....##.',
      '.########.',
      '..######..',
      '.##....##.'] },
    { nombre:'Coche', ico:'🚗', arte:[
      '..........',
      '...####...',
      '..######..',
      '.##.##.##.',
      '##########',
      '##########',
      '##########',
      '.##....##.',
      '..##..##..',
      '..........'] },
    { nombre:'Tortuga', ico:'🐢', arte:[
      '..........',
      '...####...',
      '..######..',
      '.########.',
      '##.####.##',
      '##########',
      '.########.',
      '..######..',
      '.##....##.',
      '..........'] },
    { nombre:'Árbol', ico:'🌳', arte:[
      '....##....',
      '...####...',
      '..######..',
      '.########.',
      '##########',
      '.########.',
      '..######..',
      '....##....',
      '....##....',
      '...####...'] },
    { nombre:'Cohete', ico:'🚀', arte:[
      '....##....',
      '...####...',
      '...####...',
      '..######..',
      '..##..##..',
      '..######..',
      '.########.',
      '##.####.##',
      '...####...',
      '....##....'] }
  ]
};

/* Tamaño según el curso. Igual que en el sudoku: la lógica es la misma
   para todos, lo que cambia es cuánto tablero hay que sostener a la vez. */
function nonoSegunCurso(lvl) {
  if (lvl < 2) return 5;    // Infantil
  if (lvl < 4) return 8;    // 1º y 2º
  return 10;                // de 3º en adelante
}

/** Del dibujo a los números del borde: las tiradas de casillas pintadas. */
function nonoTiradas(linea) {
  const r = [];
  let n = 0;
  for (const v of linea) {
    if (v) n++;
    else if (n) { r.push(n); n = 0; }
  }
  if (n) r.push(n);
  return r.length ? r : [0];
}

/** Todas las formas posibles de colocar unos números en una línea de largo n. */
function nonoColocaciones(nums, n) {
  if (nums.length === 1 && nums[0] === 0) return [new Array(n).fill(0)];
  const salida = [];
  const paso = (idx, desde, linea) => {
    if (idx === nums.length) { salida.push(linea.slice()); return; }
    // Hueco mínimo que necesitan los números que todavía quedan por colocar.
    let resto = 0;
    for (let k = idx + 1; k < nums.length; k++) resto += nums[k] + 1;
    for (let p = desde; p + nums[idx] + resto <= n; p++) {
      const l2 = linea.slice();
      for (let k = 0; k < nums[idx]; k++) l2[p + k] = 1;
      paso(idx + 1, p + nums[idx] + 1, l2);
    }
  };
  paso(0, 0, new Array(n).fill(0));
  return salida;
}

/**
 * ¿Se puede resolver razonando, sin probar ni rectificar?
 *
 * Trabaja igual que una persona: mira una línea, se queda con las
 * colocaciones que encajan con lo que ya sabe y, si TODAS coinciden en
 * una casilla, esa casilla queda decidida. Vuelta y vuelta hasta que no
 * se deduzca nada nuevo. Si acaba con el tablero entero resuelto, el
 * dibujo vale; si se queda a medias, es que habría que adivinar y se
 * descarta. Como además solo hay una solución posible cuando se resuelve
 * así, esta comprobación sirve para las dos cosas.
 *
 * Devuelve true si vale.
 */
function nonoResoluble(arte) {
  const n = arte.length;
  const ancho = arte[0].length;
  const filas = arte.map(f => nonoTiradas([...f].map(c => c === '#' ? 1 : 0)));
  const cols = [];
  for (let c = 0; c < ancho; c++) {
    cols.push(nonoTiradas(arte.map(f => f[c] === '#' ? 1 : 0)));
  }

  // -1 = sin decidir, 1 = pintada, 0 = vacía
  const est = new Array(n * ancho).fill(-1);
  const candFila = filas.map(f => nonoColocaciones(f, ancho));
  const candCol = cols.map(c => nonoColocaciones(c, n));

  let cambio = true;
  while (cambio) {
    cambio = false;

    for (let f = 0; f < n; f++) {
      const vivos = candFila[f].filter(c =>
        c.every((v, i) => est[f * ancho + i] === -1 || est[f * ancho + i] === v));
      if (!vivos.length) return false;
      candFila[f] = vivos;
      for (let i = 0; i < ancho; i++) {
        if (est[f * ancho + i] !== -1) continue;
        const v = vivos[0][i];
        if (vivos.every(c => c[i] === v)) { est[f * ancho + i] = v; cambio = true; }
      }
    }

    for (let c = 0; c < ancho; c++) {
      const vivos = candCol[c].filter(col =>
        col.every((v, f) => est[f * ancho + c] === -1 || est[f * ancho + c] === v));
      if (!vivos.length) return false;
      candCol[c] = vivos;
      for (let f = 0; f < n; f++) {
        if (est[f * ancho + c] !== -1) continue;
        const v = vivos[0][f];
        if (vivos.every(col => col[f] === v)) { est[f * ancho + c] = v; cambio = true; }
      }
    }
  }

  return est.every(v => v !== -1);
}

/** Prepara una partida: elige un dibujo del tamaño que toca y saca sus números. */
function generaNono(n, evitar) {
  const lista = NONO_DIBUJOS[n].filter(d => d.nombre !== evitar);
  const d = lista[Math.floor(Math.random() * lista.length)];
  const sol = [];
  d.arte.forEach(f => [...f].forEach(c => sol.push(c === '#' ? 1 : 0)));
  const filas = d.arte.map(f => nonoTiradas([...f].map(c => c === '#' ? 1 : 0)));
  const cols = [];
  for (let c = 0; c < n; c++) cols.push(nonoTiradas(d.arte.map(f => f[c] === '#' ? 1 : 0)));
  return { n, sol, filas, cols, nombre: d.nombre, ico: d.ico };
}


/* =========================== EL JUEGO =========================== */

function juegoNonograma() {
  const a = alumnoActual();
  const curso = cursoPorId(a.curso);
  const infantil = curso.etapa === 'infantil';
  const color = JUEGOS.find(x => x.id === 'nonograma').color;

  if (J.juego !== 'nonograma') {
    const g = generaNono(nonoSegunCurso(curso.lvl), nonoAnterior);
    nuevoJuego({
      juego:'nonograma', fase:'jugando', n:g.n, sol:g.sol, filas:g.filas, cols:g.cols,
      nombre:g.nombre, ico:g.ico,
      tablero: g.sol.map(() => 0),          // 0 sin tocar · 1 pintada · 2 marcada con ✕
      modo:'pintar', pistas:3, fallos:0, segundos:0, historial:[], premio:0
    });
    clearInterval(J.reloj);
    J.reloj = setInterval(() => {
      if (juegoActivo !== 'nonograma') return clearInterval(J.reloj);
      if (J.fase === 'jugando') { J.segundos++; pintaRelojNono(); }
    }, 1000);
  }

  const n = J.n;

  /* ----- Terminado: el dibujo, limpio y grande ----- */
  if (J.fase === 'fin') {
    const lado = Math.min(Math.floor(300 / n), 40);
    // Sin separación ni esquinas redondeadas: pegadas, las casillas forman la
    // figura. Con huecos entre ellas se ven cuadritos sueltos, no un dibujo.
    const dibujo = J.sol.map(v => `
      <span style="width:${lado}px;height:${lado}px;
            background:${v ? color : 'transparent'}"></span>`).join('');
    app().innerHTML = marcoJuego('nonograma', 'Dibujo escondido', null, null, `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;
                  align-items:center;text-align:center">
        <div style="display:grid;grid-template-columns:repeat(${n},${lado}px);gap:0;
                    background:var(--tarjeta);padding:16px;border-radius:20px;
                    box-shadow:0 4px 14px rgba(0,0,0,.14)">${dibujo}</div>
        <h2 style="font-size:26px;font-weight:900;margin:18px 0 2px">
          ${J.ico} ¡Es ${esFemenino(J.nombre) ? 'una' : 'un'} ${J.nombre.toLowerCase()}!</h2>
        <p style="font-size:14px;opacity:.65;margin:0">
          ${n}×${n} en ${relojBonito(J.segundos)}${J.fallos ? ' · ' + J.fallos + (J.fallos === 1 ? ' fallo' : ' fallos') : ' · sin fallos'}</p>
        <div class="pastilla" style="background:#FFC93C4D;margin-top:16px;font-weight:900;font-size:17px">
          ⭐ +${J.premio} estrellas</div>
        <div style="display:flex;gap:12px;margin-top:24px">
          <button onclick="otroNono()" style="background:${color};color:#fff;border:none;
                  border-radius:18px;padding:15px 26px;font-weight:900;font-size:16px;cursor:pointer;
                  box-shadow:0 4px 0 rgba(0,0,0,.2)">Otro 🔁</button>
          <button onclick="cierraJuego()" style="background:var(--tarjeta);color:var(--tinta);border:none;
                  border-radius:18px;padding:15px 26px;font-weight:800;font-size:16px;cursor:pointer">Salir</button>
        </div>
      </div>`);
    confeti(J.fallos === 0 ? 2 : 1);
    return;
  }

  /* ----- El tablero con sus números ----- */
  // Los números van en casillas de la MISMA rejilla que el tablero: así quedan
  // alineados con su fila y su columna sin tener que cuadrar nada a ojo.
  const anchoP = Math.max(...J.filas.map(f => f.length));
  const altoP = Math.max(...J.cols.map(c => c.length));
  const lado = Math.min(
    Math.floor(330 / (n + anchoP)),
    Math.floor((infantil ? 430 : 400) / (n + altoP)),
    infantil ? 56 : 34);
  const fuente = Math.max(9, Math.round(lado * 0.46));

  const filaHecha = f => {
    const linea = [];
    for (let c = 0; c < n; c++) linea.push(J.tablero[f * n + c] === 1 ? 1 : 0);
    return JSON.stringify(nonoTiradas(linea)) === JSON.stringify(J.filas[f]);
  };
  const colHecha = c => {
    const linea = [];
    for (let f = 0; f < n; f++) linea.push(J.tablero[f * n + c] === 1 ? 1 : 0);
    return JSON.stringify(nonoTiradas(linea)) === JSON.stringify(J.cols[c]);
  };

  let rejilla = '';

  // Esquina vacía + los números de arriba.
  for (let r = 0; r < altoP; r++) {
    rejilla += `<span style="grid-column:1/span ${anchoP}"></span>`;
    for (let c = 0; c < n; c++) {
      const nums = J.cols[c].filter(x => x);
      const idx = r - (altoP - nums.length);
      const hecha = colHecha(c);
      rejilla += `<span style="display:grid;place-items:center;font-size:${fuente}px;font-weight:900;
            color:${hecha ? 'var(--tinta-suave)' : color};opacity:${hecha ? .4 : 1};
            ${c % 5 === 0 && c ? 'border-left:2px solid ' + color + '66;' : ''}
            ${r === altoP - 1 ? 'padding-bottom:2px;' : ''}">${idx >= 0 ? nums[idx] : ''}</span>`;
    }
  }

  // Cada fila: sus números a la izquierda y luego las casillas.
  for (let f = 0; f < n; f++) {
    const nums = J.filas[f].filter(x => x);
    const hecha = filaHecha(f);
    for (let k = 0; k < anchoP; k++) {
      const idx = k - (anchoP - nums.length);
      rejilla += `<span style="display:grid;place-items:center;font-size:${fuente}px;font-weight:900;
            color:${hecha ? 'var(--tinta-suave)' : color};opacity:${hecha ? .4 : 1};
            ${f % 5 === 0 && f ? 'border-top:2px solid ' + color + '66;' : ''}
            ${k === anchoP - 1 ? 'padding-right:3px;' : ''}">${idx >= 0 ? nums[idx] : ''}</span>`;
    }
    for (let c = 0; c < n; c++) {
      const i = f * n + c, v = J.tablero[i];
      // Las vacías llevan un tinte muy suave: en blanco sobre blanco la rejilla
      // casi no se ve y hay que forzar la vista para contar casillas.
      const fondo = v === 1 ? color : 'rgba(11,42,74,.05)';
      rejilla += `<button onclick="tocaNono(${i})" aria-label="fila ${f + 1} columna ${c + 1}"
            style="width:${lado}px;height:${lado}px;padding:0;border:none;cursor:pointer;font:inherit;
                   background:${fondo};display:grid;place-items:center;
                   font-size:${Math.round(lado * .5)}px;font-weight:900;color:var(--tinta-suave);
                   border-radius:${n > 8 ? 3 : 5}px;
                   box-shadow:inset 0 0 0 1px rgba(11,42,74,.12)
                     ${c % 5 === 0 && c ? ',inset 2px 0 0 ' + color + '66' : ''}
                     ${f % 5 === 0 && f ? ',inset 0 2px 0 ' + color + '66' : ''}">${v === 2 ? '✕' : ''}</button>`;
    }
  }

  const pintado = J.tablero.filter(v => v === 1).length;
  const total = J.sol.filter(v => v).length;

  app().innerHTML = marcoJuego('nonograma',
    `Dibujo escondido`,
    `<span id="reloj-nono">${relojBonito(J.segundos)}</span>`,
    'Los números dicen cuántas casillas seguidas van pintadas', `

    <div style="display:grid;
                grid-template-columns:repeat(${anchoP}, ${Math.round(lado * .72)}px) repeat(${n}, ${lado}px);
                grid-auto-rows:${lado}px;
                background:var(--tarjeta);padding:10px;border-radius:18px;
                box-shadow:0 2px 8px rgba(0,0,0,.12)">${rejilla}</div>

    <div style="margin-top:10px;font-size:12px;font-weight:800;color:var(--tinta-suave)">
      ${pintado} de ${total} casillas</div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px;
                width:100%;max-width:330px">
      <button onclick="modoNono('pintar')" style="border:none;border-radius:14px;padding:13px;cursor:pointer;
              font:inherit;font-weight:900;font-size:14px;
              background:${J.modo === 'pintar' ? color : 'var(--tarjeta)'};
              color:${J.modo === 'pintar' ? '#fff' : 'var(--tinta)'};
              box-shadow:0 3px 0 rgba(11,42,74,.16)">🖌️ Pintar</button>
      <button onclick="modoNono('marcar')" style="border:none;border-radius:14px;padding:13px;cursor:pointer;
              font:inherit;font-weight:900;font-size:14px;
              background:${J.modo === 'marcar' ? color : 'var(--tarjeta)'};
              color:${J.modo === 'marcar' ? '#fff' : 'var(--tinta)'};
              box-shadow:0 3px 0 rgba(11,42,74,.16)">✕ Marcar vacías</button>
      <button onclick="deshazNono()" ${J.historial.length ? '' : 'disabled'}
              style="border:none;border-radius:14px;padding:13px;cursor:pointer;font:inherit;
              font-weight:800;font-size:14px;background:var(--tarjeta);color:var(--tinta);
              opacity:${J.historial.length ? 1 : .45};box-shadow:0 3px 0 rgba(11,42,74,.16)">↩ Deshacer</button>
      <button onclick="pistaNono()" ${J.pistas ? '' : 'disabled'}
              style="border:none;border-radius:14px;padding:13px;cursor:pointer;font:inherit;
              font-weight:900;font-size:14px;background:#FFC93C;color:#0B2A4A;
              opacity:${J.pistas ? 1 : .45};box-shadow:0 3px 0 rgba(11,42,74,.16)">💡 ${J.pistas}</button>
    </div>
    <div style="height:16px"></div>`);
}

/** Para el título del final: "¡Es una casa!" o "¡Es un gato!". */
function esFemenino(nombre) {
  return ['Casa', 'Cruz', 'Taza', 'Luna', 'Estrella', 'Montaña', 'Seta', 'Manzana',
          'Llave', 'Copa', 'Pajarita', 'Mariposa', 'Flor', 'Tortuga', 'Casa'].includes(nombre);
}

/** Solo el reloj, igual que en el sudoku: repintar entero cada segundo sobra. */
function pintaRelojNono() {
  const r = document.getElementById('reloj-nono');
  if (r) r.textContent = relojBonito(J.segundos);
}

function modoNono(m) { J.modo = m; pinta(); }

function tocaNono(i) {
  const antes = J.tablero[i];

  if (J.modo === 'marcar') {
    // Marcar con ✕ es la libreta del niño: son SUS notas, no se corrigen ni penalizan.
    J.historial.push({ i, antes });
    J.tablero[i] = (antes === 2) ? 0 : 2;
    pinta();
    return;
  }

  if (antes === 1) {                      // ya pintada y correcta: despintarla
    J.historial.push({ i, antes });
    J.tablero[i] = 0;
    pinta();
    return;
  }

  J.historial.push({ i, antes });
  if (J.sol[i]) {
    J.tablero[i] = 1;
    pita(true); vibra(true);
  } else {
    // Se equivoca: en vez de dejarle pintar mal y que se entere veinte casillas
    // después, se le corrige al momento y la casilla queda marcada como vacía.
    J.tablero[i] = 2;
    J.fallos++;
    pita(false); vibra(false);
  }
  if (J.historial.length > 80) J.historial.shift();

  if (J.sol.every((v, k) => !v || J.tablero[k] === 1)) return terminaNono();
  pinta();
}

function deshazNono() {
  const p = J.historial.pop();
  if (!p) return;
  J.tablero[p.i] = p.antes;
  pinta();
}

/** La pista resuelve una FILA entera: es lo que desatasca de verdad. */
function pistaNono() {
  if (!J.pistas) return;
  const n = J.n;
  // La fila más avanzada de las que aún no están, que es la que menos regala.
  let mejor = -1, mejorFalta = 1e9;
  for (let f = 0; f < n; f++) {
    let falta = 0;
    for (let c = 0; c < n; c++) if (J.sol[f * n + c] && J.tablero[f * n + c] !== 1) falta++;
    if (falta && falta < mejorFalta) { mejorFalta = falta; mejor = f; }
  }
  if (mejor < 0) return;
  for (let c = 0; c < n; c++) {
    const i = mejor * n + c;
    J.historial.push({ i, antes: J.tablero[i] });
    J.tablero[i] = J.sol[i] ? 1 : 2;
  }
  J.pistas--;
  pita(true);
  if (J.sol.every((v, k) => !v || J.tablero[k] === 1)) return terminaNono();
  pinta();
}

function terminaNono() {
  clearInterval(J.reloj);
  J.fase = 'fin';
  const base = { 5: 6, 8: 14, 10: 22 }[J.n];
  J.premio = Math.max(3, base - J.fallos - (3 - J.pistas) * 3);
  const a = alumnoActual();
  a.estrellas += J.premio; a.estrellasTotal = (a.estrellasTotal || 0) + J.premio;
  guardaTodo();
  pinta();
}

function otroNono() {
  clearInterval(J.reloj);
  // Se guarda el nombre del anterior para no repetir dibujo dos veces seguidas.
  nonoAnterior = J.nombre;
  J = {};
  pinta();
}

/* ===================================================================
   SUDOKU

   Un sudoku de verdad: la rejilla se genera aquí, se le quitan números
   comprobando que la solución SIGUE SIENDO ÚNICA, y el tamaño depende
   del curso. Nada de tableros guardados en una lista ni de "sudokus"
   que admiten dos respuestas.

   POR QUÉ CAMBIA DE TAMAÑO. Un 9×9 a un niño de cinco años no le
   enseña nada: le aburre y lo deja. Y un 4×4 a uno de 6º le insulta.
   Así que:

       Infantil .............. 4×4   (cajas de 2×2)
       1º y 2º de Primaria ... 4×4 con menos pistas
       3º y 4º ............... 6×6   (cajas de 2×3)
       5º y 6º ............... 9×9   (cajas de 3×3)

   El sudoku no es un juego de números: es de lógica pura. Por eso entra
   bien aquí aunque no pregunte nada del currículo.
   =================================================================== */

/** Cómo son las cajas de cada tamaño: [alto, ancho] en celdas. */
const SUDOKU_CAJAS = { 4: [2, 2], 6: [2, 3], 9: [3, 3] };

/** El tablero que le toca a cada curso: tamaño y cuántos números se dejan puestos. */
function sudokuSegunCurso(lvl) {
  if (lvl < 2)  return { n: 4, pistas: 9,  nombre: 'Fácil' };     // Infantil
  if (lvl < 4)  return { n: 4, pistas: 7,  nombre: 'Normal' };    // 1º y 2º
  if (lvl < 6)  return { n: 6, pistas: 16, nombre: 'Normal' };    // 3º y 4º
  return          { n: 9, pistas: 34, nombre: 'Normal' };         // 5º y 6º
}

/* ---------- El motor ---------- */

function sudokuVacio(n) { return new Array(n * n).fill(0); }

/** ¿Puede ir el valor v en la casilla i sin repetirse en fila, columna o caja? */
function sudokuCabe(t, n, i, v) {
  const [ch, cw] = SUDOKU_CAJAS[n];
  const f = Math.floor(i / n), c = i % n;
  for (let k = 0; k < n; k++) {
    if (t[f * n + k] === v) return false;          // fila
    if (t[k * n + c] === v) return false;          // columna
  }
  const f0 = Math.floor(f / ch) * ch, c0 = Math.floor(c / cw) * cw;
  for (let a = 0; a < ch; a++)
    for (let b = 0; b < cw; b++)
      if (t[(f0 + a) * n + (c0 + b)] === v) return false;   // caja
  return true;
}

function sudokuBaraja(a) {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Rellena un tablero entero válido, probando valores al azar y retrocediendo
 * cuando se atasca. Es el mismo método con el que se resuelve a mano: pones,
 * y si no sale, borras y pruebas otro.
 */
function sudokuRellena(t, n, i = 0) {
  if (i === n * n) return true;
  if (t[i] !== 0) return sudokuRellena(t, n, i + 1);
  const valores = sudokuBaraja(Array.from({ length: n }, (_, k) => k + 1));
  for (const v of valores) {
    if (!sudokuCabe(t, n, i, v)) continue;
    t[i] = v;
    if (sudokuRellena(t, n, i + 1)) return true;
    t[i] = 0;
  }
  return false;
}

/**
 * Cuenta soluciones, pero para de contar en cuanto encuentra DOS.
 *
 * Es la pieza clave: un sudoku con dos soluciones no es un sudoku, es una
 * trampa. El niño razona bien, pone un número que encaja... y le sale mal.
 * Por eso cada número que se quita se comprueba.
 */
function sudokuCuentaSoluciones(t, n, tope = 2) {
  let encontradas = 0;
  (function busca(i) {
    if (encontradas >= tope) return;
    while (i < n * n && t[i] !== 0) i++;
    if (i === n * n) { encontradas++; return; }
    for (let v = 1; v <= n; v++) {
      if (!sudokuCabe(t, n, i, v)) continue;
      t[i] = v;
      busca(i + 1);
      t[i] = 0;
      if (encontradas >= tope) return;
    }
  })(0);
  return encontradas;
}

/**
 * Genera un sudoku: tablero resuelto, y después se van quitando números
 * mientras la solución siga siendo única.
 *
 * Devuelve { n, inicial, solucion }: "inicial" con ceros en los huecos.
 */
function generaSudoku(n, pistas) {
  const solucion = sudokuVacio(n);
  sudokuRellena(solucion, n);

  const t = solucion.slice();
  const orden = sudokuBaraja(Array.from({ length: n * n }, (_, i) => i));
  let puestos = n * n;

  for (const i of orden) {
    if (puestos <= pistas) break;
    const guardado = t[i];
    t[i] = 0;
    if (sudokuCuentaSoluciones(t, n) !== 1) t[i] = guardado;   // se deshace
    else puestos--;
  }
  return { n, inicial: t, solucion };
}

/* ---------- El juego ---------- */

function juegoSudoku() {
  const a = alumnoActual();
  const curso = cursoPorId(a.curso);
  const infantil = curso.etapa === 'infantil';

  if (J.juego !== 'sudoku') {
    const cfg = sudokuSegunCurso(curso.lvl);
    const s = generaSudoku(cfg.n, cfg.pistas);
    nuevoJuego({
      juego: 'sudoku', fase: 'jugando', n: s.n,
      inicial: s.inicial, solucion: s.solucion, tablero: s.inicial.slice(),
      notas: s.inicial.map(() => []), elegida: -1, lapiz: false,
      pistas: 3, fallos: 0, segundos: 0, historial: [], premio: 0
    });
    clearInterval(J.reloj);
    J.reloj = setInterval(() => {
      if (juegoActivo !== 'sudoku') return clearInterval(J.reloj);
      if (J.fase === 'jugando') { J.segundos++; pintaReloj(); }
    }, 1000);
  }

  const n = J.n, [ch, cw] = SUDOKU_CAJAS[n];
  const color = JUEGOS.find(x => x.id === 'sudoku').color;

  /* ----- Terminado ----- */
  if (J.fase === 'fin') {
    app().innerHTML = marcoJuego('sudoku', 'Sudoku', null, null, `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;
                  align-items:center;text-align:center">
        <div style="font-size:66px">🏆</div>
        <h2 style="font-size:28px;font-weight:900;margin:10px 0 4px">¡Sudoku resuelto!</h2>
        <p style="font-size:15px;opacity:.7;margin:0">
          ${n}×${n} en ${relojBonito(J.segundos)}${J.fallos ? ' · ' + J.fallos + (J.fallos === 1 ? ' fallo' : ' fallos') : ' · sin fallos'}</p>
        <div class="pastilla" style="background:#FFC93C4D;margin-top:18px;font-weight:900;font-size:17px">
          ⭐ +${J.premio} estrellas</div>
        <div style="display:flex;gap:12px;margin-top:26px">
          <button onclick="otroSudoku()" style="background:${color};color:#fff;border:none;
                  border-radius:18px;padding:15px 26px;font-weight:900;font-size:16px;cursor:pointer;
                  box-shadow:0 4px 0 rgba(0,0,0,.2)">Otro 🔁</button>
          <button onclick="cierraJuego()" style="background:var(--tarjeta);color:var(--tinta);border:none;
                  border-radius:18px;padding:15px 26px;font-weight:800;font-size:16px;cursor:pointer">Salir</button>
        </div>
      </div>`);
    confeti(J.fallos === 0 ? 2 : 1);
    return;
  }

  /* ----- La rejilla ----- */
  const lado = Math.min(Math.floor(340 / n), infantil ? 72 : 44);
  const valorElegido = J.elegida >= 0 ? J.tablero[J.elegida] : 0;

  const casillas = J.tablero.map((v, i) => {
    const f = Math.floor(i / n), c = i % n;
    const fija = J.inicial[i] !== 0;
    const sel = i === J.elegida;
    // Se resalta la fila, la columna y la caja de la casilla elegida: así el niño
    // VE por qué un número no puede ir ahí, que es justo lo que enseña el sudoku.
    const mismaCaja = J.elegida >= 0 &&
      Math.floor(f / ch) === Math.floor(Math.floor(J.elegida / n) / ch) &&
      Math.floor(c / cw) === Math.floor((J.elegida % n) / cw);
    const enCruz = J.elegida >= 0 && (f === Math.floor(J.elegida / n) || c === J.elegida % n);
    const igual = v !== 0 && v === valorElegido && !sel;
    const malo = v !== 0 && !fija && v !== J.solucion[i];

    const fondo = sel ? color + '59'
                : igual ? color + '2E'
                : (enCruz || mismaCaja) ? 'rgba(11,42,74,.07)'
                : fija ? 'rgba(11,42,74,.05)' : 'var(--tarjeta)';
    const tinta = malo ? '#D93B3B' : fija ? 'var(--tinta)' : color;

    const notas = (!v && J.notas[i].length)
      ? `<span style="display:grid;grid-template-columns:repeat(${Math.min(3, n)},1fr);
             font-size:${Math.max(8, lado / 5)}px;line-height:1;color:var(--tinta-suave);
             font-weight:800;width:100%;height:100%;place-items:center">
           ${Array.from({ length: n }, (_, k) =>
             `<i style="font-style:normal;opacity:${J.notas[i].includes(k + 1) ? 1 : 0}">${k + 1}</i>`).join('')}
         </span>`
      : (v || '');

    return `<button onclick="tocaSudoku(${i})"
      style="width:${lado}px;height:${lado}px;padding:0;cursor:pointer;font:inherit;
             background:${fondo};color:${tinta};
             font-weight:${fija ? 900 : 700};font-size:${Math.round(lado * 0.52)}px;
             border:1px solid rgba(11,42,74,.16);
             border-left-width:${c % cw === 0 ? 3 : 1}px;
             border-top-width:${f % ch === 0 ? 3 : 1}px;
             border-right-width:${c === n - 1 ? 3 : 1}px;
             border-bottom-width:${f === n - 1 ? 3 : 1}px;
             border-color:rgba(11,42,74,.16) rgba(11,42,74,.16) rgba(11,42,74,.16) rgba(11,42,74,.16);
             ${c % cw === 0 ? 'border-left-color:' + color + ';' : ''}
             ${f % ch === 0 ? 'border-top-color:' + color + ';' : ''}
             ${c === n - 1 ? 'border-right-color:' + color + ';' : ''}
             ${f === n - 1 ? 'border-bottom-color:' + color + ';' : ''}
             display:grid;place-items:center">${notas}</button>`;
  }).join('');

  /* ----- El teclado ----- */
  const puestos = v => J.tablero.filter(x => x === v).length;
  const teclas = Array.from({ length: n }, (_, k) => {
    const v = k + 1, completo = puestos(v) === n;
    return `<button onclick="escribeSudoku(${v})" ${completo ? 'disabled' : ''}
      style="flex:1;min-width:0;padding:${infantil ? 16 : 13}px 0;cursor:pointer;font:inherit;
             border:none;border-radius:14px;font-weight:900;font-size:${infantil ? 26 : 21}px;
             background:${completo ? 'rgba(11,42,74,.08)' : 'var(--tarjeta)'};
             color:${completo ? 'var(--tinta-suave)' : color};
             opacity:${completo ? .45 : 1};
             box-shadow:${completo ? 'none' : '0 3px 0 rgba(11,42,74,.16)'}">${v}</button>`;
  }).join('');

  app().innerHTML = marcoJuego('sudoku',
    'Sudoku ' + n + '×' + n,
    `<span id="reloj-sudoku">${relojBonito(J.segundos)}</span>`,
    infantil ? 'Que no se repita ningún número en la fila, la columna ni el cuadro'
             : 'Cada número una sola vez por fila, por columna y por cuadro',
    `
    <div style="display:grid;grid-template-columns:repeat(${n},${lado}px);
                margin:4px auto 0;border-radius:10px;overflow:hidden;
                box-shadow:0 4px 14px rgba(11,42,74,.18)">${casillas}</div>

    <div style="display:flex;gap:7px;width:100%;max-width:${lado * n}px;margin:16px auto 0">${teclas}</div>

    <div style="display:flex;gap:8px;width:100%;max-width:${lado * n}px;margin:10px auto 0">
      <button onclick="lapizSudoku()" style="flex:1;padding:12px 0;border:none;border-radius:14px;
              cursor:pointer;font:inherit;font-weight:800;font-size:13px;
              background:${J.lapiz ? color : 'var(--tarjeta)'};color:${J.lapiz ? '#fff' : 'var(--tinta)'};
              box-shadow:0 3px 0 rgba(11,42,74,.16)">✏️ Notas</button>
      <button onclick="borraSudoku()" style="flex:1;padding:12px 0;border:none;border-radius:14px;
              cursor:pointer;font:inherit;font-weight:800;font-size:13px;background:var(--tarjeta);
              color:var(--tinta);box-shadow:0 3px 0 rgba(11,42,74,.16)">⌫ Borrar</button>
      <button onclick="deshazSudoku()" ${J.historial.length ? '' : 'disabled'}
              style="flex:1;padding:12px 0;border:none;border-radius:14px;cursor:pointer;font:inherit;
              font-weight:800;font-size:13px;background:var(--tarjeta);color:var(--tinta);
              opacity:${J.historial.length ? 1 : .45};box-shadow:0 3px 0 rgba(11,42,74,.16)">↩️ Deshacer</button>
      <button onclick="pistaSudoku()" ${J.pistas ? '' : 'disabled'}
              style="flex:1;padding:12px 0;border:none;border-radius:14px;cursor:pointer;font:inherit;
              font-weight:800;font-size:13px;background:${J.pistas ? '#FFC93C' : 'var(--tarjeta)'};
              color:#0B2A4A;opacity:${J.pistas ? 1 : .45};
              box-shadow:0 3px 0 rgba(11,42,74,.16)">💡 ${J.pistas}</button>
    </div>
    <div style="height:16px"></div>`);
}

/** Solo repinta el reloj: repintar el tablero entero cada segundo sería absurdo. */
function pintaReloj() {
  const r = document.getElementById('reloj-sudoku');
  if (r) r.textContent = relojBonito(J.segundos);
}

function relojBonito(s) {
  const m = Math.floor(s / 60);
  return m + ':' + String(s % 60).padStart(2, '0');
}

function tocaSudoku(i) {
  if (J.inicial[i] !== 0) {                 // una pista no se toca, pero sí resalta
    J.elegida = i; pinta(); return;
  }
  J.elegida = i; pinta();
}

function escribeSudoku(v) {
  const i = J.elegida;
  if (i < 0 || J.inicial[i] !== 0) return;

  J.historial.push({ i, antes: J.tablero[i], notas: J.notas[i].slice() });
  if (J.historial.length > 60) J.historial.shift();

  if (J.lapiz) {
    const k = J.notas[i].indexOf(v);
    if (k >= 0) J.notas[i].splice(k, 1); else J.notas[i].push(v);
    J.tablero[i] = 0;
    pinta();
    return;
  }

  J.tablero[i] = (J.tablero[i] === v) ? 0 : v;   // volver a tocar el mismo lo quita
  J.notas[i] = [];
  if (J.tablero[i] !== 0) {
    const bien = J.tablero[i] === J.solucion[i];
    if (!bien) J.fallos++;
    pita(bien); vibra(bien);
    // Al poner un número, se quita de las notas de su fila, columna y caja: es lo
    // que haría a mano con el lápiz, y si no, las notas estorban más que ayudan.
    if (bien) limpiaNotasSudoku(i, J.tablero[i]);
  }

  if (J.tablero.every((x, k) => x === J.solucion[k])) return terminaSudoku();
  pinta();
}

function limpiaNotasSudoku(i, v) {
  const n = J.n, [ch, cw] = SUDOKU_CAJAS[n];
  const f = Math.floor(i / n), c = i % n;
  const f0 = Math.floor(f / ch) * ch, c0 = Math.floor(c / cw) * cw;
  for (let k = 0; k < n * n; k++) {
    const kf = Math.floor(k / n), kc = k % n;
    const mismaCaja = kf >= f0 && kf < f0 + ch && kc >= c0 && kc < c0 + cw;
    if (kf === f || kc === c || mismaCaja) {
      const p = J.notas[k].indexOf(v);
      if (p >= 0) J.notas[k].splice(p, 1);
    }
  }
}

function borraSudoku() {
  const i = J.elegida;
  if (i < 0 || J.inicial[i] !== 0) return;
  J.historial.push({ i, antes: J.tablero[i], notas: J.notas[i].slice() });
  J.tablero[i] = 0; J.notas[i] = [];
  pinta();
}

function deshazSudoku() {
  const p = J.historial.pop();
  if (!p) return;
  J.tablero[p.i] = p.antes;
  J.notas[p.i] = p.notas;
  J.elegida = p.i;
  pinta();
}

function lapizSudoku() { J.lapiz = !J.lapiz; pinta(); }

/**
 * La pista pone bien UNA casilla, la elegida si está vacía, y si no, cualquiera.
 * Son tres por partida: suficientes para desatascarse, pocas para resolverlo así.
 */
function pistaSudoku() {
  if (!J.pistas) return;
  let i = (J.elegida >= 0 && J.tablero[J.elegida] !== J.solucion[J.elegida]) ? J.elegida : -1;
  if (i < 0) {
    const vacias = J.tablero.map((v, k) => (v !== J.solucion[k] ? k : -1)).filter(k => k >= 0);
    if (!vacias.length) return;
    i = vacias[Math.floor(Math.random() * vacias.length)];
  }
  J.historial.push({ i, antes: J.tablero[i], notas: J.notas[i].slice() });
  J.tablero[i] = J.solucion[i];
  J.notas[i] = [];
  limpiaNotasSudoku(i, J.tablero[i]);
  J.pistas--;
  J.elegida = i;
  pita(true);
  if (J.tablero.every((x, k) => x === J.solucion[k])) return terminaSudoku();
  pinta();
}

function terminaSudoku() {
  clearInterval(J.reloj);
  J.fase = 'fin';
  // El premio va por tamaño del tablero y por lo limpio que haya quedado.
  const base = { 4: 6, 6: 12, 9: 20 }[J.n];
  J.premio = Math.max(3, base - J.fallos - (3 - J.pistas) * 2);
  const a = alumnoActual();
  a.estrellas += J.premio; a.estrellasTotal = (a.estrellasTotal || 0) + J.premio;
  guardaTodo();
  pinta();
}

function otroSudoku() {
  clearInterval(J.reloj);
  J = {};
  pinta();
}

/* ===================================================================
   ZONA DE JUEGOS — los catorce de la app.
   Traducción de ui/screens/GamesScreen.kt: mismos juegos, mismos
   colores, misma dificultad por edad y el mismo marco de cabecera.
   =================================================================== */

const JUEGOS = [
  { id:'contrarreloj', nombre:'Contrarreloj',           ico:'⏱', desc:'60 segundos, ¿cuántas aciertas?', color:'#0B2A4A' },
  { id:'puzle',        nombre:'Puzle deslizante',       ico:'🧩', desc:'Ordena las piezas',              color:'#3DDC97' },
  { id:'dif',          nombre:'Encuentra el diferente', ico:'🔍', desc:'¿Cuál no es igual?',             color:'#12B5E5' },
  { id:'sopa',         nombre:'Sopa de letras',         ico:'🔠', desc:'Encuentra las palabras',         color:'#9B7BFF' },
  { id:'laberinto',    nombre:'Laberinto',              ico:'🌀', desc:'Llega a la meta',                color:'#0B2A4A' },
  { id:'pintar',       nombre:'Pintar por números',     ico:'🎨', desc:'Colorea el dibujo',              color:'#F06292' },
  { id:'ahorcado',     nombre:'Adivina la palabra',     ico:'🔤', desc:'Con pista y dibujo',             color:'#FF9F68' },
  { id:'raya',         nombre:'Tres en raya',           ico:'⭕', desc:'Juega contra la app',            color:'#FF6B6B' },
  { id:'topos',        nombre:'Topos rápidos',          ico:'🐹', desc:'Toca el resultado correcto',     color:'#8D6E63' },
  { id:'secuencia',    nombre:'¿Qué viene después?',    ico:'➡️', desc:'Completa la serie',              color:'#FFC93C' },
  { id:'sudoku',       nombre:'Sudoku',                 ico:'🔢', desc:'Lógica pura, sin repetir',       color:'#26C6DA' },
  { id:'nonograma',    nombre:'Dibujo escondido',       ico:'🖼️', desc:'Píntalo con los números',        color:'#5C6BC0' },
  { id:'carrera',      nombre:'Carrera de cálculo',     ico:'🏁', desc:'Dos jugadores a la vez',         color:'#00897B' },
  { id:'flechas',      nombre:'Flechas',                ico:'🎯', desc:'60 niveles de lógica',           color:'#7E57C2' }
];

/** Texto oscuro sobre colores claros y blanco sobre los oscuros, calculado del color. */
function tintaSobre(hex) {
  const r = parseInt(hex.slice(1,3),16)/255, g = parseInt(hex.slice(3,5),16)/255, b = parseInt(hex.slice(5,7),16)/255;
  const lum = 0.2126*r + 0.7152*g + 0.0722*b;
  return lum > 0.45 ? '#0B2A4A' : '#FFFFFF';
}

let juegoActivo = null;

function pintaJuegos() {
  const a = alumnoActual();
  const infantil = cursoPorId(a.curso).etapa === 'infantil';
  if (juegoActivo) return pintaJuego(juegoActivo);

  const fichas = JUEGOS.map(j => {
    const tinta = tintaSobre(j.color);
    return `
      <button onclick="abreJuego('${j.id}')"
              style="background:${j.color};color:${tinta};border:none;cursor:pointer;font:inherit;
                     border-radius:${infantil ? 26 : 22}px;padding:14px;text-align:left;
                     height:${infantil ? 110 : 150}px;display:flex;
                     flex-direction:${infantil ? 'row' : 'column'};align-items:${infantil ? 'center' : 'stretch'};
                     gap:${infantil ? 16 : 0};box-shadow:0 2px 6px rgba(0,0,0,.18)">
        <span style="width:${infantil ? 70 : 52}px;height:${infantil ? 70 : 52}px;border-radius:50%;
                     background:rgba(255,255,255,.25);display:grid;place-items:center;flex:none;
                     font-size:${infantil ? 38 : 28}px">${j.ico}</span>
        ${infantil
          ? `<span style="flex:1;font-weight:900;font-size:22px">${j.nombre}</span><span style="font-size:26px">▶</span>`
          : `<span style="flex:1"></span>
             <strong style="font-size:15px;font-weight:900;line-height:1.2">${j.nombre}</strong>
             <small style="font-size:11px;opacity:.78;line-height:1.25;margin-top:2px">${j.desc}</small>`}
      </button>`;
  }).join('');

  app().innerHTML = marco(`
    <h2 class="titulo-seccion">${infantil ? '¡A jugar!' : 'Zona de juegos'}</h2>
    <p class="subtitulo">${infantil ? 'Elige uno' : 'Catorce juegos para descansar de las preguntas'}</p>
    <div style="display:grid;grid-template-columns:${infantil ? '1fr' : '1fr 1fr'};gap:12px">${fichas}</div>
    <div style="height:20px"></div>`);
}

function abreJuego(id) { juegoActivo = id; pinta(); }
function cierraJuego() {
  // Cortar cualquier reloj del juego que se deja: si no, sigue corriendo por
  // detrás aunque el niño ya esté en otra pantalla.
  if (J && J.reloj) { clearInterval(J.reloj); J.reloj = null; }
  juegoActivo = null;
  const a = alumnoActual(); a.juegos = (a.juegos || 0) + 1; guardaTodo();
  pinta();
}

/** El marco común: franja del color del juego, marcador y ayuda. */
function marcoJuego(id, titulo, marcador, ayuda, cuerpo) {
  const j = JUEGOS.find(x => x.id === id);
  const tinta = tintaSobre(j.color);
  return `
    <div style="min-height:100vh;background:${j.color}1A;display:flex;flex-direction:column">
      <div style="background:${j.color};color:${tinta};padding:12px 14px">
        <div style="display:flex;align-items:center;gap:12px">
          <button onclick="cierraJuego()" style="border:none;border-radius:50%;cursor:pointer;
                  background:rgba(255,255,255,.22);color:${tinta};padding:9px 11px;font-size:15px">✕</button>
          <strong style="flex:1;font-size:18px;font-weight:900">${titulo}</strong>
          ${marcador ? `<span style="background:rgba(255,255,255,.22);border-radius:50px;
               padding:5px 12px;font-weight:900;font-size:14px">${marcador}</span>` : ''}
        </div>
        ${ayuda ? `<div style="font-size:12px;opacity:.8;margin-top:4px">${ayuda}</div>` : ''}
      </div>
      <div style="flex:1;padding:14px 18px;display:flex;flex-direction:column;align-items:center;
                  overflow-y:auto">${cuerpo}</div>
    </div>`;
}

/* Qué función pinta cada juego. Se guarda el NOMBRE, no la función: así, si un
   archivo no llegó a cargarse (una subida a medias, la caché del móvil a medio
   renovar), se cae ese juego solo y no la pestaña entera. Con las funciones
   puestas directamente, un solo archivo que falte deja a toda la clase sin
   Juegos, y eso ya pasó una vez. */
const FUNCION_DE_JUEGO = {
  contrarreloj:'juegoContrarreloj', puzle:'juegoPuzle', dif:'juegoDiferente',
  sopa:'juegoSopa', laberinto:'juegoLaberinto', pintar:'juegoPintar',
  ahorcado:'juegoAhorcado', raya:'juegoRaya', topos:'juegoTopos', secuencia:'juegoSecuencia',
  sudoku:'juegoSudoku', nonograma:'juegoNonograma', carrera:'juegoCarrera',
  flechas:'juegoFlechas'
};

function pintaJuego(id) {
  const fn = globalThis[FUNCION_DE_JUEGO[id]];
  if (typeof fn !== 'function') {
    const j = JUEGOS.find(x => x.id === id) || { nombre:'Juego' };
    app().innerHTML = marcoJuego(id, j.nombre, null, null, `
      <div style="flex:1;display:grid;place-items:center;text-align:center">
        <div>
          <div style="font-size:54px">🔌</div>
          <strong style="font-size:18px">Este juego no se ha cargado bien</strong>
          <p style="font-size:14px;opacity:.65;margin:8px 0 0">
            Cierra la web y vuelve a abrirla con internet.</p>
          <button onclick="cierraJuego()" style="margin-top:20px;background:var(--tarjeta);
                  color:var(--tinta);border:none;border-radius:16px;padding:14px 24px;
                  cursor:pointer;font:inherit;font-weight:800">Volver a los juegos</button>
        </div>
      </div>`);
    return;
  }
  fn();
}

/* Estado de los juegos: se reinicia cada vez que se entra en uno. */
let J = {};
function nuevoJuego(inicial) { J = inicial; }

/* ========== 1. CONTRARRELOJ ========== */
function juegoContrarreloj() {
  const a = alumnoActual();
  if (J.juego !== 'contrarreloj') {
    nuevoJuego({ juego:'contrarreloj', fase:'inicio', segundos:60, aciertos:0, fallos:0,
                 pregunta:null, tocada:null, record: (a.records || {})[a.curso] || 0 });
  }
  const materias = materiasDe(cursoPorId(a.curso));

  const nuevaPregunta = () => {
    const m = materias[Math.floor(Math.random() * materias.length)];
    const temas = temasDe(m.id);
    J.pregunta = generaPregunta(m.id, a.curso, temas[Math.floor(Math.random()*temas.length)]);
    J.tocada = null;
  };

  if (J.fase === 'inicio') {
    app().innerHTML = marcoJuego('contrarreloj', 'Contrarreloj', null, null, `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center">
        <div style="font-size:64px">⏱</div>
        <h2 style="font-size:28px;font-weight:900;margin:10px 0 6px">Contrarreloj</h2>
        <p style="font-size:14px;opacity:.65;line-height:1.5">60 segundos con preguntas de
          ${cursoPorId(a.curso).nombre}.<br>Cada acierto, una estrella.</p>
        ${J.record ? `<div class="pastilla" style="background:#FFC93C4D;margin-top:14px;font-weight:900">
             🏅 Tu récord: ${J.record}</div>` : ''}
        <button onclick="arrancaContrarreloj()" style="margin-top:26px;background:#0B2A4A;color:#fff;
                border:none;border-radius:20px;padding:17px 40px;font-weight:900;font-size:19px;cursor:pointer">
          ¡Empezar!</button>
      </div>`);
    return;
  }

  if (J.fase === 'fin') {
    const esRecord = J.aciertos > J.record;
    app().innerHTML = marcoJuego('contrarreloj', 'Contrarreloj', null, null, `
      <div style="flex:1;display:flex;flex-direction:column;justify-content:center;align-items:center;text-align:center">
        <div style="font-size:60px">${esRecord ? '🏅' : '🏁'}</div>
        <h2 style="font-size:28px;font-weight:900;margin:8px 0;color:${esRecord ? '#3DDC97' : 'inherit'}">
          ${esRecord ? '¡RÉCORD!' : '¡Tiempo!'}</h2>
        <div style="font-size:56px;font-weight:900;line-height:1">${J.aciertos}</div>
        <small style="opacity:.6">aciertos en 60 segundos</small>
        ${J.fallos ? `<small style="opacity:.45;margin-top:4px">${J.fallos} fallos</small>` : ''}
        ${J.aciertos ? `<div class="pastilla" style="background:#FFC93C4D;margin-top:12px;font-weight:900">
             +${J.aciertos} estrellas</div>` : ''}
        <div style="display:flex;gap:10px;margin-top:24px">
          <button onclick="arrancaContrarreloj()" style="background:#0B2A4A;color:#fff;border:none;
                  border-radius:16px;padding:14px 22px;font-weight:900;cursor:pointer">Otra vez 🔁</button>
          <button onclick="cierraJuego()" style="background:#fff;border:none;border-radius:16px;
                  padding:14px 22px;font-weight:700;cursor:pointer">Salir</button>
        </div>
      </div>`);
    return;
  }

  if (!J.pregunta) nuevaPregunta();
  const q = J.pregunta;
  const opciones = q.opciones.map(o => {
    let fondo = '#fff', tinta = '#0B2A4A';
    if (J.tocada) {
      if (o === q.respuesta) { fondo = '#3DDC97'; tinta = '#fff'; }
      else if (o === J.tocada) { fondo = '#FF6B6B'; tinta = '#fff'; }
      else fondo = '#ffffff80';
    }
    return `<button onclick="respondeContrarreloj('${o.replace(/'/g,"\\'")}')"
              style="background:${fondo};color:${tinta};border:none;border-radius:16px;padding:10px;
                     font:inherit;font-weight:700;font-size:16px;cursor:pointer;min-height:62px;max-height:104px;
                     box-shadow:${J.tocada ? 'none' : '0 1px 4px rgba(0,0,0,.12)'}">${o}</button>`;
  }).join('');

  app().innerHTML = marcoJuego('contrarreloj', 'Contrarreloj',
    `⏱ ${J.segundos}`, null, `
      <div style="display:flex;gap:14px;align-items:center;margin-bottom:12px">
        <strong style="color:#3DDC97;font-size:17px">✅ ${J.aciertos}</strong>
        ${J.record ? `<small style="opacity:.45;font-weight:700">🏅 ${J.record}</small>` : ''}
      </div>
      <div style="background:#fff;border-radius:20px;padding:20px;width:100%;text-align:center;
                  box-shadow:0 2px 6px rgba(0,0,0,.12)">
        <div style="font-size:21px;font-weight:900;line-height:1.25">${q.texto}</div>
        ${q.visual ? `<div style="font-size:30px;margin-top:8px">${q.visual}</div>` : ''}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%;margin-top:16px">${opciones}</div>`);
}

function arrancaContrarreloj() {
  const a = alumnoActual();
  J = { juego:'contrarreloj', fase:'jugando', segundos:60, aciertos:0, fallos:0,
        pregunta:null, tocada:null, record:(a.records || {})[a.curso] || 0 };
  pinta();
  clearInterval(J.reloj);
  J.reloj = setInterval(() => {
    J.segundos--;
    if (J.segundos <= 0) {
      clearInterval(J.reloj);
      terminaContrarreloj();
    } else if (!J.tocada) pinta();
  }, 1000);
}

function terminaContrarreloj() {
  const a = alumnoActual();
  a.records = a.records || {};
  // El contrarreloj da estrellas y récord, pero NO toca las estadísticas de la materia:
  // responder con el reloj encima dice lo rápido que lee, no lo que sabe, y ensuciaría
  // el informe de las familias y el repaso adaptativo.
  if (J.aciertos > 0) { a.estrellas += J.aciertos; a.estrellasTotal += J.aciertos; }
  a.juegos = (a.juegos || 0) + 1;
  const anterior = a.records[a.curso] || 0;
  if (J.aciertos > anterior) a.records[a.curso] = J.aciertos;
  guardaTodo();
  J.fase = 'fin'; pinta();
}

function respondeContrarreloj(opcion) {
  if (J.tocada) return;
  J.tocada = opcion;
  if (opcion === J.pregunta.respuesta) J.aciertos++; else J.fallos++;
  pinta();
  setTimeout(() => { if (J.fase === 'jugando') { J.pregunta = null; J.tocada = null; pinta(); } }, 450);
}

/* ========== 2. PUZLE DESLIZANTE ========== */
function juegoPuzle() {
  if (J.juego !== 'puzle') {
    const resuelto = [1,2,3,4,5,6,7,8,0];
    let t = [...resuelto], vacio = 8;
    for (let i = 0; i < 120; i++) {
      const f = Math.floor(vacio/3), c = vacio%3, vecinos = [];
      if (f>0) vecinos.push(vacio-3); if (f<2) vecinos.push(vacio+3);
      if (c>0) vecinos.push(vacio-1); if (c<2) vecinos.push(vacio+1);
      const d = vecinos[Math.floor(Math.random()*vecinos.length)];
      [t[vacio], t[d]] = [t[d], t[vacio]]; vacio = d;
    }
    nuevoJuego({ juego:'puzle', tablero:t, movimientos:0 });
  }
  const ganado = J.tablero.every((v,i) => v === (i===8 ? 0 : i+1));
  const piezas = J.tablero.map((n,i) => `
    <button onclick="tocaPuzle(${i})" style="width:90px;height:90px;border:none;border-radius:16px;cursor:pointer;
            background:${n===0 ? 'transparent' : '#12B5E5'};color:#fff;font-weight:900;font-size:30px;
            box-shadow:${n===0 ? 'none' : '0 2px 5px rgba(0,0,0,.15)'}">${n===0 ? '' : n}</button>`).join('');

  app().innerHTML = marcoJuego('puzle', 'Puzle deslizante', `${J.movimientos} mov.`,
    'Toca una pieza junto al hueco para moverla', `
      <div style="background:#fff;border-radius:14px;padding:10px;text-align:center;margin-bottom:18px">
        <small style="font-size:10px;font-weight:900;opacity:.5">ASÍ DEBE QUEDAR</small>
        <div style="display:grid;grid-template-columns:repeat(3,26px);gap:2px;margin-top:6px">
          ${[1,2,3,4,5,6,7,8,0].map(n => `<div style="height:26px;border-radius:4px;display:grid;place-items:center;
             font-size:11px;font-weight:700;background:${n ? '#12B5E559' : 'transparent'}">${n||''}</div>`).join('')}
        </div>
      </div>
      <div style="display:grid;grid-template-columns:repeat(3,90px);gap:8px">${piezas}</div>
      ${ganado ? `<div style="margin-top:20px;text-align:center">
          <strong>🎉 ¡Completado en ${J.movimientos} movimientos!</strong><br>
          <button onclick="J={};pinta()" style="margin-top:10px;background:#3DDC97;color:#fff;border:none;
            border-radius:14px;padding:12px 20px;font-weight:700;cursor:pointer">Jugar otra vez 🔁</button>
        </div>` : ''}`);
}

function tocaPuzle(i) {
  const vacio = J.tablero.indexOf(0);
  const f = Math.floor(i/3), c = i%3, fv = Math.floor(vacio/3), cv = vacio%3;
  if ((f===fv && Math.abs(c-cv)===1) || (c===cv && Math.abs(f-fv)===1)) {
    [J.tablero[vacio], J.tablero[i]] = [J.tablero[i], J.tablero[vacio]];
    J.movimientos++; pinta();
  }
}

/* ========== 3. ENCUENTRA EL DIFERENTE ========== */
const DIF_SUELTOS = ['🍎','🍌','🐱','🐶','⭐','🎈','🌸','🚗','⚽','🍕'];
const DIF_PARECIDOS = [['🍎','🍏'],['😀','😄'],['⭐','🌟'],['🔵','🔷'],['🐢','🐸'],['🌲','🌳'],
                       ['🟠','🟡'],['🐱','🐯'],['🌙','🌛'],['🚗','🚙'],['🏀','🏐']];

function juegoDiferente() {
  const lvl = cursoPorId(alumnoActual().curso).lvl;
  const columnas = lvl <= 1 ? 3 : 4;
  const dificil = lvl >= 4;
  if (J.juego !== 'dif') nuevoJuego({ juego:'dif', ronda:1, puntos:0, respondida:false, rejilla:[], intruso:0 });
  if (!J.rejilla.length) nuevaRondaDif(columnas, dificil);

  const total = columnas*columnas;
  const casillas = J.rejilla.map((e,i) => `
    <button onclick="tocaDif(${i})" style="width:${columnas===3?88:72}px;height:${columnas===3?88:72}px;
            border:none;border-radius:16px;cursor:pointer;font-size:${columnas===3?32:28}px;
            background:${J.respondida && i===J.intruso ? '#3DDC9766' : '#fff'};
            box-shadow:0 1px 4px rgba(0,0,0,.12)">${e}</button>`).join('');

  app().innerHTML = marcoJuego('dif', 'Encuentra el diferente', `${J.ronda}/10`, null, `
    <strong style="margin-bottom:12px">Puntos: ${J.puntos}</strong>
    <div style="display:grid;grid-template-columns:repeat(${columnas},auto);gap:8px">${casillas}</div>
    ${J.respondida ? `<button onclick="siguienteDif(${columnas},${dificil})" style="margin-top:18px;
        background:#12B5E5;color:#fff;border:none;border-radius:14px;padding:12px 20px;
        font-weight:700;cursor:pointer">${J.ronda >= 10 ? 'Terminar 🏁' : 'Siguiente →'}</button>` : ''}`);
}

function nuevaRondaDif(columnas, dificil) {
  const total = columnas*columnas;
  let base, otro;
  if (dificil) { const p = DIF_PARECIDOS[Math.floor(Math.random()*DIF_PARECIDOS.length)]; base = p[0]; otro = p[1]; }
  else { base = DIF_SUELTOS[Math.floor(Math.random()*DIF_SUELTOS.length)];
         do { otro = DIF_SUELTOS[Math.floor(Math.random()*DIF_SUELTOS.length)]; } while (otro === base); }
  J.intruso = Math.floor(Math.random()*total);
  J.rejilla = Array.from({length: total}, (_,i) => i === J.intruso ? otro : base);
  J.respondida = false;
}

function tocaDif(i) {
  if (J.respondida) return;
  J.respondida = true;
  if (i === J.intruso) J.puntos++;
  pinta();
}

function siguienteDif(columnas, dificil) {
  if (J.ronda >= 10) { J = {}; return cierraJuego(); }
  J.ronda++; nuevaRondaDif(columnas, dificil); pinta();
}

/* ========== 4. SOPA DE LETRAS ========== */
const SOPA_TAM = 9;
const SOPA_PEQUES = ['GATO','CASA','SOL','LUNA','MAR','PEZ','PAN'];
const SOPA_MEDIANAS = ['LIBRO','VERDE','PLAYA','QUESO','NUBE','ARBOL','RATON','FLOR'];
const SOPA_MAYORES = ['PLANETA','MUSCULO','ANFIBIO','COMARCA','DECIMAL','PAISAJE','ENERGIA','MEMORIA'];

/** Misma construcción que SopaDeLetras.kt: palabras al azar, colocadas sin pisarse. */
function construyeSopa(lvl) {
  const lista = lvl <= 1 ? SOPA_PEQUES : lvl < 4 ? SOPA_PEQUES.concat(SOPA_MEDIANAS) : SOPA_MAYORES;
  const cuantas = lvl <= 1 ? 4 : 5;
  const elegidas = [...lista].sort(() => Math.random()-0.5).slice(0, cuantas);
  const rejilla = Array.from({length:SOPA_TAM}, () => Array(SOPA_TAM).fill(' '));
  const colocadas = [];

  elegidas.forEach(palabra => {
    for (let intento = 0; intento < 120; intento++) {
      const horizontal = Math.random() < 0.5;
      const alReves = Math.random() < 0.5;
      const texto = alReves ? [...palabra].reverse().join('') : palabra;
      if (texto.length > SOPA_TAM) break;
      const fila = Math.floor(Math.random() * (horizontal ? SOPA_TAM : SOPA_TAM - texto.length + 1));
      const col = Math.floor(Math.random() * (horizontal ? SOPA_TAM - texto.length + 1 : SOPA_TAM));
      const cabe = [...texto].every((ch,i) => {
        const r = horizontal ? fila : fila+i, c = horizontal ? col+i : col;
        return rejilla[r][c] === ' ' || rejilla[r][c] === ch;
      });
      if (!cabe) continue;
      [...texto].forEach((ch,i) => {
        const r = horizontal ? fila : fila+i, c = horizontal ? col+i : col;
        rejilla[r][c] = ch;
      });
      colocadas.push({ palabra, fila, col, horizontal });
      break;
    }
  });

  const letras = 'AEIOUBCDFGHLMNPRST';
  for (let r=0; r<SOPA_TAM; r++) for (let c=0; c<SOPA_TAM; c++)
    if (rejilla[r][c] === ' ') rejilla[r][c] = letras[Math.floor(Math.random()*letras.length)];
  return { rejilla, palabras: colocadas };
}

function juegoSopa() {
  const lvl = cursoPorId(alumnoActual().curso).lvl;
  if (J.juego !== 'sopa') {
    const s = construyeSopa(lvl);
    nuevoJuego({ juego:'sopa', ...s, encontradas:[], primera:null, celdasOk:new Set(), mal:new Set() });
  }
  const celdas = [];
  for (let r=0; r<SOPA_TAM; r++) for (let c=0; c<SOPA_TAM; c++) {
    const clave = r+','+c;
    const fondo = J.celdasOk.has(clave) ? '#3DDC9780'
                : J.mal.has(clave) ? '#FF6B6B'
                : (J.primera && J.primera[0]===r && J.primera[1]===c) ? '#12B5E566' : '#fff';
    celdas.push(`<button onclick="tocaSopa(${r},${c})" style="width:34px;height:34px;border:none;
       border-radius:6px;background:${fondo};font-weight:700;font-size:14px;cursor:pointer">${J.rejilla[r][c]}</button>`);
  }
  const lista = J.palabras.map(p => J.encontradas.includes(p.palabra)
      ? `<span style="opacity:.5">✅ ${p.palabra}</span>` : `<span>${p.palabra}</span>`).join('   ');

  app().innerHTML = marcoJuego('sopa', 'Sopa de letras', `${J.encontradas.length}/${J.palabras.length}`,
    'Toca la primera y la última letra de cada palabra', `
      <div style="font-size:12px;opacity:.75;text-align:center;margin-bottom:12px">Busca: ${lista}</div>
      <div style="display:grid;grid-template-columns:repeat(${SOPA_TAM},34px);gap:2px">${celdas.join('')}</div>
      ${J.encontradas.length === J.palabras.length
        ? '<strong style="margin-top:16px">🎉 ¡Todas encontradas!</strong>' : ''}`);
}

function tocaSopa(r, c) {
  if (!J.primera) { J.primera = [r,c]; return pinta(); }
  const [r1,c1] = J.primera; J.primera = null;
  let celdas = null;
  if (r1 === r) { const [a,b] = [Math.min(c1,c), Math.max(c1,c)];
                  celdas = Array.from({length:b-a+1}, (_,i) => [r, a+i]); }
  else if (c1 === c) { const [a,b] = [Math.min(r1,r), Math.max(r1,r)];
                       celdas = Array.from({length:b-a+1}, (_,i) => [a+i, c]); }
  if (!celdas) { J.mal = new Set([r1+','+c1, r+','+c]); pinta();
                 setTimeout(() => { J.mal = new Set(); pinta(); }, 300); return; }

  const texto = celdas.map(([x,y]) => J.rejilla[x][y]).join('');
  const encaja = J.palabras.find(p => !J.encontradas.includes(p.palabra) &&
      (p.palabra === texto || p.palabra === [...texto].reverse().join('')));
  if (encaja) {
    J.encontradas.push(encaja.palabra);
    celdas.forEach(([x,y]) => J.celdasOk.add(x+','+y));
  } else {
    J.mal = new Set(celdas.map(([x,y]) => x+','+y));
    setTimeout(() => { J.mal = new Set(); pinta(); }, 300);
  }
  pinta();
}

/* ========== 5. LABERINTO ========== */
function generaLaberinto(n) {
  const tam = 2*n+1;
  const g = Array.from({length:tam}, () => Array(tam).fill('#'));
  const visto = Array.from({length:n}, () => Array(n).fill(false));
  (function excava(r,c) {
    visto[r][c] = true; g[2*r+1][2*c+1] = '.';
    [[0,1],[0,-1],[1,0],[-1,0]].sort(() => Math.random()-0.5).forEach(([dr,dc]) => {
      const nr = r+dr, nc = c+dc;
      if (nr>=0 && nr<n && nc>=0 && nc<n && !visto[nr][nc]) {
        g[2*r+1+dr][2*c+1+dc] = '.'; excava(nr,nc);
      }
    });
  })(0,0);
  g[1][1] = 'S'; g[tam-2][tam-2] = 'G';
  return g;
}

function juegoLaberinto() {
  const lvl = cursoPorId(alumnoActual().curso).lvl;
  const celdas = lvl <= 1 ? 3 : lvl < 4 ? 4 : 6;
  const lado = celdas === 3 ? 32 : celdas === 4 ? 28 : 22;
  if (J.juego !== 'laberinto') nuevoJuego({ juego:'laberinto', g:generaLaberinto(celdas), f:1, c:1, mov:0 });

  const ganado = J.g[J.f][J.c] === 'G';
  const filas = J.g.map((fila,r) => fila.map((ch,c) => {
    const jugador = r===J.f && c===J.c;
    const fondo = ch==='#' ? '#0B2A4A' : ch==='G' ? '#3DDC97' : '#fff';
    return `<div style="width:${lado}px;height:${lado}px;background:${fondo};border-radius:4px;
       display:grid;place-items:center;font-size:${lado*0.55}px">${jugador ? '🐭' : ch==='G' ? '🧀' : ''}</div>`;
  }).join('')).join('');

  const boton = (ico, df, dc) => `<button onclick="mueveLaberinto(${df},${dc})" style="width:56px;height:56px;
     border:none;border-radius:14px;background:#fff;font-size:22px;cursor:pointer;margin:4px;
     box-shadow:0 1px 4px rgba(0,0,0,.12)">${ico}</button>`;

  app().innerHTML = marcoJuego('laberinto', 'Laberinto', `${J.mov} mov.`, 'Lleva al ratón hasta el queso', `
    <div style="display:grid;grid-template-columns:repeat(${J.g.length},${lado}px);gap:1px">${filas}</div>
    ${ganado
      ? `<div style="margin-top:18px;text-align:center"><strong>🎉 ¡Llegaste al queso en ${J.mov} movimientos!</strong><br>
          <button onclick="J={};pinta()" style="margin-top:10px;background:#3DDC97;color:#fff;border:none;
            border-radius:14px;padding:12px 20px;font-weight:700;cursor:pointer">Otro laberinto 🔁</button></div>`
      : `<div style="margin-top:16px;text-align:center">${boton('⬆️',-1,0)}
          <div>${boton('⬅️',0,-1)}<span style="display:inline-block;width:56px"></span>${boton('➡️',0,1)}</div>
          ${boton('⬇️',1,0)}</div>`}`);
}

function mueveLaberinto(df, dc) {
  const nf = J.f+df, nc = J.c+dc;
  if (nf>=0 && nf<J.g.length && nc>=0 && nc<J.g.length && J.g[nf][nc] !== '#') {
    J.f = nf; J.c = nc; J.mov++; pinta();
  }
}

/* ========== 6. PINTAR POR NÚMEROS ========== */
const DIBUJOS = [
  [[0,0,0,2,2,0,0,0],[0,0,2,2,2,2,0,0],[0,2,2,2,2,2,2,0],[1,1,1,1,1,1,1,1],
   [1,4,4,1,1,4,4,1],[1,4,4,1,1,4,4,1],[1,1,1,3,3,1,1,1],[1,1,1,3,3,1,1,1]],
  [[0,0,0,2,0,0,0,0],[0,0,2,2,2,0,0,0],[0,2,2,2,2,2,0,0],[0,0,2,2,2,0,0,0],
   [2,2,2,2,2,2,2,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0],[0,0,0,1,1,0,0,0]],
  [[0,0,0,3,0,0,0,0],[0,0,2,3,0,0,0,0],[0,2,2,3,0,0,0,0],[2,2,2,3,0,0,0,0],
   [0,0,0,3,0,0,0,0],[1,1,1,1,1,1,1,1],[0,1,1,1,1,1,0,0],[0,0,1,1,1,0,0,0]]
];
const COLORES_PINTAR = { 1:'#B0704A', 2:'#FF6B6B', 3:'#0B2A4A', 4:'#12B5E5' };

function juegoPintar() {
  if (J.juego !== 'pintar')
    nuevoJuego({ juego:'pintar', dibujo: DIBUJOS[Math.floor(Math.random()*DIBUJOS.length)],
                 pintadas:{}, color:1, mal:null });
  const objetivo = J.dibujo.flat().filter(v => v !== 0).length;
  const hechas = Object.keys(J.pintadas).length;

  const celdas = J.dibujo.map((fila,r) => fila.map((v,c) => {
    const clave = r+','+c, pintada = J.pintadas[clave];
    const fondo = v===0 ? 'transparent' : J.mal===clave ? '#FF6B6B'
                : pintada ? COLORES_PINTAR[v] : '#fff';
    return `<button onclick="pinta1(${r},${c})" style="width:34px;height:34px;border:none;border-radius:4px;
      background:${fondo};cursor:${v?'pointer':'default'};font-size:12px;font-weight:700;color:#0B2A4A66">
      ${v && !pintada ? v : ''}</button>`;
  }).join('')).join('');

  const paleta = Object.entries(COLORES_PINTAR).map(([n,col]) => `
    <button onclick="J.color=${n};pinta()" style="width:48px;height:48px;border-radius:50%;cursor:pointer;
      background:${col};color:#fff;font-weight:900;margin:6px;
      border:${J.color==n ? '3px solid #0B2A4A' : 'none'}">${n}</button>`).join('');

  app().innerHTML = marcoJuego('pintar', 'Pintar por números', `${hechas}/${objetivo}`,
    'Elige un color y toca las casillas con ese número', `
      <div style="display:grid;grid-template-columns:repeat(8,34px);gap:1px">${celdas}</div>
      ${hechas === objetivo
        ? `<div style="margin-top:18px;text-align:center"><strong>🎉 ¡Dibujo terminado!</strong><br>
            <button onclick="J={};pinta()" style="margin-top:10px;background:#F06292;color:#fff;border:none;
              border-radius:14px;padding:12px 20px;font-weight:700;cursor:pointer">Otro dibujo 🔁</button></div>`
        : `<div style="margin-top:14px">${paleta}</div>`}`);
}

function pinta1(r, c) {
  const v = J.dibujo[r][c];
  if (!v) return;
  if (v === +J.color) J.pintadas[r+','+c] = true;
  else { J.mal = r+','+c; setTimeout(() => { J.mal = null; pinta(); }, 300); }
  pinta();
}

/* ========== 7. ADIVINA LA PALABRA ========== */
const PALABRAS_PEQUES = [['GATO','🐱'],['PERRO','🐶'],['CASA','🏠'],['SOL','☀️'],['LUNA','🌙'],
                         ['FLOR','🌸'],['PEZ','🐟'],['PATO','🦆']];
const PALABRAS_MEDIANAS = [['LIBRO','📖'],['ARBOL','🌳'],['TREN','🚂'],['COCHE','🚗'],['PIZZA','🍕'],
                           ['MANZANA','🍎'],['ESTRELLA','⭐'],['PLAYA','🏖️'],['QUESO','🧀'],
                           ['CABALLO','🐴'],['GUITARRA','🎸'],['VENTANA','🪟']];
const PALABRAS_MAYORES = [['BIBLIOTECA','📚'],['MONTANA','⛰️'],['TRIANGULO','📐'],['ESQUELETO','💀'],
                          ['BICICLETA','🚲'],['ORDENADOR','💻'],['MICROSCOPIO','🔬'],['PINGUINO','🐧'],
                          ['CALENDARIO','📅'],['TELESCOPIO','🔭'],['MARIPOSA','🦋'],['PIRAMIDE','🔺'],
                          ['DINOSAURIO','🦕'],['SEMAFORO','🚦'],['ELEFANTE','🐘'],['VOLCAN','🌋']];

function juegoAhorcado() {
  const lvl = cursoPorId(alumnoActual().curso).lvl;
  const lista = lvl <= 1 ? PALABRAS_PEQUES
              : lvl < 4 ? PALABRAS_PEQUES.concat(PALABRAS_MEDIANAS)
              : PALABRAS_MEDIANAS.concat(PALABRAS_MAYORES);
  if (J.juego !== 'ahorcado') {
    const [p, e] = lista[Math.floor(Math.random()*lista.length)];
    nuevoJuego({ juego:'ahorcado', palabra:p, emoji:e, dichas:[], fallos:0, lista });
  }
  const maxFallos = 6;
  const ganado = [...J.palabra].every(c => J.dichas.includes(c));
  const perdido = J.fallos >= maxFallos;

  const teclado = ['ABCDEFGHI','JKLMNOPQR','STUVWXYZ'].map(fila => `
    <div>${[...fila].map(l => {
      const usada = J.dichas.includes(l);
      const fondo = !usada ? '#fff' : J.palabra.includes(l) ? '#3DDC97' : '#FF6B6B66';
      return `<button onclick="diceLetra('${l}')" style="width:32px;height:32px;margin:2px;border:none;
        border-radius:8px;background:${fondo};font-weight:700;font-size:12px;cursor:pointer">${l}</button>`;
    }).join('')}</div>`).join('');

  app().innerHTML = marcoJuego('ahorcado', 'Adivina la palabra',
    '❤️'.repeat(Math.max(0, maxFallos - J.fallos)), null, `
      <div style="font-size:60px">${J.emoji}</div>
      <div style="font-size:28px;font-weight:900;letter-spacing:4px;margin:16px 0 24px">
        ${[...J.palabra].map(c => J.dichas.includes(c) ? c : '_').join(' ')}</div>
      ${ganado || perdido
        ? `<div style="text-align:center"><strong>${ganado ? '¡Lo has adivinado! 🎉' : 'La palabra era: ' + J.palabra}</strong><br>
            <button onclick="J={};pinta()" style="margin-top:12px;background:#FF9F68;color:#fff;border:none;
              border-radius:14px;padding:12px 20px;font-weight:700;cursor:pointer">Otra palabra 🔁</button></div>`
        : teclado}`);
}

function diceLetra(l) {
  if (J.dichas.includes(l)) return;
  J.dichas.push(l);
  if (!J.palabra.includes(l)) J.fallos++;
  pinta();
}

/* ========== 8. TRES EN RAYA ========== */
function juegoRaya() {
  if (J.juego !== 'raya') nuevoJuego({ juego:'raya', tablero:Array(9).fill(''), estado:'Tu turno (❌)', fin:false });
  const casillas = J.tablero.map((v,i) => `
    <button onclick="tocaRaya(${i})" style="width:88px;height:88px;border:none;border-radius:16px;background:#fff;
      font-size:42px;font-weight:900;cursor:pointer;color:${v==='X' ? '#12B5E5' : '#FF6B6B'};
      box-shadow:0 1px 4px rgba(0,0,0,.12)">${v}</button>`).join('');

  app().innerHTML = marcoJuego('raya', 'Tres en raya', null, null, `
    <strong style="font-size:17px;margin-bottom:18px">${J.estado}</strong>
    <div style="display:grid;grid-template-columns:repeat(3,88px);gap:8px">${casillas}</div>
    ${J.fin ? `<button onclick="J={};pinta()" style="margin-top:20px;background:#FF6B6B;color:#fff;border:none;
        border-radius:14px;padding:12px 22px;font-weight:700;cursor:pointer">Jugar otra vez 🔁</button>` : ''}`);
}

function ganadorRaya(b) {
  const lineas = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
  for (const [a,c,d] of lineas) if (b[a] && b[a]===b[c] && b[a]===b[d]) return b[a];
  return null;
}

function tocaRaya(i) {
  if (J.fin || J.tablero[i]) return;
  const b = [...J.tablero]; b[i] = 'X';
  if (ganadorRaya(b) === 'X') { J.tablero=b; J.estado='¡Has ganado! 🎉'; J.fin=true; return pinta(); }
  if (b.every(v => v)) { J.tablero=b; J.estado='Empate 🤝'; J.fin=true; return pinta(); }

  // La app: gana si puede, bloquea si debe, centro, esquina, hueco.
  const libres = b.map((v,j) => v ? -1 : j).filter(j => j >= 0);
  let jugada = libres.find(j => { const t=[...b]; t[j]='O'; return ganadorRaya(t)==='O'; });
  if (jugada === undefined) jugada = libres.find(j => { const t=[...b]; t[j]='X'; return ganadorRaya(t)==='X'; });
  if (jugada === undefined && !b[4]) jugada = 4;
  if (jugada === undefined) jugada = [0,2,6,8].find(j => !b[j]);
  if (jugada === undefined) jugada = libres[Math.floor(Math.random()*libres.length)];
  b[jugada] = 'O';

  J.tablero = b;
  if (ganadorRaya(b) === 'O') { J.estado='Ha ganado la app 🤖'; J.fin=true; }
  else if (b.every(v => v)) { J.estado='Empate 🤝'; J.fin=true; }
  else J.estado = 'Tu turno (❌)';
  pinta();
}

/* ========== 9. TOPOS RÁPIDOS ========== */
function juegoTopos() {
  const lvl = cursoPorId(alumnoActual().curso).lvl;
  if (J.juego !== 'topos') {
    nuevoJuego({ juego:'topos', puntos:0, segundos:40, fin:false, pregunta:'', opciones:[], buena:0, mal:-1 });
    nuevaRondaTopos(lvl);
    clearInterval(J.reloj);
    J.reloj = setInterval(() => {
      J.segundos--;
      if (J.segundos <= 0) { clearInterval(J.reloj); J.fin = true; }
      if (juegoActivo === 'topos') pinta();
    }, 1000);
  }

  if (J.fin) {
    app().innerHTML = marcoJuego('topos', 'Topos rápidos', null, null, `
      <div style="text-align:center;margin-top:40px">
        <div style="font-size:60px">🏁</div>
        <h2 style="font-weight:900">¡Tiempo!</h2>
        <div style="font-size:22px;font-weight:900">Puntuación: ${J.puntos}</div>
        <button onclick="J={};pinta()" style="margin-top:20px;background:#8D6E63;color:#fff;border:none;
          border-radius:14px;padding:12px 22px;font-weight:700;cursor:pointer">Jugar otra vez 🔁</button>
      </div>`);
    return;
  }

  const topos = J.opciones.map((v,i) => `
    <button onclick="tocaTopo(${i},${lvl})" style="width:96px;height:96px;border:none;border-radius:18px;
      background:${J.mal===i ? '#FF6B6B4D' : '#fff'};font-weight:700;font-size:16px;cursor:pointer;
      box-shadow:0 1px 4px rgba(0,0,0,.12)">🐹 ${v}</button>`).join('');

  app().innerHTML = marcoJuego('topos', 'Topos rápidos', `⏱ ${J.segundos} s`,
    'Toca el topo con el resultado correcto', `
      <div style="background:#fff;border-radius:18px;padding:18px;width:100%;text-align:center;
                  font-size:22px;font-weight:700">${J.pregunta}</div>
      <strong style="margin:12px 0">Puntos: ${J.puntos}</strong>
      <div style="display:grid;grid-template-columns:repeat(3,96px);gap:8px">${topos}</div>`);
}

function nuevaRondaTopos(lvl) {
  const n = Math.max(2, Math.min(7, Math.round(lvl)));
  let a, b, resultado, texto;
  if (n <= 4) { a = 1+Math.floor(Math.random()*20); b = 1+Math.floor(Math.random()*20);
                resultado = a+b; texto = `${a} + ${b}`; }
  else { a = 2+Math.floor(Math.random()*9); b = 2+Math.floor(Math.random()*9);
         resultado = a*b; texto = `${a} × ${b}`; }
  const set = new Set([resultado]);
  while (set.size < 9) {
    const v = resultado + (Math.floor(Math.random()*13) - 6);
    if (v >= 0) set.add(v);
  }
  J.opciones = [...set].sort(() => Math.random()-0.5);
  J.buena = J.opciones.indexOf(resultado);
  J.pregunta = texto + ' = ?';
  J.mal = -1;
}

function tocaTopo(i, lvl) {
  if (J.fin) return;
  if (i === J.buena) { J.puntos++; nuevaRondaTopos(lvl); }
  else { J.mal = i; setTimeout(() => { J.mal = -1; pinta(); }, 250); }
  pinta();
}

/* ========== 10. ¿QUÉ VIENE DESPUÉS? ========== */
function juegoSecuencia() {
  if (J.juego !== 'secuencia') { nuevoJuego({ juego:'secuencia', ronda:1, puntos:0 }); nuevaRondaSec(); }
  const total = 8;

  if (J.ronda > total) {
    app().innerHTML = marcoJuego('secuencia', '¿Qué viene después?', null, null, `
      <div style="text-align:center;margin-top:40px">
        <div style="font-size:60px">🏁</div><h2 style="font-weight:900">¡Completado!</h2>
        <div style="font-size:20px;font-weight:900">Puntuación: ${J.puntos}/${total}</div>
        <button onclick="J={};pinta()" style="margin-top:20px;background:#FFC93C;color:#0B2A4A;border:none;
          border-radius:14px;padding:12px 22px;font-weight:900;cursor:pointer">Jugar otra vez 🔁</button>
      </div>`);
    return;
  }

  const opciones = J.opciones.map(o => {
    const fondo = J.respondida == null ? '#fff' : o === J.respuesta ? '#3DDC97' : '#ffffff80';
    return `<button onclick="tocaSec(${o})" style="background:${fondo};border:none;border-radius:16px;
      padding:18px;font-weight:900;font-size:22px;cursor:pointer;min-height:64px">${o}</button>`;
  }).join('');

  app().innerHTML = marcoJuego('secuencia', '¿Qué viene después?', `${J.ronda}/${total}`,
    'Descubre la serie y di el número que falta', `
      <div style="background:#fff;border-radius:18px;padding:24px;width:100%;text-align:center;
                  font-size:26px;font-weight:900">${J.terminos.join(', ')}, ?</div>
      <strong style="margin:14px 0">Puntos: ${J.puntos}</strong>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;width:100%">${opciones}</div>
      ${J.respondida != null ? `<button onclick="J.ronda++;nuevaRondaSec();pinta()" style="margin-top:16px;
          background:#FFC93C;color:#0B2A4A;border:none;border-radius:14px;padding:12px 22px;
          font-weight:900;cursor:pointer">${J.ronda < total ? 'Siguiente →' : 'Ver resultado 🏁'}</button>` : ''}`);
}

function nuevaRondaSec() {
  const paso = [1,2,3,5,10][Math.floor(Math.random()*5)];
  const inicio = 1+Math.floor(Math.random()*20);
  J.terminos = [0,1,2,3].map(i => inicio + i*paso);
  J.respuesta = inicio + 4*paso;
  const set = new Set([J.respuesta]);
  while (set.size < 4) {
    const v = J.respuesta + (Math.floor(Math.random()*paso*4) - paso*2);
    if (v > 0) set.add(v);
  }
  J.opciones = [...set].sort(() => Math.random()-0.5);
  J.respondida = null;
}

function tocaSec(o) {
  if (J.respondida != null) return;
  J.respondida = o;
  if (o === J.respuesta) J.puntos++;
  pinta();
}

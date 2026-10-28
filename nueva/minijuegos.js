/* ===================================================================
   MINIJUEGOS PREMIO — los que salen al terminar una sesión.
   Traducción de ui/screens/PostQuizMiniGames.kt. Duran segundos y no
   penalizan: son un premio por terminar, no un segundo examen. Pero
   SÍ dicen la verdad: en la app había tres que daban por buena
   cualquier respuesta, y eso se corrigió. Aquí ya nacen corregidos.
   =================================================================== */

const MINIJUEGOS = ['burbujas','globos','relampago','memory','ordena','intruso','simon','cuenta','parejas'];

let M = {};

function minijuegoAlAzar() {
  const id = MINIJUEGOS[Math.floor(Math.random() * MINIJUEGOS.length)];
  M = { id };
  pintaMinijuego();
}

function finMinijuego() {
  const a = alumnoActual();
  a.juegos = (a.juegos || 0) + 1;
  guardaTodo();
  M = {};
  estado.faseResultado = 'marcador';
  pinta();
}

function cajaMini(titulo, ayuda, cuerpo) {
  return `
    <div class="contenido" style="display:flex;flex-direction:column;align-items:center;
                                  justify-content:center;min-height:100vh;text-align:center">
      <strong style="font-size:18px;font-weight:900">${titulo}</strong>
      ${ayuda ? `<small style="font-size:12px;opacity:.55;margin-top:4px">${ayuda}</small>` : ''}
      <div style="margin-top:18px">${cuerpo}</div>
    </div>`;
}

function pintaMinijuego() {
  ({ burbujas:miniBurbujas, globos:miniGlobos, relampago:miniRelampago, memory:miniMemory,
     ordena:miniOrdena, intruso:miniIntruso, simon:miniSimon, cuenta:miniCuenta,
     parejas:miniParejas })[M.id]();
}

/* ---- Burbujas ---- */
function miniBurbujas() {
  if (!M.rotas) M.rotas = [];
  const b = Array.from({length:9}, (_,i) => M.rotas.includes(i)
    ? `<div style="width:64px;height:64px;margin:6px"></div>`
    : `<button onclick="rompeBurbuja(${i})" style="width:64px;height:64px;margin:6px;border:none;
         border-radius:50%;background:#12B5E559;font-size:28px;cursor:pointer;
         box-shadow:0 1px 4px rgba(0,0,0,.1)">🫧</button>`).join('');
  app().innerHTML = cajaMini('🫧 ¡Revienta las burbujas!', null,
    `<div style="display:grid;grid-template-columns:repeat(3,76px)">${b}</div>`);
}
function rompeBurbuja(i) {
  M.rotas.push(i); pintaMinijuego();
  if (M.rotas.length === 9) setTimeout(finMinijuego, 400);
}

/* ---- Globos en orden ---- */
function miniGlobos() {
  if (!M.orden) { M.orden = [1,2,3,4,5,6].sort(() => Math.random()-0.5); M.siguiente = 1; }
  const g = M.orden.map(n => {
    const hecho = n < M.siguiente;
    return `<button onclick="tocaGlobo(${n})" style="width:64px;height:64px;margin:6px;border:none;
      border-radius:50%;background:${hecho ? '#3DDC97' : '#FF6B6BCC'};color:#fff;font-weight:900;
      font-size:20px;cursor:pointer">${hecho ? '✔' : n}</button>`;
  }).join('');
  app().innerHTML = cajaMini('🎈 ¡En orden, del 1 al 6!', null,
    `<div style="display:grid;grid-template-columns:repeat(3,76px)">${g}</div>`);
}
function tocaGlobo(n) {
  if (n !== M.siguiente) return;
  M.siguiente++; pintaMinijuego();
  if (M.siguiente > 6) setTimeout(finMinijuego, 400);
}

/* ---- Relámpago ---- */
function miniRelampago() {
  if (M.ronda === undefined) { M.ronda = 0; M.acierto = null; nuevaRondaRelampago(); }
  const fondo = M.acierto === null ? '#fff' : M.acierto ? '#3DDC97' : '#FF6B6B';
  const tinta = M.acierto === null ? '#0B2A4A' : '#fff';
  app().innerHTML = cajaMini('⚡ Relámpago', '¿La cuenta está bien?', `
    <small style="opacity:.5;font-weight:700">${M.ronda+1}/5</small>
    <div style="background:${fondo};color:${tinta};border-radius:20px;padding:26px;margin:14px 0;
                box-shadow:0 2px 6px rgba(0,0,0,.12)">
      <div style="font-size:26px;font-weight:900">${M.texto}</div>
      ${M.acierto !== null ? `<div style="font-size:15px;font-weight:900;margin-top:4px">
          ${M.acierto ? '¡Bien!' : 'No era'}</div>` : ''}
    </div>
    <div style="display:flex;gap:12px;justify-content:center">
      <button onclick="respondeRelampago(true)" style="background:#3DDC97;color:#fff;border:none;
        border-radius:16px;padding:14px 20px;font-weight:900;cursor:pointer">✔ Verdadero</button>
      <button onclick="respondeRelampago(false)" style="background:#FF6B6B;color:#fff;border:none;
        border-radius:16px;padding:14px 20px;font-weight:900;cursor:pointer">✘ Falso</button>
    </div>`);
}
function nuevaRondaRelampago() {
  const a = 1+Math.floor(Math.random()*12), b = 1+Math.floor(Math.random()*12);
  const real = a+b, bien = Math.random() < 0.5;
  const mostrado = bien ? real : real + [-2,-1,1,2][Math.floor(Math.random()*4)];
  M.texto = `${a} + ${b} = ${mostrado}`;
  M.correcta = mostrado === real;
  M.acierto = null;
}
function respondeRelampago(dice) {
  if (M.acierto !== null) return;
  M.acierto = (dice === M.correcta);
  pintaMinijuego();
  setTimeout(() => {
    M.ronda++;
    if (M.ronda >= 5) return finMinijuego();
    nuevaRondaRelampago(); pintaMinijuego();
  }, 650);
}

/* ---- Memory ---- */
function miniMemory() {
  if (!M.cartas) {
    const base = ['🐶','🐱','🐰','🦊','🐸','🐼'];
    M.cartas = [...base, ...base].sort(() => Math.random()-0.5);
    M.giradas = []; M.hechas = [];
  }
  const c = M.cartas.map((e,i) => {
    const vista = M.hechas.includes(i) || M.giradas.includes(i);
    return `<button onclick="giraCarta(${i})" style="width:56px;height:56px;margin:4px;border:none;
      border-radius:12px;font-size:22px;cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.1);
      background:${M.hechas.includes(i) ? '#3DDC9766' : vista ? '#12B5E54D' : '#fff'}">
      ${vista ? e : '❓'}</button>`;
  }).join('');
  app().innerHTML = cajaMini('🧠 ¡Encuentra las parejas!', null,
    `<div style="display:grid;grid-template-columns:repeat(4,64px)">${c}</div>`);
}
function giraCarta(i) {
  if (M.giradas.length >= 2 || M.giradas.includes(i) || M.hechas.includes(i)) return;
  M.giradas.push(i); pintaMinijuego();
  if (M.giradas.length === 2) setTimeout(() => {
    const [a,b] = M.giradas;
    if (M.cartas[a] === M.cartas[b]) M.hechas.push(a,b);
    M.giradas = []; pintaMinijuego();
    if (M.hechas.length === M.cartas.length) setTimeout(finMinijuego, 400);
  }, 600);
}

/* ---- Ordena las letras ---- */
function miniOrdena() {
  if (!M.palabra) {
    M.palabra = ['GATO','CASA','LIBRO','SOL','FLOR','PATO'][Math.floor(Math.random()*6)];
    M.sueltas = [...M.palabra].sort(() => Math.random()-0.5);
    M.puestas = [];
  }
  const actual = M.puestas.map(i => M.sueltas[i]).join('');
  const letras = M.sueltas.map((ch,i) => M.puestas.includes(i)
    ? `<span style="display:inline-block;width:44px;height:44px;margin:4px"></span>`
    : `<button onclick="ponLetra(${i})" style="width:44px;height:44px;margin:4px;border:none;
         border-radius:10px;background:#12B5E5;color:#fff;font-weight:700;font-size:18px;
         cursor:pointer">${ch}</button>`).join('');
  app().innerHTML = cajaMini('🔤 ¡Ordena las letras!', null, `
    <div style="background:#fff;border-radius:14px;padding:16px;font-size:24px;font-weight:900;
                letter-spacing:3px">${actual || '?'}</div>
    <div style="margin-top:16px">${letras}</div>`);
}
function ponLetra(i) {
  M.puestas.push(i);
  const actual = M.puestas.map(j => M.sueltas[j]).join('');
  if (actual === M.palabra) { pintaMinijuego(); return setTimeout(finMinijuego, 500); }
  if (M.puestas.length === M.sueltas.length) { M.puestas = []; }
  pintaMinijuego();
}

/* ---- El intruso ---- */
const GRUPOS_INTRUSO = [
  { palabras:['PERRO','GATO','CONEJO','MESA'], intruso:3 },
  { palabras:['ROJO','AZUL','SILLA','VERDE'], intruso:2 },
  { palabras:['MANZANA','PERA','COCHE','PLÁTANO'], intruso:2 },
  { palabras:['LUNES','MARTES','ENERO','JUEVES'], intruso:2 },
  { palabras:['VACA','LEÓN','TIGRE','OSO'], intruso:0 }
];
function miniIntruso() {
  if (!M.grupo) { M.grupo = GRUPOS_INTRUSO[Math.floor(Math.random()*GRUPOS_INTRUSO.length)]; M.elegida = null; }
  const b = M.grupo.palabras.map((p,i) => {
    let fondo = '#fff', tinta = '#0B2A4A';
    if (M.elegida !== null) {
      if (i === M.grupo.intruso) { fondo = '#3DDC97'; tinta = '#fff'; }
      else if (i === M.elegida) { fondo = '#FF6B6B'; tinta = '#fff'; }
      else fondo = '#ffffff73';
    }
    return `<button onclick="eligeIntruso(${i})" style="display:block;width:220px;margin:5px auto;border:none;
      border-radius:16px;padding:15px;background:${fondo};color:${tinta};font-weight:900;font-size:16px;
      cursor:pointer;box-shadow:0 1px 4px rgba(0,0,0,.1)">${p}</button>`;
  }).join('');
  app().innerHTML = cajaMini('🕵️ ¿Cuál es el intruso?', 'La palabra que no pega con las demás', b);
}
function eligeIntruso(i) {
  if (M.elegida !== null) return;
  M.elegida = i; pintaMinijuego();
  setTimeout(finMinijuego, 900);
}

/* ---- Simón ---- */
const COLORES_SIMON = ['#FF6B6B','#12B5E5','#3DDC97','#0B2A4A'];
function miniSimon() {
  if (!M.secuencia) { M.secuencia = [Math.floor(Math.random()*4)]; M.ronda = 1; M.paso = 0; M.mostrando = -1;
                      muestraSimon(); }
  const b = COLORES_SIMON.map((col,i) => `
    <button onclick="tocaSimon(${i})" style="width:70px;height:70px;margin:4px;border:none;border-radius:16px;
      cursor:pointer;background:${M.mostrando === i ? col : col + '59'}"></button>`).join('');
  app().innerHTML = cajaMini('🎯 ¡Repite la secuencia!', `Ronda ${M.ronda}/4`,
    `<div style="display:grid;grid-template-columns:repeat(2,78px)">${b}</div>`);
}
function muestraSimon() {
  let i = 0;
  const paso = () => {
    if (i >= M.secuencia.length) { M.mostrando = -1; M.paso = 0; return pintaMinijuego(); }
    M.mostrando = M.secuencia[i]; pintaMinijuego();
    setTimeout(() => { M.mostrando = -1; pintaMinijuego(); i++; setTimeout(paso, 200); }, 450);
  };
  setTimeout(paso, 300);
}
function tocaSimon(i) {
  if (M.mostrando !== -1) return;
  if (M.secuencia[M.paso] !== i) return finMinijuego();   // falla: se acaba sin castigo
  M.paso++;
  if (M.paso === M.secuencia.length) {
    if (M.ronda >= 4) return finMinijuego();
    M.ronda++; M.secuencia.push(Math.floor(Math.random()*4)); muestraSimon();
  }
}

/* ---- Cuenta rápida ---- */
function miniCuenta() {
  if (M.ronda === undefined) { M.ronda = 0; M.aciertos = 0; nuevaRondaCuenta(); }
  const b = M.opciones.map(o => {
    let col = '#12B5E5';
    if (M.elegida != null) col = o === M.cuantas ? '#3DDC97' : o === M.elegida ? '#FF6B6B' : '#12B5E54D';
    return `<button onclick="eligeCuenta(${o})" style="width:64px;height:64px;margin:5px;border:none;
      border-radius:18px;background:${col};color:#fff;font-weight:900;font-size:22px;cursor:pointer">${o}</button>`;
  }).join('');
  app().innerHTML = cajaMini('🔢 ¡Cuenta rápido!', `${M.ronda+1}/4 · ${M.aciertos} ✓`, `
    <div style="background:#fff;border-radius:20px;padding:16px 20px;max-width:230px;margin:0 auto;
                font-size:30px;line-height:1.3">${'⭐'.repeat(M.cuantas)}</div>
    <div style="margin-top:18px">${b}</div>`);
}
function nuevaRondaCuenta() {
  M.cuantas = 3 + Math.floor(Math.random()*7);
  const set = new Set([M.cuantas]);
  while (set.size < 3) { const v = M.cuantas + Math.floor(Math.random()*5) - 2; if (v > 0) set.add(v); }
  M.opciones = [...set].sort(() => Math.random()-0.5);
  M.elegida = null;
}
function eligeCuenta(o) {
  if (M.elegida != null) return;
  M.elegida = o;
  if (o === M.cuantas) M.aciertos++;
  pintaMinijuego();
  setTimeout(() => {
    M.ronda++;
    if (M.ronda >= 4) return finMinijuego();
    nuevaRondaCuenta(); pintaMinijuego();
  }, 650);
}

/* ---- Parejas de palabras ---- */
const PAREJAS = [['FELIZ','CONTENTO'],['GRANDE','ENORME'],['RÁPIDO','VELOZ'],['BONITO','GUAPO']];
function miniParejas() {
  if (!M.cartas) {
    M.cartas = PAREJAS.flatMap((p,i) => [{t:p[0],g:i},{t:p[1],g:i}]).sort(() => Math.random()-0.5);
    M.giradas = []; M.hechas = [];
  }
  const c = M.cartas.map((x,i) => {
    const vista = M.hechas.includes(i) || M.giradas.includes(i);
    return `<button onclick="giraPareja(${i})" style="width:74px;height:48px;margin:3px;border:none;
      border-radius:10px;font-size:11px;font-weight:700;cursor:pointer;
      background:${M.hechas.includes(i) ? '#3DDC9766' : vista ? '#12B5E54D' : '#fff'}">
      ${vista ? x.t : '?'}</button>`;
  }).join('');
  app().innerHTML = cajaMini('🔗 ¡Empareja las palabras!', null,
    `<div style="display:grid;grid-template-columns:repeat(4,80px)">${c}</div>`);
}
function giraPareja(i) {
  if (M.giradas.length >= 2 || M.giradas.includes(i) || M.hechas.includes(i)) return;
  M.giradas.push(i); pintaMinijuego();
  if (M.giradas.length === 2) setTimeout(() => {
    const [a,b] = M.giradas;
    if (M.cartas[a].g === M.cartas[b].g) M.hechas.push(a,b);
    M.giradas = []; pintaMinijuego();
    if (M.hechas.length === M.cartas.length) setTimeout(finMinijuego, 400);
  }, 700);
}

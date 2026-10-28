/* ===================================================================
   DANIVIA SCHOOL — WEB
   Mismas pantallas que la app de Android, mismas pieles, mismo Dani.
   Las decisiones de diseño están explicadas en el código de la app;
   aquí solo se repiten los motivos cuando algo cambia respecto a ella.
   =================================================================== */

const almacen = {
  leer(clave, pordefecto) {
    try { const v = localStorage.getItem('danivia_' + clave); return v ? JSON.parse(v) : pordefecto; }
    catch (e) { return pordefecto; }   // navegador en privado o sin permisos
  },
  guardar(clave, valor) {
    try { localStorage.setItem('danivia_' + clave, JSON.stringify(valor)); } catch (e) {}
  }
};

const estado = {
  alumnos: almacen.leer('alumnos', []),
  actual: almacen.leer('actual', null),
  oscuro: almacen.leer('oscuro', false),
  pantalla: 'perfiles',
  pestana: 'cuadernos',
  materia: null,
  sesion: null
};

function alumnoActual() { return estado.alumnos.find(a => a.id === estado.actual) || null; }
function guardaTodo() { almacen.guardar('alumnos', estado.alumnos); almacen.guardar('actual', estado.actual); }

/* Primera letra en mayúscula, como comoNombrePropio() en el ViewModel. */
function comoNombrePropio(n) {
  const t = (n || '').trim();
  return t ? t[0].toUpperCase() + t.slice(1) : t;
}

function estadisticaTema(alumno, materiaId, tema) {
  const m = alumno.stats[materiaId];
  if (!m || !m.temas[tema]) return { hechas: 0, ok: 0 };
  return m.temas[tema];
}

function registraRespuesta(alumno, materiaId, tema, acierto) {
  const m = alumno.stats[materiaId] || (alumno.stats[materiaId] = { hechas: 0, ok: 0, temas: {} });
  m.hechas++; if (acierto) m.ok++;
  const t = m.temas[tema] || (m.temas[tema] = { hechas: 0, ok: 0 });
  t.hechas++; if (acierto) t.ok++;
  if (acierto) { alumno.estrellas++; alumno.estrellasTotal++; }
}

/* ===================================================================
   PINTADO
   =================================================================== */

const app = () => document.getElementById('app');

function aplicaPiel() {
  const a = alumnoActual();
  const curso = a ? cursoPorId(a.curso) : CURSOS[3];
  document.body.dataset.etapa = curso.etapa;
  document.body.dataset.oscuro = estado.oscuro ? 'si' : 'no';
}

function pinta() {
  aplicaPiel();
  const pantallas = {
    perfiles: pintaPerfiles,
    principal: pintaPrincipal,
    temas: pintaTemas,
    quiz: pintaQuiz,
    resultado: pintaResultado,
    tienda: pintaTienda
  };
  (pantallas[estado.pantalla] || pintaPerfiles)();
}

/* ---------- Perfiles ---------- */
function pintaPerfiles() {
  const lista = estado.alumnos.map(a => {
    const c = cursoPorId(a.curso);
    return `<button class="tarjeta-infantil" style="--color:${c.etapa === 'infantil' ? '#3DDC97' : '#12B5E5'};--suave:rgba(18,181,229,.12)"
              onclick="eligeAlumno('${a.id}')">
              <span class="cuadro">${a.avatar}</span>
              <span class="nombre">${a.nombre}<br><small style="font-size:13px;font-weight:600;opacity:.6">${c.nombre}</small></span>
              <span class="flecha">▶</span>
            </button>`;
  }).join('');

  app().innerHTML = `
    <div class="contenido" style="display:flex;flex-direction:column;justify-content:center;min-height:100vh">
      <div style="text-align:center;margin-bottom:18px">
        <canvas id="dani-hola" style="width:110px;height:110px"></canvas>
        <h1 style="margin:8px 0 2px;font-size:26px;font-weight:900">¿Quién va a repasar?</h1>
        <p class="subtitulo">Cada alumno guarda su propio progreso</p>
      </div>
      <div style="display:flex;flex-direction:column;gap:10px">${lista}</div>
      <button class="btn-chico" style="margin-top:18px;padding:16px;font-size:16px;border-radius:18px"
              onclick="nuevoAlumno()">+ Nuevo alumno</button>
    </div>`;
  animaDani(document.getElementById('dani-hola'), { animo: 'alegre' });
}

function nuevoAlumno() {
  const nombre = prompt('Nombre del alumno');
  if (!nombre) return;
  const curso = prompt('Curso (inf3, inf4, inf5, p1, p2, p3, p4, p5, p6)', 'p3');
  if (!cursoPorId(curso)) { alert('Ese curso no existe'); return; }
  const a = {
    id: 'p_' + Date.now().toString(36),
    nombre: comoNombrePropio(nombre),
    avatar: AVATARES[Math.floor(Math.random() * AVATARES.length)],
    curso, estrellas: 0, estrellasTotal: 0, racha: 0,
    stats: {}, historial: [],
    daniColor: 'color_azul', daniGorro: '', daniGafas: false, comprados: []
  };
  estado.alumnos.push(a); estado.actual = a.id; guardaTodo();
  estado.pantalla = 'principal'; pinta();
}

function eligeAlumno(id) { estado.actual = id; guardaTodo(); estado.pantalla = 'principal'; pinta(); }

/* ---------- Armazón con cabecera y pestañas ---------- */
function marco(contenido) {
  const a = alumnoActual();
  const estrellas = estado.alumnos.reduce((s, x) => s + x.estrellas, 0);
  const pes = [
    ['cuadernos', '📖', 'Cuadernos'], ['juegos', '🎮', 'Juegos'],
    ['progreso', '⭐', 'Progreso'], ['familias', '👨‍👩‍👧', 'Familias']
  ].map(([id, ico, txt]) => `
      <button onclick="cambiaPestana('${id}')" ${estado.pestana === id ? 'aria-current="page"' : ''}>
        <span class="ico">${ico}</span>${txt}
      </button>`).join('');

  return `
    <div class="cabecera">
      <div class="logo">📚</div>
      <div class="marca"><b>DANIVIA SCHOOL</b><small>REPASO ESCOLAR · GVA</small></div>
      <div class="pastilla">⭐ ${estrellas}</div>
    </div>
    <div class="contenido">${contenido}</div>
    <nav class="barra-abajo">${pes}</nav>`;
}

function cambiaPestana(id) {
  if (typeof J !== 'undefined' && J.reloj) clearInterval(J.reloj);
  if (typeof juegoActivo !== 'undefined') { juegoActivo = null; J = {}; }
  estado.pestana = id;
  estado.pantalla = 'principal';
  pinta();
}

/* ---------- Cuadernos ---------- */
function saludo() {
  const h = new Date().getHours();
  return h < 6 ? 'Buenas noches' : h < 12 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
}

function pintaPrincipal() {
  const a = alumnoActual();
  if (!a) { estado.pantalla = 'perfiles'; return pinta(); }
  const curso = cursoPorId(a.curso);
  const infantil = curso.etapa === 'infantil';

  if (estado.pestana === 'juegos') return pintaJuegos();
  if (estado.pestana === 'progreso') return pintaProgreso();
  if (estado.pestana === 'familias') return pintaFamilias();

  if (estado.pestana !== 'cuadernos') {
    app().innerHTML = marco(`
      <h2 class="titulo-seccion">${estado.pestana[0].toUpperCase() + estado.pestana.slice(1)}</h2>
      <p class="subtitulo">Esta pantalla todavía no está portada a la web.</p>
      <div style="text-align:center;margin-top:40px">
        <canvas id="dani-obra" style="width:120px;height:120px"></canvas>
        <p style="font-weight:700;margin-top:10px">En construcción</p>
      </div>`);
    animaDani(document.getElementById('dani-obra'), { animo: 'pensativo', ...aspectoDani(a) });
    return;
  }

  const tarjetas = materiasDe(curso).map(m => {
    const st = a.stats[m.id];
    const empezada = st && st.hechas > 0;
    const pct = empezada ? Math.round(st.ok * 100 / st.hechas) : 0;

    if (infantil) {
      return `<button class="tarjeta-infantil" style="--color:${m.color};--suave:${m.color}2E"
                onclick="abreMateria('${m.id}')">
                <span class="cuadro">${m.icono}</span>
                <span class="nombre">${m.nombre}
                  <span class="barra" style="--color:${m.color};--pista:${m.color}2E;height:14px;margin-top:8px">
                    <i style="width:${pct}%"></i></span>
                </span>
                <span class="flecha">▶</span>
              </button>`;
    }
    return `<button class="cuaderno" style="--color:${m.color};--papel:${m.color}12;--pista:${m.color}26"
              onclick="abreMateria('${m.id}')">
              <span class="lomo"><i class="anilla"></i><i class="anilla"></i><i class="anilla"></i></span>
              <span class="hojas">
                <span class="fila"><span class="icono">${m.icono}</span>
                  ${empezada ? `<span class="pct">${pct}%</span>` : ''}</span>
                <h3>${m.nombre}</h3>
                <span class="hechas">${empezada ? st.hechas + ' preguntas' : 'Sin empezar'}</span>
                <span class="barra"><i style="width:${pct}%"></i></span>
              </span>
            </button>`;
  }).join('');

  const tandas = infantil ? [5, 10] : [10, 25, 50];

  app().innerHTML = marco(`
    <div class="saludo">
      ${infantil ? '<canvas id="dani-saludo" style="width:58px;height:58px"></canvas>'
                 : `<span class="avatar">${a.avatar}</span>`}
      <div style="flex:1">
        <h1>${infantil ? '¡Hola, ' + a.nombre + '!' : saludo() + ', ' + a.nombre}</h1>
        <div class="curso">${curso.nombre}</div>
      </div>
      <div class="botones">
        <button class="btn-chico" onclick="cambiaCurso()">🎓 Curso</button>
        <button class="btn-chico hueco" onclick="estado.pantalla='perfiles';pinta()">👥 Alumno</button>
      </div>
    </div>

    ${tarjetaFallos(a, infantil)}
    ${infantil ? '' : tarjetaReto(a)}

    <div style="height:14px"></div>
    <h2 class="titulo-seccion">${infantil ? '¿Qué hacemos hoy?' : 'Mis cuadernos'}</h2>
    ${infantil ? '' : '<p class="subtitulo">Elige uno y ponte a repasar</p>'}
    <div class="rejilla">${tarjetas}</div>

    <div class="reto">
      <h3>${infantil ? 'Un poco de todo' : '⚡ Reto del día'}</h3>
      <p>Preguntas mezcladas de todas las materias</p>
      <div class="tandas">
        ${tandas.map(n => `<button onclick="empiezaMezcla(${n})">${n}</button>`).join('')}
      </div>
    </div>`);

  if (infantil) animaDani(document.getElementById('dani-saludo'), { animo: 'tranquilo', ...aspectoDani(a) });
}

function aspectoDani(a) {
  return { cuerpo: colorDaniDe(a.daniColor), gorro: gorroDe(a.daniGorro), gafas: !!a.daniGafas };
}

function cambiaCurso() {
  const lista = CURSOS.map(c => c.id).join(', ');
  const nuevo = prompt('Curso (' + lista + ')', alumnoActual().curso);
  if (!nuevo || !cursoPorId(nuevo)) return;
  const a = alumnoActual();
  // Mismo mecanismo que Profile.cambiarDeCurso: el progreso de cada curso
  // se guarda aparte, para que lo de 5º no aparezca en 3º.
  a.porCurso = a.porCurso || {};
  a.porCurso[a.curso] = { stats: a.stats, historial: a.historial };
  const caja = a.porCurso[nuevo];
  a.stats = caja ? caja.stats : {};
  a.historial = caja ? caja.historial : [];
  delete a.porCurso[nuevo];
  a.curso = nuevo;
  guardaTodo(); pinta();
}

/* ---------- El camino de temas ---------- */
function abreMateria(id) { estado.materia = id; estado.pantalla = 'temas'; pinta(); }

function pintaTemas() {
  const a = alumnoActual();
  const curso = cursoPorId(a.curso);
  const infantil = curso.etapa === 'infantil';
  const m = materiasDe(curso).find(x => x.id === estado.materia);
  const temas = temasDe(m.id);
  const tandas = infantil ? [5, 10] : [10, 25, 50];

  const dominados = temas.filter(t => {
    const s = estadisticaTema(a, m.id, t);
    return s.hechas >= 10 && s.ok * 100 / s.hechas >= 80;
  }).length;

  const casillas = temas.map((t, i) => {
    const s = estadisticaTema(a, m.id, t);
    const pct = s.hechas ? Math.round(s.ok * 100 / s.hechas) : 0;
    const dominado = s.hechas >= 10 && pct >= 80;
    const empezado = s.hechas > 0;
    const fondo = dominado ? '#3DDC97' : empezado ? m.color : 'var(--tarjeta)';
    const tinta = (dominado || empezado) ? '#fff' : 'var(--tinta-suave)';
    return `
      <div style="display:flex;gap:12px;align-items:flex-start">
        <div style="display:flex;flex-direction:column;align-items:center">
          <div style="width:46px;height:46px;border-radius:50%;background:${fondo};color:${tinta};
                      display:grid;place-items:center;font-weight:900;font-size:17px;
                      border:${(dominado || empezado) ? 'none' : '2.5px solid ' + m.color + '73'};
                      box-shadow:${(dominado || empezado) ? '0 2px 5px rgba(0,0,0,.18)' : 'none'}">
            ${dominado ? '★' : i + 1}
          </div>
          ${i < temas.length - 1 ? `<div style="width:4px;height:22px;border-radius:50px;
             background:${dominado ? '#3DDC978C' : m.color + '38'}"></div>` : ''}
        </div>
        <div style="flex:1;background:var(--tarjeta);border-radius:var(--radio);padding:14px;
                    box-shadow:0 1px 4px rgba(0,0,0,.12);margin-bottom:12px">
          <div style="display:flex;align-items:center">
            <strong style="flex:1;font-size:${infantil ? 20 : 15}px">${t}</strong>
            ${dominado ? '<span style="font-size:11px;font-weight:900;color:#3DDC97">Dominado</span>' : ''}
          </div>
          ${s.hechas ? `<div style="font-size:var(--letra-pequena);color:var(--tinta-suave);margin-top:3px">
              ${s.hechas} hechas · ${pct}% aciertos</div>
            <div class="barra" style="--color:${dominado ? '#3DDC97' : m.color};--pista:${m.color}26">
              <i style="width:${pct}%"></i></div>` : ''}
          <div style="display:flex;gap:6px;margin-top:10px">
            ${tandas.map(n => `<button class="btn-chico" style="background:${m.color};color:#fff"
                 onclick="empiezaQuiz('${m.id}','${t.replace(/'/g, "\\'")}',${n})">${n}</button>`).join('')}
          </div>
        </div>
      </div>`;
  }).join('');

  app().innerHTML = marco(`
    <button class="btn-chico hueco" onclick="estado.pantalla='principal';pinta()">← Cuadernos</button>
    <h2 class="titulo-seccion" style="margin-top:10px">${m.icono} ${m.nombre}</h2>
    <p class="subtitulo">${curso.nombre}</p>

    <div style="background:var(--tarjeta);border-radius:var(--radio);padding:16px;margin-bottom:16px;
                box-shadow:0 1px 4px rgba(0,0,0,.12)">
      <strong>${infantil ? 'Todo mezclado' : 'Repaso completo'}</strong>
      <div style="font-size:var(--letra-pequena);color:var(--tinta-suave);margin:4px 0 10px">
        Preguntas de todos los temas</div>
      <div style="display:flex;gap:8px">
        ${tandas.map(n => `<button class="btn-chico" style="background:var(--sun)"
             onclick="empiezaQuiz('${m.id}',null,${n})">${n}</button>`).join('')}
      </div>
    </div>

    <div style="display:flex;align-items:center;margin-bottom:8px">
      <h2 class="titulo-seccion" style="flex:1;font-size:19px">${infantil ? 'Mi camino' : 'El camino'}</h2>
      <small style="font-weight:700;color:var(--tinta-suave)">${dominados} de ${temas.length} dominados</small>
    </div>
    <div class="barra" style="--color:#3DDC97;--pista:#3DDC972E;height:10px;margin-bottom:16px">
      <i style="width:${temas.length ? dominados * 100 / temas.length : 0}%"></i></div>

    ${casillas}
    <p class="subtitulo">Todos los temas están abiertos desde el primer día: repasa el que te toque en clase.</p>`);
}

/* ---------- Preguntas ---------- */
function empiezaQuiz(materiaId, tema, n) {
  const a = alumnoActual();
  const preguntas = [];
  for (let i = 0; i < n; i++) {
    const t = tema || temasDe(materiaId)[Math.floor(Math.random() * temasDe(materiaId).length)];
    preguntas.push(generaPregunta(materiaId, a.curso, t));
  }
  estado.sesion = { materiaId, tema, preguntas, indice: 0, aciertos: 0, bloqueada: false,
                    dada: null, racha: 0, mezcla: false };
  estado.pantalla = 'quiz'; pinta();
}

function empiezaMezcla(n) {
  const a = alumnoActual();
  const materias = materiasDe(cursoPorId(a.curso));
  const preguntas = [];
  for (let i = 0; i < n; i++) {
    const m = materias[i % materias.length];
    const temas = temasDe(m.id);
    preguntas.push(generaPregunta(m.id, a.curso, temas[Math.floor(Math.random() * temas.length)]));
  }
  estado.sesion = { materiaId: null, tema: null, preguntas, indice: 0, aciertos: 0,
                    bloqueada: false, dada: null, racha: 0, mezcla: true };
  estado.pantalla = 'quiz'; pinta();
}

function pintaQuiz() {
  const a = alumnoActual();
  const s = estado.sesion;
  const q = s.preguntas[s.indice];
  const curso = cursoPorId(a.curso);
  const infantil = curso.etapa === 'infantil';
  const m = materiasDe(curso).find(x => x.id === q.materia) || { color: '#12B5E5' };
  const letras = ['A', 'B', 'C', 'D', 'E', 'F'];

  const opciones = q.opciones.map((o, i) => {
    const elegida = s.bloqueada && s.dada === o;
    const buena = o === q.respuesta;
    let fondo = 'var(--tarjeta)', tinta = 'var(--tinta)', marca = letras[i];
    if (s.bloqueada && buena) { fondo = '#3DDC97'; tinta = '#fff'; marca = '✓'; }
    else if (elegida) { fondo = '#FF6B6B'; tinta = '#fff'; marca = '✗'; }
    else if (s.bloqueada) { fondo = 'var(--tarjeta)'; tinta = 'var(--tinta-suave)'; }
    return `<button onclick="responde('${o.replace(/'/g, "\\'")}')" ${s.bloqueada ? 'disabled' : ''}
              style="background:${fondo};color:${tinta};border:${s.bloqueada ? 'none' : '1.5px solid ' + m.color + '59'};
                     border-radius:${infantil ? 22 : 18}px;padding:${infantil ? 16 : 12}px;cursor:pointer;
                     font:inherit;font-weight:700;font-size:${infantil ? 26 : 16}px;min-height:${infantil ? 86 : 68}px;
                     box-shadow:${s.bloqueada ? 'none' : '0 1px 4px rgba(0,0,0,.1)'}">
              ${infantil ? '' : `<div style="font-size:12px;font-weight:900;opacity:.75;margin-bottom:4px">${marca}</div>`}
              ${o}
            </button>`;
  }).join('');

  const respuesta = !s.bloqueada ? '' : `
    <div style="display:flex;align-items:center;gap:10px;margin-top:14px">
      <canvas id="dani-quiz" style="width:${infantil ? 90 : 64}px;height:${infantil ? 90 : 64}px"></canvas>
      <div style="flex:1">
        <div style="font-weight:900;font-size:${infantil ? 22 : 19}px;
                    color:${s.acierto ? '#3DDC97' : '#FF6B6B'}">
          ${s.acierto ? (s.racha >= 3 ? '¡' + s.racha + ' seguidas! 🔥' : '¡Muy bien!') : 'Casi'}
        </div>
        ${!s.acierto ? `<div style="font-weight:700;font-size:14px">La respuesta correcta era: ${q.respuesta}</div>` : ''}
      </div>
    </div>
    ${(!infantil && q.explicacion) ? `<div style="background:var(--fondo);border-radius:14px;padding:12px;
        margin-top:8px;font-size:13px">💡 ${q.explicacion}</div>` : ''}
    ${!s.acierto ? `<button onclick="siguiente()" style="width:100%;margin-top:14px;padding:16px;
        border:none;border-radius:14px;background:${m.color};color:#fff;font-weight:700;
        font-size:16px;cursor:pointer">${s.indice === s.preguntas.length - 1 ? 'Ver resultado 🏁' : 'Siguiente →'}</button>` : ''}`;

  app().innerHTML = `
    <div class="contenido">
      <div style="display:flex;align-items:center;gap:8px;margin-bottom:16px">
        <button class="btn-chico hueco" onclick="estado.pantalla='principal';pinta()">✕</button>
        <div class="barra" style="flex:1;--color:${m.color};--pista:${m.color}33;height:10px">
          <i style="width:${s.indice * 100 / s.preguntas.length}%"></i></div>
        ${s.racha >= 2 ? `<span class="pastilla" style="background:#FFC93C40">🔥 ${s.racha}</span>` : ''}
        <strong style="font-size:14px">${s.indice + 1}/${s.preguntas.length}</strong>
      </div>

      <div style="background:var(--tarjeta);border-radius:var(--radio);padding:22px;text-align:center;
                  box-shadow:0 2px 6px rgba(0,0,0,.12);border:var(--marco) solid var(--sun)">
        <div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-bottom:10px">
          ${q.etiqueta && !infantil ? `<span class="pastilla" style="background:var(--fondo);font-size:12px">${q.etiqueta}</span>` : ''}
          <button onclick="leeEnAlto()" style="border:none;border-radius:50%;cursor:pointer;
                  background:${m.color}26;padding:${infantil ? 14 : 9}px;font-size:${infantil ? 30 : 17}px">🔈</button>
        </div>
        <div style="font-size:${infantil ? 28 : 24}px;font-weight:700;line-height:1.25">${q.texto}</div>
        ${q.visual ? `<div style="font-size:${infantil ? 56 : 30}px;margin-top:12px">${q.visual}</div>` : ''}
      </div>

      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px">${opciones}</div>
      ${respuesta}
    </div>`;

  if (s.bloqueada) {
    animaDani(document.getElementById('dani-quiz'),
      { animo: s.acierto ? 'alegre' : 'pensativo', ...aspectoDani(a) });
  }
}

function leeEnAlto() {
  const q = estado.sesion.preguntas[estado.sesion.indice];
  try {
    const voz = new SpeechSynthesisUtterance(q.texto);
    voz.lang = 'es-ES';
    speechSynthesis.cancel();
    speechSynthesis.speak(voz);
  } catch (e) { /* algunos navegadores no tienen voz; no pasa nada */ }
}

function responde(opcion) {
  const s = estado.sesion;
  if (s.bloqueada) return;
  const q = s.preguntas[s.indice];
  const acierto = opcion === q.respuesta;
  s.bloqueada = true; s.dada = opcion; s.acierto = acierto;
  s.racha = acierto ? s.racha + 1 : 0;
  if (acierto) s.aciertos++;
  registraRespuesta(alumnoActual(), q.materia, q.tema, acierto);
  apuntaFallo(alumnoActual(), q, acierto, !!s.esRepasoFallos);
  guardaTodo();
  pinta();

  // Al acertar pasa sola, igual que en la app: en una sesión de 25, son
  // 25 toques que no deciden nada.
  if (acierto) setTimeout(() => { if (estado.sesion === s && s.bloqueada) siguiente(); },
                          document.body.dataset.etapa === 'infantil' ? 1600 : 1100);
}

function siguiente() {
  const s = estado.sesion;
  if (s.indice >= s.preguntas.length - 1) {
    estado.pantalla = 'resultado';
    estado.faseResultado = 'oferta';
    return pinta();
  }
  s.indice++; s.bloqueada = false; s.dada = null; s.acierto = null;
  pinta();
}

/* ---------- Resultado ---------- */
function pintaResultado() {
  if (estado.faseResultado === 'oferta') return pintaOferta();
  if (estado.faseResultado === 'minijuego') return pintaMinijuego();
  return pintaMarcador();
}

/**
 * El ofrecimiento del minijuego, igual que en la app: lo trae Dani con el regalo.
 */
function pintaOferta() {
  const a = alumnoActual();
  const infantil = document.body.dataset.etapa === 'infantil';
  app().innerHTML = `
    <div class="contenido" style="display:flex;flex-direction:column;align-items:center;
                                  justify-content:center;min-height:100vh;text-align:center">
      <div style="position:relative">
        <canvas id="dani-regalo" style="width:${infantil ? 150 : 120}px;height:${infantil ? 150 : 120}px"></canvas>
        <span style="position:absolute;top:0;right:-6px;font-size:${infantil ? 44 : 36}px">🎁</span>
      </div>
      <h1 style="font-size:${infantil ? 30 : 26}px;font-weight:900;margin:14px 0 6px">
        ${infantil ? '¡Ya está!' : '¡Sesión terminada!'}</h1>
      <p style="font-size:${infantil ? 18 : 14}px;color:var(--tinta-suave);line-height:1.4">
        ${infantil ? '¿Jugamos un poquito?' : '¿Jugamos un momento antes de ver el resultado?'}</p>
      <button onclick="estado.faseResultado='minijuego';minijuegoAlAzar()"
              style="margin-top:26px;background:#3DDC97;color:#fff;border:none;border-radius:20px;
                     padding:${infantil ? 20 : 16}px ${infantil ? 42 : 34}px;font-weight:900;
                     font-size:${infantil ? 24 : 18}px;cursor:pointer">🎮  ¡Sí, jugar!</button>
      <button onclick="estado.faseResultado='marcador';pinta()"
              style="margin-top:12px;background:none;border:none;color:var(--tinta-suave);
                     font-weight:700;font-size:13px;cursor:pointer">Ver resultado directamente →</button>
    </div>`;
  animaDani(document.getElementById('dani-regalo'), { animo:'alegre', ...aspectoDani(a) });
}

function pintaMarcador() {
  const a = alumnoActual();
  const s = estado.sesion;
  const n = s.preguntas.length, ok = s.aciertos;
  const pct = n ? ok / n : 0;
  const estrellas = pct === 1 ? 3 : pct >= 0.7 ? 2 : pct >= 0.4 ? 1 : 0;
  const ganadas = estrellas * 3;
  const color = estrellas === 3 ? '#3DDC97' : estrellas === 2 ? '#12B5E5' : estrellas === 1 ? '#FFC93C' : '#FF6B6B';
  const [emoji, titulo] = estrellas === 3 ? ['🏆', '¡Perfecto!'] : estrellas === 2 ? ['🎉', '¡Muy bien!']
                        : estrellas === 1 ? ['👍', '¡Buen trabajo!'] : ['💪', '¡Sigue practicando!'];

  // Se cobra una sola vez: antes, cualquier repintado de esta pantalla volvía a sumar
  // las estrellas y a apuntar la sesión en el historial.
  if (!s.cobrada) {
    s.cobrada = true;
    a.estrellas += ganadas; a.estrellasTotal += ganadas;
    a.historial.unshift({ d: Date.now(), ok, n });
    guardaTodo();
  }

  const r = 85, circ = 2 * Math.PI * r;
  app().innerHTML = `
    <div class="contenido" style="display:flex;flex-direction:column;align-items:center;justify-content:center;min-height:100vh">
      <div style="position:relative;width:200px;height:200px">
        <svg width="200" height="200" style="transform:rotate(-90deg)">
          <circle cx="100" cy="100" r="${r}" fill="none" stroke="${color}29" stroke-width="15"/>
          <circle cx="100" cy="100" r="${r}" fill="none" stroke="${color}" stroke-width="15"
                  stroke-linecap="round" stroke-dasharray="${circ}"
                  stroke-dashoffset="${circ}" id="aro"/>
        </svg>
        <div style="position:absolute;inset:0;display:flex;flex-direction:column;
                    align-items:center;justify-content:center">
          <div style="font-size:38px">${emoji}</div>
          <div style="font-size:42px;font-weight:900;line-height:1">${ok}/${n}</div>
          <small style="font-weight:700;color:var(--tinta-suave)">${Math.round(pct * 100)}% de aciertos</small>
        </div>
      </div>

      <h1 style="font-size:26px;font-weight:900;margin:16px 0 10px">${titulo}</h1>
      <div id="estrellas" style="font-size:38px;letter-spacing:4px">☆☆☆</div>
      ${ganadas ? `<div class="pastilla" style="background:#FFC93C40;margin-top:14px;font-weight:900">
            +${ganadas} estrellas</div>` : ''}

      <div style="display:flex;gap:12px;margin-top:24px">
        <button onclick="repite()" style="background:${color};color:#fff;border:none;border-radius:18px;
                padding:14px 24px;font-weight:900;font-size:16px;cursor:pointer">Repetir 🔁</button>
        <button onclick="estado.pantalla='principal';pinta()" style="background:var(--tarjeta);
                color:var(--tinta);border:none;border-radius:18px;padding:14px 24px;
                font-weight:700;font-size:16px;cursor:pointer">Cuadernos</button>
      </div>

      <div style="margin-top:18px"><canvas id="dani-fin" style="width:90px;height:90px"></canvas></div>
    </div>`;

  // El aro se llena solo, y las estrellas caen una a una.
  requestAnimationFrame(() => {
    const aro = document.getElementById('aro');
    aro.style.transition = 'stroke-dashoffset .9s ease';
    aro.style.strokeDashoffset = circ * (1 - pct);
  });
  let puestas = 0;
  const caja = document.getElementById('estrellas');
  const timer = setInterval(() => {
    if (puestas >= estrellas) return clearInterval(timer);
    puestas++;
    caja.textContent = '⭐'.repeat(puestas) + '☆'.repeat(3 - puestas);
  }, 300);

  animaDani(document.getElementById('dani-fin'),
    { animo: estrellas >= 2 ? 'alegre' : 'tranquilo', ...aspectoDani(a) });
}

function repite() {
  const s = estado.sesion;
  if (s.mezcla) empiezaMezcla(s.preguntas.length);
  else empiezaQuiz(s.materiaId, s.tema, s.preguntas.length);
}

/* ---------- Arranque ---------- */
function arranca() {
  if (!estado.alumnos.length) estado.pantalla = 'perfiles';
  else if (!alumnoActual()) estado.pantalla = 'perfiles';
  else estado.pantalla = 'principal';
  pinta();
}

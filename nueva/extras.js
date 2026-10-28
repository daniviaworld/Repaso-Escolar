/* ===================================================================
   PROGRESO, TIENDA DE DANI, ZONA DE FAMILIAS, RETO SEMANAL Y FALLOS.
   Traducción de Badges.kt, RetoSemanal.kt, ProgressScreen.kt y
   FamilyScreen.kt. Las reglas son las mismas; donde cambian, se
   explica el motivo en el sitio.
   =================================================================== */

/* ---------- Logros (Badges.kt) ---------- */
const LOGROS = [
  { id:'first',    ico:'🥉', nombre:'PRIMER REPASO', test:a => a.historial.length >= 1 },
  { id:'perfect',  ico:'🌟', nombre:'PLENO',         test:a => a.historial.some(h => h.n > 0 && h.ok === h.n) },
  { id:'ten',      ico:'📚', nombre:'CONSTANTE',     test:a => a.historial.length >= 10 },
  { id:'hundred',  ico:'💯', nombre:'CENTENARIO',    test:a => sumaHechas(a) >= 100 },
  { id:'streak3',  ico:'🔥', nombre:'RACHA DE 3',    test:a => racha(a) >= 3 },
  { id:'streak7',  ico:'🚀', nombre:'RACHA DE 7',    test:a => racha(a) >= 7 },
  { id:'gamer',    ico:'🎮', nombre:'JUGUETÓN',      test:a => (a.juegos || 0) >= 5 },
  { id:'explorer', ico:'🧭', nombre:'EXPLORADOR',
    test:a => materiasDe(cursoPorId(a.curso)).every(m => (a.stats[m.id] && a.stats[m.id].hechas > 0)) }
];

function sumaHechas(a) { return Object.values(a.stats).reduce((s, m) => s + m.hechas, 0); }
function sumaAciertos(a) { return Object.values(a.stats).reduce((s, m) => s + m.ok, 0); }

/** Días seguidos practicando, igual que getStreak(). */
function racha(a) {
  if (!a.historial.length) return 0;
  const dias = new Set(a.historial.map(h => new Date(h.d).toDateString()));
  const d = new Date();
  if (!dias.has(d.toDateString())) d.setDate(d.getDate() - 1);
  let n = 0;
  while (dias.has(d.toDateString())) { n++; d.setDate(d.getDate() - 1); }
  return n;
}

/* ---------- Reto de la semana (RetoSemanal.kt) ---------- */

/**
 * Semana ISO, la que empieza en lunes. Mismo cálculo que en la app, incluido el
 * cuidado con la semana que cruza de diciembre a enero: si se partiera en dos, el
 * niño perdería el reto a mitad justo en vacaciones.
 */
function semanaActual(ahora = Date.now()) {
  const f = new Date(ahora);
  const d = new Date(Date.UTC(f.getFullYear(), f.getMonth(), f.getDate()));
  const dia = d.getUTCDay() || 7;             // lunes = 1 … domingo = 7
  d.setUTCDate(d.getUTCDate() + 4 - dia);     // al jueves de esa semana
  const anio = d.getUTCFullYear();
  const enero1 = new Date(Date.UTC(anio, 0, 1));
  const semana = Math.ceil(((d - enero1) / 86400000 + 1) / 7);
  return anio + '-W' + semana;
}

function inicioDeSemana(ahora = Date.now()) {
  const d = new Date(ahora);
  const dia = d.getDay() || 7;
  d.setDate(d.getDate() - (dia - 1));
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function diasQueQuedan(ahora = Date.now()) {
  const dia = new Date(ahora).getDay() || 7;
  return 8 - dia;
}

function retoDeLaSemana(a, ahora = Date.now()) {
  const semana = semanaActual(ahora);
  const desde = inicioDeSemana(ahora);
  const sesiones = a.historial.filter(h => h.d >= desde);
  const numero = parseInt(semana.split('W')[1], 10) || 0;

  const retos = [
    { id:'sesiones5',   titulo:'Haz 5 sesiones',        explica:'Termina cinco repasos esta semana',
      objetivo:5,  logrado:sesiones.length,                             premio:30 },
    { id:'preguntas60', titulo:'Responde 60 preguntas', explica:'Da igual de qué materia',
      objetivo:60, logrado:sesiones.reduce((s,h) => s + h.n, 0),        premio:35 },
    { id:'plenos2',     titulo:'Consigue 2 plenos',     explica:'Dos sesiones sin fallar ni una',
      objetivo:2,  logrado:sesiones.filter(h => h.n > 0 && h.ok === h.n).length, premio:40 },
    { id:'aciertos50',  titulo:'Acierta 50 preguntas',  explica:'Suman las de todas las sesiones',
      objetivo:50, logrado:sesiones.reduce((s,h) => s + h.ok, 0),       premio:35 }
  ];
  const r = retos[numero % 4];
  return { ...r, semana, completado: r.logrado >= r.objetivo,
           avance: Math.min(1, r.objetivo ? r.logrado / r.objetivo : 0) };
}

function cobraReto() {
  const a = alumnoActual();
  const r = retoDeLaSemana(a);
  if (!r.completado) return;
  a.retosCobrados = a.retosCobrados || {};
  if (a.retosCobrados[r.semana]) return;      // una vez por semana y no más
  a.retosCobrados[r.semana] = Date.now();
  a.estrellas += r.premio; a.estrellasTotal += r.premio;
  guardaTodo(); pinta();
}

/* ---------- Repaso de fallos ---------- */
function apuntaFallo(a, pregunta, acierto, enRepaso) {
  a.fallos = a.fallos || [];
  const huella = p => p.texto + '|' + p.respuesta;
  if (acierto) {
    // Acertarla por casualidad en una sesión normal NO la tacha: entre cuatro
    // opciones se acierta de chiripa. Solo cuenta sacarla en el repaso de fallos.
    if (enRepaso) a.fallos = a.fallos.filter(f => huella(f.pregunta) !== huella(pregunta));
    return;
  }
  if (a.fallos.some(f => huella(f.pregunta) === huella(pregunta))) return;
  a.fallos.push({ pregunta, curso: a.curso, cuando: Date.now() });
  while (a.fallos.length > 40) a.fallos.shift();
}

function fallosPendientes(a) {
  return (a.fallos || []).filter(f => f.curso === a.curso);
}

function empiezaRepasoFallos(n) {
  const a = alumnoActual();
  const pendientes = fallosPendientes(a).sort((x, y) => x.cuando - y.cuando).slice(0, n);
  if (!pendientes.length) return;
  estado.sesion = { materiaId:null, tema:null, preguntas:pendientes.map(f => f.pregunta),
                    indice:0, aciertos:0, bloqueada:false, dada:null, racha:0,
                    mezcla:true, esRepasoFallos:true };
  estado.pantalla = 'quiz'; pinta();
}

/* ===================================================================
   PROGRESO
   =================================================================== */
function pintaProgreso() {
  const a = alumnoActual();
  const curso = cursoPorId(a.curso);
  const hechas = sumaHechas(a), aciertos = sumaAciertos(a);
  const pct = hechas ? Math.round(aciertos * 100 / hechas) : 0;
  const conseguidos = LOGROS.filter(l => l.test(a));

  const cifra = (ico, valor, etiqueta, color) => `
    <div style="flex:1;background:${color}29;border-radius:20px;padding:14px 6px;text-align:center">
      <div style="font-size:20px">${ico}</div>
      <div style="font-weight:900;font-size:22px">${valor}</div>
      <small style="font-size:11px;font-weight:700;opacity:.65">${etiqueta}</small>
    </div>`;

  const materias = materiasDe(curso).map(m => {
    const st = a.stats[m.id];
    const p = st && st.hechas ? Math.round(st.ok * 100 / st.hechas) : 0;
    return `
      <div style="background:var(--tarjeta);border-radius:18px;padding:14px;margin-bottom:8px;
                  display:flex;align-items:center;gap:12px;box-shadow:0 1px 4px rgba(0,0,0,.1)">
        <div style="width:40px;height:40px;border-radius:13px;background:${m.color}2E;
                    display:grid;place-items:center;font-size:20px">${m.icono}</div>
        <div style="flex:1">
          <div style="display:flex;align-items:center">
            <strong style="flex:1;font-size:14px">${m.nombre}</strong>
            <span style="font-weight:900;font-size:15px;color:${st ? m.color : 'var(--tinta-suave)'}">
              ${st && st.hechas ? p + '%' : '—'}</span>
          </div>
          <div class="barra" style="--color:${m.color};--pista:${m.color}26;margin-top:7px">
            <i style="width:${p}%"></i></div>
          ${st && st.hechas ? `<small style="font-size:11px;color:var(--tinta-suave)">
              ${st.ok} aciertos de ${st.hechas}</small>` : ''}
        </div>
      </div>`;
  }).join('');

  const medallas = LOGROS.map(l => {
    const tiene = conseguidos.includes(l);
    return `
      <div style="background:var(--tarjeta);border-radius:18px;padding:12px 6px;text-align:center;
                  opacity:${tiene ? 1 : .55}">
        <div style="width:52px;height:52px;border-radius:50%;margin:0 auto;
                    background:${tiene ? '#FFC93C4D' : '#6C7A8A24'};display:grid;place-items:center;
                    font-size:${tiene ? 28 : 20}px">${tiene ? l.ico : '🔒'}</div>
        <small style="display:block;margin-top:7px;font-size:11px;font-weight:700;
                      color:${tiene ? 'var(--tinta)' : 'var(--tinta-suave)'}">${l.nombre}</small>
      </div>`;
  }).join('');

  app().innerHTML = marco(`
    <h2 class="titulo-seccion">Mi progreso</h2>
    <p class="subtitulo">Todo lo que has hecho hasta hoy</p>

    <button onclick="estado.pantalla='tienda';pinta()"
            style="width:100%;text-align:left;background:var(--tarjeta);border:none;cursor:pointer;
                   border-radius:22px;padding:14px;display:flex;align-items:center;gap:12px;
                   box-shadow:0 1px 4px rgba(0,0,0,.1);font:inherit;color:inherit">
      <canvas id="dani-progreso" style="width:76px;height:76px"></canvas>
      <div style="flex:1">
        <strong style="font-size:17px">Mi Dani</strong>
        <div style="font-size:var(--letra-pequena);color:var(--tinta-suave);margin:2px 0 6px">
          Gasta tus estrellas en gorros y colores</div>
        <span class="pastilla" style="background:#FFC93C40;font-size:12px;font-weight:900">
          ⭐ ${a.estrellas} para gastar</span>
      </div>
      <span style="font-size:26px;color:var(--tinta-suave)">›</span>
    </button>

    <div style="display:flex;gap:8px;margin:14px 0 22px">
      ${cifra('⭐', a.estrellasTotal, 'Ganadas', '#FFC93C')}
      ${cifra('🔥', racha(a), 'Racha', '#FF6B6B')}
      ${cifra('🎯', hechas ? pct + '%' : '—', 'Acierto', '#3DDC97')}
    </div>

    <h3 style="font-size:17px;font-weight:900;margin:0">Por materia</h3>
    <p class="subtitulo">${hechas ? hechas + ' preguntas respondidas en total'
                                  : 'Todavía no has respondido ninguna pregunta'}</p>
    ${materias}

    <h3 style="font-size:17px;font-weight:900;margin:24px 0 2px">Mis logros</h3>
    <p class="subtitulo">${conseguidos.length} de ${LOGROS.length} conseguidos</p>
    <div class="barra" style="--color:#FFC93C;--pista:#FFC93C38;height:10px;margin-bottom:14px">
      <i style="width:${conseguidos.length * 100 / LOGROS.length}%"></i></div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">${medallas}</div>
    <div style="height:24px"></div>`);

  animaDani(document.getElementById('dani-progreso'), { animo:'alegre', ...aspectoDani(a) });
}

/* ---------- La tienda ---------- */
function pintaTienda() {
  const a = alumnoActual();
  const seccion = (tipo, titulo) => {
    const fichas = CATALOGO_DANI.filter(x => x.tipo === tipo).map(art => {
      const tuyo = art.precio === 0 || (a.comprados || []).includes(art.id);
      const puesto = tipo === 'color' ? a.daniColor === art.id
                   : tipo === 'gorro' ? a.daniGorro === art.id
                   : !!a.daniGafas;
      const alcanza = tuyo || a.estrellas >= art.precio;
      const etiqueta = puesto ? 'Puesto ✓' : tuyo ? 'Ponérselo' : '⭐ ' + art.precio;
      return `
        <button onclick="tocaArticulo('${art.id}')"
                style="background:${puesto ? '#3DDC9729' : 'var(--tarjeta)'};border:${puesto ? '2.5px solid #3DDC97' : 'none'};
                       border-radius:20px;padding:12px 6px;cursor:pointer;font:inherit;color:inherit;
                       box-shadow:0 1px 4px rgba(0,0,0,.1);text-align:center">
          <canvas class="miniDani" data-art="${art.id}" style="width:64px;height:64px;margin:0 auto"></canvas>
          <div style="font-size:13px;font-weight:700;margin-top:8px">${art.nombre}</div>
          <span style="display:inline-block;margin-top:6px;border-radius:50px;padding:4px 12px;
                       font-size:12px;font-weight:900;
                       background:${puesto ? '#3DDC97' : tuyo ? 'var(--fondo)' : alcanza ? '#FFC93C4D' : '#6C7A8A24'};
                       color:${puesto ? '#fff' : alcanza ? 'var(--tinta)' : 'var(--tinta-suave)'}">${etiqueta}</span>
        </button>`;
    }).join('');
    return `<h3 style="font-size:17px;font-weight:900;margin:18px 0 8px">${titulo}</h3>
            <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${fichas}</div>`;
  };

  app().innerHTML = `
    <div class="contenido">
      <div style="display:flex;align-items:center;gap:12px">
        <button class="btn-chico hueco" onclick="estado.pantalla='principal';estado.pestana='progreso';pinta()">✕</button>
        <h2 class="titulo-seccion" style="flex:1">Mi Dani</h2>
        <span class="pastilla" style="background:#FFC93C4D;font-weight:900">⭐ ${a.estrellas}</span>
      </div>

      <div style="background:var(--tarjeta);border-radius:26px;padding:18px;margin-top:16px;text-align:center;
                  box-shadow:0 1px 4px rgba(0,0,0,.1)">
        <canvas id="dani-grande" style="width:150px;height:150px"></canvas>
        <div id="aviso-falta" style="color:#FF6B6B;font-weight:700;font-size:13px;margin-top:8px"></div>
      </div>

      ${seccion('color', 'Colores')}
      ${seccion('gorro', 'Gorros')}
      ${seccion('gafas', 'Extras')}

      <p class="subtitulo" style="text-align:center;margin-top:18px">
        Las estrellas se ganan acertando preguntas y terminando sesiones.
        Lo que compras es tuyo para siempre.</p>
      <div style="height:20px"></div>
    </div>`;

  animaDani(document.getElementById('dani-grande'), { animo:'alegre', ...aspectoDani(a) });
  // Cada ficha enseña a Dani CON esa cosa puesta: así se ve lo que se compra.
  document.querySelectorAll('.miniDani').forEach(c => {
    const art = CATALOGO_DANI.find(x => x.id === c.dataset.art);
    dibujaDani(c, {
      animo:'tranquilo',
      cuerpo: art.tipo === 'color' ? colorDaniDe(art.id) : colorDaniDe(a.daniColor),
      gorro: art.tipo === 'gorro' ? gorroDe(art.id) : 'ninguno',
      gafas: art.tipo === 'gafas'
    });
  });
}

function tocaArticulo(id) {
  const a = alumnoActual();
  const art = CATALOGO_DANI.find(x => x.id === id);
  const tuyo = art.precio === 0 || (a.comprados || []).includes(art.id);

  if (!tuyo) {
    if (a.estrellas < art.precio) {
      const aviso = document.getElementById('aviso-falta');
      if (aviso) aviso.textContent = `Te faltan ${art.precio - a.estrellas} estrellas para eso`;
      return;
    }
    a.estrellas -= art.precio;
    a.comprados = a.comprados || [];
    a.comprados.push(art.id);
  }
  if (art.tipo === 'color') a.daniColor = art.id;
  // Tocar el gorro que ya llevas te lo quita: es lo que un niño intenta sin pensarlo.
  else if (art.tipo === 'gorro') a.daniGorro = (a.daniGorro === art.id) ? '' : art.id;
  else a.daniGafas = !a.daniGafas;

  guardaTodo(); pintaTienda();
}

/* ===================================================================
   ZONA DE FAMILIAS
   =================================================================== */
function pintaFamilias() {
  const a = alumnoActual();
  const curso = cursoPorId(a.curso);
  const materias = materiasDe(curso);
  const temas = materias.reduce((s, m) => s + temasDe(m.id).length, 0);

  const flojos = [];
  materias.forEach(m => {
    const st = a.stats[m.id]; if (!st) return;
    Object.entries(st.temas).forEach(([t, v]) => {
      if (v.hechas >= 4 && v.ok * 100 / v.hechas < 60)
        flojos.push(`${m.nombre} · ${t} (${Math.round(v.ok * 100 / v.hechas)}%)`);
    });
  });

  const fila = (ico, color, titulo, detalle, accion) => `
    <button onclick="${accion}" style="width:100%;display:flex;align-items:center;gap:12px;background:none;
            border:none;padding:8px 12px;cursor:pointer;font:inherit;color:inherit;text-align:left">
      <span style="width:38px;height:38px;border-radius:12px;background:${color}26;display:grid;
                   place-items:center;font-size:18px">${ico}</span>
      <span style="flex:1">
        <span style="display:block;font-weight:700;font-size:14px">${titulo}</span>
        ${detalle ? `<small style="font-size:11px;color:var(--tinta-suave)">${detalle}</small>` : ''}
      </span>
      <span style="font-size:22px;color:var(--tinta-suave)">›</span>
    </button>`;

  const interruptor = (ico, color, titulo, encendido, accion) => `
    <div style="display:flex;align-items:center;gap:12px;padding:8px 12px">
      <span style="width:38px;height:38px;border-radius:12px;background:${color}26;display:grid;
                   place-items:center;font-size:18px">${ico}</span>
      <span style="flex:1;font-weight:700;font-size:14px">${titulo}</span>
      <button onclick="${accion}" style="width:50px;height:28px;border-radius:50px;border:none;cursor:pointer;
              background:${encendido ? '#12B5E5' : '#6C7A8A4D'};position:relative">
        <span style="position:absolute;top:3px;left:${encendido ? 25 : 3}px;width:22px;height:22px;
                     border-radius:50%;background:#fff;transition:left .15s"></span>
      </button>
    </div>`;

  app().innerHTML = marco(`
    <h2 class="titulo-seccion">Zona familias</h2>
    <p class="subtitulo">Danivia School genera ejercicios nuevos en cada sesión, adaptados al curso,
       siguiendo las áreas del currículo de la Generalitat Valenciana.</p>

    <div style="background:var(--tarjeta);border-radius:22px;overflow:hidden;margin-bottom:20px;
                box-shadow:0 1px 4px rgba(0,0,0,.1)">
      <div style="background:#0B2A4A;color:#fff;padding:16px;display:flex;align-items:center;gap:14px">
        <span style="width:50px;height:50px;border-radius:50%;background:rgba(255,255,255,.16);
                     display:grid;place-items:center;font-size:28px">${a.avatar}</span>
        <span style="flex:1">
          <span style="display:block;font-weight:900;font-size:19px">${a.nombre}</span>
          <small style="opacity:.72;font-size:13px">${curso.nombre}</small>
        </span>
      </div>
      <div style="display:flex;padding:14px;text-align:center">
        <div style="flex:1"><strong style="display:block;font-size:20px">${materias.length}</strong>
          <small style="font-size:11px;font-weight:700;opacity:.6">Materias</small></div>
        <div style="flex:1"><strong style="display:block;font-size:20px">${temas}</strong>
          <small style="font-size:11px;font-weight:700;opacity:.6">Temas</small></div>
        <div style="flex:1"><strong style="display:block;font-size:20px">${a.estrellas}</strong>
          <small style="font-size:11px;font-weight:700;opacity:.6">Estrellas</small></div>
      </div>
      <div style="height:1px;background:var(--tinta-suave);opacity:.18"></div>
      <div style="padding:16px">
        <strong style="font-size:14px">Temas a reforzar</strong>
        <div style="margin-top:8px">
          ${flojos.length
            ? flojos.map(t => `<span style="display:inline-block;background:#FF6B6B21;color:#FF6B6B;
                 border-radius:50px;padding:7px 12px;font-size:12px;font-weight:700;margin:0 6px 6px 0">${t}</span>`).join('')
              + `<p style="font-size:11px;color:var(--tinta-suave);line-height:1.4;margin:6px 0 0">
                   La app ya insiste en estos temas por su cuenta cuando el alumno repasa la materia entera.</p>`
            : `<div style="display:flex;gap:8px;align-items:center;font-size:12px;color:var(--tinta-suave)">
                 ✅ Ninguno detectado todavía. Se calculan a partir de 4 respuestas por tema.</div>`}
        </div>
      </div>
    </div>

    <h3 style="font-size:17px;font-weight:900;margin:0 0 8px">Ajustes</h3>
    <div style="background:var(--tarjeta);border-radius:20px;padding:4px 0;margin-bottom:20px;
                box-shadow:0 1px 4px rgba(0,0,0,.1)">
      ${interruptor('🌙', '#0B2A4A', 'Modo oscuro', estado.oscuro, 'cambiaOscuro()')}
      ${interruptor('🗣️', '#9B7BFF', 'Voz automática', !!estado.voz, 'cambiaVoz()')}
    </div>

    <h3 style="font-size:17px;font-weight:900;margin:0 0 8px">Informes</h3>
    <div style="background:var(--tarjeta);border-radius:20px;padding:4px 0;margin-bottom:20px;
                box-shadow:0 1px 4px rgba(0,0,0,.1)">
      ${fila('🏅', '#3DDC97', 'Diploma', 'Para imprimir o guardar en PDF', 'abreDiploma()')}
      ${fila('🖨️', '#FF9F68', 'Informe para imprimir', 'Para llevarlo a la tutoría', 'abreInforme()')}
    </div>

    <h3 style="font-size:17px;font-weight:900;margin:0 0 8px">Curso y datos</h3>
    <div style="background:var(--tarjeta);border-radius:20px;padding:4px 0;
                box-shadow:0 1px 4px rgba(0,0,0,.1)">
      ${fila('🎓', '#12B5E5', 'Cambiar de curso', curso.nombre, 'cambiaCurso()')}
    </div>

    <button onclick="borraTodo()" style="width:100%;margin-top:12px;background:#FF6B6B1A;border:none;
            border-radius:18px;padding:14px;cursor:pointer;font:inherit;text-align:left;display:flex;gap:12px">
      <span style="font-size:18px">🗑️</span>
      <span><strong style="display:block;color:#FF6B6B;font-size:14px">Borrar todo</strong>
        <small style="font-size:11px;color:#FF6B6BBF">Borra los alumnos y su progreso de este navegador</small></span>
    </button>

    <p style="text-align:center;font-size:11px;font-weight:700;color:var(--tinta-suave);
              margin-top:22px;line-height:1.5">
      DANIVIA World Technologies<br>www.daniviaworldtechnologies.com</p>
    <div style="height:20px"></div>`);
}

function cambiaOscuro() { estado.oscuro = !estado.oscuro; almacen.guardar('oscuro', estado.oscuro); pinta(); }
function cambiaVoz() { estado.voz = !estado.voz; almacen.guardar('voz', estado.voz); pinta(); }

function borraTodo() {
  if (!confirm('¿Borrar todos los alumnos y su progreso de este navegador? No se puede deshacer.')) return;
  estado.alumnos = []; estado.actual = null; guardaTodo();
  estado.pantalla = 'perfiles'; pinta();
}

/* ---------- Diploma e informe: se abren en otra pestaña y se imprimen ---------- */
function abreVentanaImprimible(html) {
  const v = window.open('', '_blank');
  if (!v) { alert('El navegador ha bloqueado la ventana. Permite las ventanas emergentes para imprimir.'); return; }
  v.document.write(html); v.document.close();
  setTimeout(() => v.print(), 400);
}

function abreDiploma() {
  const a = alumnoActual();
  const curso = cursoPorId(a.curso);
  const hechas = sumaHechas(a), pct = hechas ? Math.round(sumaAciertos(a) * 100 / hechas) : 0;
  const medallas = LOGROS.filter(l => l.test(a)).map(l => `<span>${l.nombre}</span>`).join('');
  const fecha = new Date().toLocaleDateString('es-ES', { day:'numeric', month:'long', year:'numeric' });

  abreVentanaImprimible(`
    <html><head><meta charset="utf-8"><title>Diploma de ${a.nombre}</title><style>
      @page { size: A4 landscape; margin: 10mm }
      body { font-family: Georgia, serif; text-align:center; color:#0B2A4A; margin:0 }
      .marco { border:10px double #12B5E5; border-radius:10px; padding:26px 30px; margin:6px }
      .cab { font-size:13px; letter-spacing:3px; color:#6C7A8A; text-transform:uppercase }
      h1 { font-size:40px; margin:10px 0 4px }
      .nombre { font-size:46px; font-weight:bold; margin:18px 0 6px; color:#12B5E5 }
      .curso { font-size:18px; color:#173A5E; margin-bottom:18px }
      .texto { font-size:15px; line-height:1.6; max-width:620px; margin:0 auto }
      .cifras { display:flex; justify-content:center; gap:40px; margin:22px 0 10px }
      .cifra { font-size:13px; color:#6C7A8A }
      .cifra b { display:block; font-size:28px; color:#0B2A4A }
      .medallas span { display:inline-block; border:1px solid #12B5E5; border-radius:20px;
                       padding:3px 10px; margin:3px; font-size:12px }
      .pie { margin-top:24px; display:flex; justify-content:space-between; font-size:11px; color:#6C7A8A }
      .firma { border-top:1px solid #6C7A8A; padding-top:4px; width:200px }
    </style></head><body><div class="marco">
      <div class="cab">Danivia School · Repaso GVA</div>
      <h1>Diploma de repaso</h1>
      <div class="texto">Se concede este diploma a</div>
      <div class="nombre">${a.nombre}</div>
      <div class="curso">${curso.nombre}</div>
      <div class="texto">por su trabajo y su constancia repasando los contenidos del currículo
        de la Comunitat Valenciana.</div>
      <div class="cifras">
        <div class="cifra"><b>${hechas}</b>preguntas respondidas</div>
        <div class="cifra"><b>${pct}%</b>de aciertos</div>
        <div class="cifra"><b>${a.estrellasTotal}</b>estrellas ganadas</div>
      </div>
      <div class="medallas">${medallas}</div>
      <div class="pie"><div class="firma">${fecha}</div>
        <div class="firma">DANIVIA World Technologies</div></div>
    </div></body></html>`);
}

function abreInforme() {
  const a = alumnoActual();
  const curso = cursoPorId(a.curso);
  const filas = materiasDe(curso).map(m => {
    const st = a.stats[m.id];
    const p = st && st.hechas ? Math.round(st.ok * 100 / st.hechas) : 0;
    return `<tr><td>${m.icono} ${m.nombre}</td><td>${st ? st.hechas : 0}</td><td>${st && st.hechas ? p + '%' : '—'}</td></tr>`;
  }).join('');
  const sesiones = a.historial.slice(0, 10).map(h =>
    `<li>${new Date(h.d).toLocaleDateString('es-ES')} — ${h.ok}/${h.n}</li>`).join('');

  abreVentanaImprimible(`
    <html><head><meta charset="utf-8"><title>Informe de ${a.nombre}</title><style>
      body { font-family: system-ui, sans-serif; color:#0B2A4A; padding:24px; max-width:720px; margin:0 auto }
      h1 { font-size:22px } h2 { font-size:15px; margin-top:22px }
      table { width:100%; border-collapse:collapse; font-size:14px }
      td, th { border-bottom:1px solid #E1EDFA; padding:8px; text-align:left }
      .cab { color:#6C7A8A; font-size:12px; letter-spacing:2px; text-transform:uppercase }
    </style></head><body>
      <div class="cab">Danivia School · Repaso GVA</div>
      <h1>Informe de ${a.nombre}</h1>
      <p>${curso.nombre} · ⭐ ${a.estrellasTotal} estrellas · 🔥 racha de ${racha(a)} días</p>
      <h2>Por materia</h2>
      <table><tr><th>Materia</th><th>Preguntas</th><th>Aciertos</th></tr>${filas}</table>
      <h2>Últimas sesiones</h2>
      ${sesiones ? '<ul>' + sesiones + '</ul>' : '<p>Sin sesiones todavía.</p>'}
    </body></html>`);
}

/* ---------- Las dos tarjetas de la pantalla de cuadernos ---------- */

/**
 * Aparece a partir de 5 fallos pendientes. Con uno o dos, un repaso de fallos es un
 * examen de dos preguntas que no enseña nada y deja la sensación de que la app te
 * persigue por un despiste.
 */
function tarjetaFallos(a, infantil) {
  const pendientes = fallosPendientes(a);
  if (pendientes.length < 5) return '';
  return `
    <div style="height:14px"></div>
    <button onclick="empiezaRepasoFallos(${Math.min(10, pendientes.length)})"
            style="width:100%;display:flex;align-items:center;gap:12px;background:#FF6B6B1F;
                   border:2px solid #FF6B6B59;border-radius:var(--radio);padding:16px;cursor:pointer;
                   font:inherit;color:inherit;text-align:left">
      <span style="font-size:${infantil ? 34 : 26}px">${infantil ? '🔁' : '📒'}</span>
      <span style="flex:1">
        <strong style="display:block;font-size:${infantil ? 22 : 17}px">
          ${infantil ? 'Otra vez esas' : 'Repasa tus fallos'}</strong>
        <small style="font-size:var(--letra-pequena);color:var(--tinta-suave)">
          ${infantil ? 'Las preguntas que fallaste'
                     : pendientes.length + ' preguntas que fallaste, listas para sacártelas'}</small>
      </span>
      <span style="font-size:${infantil ? 28 : 22}px;color:#FF6B6B">▶</span>
    </button>`;
}

/**
 * El reto semanal solo en Primaria: un objetivo de siete días se sostiene sobre leer un
 * número y acordarse de él, y un niño de cuatro años no hace ninguna de las dos cosas.
 */
function tarjetaReto(a) {
  const r = retoDeLaSemana(a);
  const cobrado = (a.retosCobrados || {})[r.semana];
  const dias = diasQueQuedan();
  return `
    <div style="height:14px"></div>
    <div style="background:var(--tarjeta);border-radius:var(--radio);padding:16px;
                box-shadow:0 1px 4px rgba(0,0,0,.1)">
      <div style="display:flex;align-items:center;gap:8px">
        <span style="font-size:20px">🎯</span>
        <span style="flex:1">
          <small style="display:block;font-size:11px;font-weight:900;color:var(--tinta-suave)">
            Reto de la semana</small>
          <strong style="font-size:17px">${r.titulo}</strong>
        </span>
        ${!r.completado ? `<small style="font-weight:700;color:${dias <= 2 ? '#FF6B6B' : 'var(--tinta-suave)'}">
            ${dias === 1 ? 'último día' : dias + ' días'}</small>` : ''}
      </div>
      <div class="barra" style="--color:${r.completado ? '#3DDC97' : '#12B5E5'};--pista:#12B5E526;
                                height:10px;margin-top:10px"><i style="width:${r.avance * 100}%"></i></div>
      <small style="display:block;font-size:var(--letra-pequena);color:var(--tinta-suave);margin-top:6px">
        ${Math.min(r.logrado, r.objetivo)} de ${r.objetivo} · ${r.explica}</small>
      ${cobrado ? `<div style="margin-top:10px;font-size:12px;font-weight:700;color:#3DDC97">
            ✅ Premio cobrado. El lunes hay reto nuevo.</div>`
        : r.completado ? `<button onclick="cobraReto()" style="width:100%;margin-top:12px;border:none;
              border-radius:14px;background:#3DDC97;color:#fff;padding:12px;font-weight:900;
              font-size:15px;cursor:pointer">¡Conseguido! Recoger ⭐ ${r.premio}</button>`
        : `<div style="margin-top:4px;font-size:12px;font-weight:700;color:#FFC93C">
              Premio: ⭐ ${r.premio}</div>`}
    </div>`;
}

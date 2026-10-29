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
  // Estos tres se guardaban (o ni eso) pero no se leían al arrancar: el interruptor
  // de "Voz automática" aparecía apagado cada vez que se recargaba la página.
  voz: almacen.leer('voz', false),
  sonido: almacen.leer('sonido', true),
  vibrar: almacen.leer('vibrar', true),
  pin: almacen.leer('pin', null),
  letraGrande: almacen.leer('letraGrande', false),
  tanda: almacen.leer('tanda', 10),
  pantalla: 'perfiles',
  pestana: 'cuadernos',
  materia: null,
  sesion: null
};

function alumnoActual() { return estado.alumnos.find(a => a.id === estado.actual) || null; }
function guardaTodo() {
  almacen.guardar('alumnos', estado.alumnos);
  almacen.guardar('actual', estado.actual);
  // El espejo para el panel de control. Va con freno de 8 segundos dentro,
  // así que se puede llamar en cada respuesta sin saturar nada.
  if (typeof sincronizaNube === 'function') sincronizaNube(alumnoActual());
}

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
  // El alta y el cambio de curso van SIEMPRE con la piel de Infantil: son las dos
  // pantallas que ve un adulto con el niño al lado, antes de que haya curso elegido,
  // y la crema con el marco gordo se entiende a cualquier edad. La piel de Primaria
  // empieza en cuanto se entra a repasar.
  const etapa = (estado.pantalla === 'nuevo' || estado.pantalla === 'curso')
    ? 'infantil' : curso.etapa;
  document.body.dataset.etapa = etapa;
  document.body.dataset.oscuro = estado.oscuro ? 'si' : 'no';
  document.body.dataset.letra = estado.letraGrande ? 'grande' : 'normal';
}

function pinta() {
  aplicaPiel();
  const pantallas = {
    perfiles: pintaPerfiles,
    nuevo: pintaNuevo,
    curso: pintaCurso,
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

/* Alta de alumno: pantalla propia, como en la app. Antes esto se hacía con las
   ventanitas del navegador y había que escribir el curso en clave ("p4"), que
   para un padre o una maestra no significa nada. */
function nuevoAlumno() {
  estado.nuevo = { nombre: '', avatar: AVATARES[Math.floor(Math.random() * AVATARES.length)], curso: '' };
  estado.pantalla = 'nuevo'; pinta();
}

/* ===================================================================
   EL SELECTOR DE CURSO

   Se usa en los dos sitios donde hay que elegir curso: al dar de alta a
   un alumno y al cambiarlo de curso. Está escrito una sola vez a
   propósito: si estuviera dos veces, acabarían siendo distintos.

   No se enseñan códigos ("p4") ni nombres sueltos: se enseña el curso
   como lo diría una madre —"4º de Primaria, 9-10 años"— porque quien
   elige aquí casi nunca es el niño.
   =================================================================== */

/** La edad típica del curso, sacada del nivel. Ayuda a quien duda entre dos. */
function edadDe(curso) {
  if (curso.etapa === 'infantil') {
    const a = 3 + Math.round(curso.lvl * 2);      // 0 -> 3, 0.5 -> 4, 1 -> 5
    return a + '-' + (a + 1) + ' años';
  }
  const a = 4 + Math.round(curso.lvl);            // 2 -> 6, 7 -> 11
  return a + '-' + (a + 1) + ' años';
}

/**
 * Dibuja los nueve cursos en tarjetas.
 * @param elegido  id del curso marcado ahora mismo ('' si ninguno)
 * @param alPulsar nombre de la función JS que recibe el id, p. ej. 'eligeCurso'
 */
function selectorDeCurso(elegido, alPulsar) {
  const tarjeta = (c, color) => {
    const marcada = elegido === c.id;
    const grande = c.etapa === 'infantil'
      ? c.nombre.replace('Infantil ', '').replace(' años', '')
      : c.nombre.replace(' Primaria', '');
    // En Infantil el curso ES la edad, así que repetir "3" y "3-4 años" sobra:
    // se pone "3 / años / Infantil", que es como lo dice todo el mundo.
    const bajo = c.etapa === 'infantil' ? 'años' : 'Primaria';
    const pie = c.etapa === 'infantil' ? 'Infantil' : edadDe(c);
    return `
      <button onclick="${alPulsar}('${c.id}')" style="position:relative;cursor:pointer;font:inherit;
              padding:16px 6px 13px;border-radius:22px;text-align:center;
              background:${marcada ? color : '#fff'};
              color:${marcada ? '#fff' : 'var(--tinta)'};
              border:4px solid ${marcada ? color : color + '33'};
              box-shadow:${marcada ? '0 6px 16px ' + color + '66' : '0 2px 0 ' + color + '22'};
              transform:${marcada ? 'translateY(-2px)' : 'none'};transition:transform .12s">
        ${marcada ? `<span style="position:absolute;top:-9px;right:-7px;width:26px;height:26px;
             border-radius:50%;background:#fff;color:${color};border:3px solid ${color};
             display:grid;place-items:center;font-size:13px;font-weight:900">✓</span>` : ''}
        <span style="display:block;font-size:30px;font-weight:900;line-height:1.05">${grande}</span>
        <span style="display:block;font-size:12px;font-weight:800;letter-spacing:.04em;
                     opacity:${marcada ? .95 : .7};margin-top:3px">${bajo}</span>
        <span style="display:block;font-size:11px;font-weight:700;
                     opacity:${marcada ? .85 : .5};margin-top:3px">${pie}</span>
      </button>`;
  };

  const bloque = (titulo, ico, cursos, color) => `
    <div style="display:flex;align-items:center;gap:9px;margin:20px 0 10px">
      <span style="width:34px;height:34px;border-radius:12px;background:${color}2E;display:grid;
                   place-items:center;font-size:19px">${ico}</span>
      <span style="font-weight:900;font-size:15px;letter-spacing:.03em;color:var(--tinta)">${titulo}</span>
      <span style="flex:1;height:3px;border-radius:3px;background:${color}33"></span>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:11px">
      ${cursos.map(c => tarjeta(c, color)).join('')}
    </div>`;

  return bloque('Infantil', '🧸', CURSOS.filter(c => c.etapa === 'infantil'), '#3DDC97') +
         bloque('Primaria', '🎒', CURSOS.filter(c => c.etapa === 'primaria'), '#12B5E5');
}

/**
 * La cabecera de las dos pantallas de curso: Dani, un título grande y una frase.
 *
 * Dani sale aquí porque es la primera vez que el niño lo ve: cuando llegue a las
 * preguntas ya lo conoce, y la recompensa de que salga celebrando vale más.
 */
function cabeceraConDani(titulo, frase, atras) {
  return `
    <div style="position:relative;margin:-6px -4px 4px;padding:18px 16px 16px;border-radius:0 0 30px 30px;
                background:linear-gradient(180deg,#FFF9EC 0%,rgba(255,249,236,0) 100%)">
      <button class="btn-chico hueco" onclick="${atras}"
              style="position:absolute;top:10px;left:6px">←</button>
      <div style="display:flex;flex-direction:column;align-items:center;text-align:center">
        <canvas id="dani-cabecera" style="width:104px;height:104px"></canvas>
        <h1 style="margin:4px 0 2px;font-size:25px;font-weight:900;color:var(--tinta)">${titulo}</h1>
        <p style="margin:0;font-size:14px;font-weight:700;color:var(--tinta-suave)">${frase}</p>
      </div>
    </div>`;
}

function pintaNuevo() {
  const n = estado.nuevo;
  const avatares = AVATARES.map(v => `
    <button onclick="eligeAvatar('${v}')" style="box-sizing:border-box;width:100%;font-size:32px;
            line-height:1;padding:11px 0;cursor:pointer;border-radius:20px;background:#fff;
            transition:transform .12s;transform:${n.avatar === v ? 'scale(1.06)' : 'none'};
            border:4px solid ${n.avatar === v ? '#FFC93C' : 'rgba(74,59,42,.10)'};
            box-shadow:${n.avatar === v ? '0 4px 12px rgba(255,201,60,.5)' : 'none'}">${v}</button>`).join('');

  const listo = n.nombre.trim().length >= 2 && !!n.curso;
  const rotulo = t => `<div style="font-weight:900;font-size:14px;color:var(--tinta);margin:20px 0 8px">${t}</div>`;

  app().innerHTML = `
    <div class="contenido">
      ${cabeceraConDani('Nuevo alumno', '¿Quién va a repasar?', "estado.pantalla='perfiles';pinta()")}

      ${rotulo('¿Cómo te llamas?')}
      <input id="campo-nombre" value="${escapaHtml(n.nombre)}" maxlength="20" autocomplete="off"
             oninput="estado.nuevo.nombre=this.value;document.getElementById('btn-crear').disabled=!(this.value.trim().length>=2&&estado.nuevo.curso)"
             placeholder="Escribe tu nombre"
             style="width:100%;box-sizing:border-box;padding:16px;font:inherit;font-size:21px;
                    font-weight:800;text-align:center;border:4px solid #12B5E54D;border-radius:22px;
                    background:#fff;color:var(--tinta)">

      ${rotulo('Elige tu dibujo')}
      <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:9px">${avatares}</div>

      ${rotulo('¿En qué curso estás?')}
      ${selectorDeCurso(n.curso, 'eligeCurso')}

      <button id="btn-crear" ${listo ? '' : 'disabled'} onclick="creaAlumno()"
              style="width:100%;margin-top:26px;padding:19px;border:none;border-radius:24px;
                     background:#3DDC97;color:#fff;font:inherit;font-weight:900;font-size:19px;
                     cursor:pointer;box-shadow:0 5px 0 #2BB97C">¡Empezar a repasar!</button>
      <div style="height:26px"></div>
      <style>#btn-crear:disabled{opacity:.4;cursor:default;box-shadow:none}</style>
    </div>`;

  animaDani(document.getElementById('dani-cabecera'), { animo: 'alegre' });
  const c = document.getElementById('campo-nombre');
  if (c && !n.nombre) c.focus();
}

function eligeAvatar(v) { estado.nuevo.avatar = v; pinta(); }
function eligeCurso(id) { estado.nuevo.curso = id; pinta(); }

function creaAlumno() {
  const n = estado.nuevo;
  if (n.nombre.trim().length < 2 || !cursoPorId(n.curso)) return;
  const a = {
    id: 'p_' + Date.now().toString(36),
    nombre: comoNombrePropio(n.nombre.trim()),
    avatar: n.avatar,
    curso: n.curso, estrellas: 0, estrellasTotal: 0, racha: 0,
    stats: {}, historial: [], fallos: [],
    daniColor: 'color_azul', daniGorro: '', daniGafas: false, comprados: []
  };
  estado.alumnos.push(a); estado.actual = a.id;
  olvidarRecientes(); guardaTodo();
  estado.pantalla = 'principal'; pinta();
}

function eligeAlumno(id) { estado.actual = id; olvidarRecientes(); guardaTodo(); estado.pantalla = 'principal'; pinta(); }


/**
 * LO QUE DICE DANI EN EL INICIO.
 *
 * Dani salía solo al responder una pregunta, y es el mejor personaje que tiene la
 * app. Aquí saluda y, sobre todo, DICE ALGO ÚTIL: la materia que lleva días sin
 * tocar, la racha que puede perder hoy, los fallos que tiene pendientes. Es el
 * empujón que en la app de Android da el recordatorio diario, pero dentro.
 *
 * Nunca riñe. "Hoy no has hecho nada" no mueve a un niño de nueve años; "te queda
 * una para la medalla", sí.
 */
function fraseDeDani(a, curso) {
  const deAntes = (typeof fallosDeOtrosDias === 'function') ? fallosDeOtrosDias(a) : [];
  if (deAntes.length >= 3) return '¿Sacamos las de ayer? 🌅';

  const dias = (typeof racha === 'function') ? racha(a) : 0;
  const hoy = new Date().toDateString();
  const hechoHoy = (a.historial || []).some(h => new Date(h.d).toDateString() === hoy);
  if (dias >= 2 && !hechoHoy) return `¡Llevas ${dias} días seguidos! No lo pierdas 🔥`;

  // La materia más olvidada: la que menos ha practicado de su curso.
  const materias = materiasDe(curso);
  const sinTocar = materias.filter(m => !a.stats[m.id] || !a.stats[m.id].hechas);
  if (sinTocar.length) {
    const m = sinTocar[Math.floor(Math.random() * sinTocar.length)];
    return `Hoy no has tocado ${m.nombre} ${m.icono}`;
  }

  const flojo = materias
    .map(m => ({ m, st: a.stats[m.id] }))
    .filter(x => x.st && x.st.hechas >= 4)
    .sort((x, y) => (x.st.ok / x.st.hechas) - (y.st.ok / y.st.hechas))[0];
  if (flojo && flojo.st.ok / flojo.st.hechas < 0.7) {
    return `${flojo.m.nombre} se te resiste un poco ${flojo.m.icono}`;
  }
  return curso.nombre + ' · ¡vas muy bien! 💪';
}

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

  // La tienda de Dani es la mejor mecánica que tiene la app y estaba escondida en
  // Progreso. Ahora se entra tocando las estrellas, que es donde el niño mira. Y si
  // ya le llega para algo que no tiene, sale un punto: no hace falta saber leer.
  const puede = a && CATALOGO_DANI.some(x => x.precio > 0 && x.precio <= a.estrellas
                                             && !(a.comprados || []).includes(x.id));

  return `
    <div class="cabecera">
      <img class="logo" src="icono-192.png" alt="Danivia School">
      <div class="marca"><b>DANIVIA SCHOOL</b><small>REPASO ESCOLAR · GVA</small></div>
      <button class="pastilla" id="pastilla-estrellas" onclick="estado.pantalla='tienda';pinta()"
              style="border:none;cursor:pointer;font:inherit;position:relative">
        ⭐ <span id="contador-estrellas">${a ? a.estrellas : estrellas}</span>
        ${puede ? `<span style="position:absolute;top:-3px;right:-3px;width:11px;height:11px;
             border-radius:50%;background:#FF6B6B;border:2px solid var(--fondo)"></span>` : ''}
      </button>
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

  const tarjetas = materiasDe(curso).map((m, i) => {
    const retraso = `animation-delay:${i * 45}ms`;
    const st = a.stats[m.id];
    const empezada = st && st.hechas > 0;
    const pct = empezada ? Math.round(st.ok * 100 / st.hechas) : 0;

    if (infantil) {
      return `<button class="tarjeta-infantil entra" style="--color:${m.color};--suave:${m.color}2E;${retraso}"
                onclick="abreMateria('${m.id}')">
                <span class="cuadro">${m.icono}</span>
                <span class="nombre">${m.nombre}
                  <span class="barra" style="--color:${m.color};--pista:${m.color}2E;height:14px;margin-top:8px">
                    <i style="width:${pct}%"></i></span>
                </span>
                <span class="flecha">▶</span>
              </button>`;
    }
    return `<button class="cuaderno entra" style="--color:${m.color};--papel:${m.color}12;--pista:${m.color}26;${retraso}"
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
      <canvas id="dani-saludo" style="width:${infantil ? 62 : 56}px;height:${infantil ? 62 : 56}px"></canvas>
      <div style="flex:1">
        <h1>${infantil ? '¡Hola, ' + a.nombre + '!' : saludo() + ', ' + a.nombre}</h1>
        <div class="curso">${infantil ? curso.nombre : escapaHtml(fraseDeDani(a, curso))}</div>
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

  // Dani saluda también en Primaria: es el personaje de la app, no un adorno de Infantil.
  animaDani(document.getElementById('dani-saludo'), { animo: 'alegre', ...aspectoDani(a) });
}

function aspectoDani(a) {
  return { cuerpo: colorDaniDe(a.daniColor), gorro: gorroDe(a.daniGorro), gafas: !!a.daniGafas };
}

/* Cambiar de curso tenía la misma chapuza que el alta: una ventanita del navegador
   pidiendo que escribieras "p4". Ahora es una pantalla con los cursos en botones. */
function cambiaCurso() { estado.pantalla = 'curso'; pinta(); }

function pintaCurso() {
  const a = alumnoActual();
  app().innerHTML = `
    <div class="contenido">
      ${cabeceraConDani('Cambiar de curso',
         escapaHtml(a.nombre) + ' está ahora en ' + cursoPorId(a.curso).nombre,
         "estado.pantalla='principal';pinta()")}
      ${selectorDeCurso(a.curso, 'eligeCursoDeAlumno')}
      <div style="background:#fff;border:4px solid rgba(74,59,42,.10);border-radius:22px;padding:16px;
                  margin-top:22px;font-size:13px;line-height:1.55;color:var(--tinta-suave)">
        🔒 El progreso de cada curso se guarda por separado: si vuelve al curso anterior,
        se encontrará sus estrellas y sus temas tal y como los dejó.
      </div>
      <div style="height:26px"></div>
    </div>`;

  animaDani(document.getElementById('dani-cabecera'), { animo: 'tranquilo', ...aspectoDani(a) });
}

function eligeCursoDeAlumno(nuevo) {
  const a = alumnoActual();
  if (!a || !cursoPorId(nuevo)) return;
  if (nuevo !== a.curso) {
    // Mismo mecanismo que Profile.cambiarDeCurso: el progreso de cada curso
    // se guarda aparte, para que lo de 5º no aparezca en 3º.
    a.porCurso = a.porCurso || {};
    a.porCurso[a.curso] = { stats: a.stats, historial: a.historial };
    const caja = a.porCurso[nuevo];
    a.stats = caja ? caja.stats : {};
    a.historial = caja ? caja.historial : [];
    delete a.porCurso[nuevo];
    a.curso = nuevo;
    olvidarRecientes();   // las preguntas vistas en el otro curso no cuentan aquí
    guardaTodo();
  }
  estado.pantalla = 'principal'; pinta();
}

/* ---------- El camino de temas ---------- */
function abreMateria(id) { estado.materia = id; estado.pantalla = 'temas'; pinta(); }

/**
 * EL CAMINO DE TEMAS.
 *
 * Es la pantalla donde el niño decide qué va a hacer, así que es la que más tiene
 * que apetecer. Es un tablero: cielo, nubes, una senda que serpentea entre la
 * hierba y las casillas de cada tema, con su meta al final.
 *
 * DOS DECISIONES QUE VIENEN DE PROBARLO:
 *
 * 1. Tocar una casilla ENTRA DIRECTO al ejercicio. Antes abría una ficha con los
 *    botones de 10/25/50 y había que dar un segundo toque. Un niño no quiere
 *    configurar nada: quiere jugar. Cuántas preguntas se elige UNA VEZ arriba, se
 *    recuerda para la próxima, y ya no estorba más.
 *
 * 2. Cada casilla lleva su aro de progreso alrededor. Así el camino no solo dice
 *    "por dónde vas", también "cómo llevas cada cosa", sin leer ni un número.
 */
function pintaTemas() {
  const a = alumnoActual();
  const curso = cursoPorId(a.curso);
  const infantil = curso.etapa === 'infantil';
  const m = materiasDe(curso).find(x => x.id === estado.materia);
  const temas = temasDe(m.id);
  const tandas = infantil ? [5, 10] : [10, 25, 50];
  if (!tandas.includes(estado.tanda)) estado.tanda = tandas[0];

  const estadoDe = t => {
    const s = estadisticaTema(a, m.id, t);
    const pct = s.hechas ? Math.round(s.ok * 100 / s.hechas) : 0;
    return { s, pct, dominado: s.hechas >= 10 && pct >= 80, empezado: s.hechas > 0 };
  };
  const dominados = temas.filter(t => estadoDe(t).dominado).length;
  const actual = temas.find(t => !estadoDe(t).dominado) || temas[temas.length - 1];

  const COLORES = ['#12B5E5', '#FF6B6B', '#FFC93C', '#3DDC97', '#9B7BFF', '#FF9F68', '#F06292', '#26C6DA'];
  const ADORNOS = ['🌳', '🌼', '🎈', '🪁', '🌻', '🦋', '🌈', '🐞', '🍀', '🐝'];

  const carriles = [20, 46, 72, 46];
  const alto = infantil ? 112 : 104, arriba = 56;
  const punto = i => ({ x: carriles[i % carriles.length], y: arriba + i * alto });
  const altoTotal = arriba + (temas.length - 1) * alto + 96;

  let d = '';
  temas.forEach((t, i) => {
    const p = punto(i);
    if (i === 0) { d += `M ${p.x} ${p.y} `; return; }
    const ant = punto(i - 1);
    const medio = (ant.y + p.y) / 2;
    d += `C ${ant.x} ${medio}, ${p.x} ${medio}, ${p.x} ${p.y} `;
  });

  const casillas = temas.map((t, i) => {
    const e = estadoDe(t);
    const p = punto(i);
    const color = COLORES[i % COLORES.length];
    const esActual = t === actual;
    const lado = infantil ? 72 : 64;
    const fondo = e.dominado ? '#FFC93C' : e.empezado ? color : '#FFFFFF';
    const tinta = (e.dominado || e.empezado) ? '#fff' : color;
    const aLaDerecha = p.x < 50;

    // El aro de progreso: cuánto lleva hecho de ese tema, sin números.
    const aro = e.empezado
      ? `background:conic-gradient(${e.dominado ? '#3DDC97' : color} ${e.pct * 3.6}deg, rgba(255,255,255,.8) 0);
         box-shadow:0 3px 8px rgba(0,0,0,.16)`
      : 'background:transparent';

    return `
      <div style="position:absolute;left:${p.x}%;top:${p.y}px;transform:translate(-50%,-50%);z-index:3;
                  width:${lado + 14}px;height:${lado + 14}px;border-radius:50%;${aro};
                  display:grid;place-items:center;animation-delay:${i * 45}ms" class="entra">
        <button onclick="empiezaQuiz('${m.id}','${t.replace(/'/g, "\\'")}',${estado.tanda})"
          class="${esActual ? 'late' : ''}" aria-label="${escapaHtml(t)}"
          style="width:${lado}px;height:${lado}px;border-radius:50%;cursor:pointer;font:inherit;padding:0;
                 background:${fondo};color:${tinta};font-weight:900;font-size:${infantil ? 27 : 23}px;
                 border:4px ${e.empezado ? 'solid' : 'dashed'} ${e.dominado ? '#E8A700' : color};
                 box-shadow:0 5px 0 ${e.dominado ? '#C98F00' : 'rgba(0,0,0,.18)'}">
          ${e.dominado ? '★' : i + 1}
        </button>
      </div>
      ${esActual ? `<span class="late" style="position:absolute;left:${p.x}%;
           top:${p.y + lado / 2 + 14}px;transform:translateX(-50%);z-index:5;
           background:#0B2A4A;color:#fff;font-size:11px;font-weight:900;letter-spacing:.04em;
           padding:3px 9px;border-radius:50px;white-space:nowrap">TE TOCA</span>` : ''}
      <span style="position:absolute;top:${p.y}px;transform:translateY(-50%);z-index:4;
           ${aLaDerecha ? `left:calc(${p.x}% + ${lado / 2 + 16}px)`
                        : `right:calc(${100 - p.x}% + ${lado / 2 + 16}px)`};
           max-width:150px;background:rgba(255,255,255,.92);border-radius:14px;
           padding:6px 10px;box-shadow:0 2px 6px rgba(0,0,0,.12);
           font-size:${infantil ? 14 : 12.5}px;font-weight:800;line-height:1.2;color:var(--tinta);
           text-align:${aLaDerecha ? 'left' : 'right'}">
        ${infantil ? ADORNOS[i % ADORNOS.length] + ' ' + (i + 1) : escapaHtml(t)}
        ${(!infantil && e.empezado) ? `<small style="display:block;font-size:10.5px;font-weight:700;
             color:${e.dominado ? '#2BA873' : 'var(--tinta-suave)'}">
             ${e.dominado ? '★ dominado' : e.s.hechas + ' hechas · ' + e.pct + '%'}</small>` : ''}
      </span>
      <span style="position:absolute;top:${p.y + 30}px;z-index:2;font-size:21px;opacity:.9;
           ${aLaDerecha ? `right:calc(${100 - p.x}% + ${lado / 2 + 14}px)`
                        : `left:calc(${p.x}% + ${lado / 2 + 14}px)`}">
           ${ADORNOS[(i * 3 + 1) % ADORNOS.length]}</span>`;
  }).join('');

  const chips = tandas.map(n => `
    <button onclick="eligeTanda(${n})" style="flex:1;cursor:pointer;font:inherit;border-radius:14px;
            padding:9px 0;font-weight:900;font-size:14px;border:none;
            background:${estado.tanda === n ? m.color : 'rgba(255,255,255,.75)'};
            color:${estado.tanda === n ? '#fff' : 'var(--tinta-suave)'};
            box-shadow:${estado.tanda === n ? '0 3px 0 rgba(0,0,0,.18)' : 'none'}">${n}</button>`).join('');

  app().innerHTML = marco(`
    <button class="btn-chico hueco" onclick="estado.pantalla='principal';pinta()">← Cuadernos</button>

    <div style="display:flex;align-items:center;gap:10px;margin:10px 0 2px">
      <span style="font-size:30px">${m.icono}</span>
      <span style="flex:1">
        <h2 class="titulo-seccion" style="font-size:21px;line-height:1.1">${m.nombre}</h2>
        <small style="font-weight:800;color:var(--tinta-suave)">
          ${dominados} de ${temas.length} temas dominados ★</small>
      </span>
    </div>

    <div style="background:var(--tarjeta);border-radius:20px;padding:12px 14px;margin:12px 0 10px;
                box-shadow:0 2px 6px rgba(0,0,0,.12)">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px">
        <span style="font-size:22px">🎯</span>
        <strong style="flex:1;font-size:14px">¿Cuántas preguntas?</strong>
        <button class="btn-chico" style="background:var(--sun)"
                onclick="empiezaQuiz('${m.id}',null,${estado.tanda})">🎲 Mezcladas</button>
      </div>
      <div style="display:flex;gap:8px">${chips}</div>
    </div>

    <p class="subtitulo" style="margin:0 0 6px">
      ${infantil ? 'Toca una casilla y a jugar' : 'Toca un tema del camino y empieza'}</p>

    <div class="tablero" style="position:relative;height:${altoTotal}px;border-radius:24px;overflow:hidden">
      <span style="position:absolute;top:14px;left:8%;font-size:24px;opacity:.85">☁️</span>
      <span style="position:absolute;top:34px;right:10%;font-size:19px;opacity:.75">☁️</span>
      <span style="position:absolute;top:10px;right:6%;font-size:26px">☀️</span>

      <svg width="100%" height="100%" style="position:absolute;inset:0;z-index:1" preserveAspectRatio="none"
           viewBox="0 0 100 ${altoTotal}">
        <path d="${d}" fill="none" stroke="#C9A227" stroke-opacity=".28" stroke-width="30"
              stroke-linecap="round" vector-effect="non-scaling-stroke"/>
        <path d="${d}" fill="none" stroke="#FFF6DC" stroke-width="24"
              stroke-linecap="round" vector-effect="non-scaling-stroke"/>
        <path class="senda" d="${d}" fill="none" stroke="#C9A227" stroke-opacity=".55" stroke-width="3"
              stroke-linecap="round" stroke-dasharray="10 14" vector-effect="non-scaling-stroke"/>
      </svg>

      ${casillas}

      <span style="position:absolute;left:${punto(temas.length - 1).x}%;
                   top:${punto(temas.length - 1).y + 62}px;transform:translateX(-50%);
                   z-index:3;text-align:center">
        <span style="font-size:34px;display:block">🏁</span>
        <span style="font-size:11px;font-weight:900;color:var(--tinta-suave)">META</span>
      </span>
    </div>
    <div style="height:14px"></div>`);
}

/** Cuántas preguntas por tanda. Se elige una vez y se recuerda. */
function eligeTanda(n) { estado.tanda = n; almacen.guardar('tanda', n); pinta(); }

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

let ultimaLeidaEnAlto = null;

function pintaQuiz() {
  const a = alumnoActual();
  const s = estado.sesion;
  const q = s.preguntas[s.indice];
  const curso = cursoPorId(a.curso);
  const infantil = curso.etapa === 'infantil';
  const m = materiasDe(curso).find(x => x.id === q.materia) || { color: '#12B5E5' };
  const letras = ['A', 'B', 'C', 'D', 'E', 'F'];

  // Hay preguntas de opciones (MC) y preguntas de escribir (INPUT). El motor de
  // la app trae las dos, así que la web tiene que saber pintar las dos.
  const esEscribir = q.tipo === 'INPUT' || !q.opciones.length;

  const opciones = esEscribir ? '' : q.opciones.map((o, i) => {
    const elegida = s.bloqueada && s.dada === o;
    const buena = o === q.respuesta;
    // Una opción que es solo un dibujito (🍎🍎🍎) se pinta grande en Infantil.
    const soloDibujo = !/[a-zA-Z0-9áéíóúñÁÉÍÓÚÑ]/.test(o);
    let fondo = 'var(--tarjeta)', tinta = 'var(--tinta)', marca = letras[i];
    if (s.bloqueada && buena) { fondo = '#3DDC97'; tinta = '#fff'; marca = '✓'; }
    else if (elegida) { fondo = '#FF6B6B'; tinta = '#fff'; marca = '✗'; }
    else if (s.bloqueada) { fondo = 'var(--tarjeta)'; tinta = 'var(--tinta-suave)'; }
    const cuerpo = infantil ? (soloDibujo ? 44 : 26) : (soloDibujo ? 26 : 16);
    const gesto = (s.bloqueada && buena) ? ' acierta' : (elegida ? ' falla' : '');
    return `<button onclick="respondeOpcion(${i})" ${s.bloqueada ? 'disabled' : ''} class="${gesto.trim()}"
              style="background:${fondo};color:${tinta};border:${s.bloqueada ? 'none' : '1.5px solid ' + m.color + '59'};
                     border-radius:${infantil ? 22 : 18}px;padding:${infantil ? 16 : 12}px;cursor:pointer;
                     font:inherit;font-weight:700;font-size:${cuerpo}px;min-height:${infantil ? 86 : 68}px;
                     box-shadow:${s.bloqueada ? 'none' : '0 1px 4px rgba(0,0,0,.1)'}">
              ${infantil ? '' : `<div style="font-size:12px;font-weight:900;opacity:.75;margin-bottom:4px">${marca}</div>`}
              ${escapaHtml(o)}
            </button>`;
  }).join('');

  // Caja de escribir: el niño teclea y pulsa Comprobar (o Enter).
  const caja = !esEscribir ? '' : `
    <div style="margin-top:18px">
      <input id="caja-respuesta" inputmode="text" autocomplete="off" ${s.bloqueada ? 'disabled' : ''}
             value="${s.bloqueada ? escapaHtml(s.dada || '') : ''}"
             onkeydown="if(event.key==='Enter')respondeEscrito()"
             placeholder="Escribe tu respuesta"
             style="width:100%;box-sizing:border-box;padding:${infantil ? 20 : 15}px;font:inherit;
                    font-size:${infantil ? 28 : 20}px;font-weight:700;text-align:center;
                    border:2px solid ${s.bloqueada ? (s.acierto ? '#3DDC97' : '#FF6B6B') : m.color + '80'};
                    border-radius:18px;background:var(--tarjeta);color:var(--tinta)">
      ${s.bloqueada ? '' : `<button onclick="respondeEscrito()" style="width:100%;margin-top:12px;
          padding:16px;border:none;border-radius:14px;background:${m.color};color:#fff;
          font-weight:700;font-size:16px;cursor:pointer">Comprobar</button>`}
    </div>`;

  const respuesta = !s.bloqueada ? '' : `
    <div style="display:flex;align-items:center;gap:10px;margin-top:14px">
      <canvas id="dani-quiz" style="width:${infantil ? 90 : 64}px;height:${infantil ? 90 : 64}px"></canvas>
      <div style="flex:1">
        <div style="font-weight:900;font-size:${infantil ? 22 : 19}px;
                    color:${s.acierto ? '#3DDC97' : '#FF6B6B'}">
          ${s.acierto ? (s.racha >= 3 ? '¡' + s.racha + ' seguidas! 🔥' : '¡Muy bien!') : 'Casi'}
        </div>
        ${!s.acierto ? `<div style="font-weight:700;font-size:14px">La respuesta correcta era: ${escapaHtml(q.respuesta)}</div>` : ''}
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
        <button class="btn-chico hueco" onclick="callaVoz();estado.pantalla='principal';pinta()">✕</button>
        <div class="barra" style="flex:1;--color:${m.color};--pista:${m.color}33;height:10px">
          <!-- Cuenta las CONTESTADAS, no las pasadas: antes, al responder la última,
               la barra se quedaba al 90% y el niño no la veía llenarse nunca. -->
          <i style="width:${(s.indice + (s.bloqueada ? 1 : 0)) * 100 / s.preguntas.length}%"></i></div>
        ${s.racha >= 2 ? `<span class="pastilla" style="background:#FFC93C40">🔥 ${s.racha}</span>` : ''}
        <!-- El contador de estrellas también DENTRO de la sesión: es donde aterriza la
             estrella de cada acierto. Verlas subir mientras responde es la mitad de la
             gracia; si solo se ven al salir, acertar no se nota. -->
        <span class="pastilla" id="pastilla-estrellas" style="background:#FFC93C33;font-weight:900">
          ⭐ <span id="contador-estrellas">${a.estrellas}</span></span>
        <strong style="font-size:14px">${s.indice + 1}/${s.preguntas.length}</strong>
      </div>

      ${q.lectura ? `<div style="background:var(--tarjeta);border-radius:var(--radio);padding:18px;
          margin-bottom:12px;font-size:15px;line-height:1.5;box-shadow:0 2px 6px rgba(0,0,0,.08)">
          <div style="font-weight:900;font-size:12px;letter-spacing:.06em;color:var(--tinta-suave);
                      margin-bottom:8px">LEE EL TEXTO</div>${escapaHtml(q.lectura)}</div>` : ''}

      <div style="background:var(--tarjeta);border-radius:var(--radio);padding:22px;text-align:center;
                  box-shadow:0 2px 6px rgba(0,0,0,.12);border:var(--marco) solid var(--sun)">
        <div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-bottom:10px">
          ${q.etiqueta && !infantil ? `<span class="pastilla" style="background:var(--fondo);font-size:12px">${q.etiqueta}</span>` : ''}
          <button onclick="leeEnAlto()" style="border:none;border-radius:50%;cursor:pointer;
                  background:${m.color}26;padding:${infantil ? 14 : 9}px;font-size:${infantil ? 30 : 17}px">🔈</button>
          ${(q.audio && q.audio.length) ? `<button onclick="tocaPregunta(estado.sesion.preguntas[estado.sesion.indice])"
                  style="border:none;border-radius:50%;cursor:pointer;background:#12B5E526;
                  padding:${infantil ? 14 : 8}px;font-size:${infantil ? 30 : 16}px">🔊</button>` : ''}
        </div>
        <div style="font-size:${infantil ? 28 : 24}px;font-weight:700;line-height:1.25">${escapaHtml(q.texto)}</div>
        ${q.visual ? `<div style="font-size:${infantil ? 56 : 30}px;margin-top:12px">${q.visual}</div>` : ''}
      </div>

      ${esEscribir ? caja
        : `<div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:18px">${opciones}</div>`}
      ${respuesta}
    </div>`;

  if (esEscribir && !s.bloqueada) {
    const c = document.getElementById('caja-respuesta');
    if (c) c.focus();
  }

  // VOZ AUTOMÁTICA. El interruptor existía en la Zona Familias desde el primer día...
  // y no hacía absolutamente nada: se guardaba el ajuste y ahí se quedaba. Ahora lee
  // la pregunta sola al aparecer, que es lo que un padre espera al encenderlo.
  // La marca evita que se repita la lectura cada vez que se repinta la pantalla.
  const marcaLectura = s.preguntas.length + '|' + s.indice;
  if (ultimaLeidaEnAlto !== marcaLectura && !s.bloqueada) {
    ultimaLeidaEnAlto = marcaLectura;
    // Las preguntas de Música suenan solas al aparecer, como en la app: si no, el
    // niño ve "¿cuántos sonidos has oído?" sin haber oído nada.
    if (q.audio && q.audio.length) tocaPregunta(q);
    else if (estado.voz) leeTexto(textoDeLaPregunta(q));
  }

  if (s.bloqueada) {
    animaDani(document.getElementById('dani-quiz'),
      { animo: s.acierto ? 'alegre' : 'pensativo', ...aspectoDani(a) });
  }
}

function textoDeLaPregunta(q) {
  // Si la pregunta lleva texto de lectura, se lee también: si no, el niño
  // que necesita el audio se queda sin la mitad del ejercicio.
  return q.lectura ? q.lectura + '. ' + q.texto : q.texto;
}

function leeEnAlto() {
  leeTexto(textoDeLaPregunta(estado.sesion.preguntas[estado.sesion.indice]));
}

/** Protege el HTML: las preguntas vienen del motor y pueden traer < > & " '. */
function escapaHtml(t) {
  return String(t == null ? '' : t)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

function respondeOpcion(i) {
  const s = estado.sesion;
  if (s.bloqueada) return;
  const o = s.preguntas[s.indice].opciones[i];
  // De dónde sale la estrella: del botón que acaba de tocar.
  const botones = document.querySelectorAll('div[style*="grid-template-columns"] > button');
  responde(o, o === s.preguntas[s.indice].respuesta, botones[i]);
}

function respondeEscrito() {
  const s = estado.sesion;
  if (s.bloqueada) return;
  const c = document.getElementById('caja-respuesta');
  const escrito = c ? c.value.trim() : '';
  if (!escrito) return;                       // vacío no cuenta como fallo
  const pregunta = s.preguntas[s.indice];
  responde(escrito, respuestaEscritaVale(escrito, pregunta.respuesta, pregunta), c);
}

function responde(dada, acierto, desde) {
  const s = estado.sesion;
  if (s.bloqueada) return;
  const q = s.preguntas[s.indice];
  // Dónde estaba lo que ha tocado, ANTES de repintar: después ya no existe.
  const origen = desde ? desde.getBoundingClientRect() : null;
  s.bloqueada = true; s.dada = dada; s.acierto = acierto;
  s.racha = acierto ? s.racha + 1 : 0;
  if (acierto) s.aciertos++;
  pita(acierto); vibra(acierto);
  registraRespuesta(alumnoActual(), q.materia, q.tema, acierto);
  apuntaFallo(alumnoActual(), q, acierto, !!s.esRepasoFallos);
  guardaTodo();
  pinta();
  // La estrella viaja al contador. Es lo que hace que acertar se note.
  if (acierto && origen) {
    estrellaQueVuela({ getBoundingClientRect: () => origen });
  }

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
    const mat = s.mezcla ? null : materiasDe(cursoPorId(a.curso)).find(x => x.id === s.materiaId);
    a.historial.unshift({ d: Date.now(), s: mat ? mat.nombre : 'Repaso mezclado', ok, n });
    // Las últimas 30, igual que la app. Sin tope, el historial crece para siempre
    // dentro del navegador y acaba ocupando más que todo lo demás junto.
    while (a.historial.length > 30) a.historial.pop();
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
    caja.classList.remove('sube'); void caja.offsetWidth; caja.classList.add('sube');
  }, 300);

  // CONFETI. Un pleno sin celebrar es un pleno desperdiciado: el niño ha hecho lo
  // máximo que se le puede pedir y la pantalla le responde con un número. Cae al
  // terminar de ponerse las estrellas, no antes, para que no se pisen.
  if (estrellas >= 2) setTimeout(() => confeti(estrellas === 3 ? 2 : 1), 300 * estrellas + 150);

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

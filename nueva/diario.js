/* ===================================================================
   MI DIARIO — el calendario de lo que se ha ido haciendo.

   QUÉ ES. Un calendario del mes con los días trabajados pintados, y al
   tocar un día, lo que hizo ese día: cuántas preguntas, de qué, cuántas
   acertó y a qué jugó. Más una pegatina de cómo le fue, que la pone él.

   POR QUÉ ASÍ Y NO UNA RACHA DE FUEGO. Una racha mete prisa y castiga
   al que un día no puede, y hablamos de niños de seis años. Un diario
   hace lo contrario: mira hacia atrás y enseña lo que YA ha hecho. Y
   como se rellena solo con lo que la app ya apuntaba, nunca está vacío
   ni hay que acordarse de escribir nada.

   DÓNDE SE GUARDA. En la ficha del alumno (a.diario), en el aparato.
   NO se manda al panel: el espejo de Firestore se arma con una lista
   fija de campos (ver nube.js) y este no está en ella, así que ni el
   documento ni las reglas cambian. Si algún día se quiere en el panel,
   será una decisión aparte y pensada.
   =================================================================== */

/* Cuántos días se guardan. Un año largo: a ~120 bytes por día son unos
   50 KB, nada al lado de lo que ya ocupa el resto, y evita que la ficha
   crezca para siempre en el navegador de una tablet del colegio. */
const DIARIO_DIAS = 400;

const DIARIO_PEGATINAS = ['😀', '🙂', '😐', '😓', '💪'];
const DIARIO_MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
                      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

/** La clave de un día, en hora local: 2026-10-31. */
function diarioClave(fecha) {
  const d = new Date(fecha);
  return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0')
         + '-' + String(d.getDate()).padStart(2, '0');
}

/** El cajón de hoy, creándolo si hace falta. */
function diarioHoy(a) {
  if (!a.diario) a.diario = {};
  const k = diarioClave(Date.now());
  if (!a.diario[k]) a.diario[k] = {};
  return a.diario[k];
}

/** Tira los días más viejos cuando ya hay de sobra. */
function diarioPoda(a) {
  const claves = Object.keys(a.diario || {});
  if (claves.length <= DIARIO_DIAS) return;
  claves.sort();
  claves.slice(0, claves.length - DIARIO_DIAS).forEach(k => delete a.diario[k]);
}

/** Se llama al terminar un cuaderno. */
function diarioApuntaSesion(a, materia, aciertos, preguntas) {
  const d = diarioHoy(a);
  d.p = (d.p || 0) + preguntas;
  d.ok = (d.ok || 0) + aciertos;
  d.m = d.m || {};
  d.m[materia] = (d.m[materia] || 0) + 1;
  diarioPoda(a);
}

/** Se llama al salir de un juego que SE HA TERMINADO, no al abrirlo y cerrarlo. */
function diarioApuntaJuego(a, nombre) {
  if (!nombre) return;
  const d = diarioHoy(a);
  d.j = d.j || {};
  d.j[nombre] = (d.j[nombre] || 0) + 1;
  diarioPoda(a);
}

/* El mes que se está mirando y el día abierto. Viven aquí y no en el estado
   general: son cosa de esta pantalla y nadie más las necesita. */
let diarioMes = null;      // Date del día 1 del mes que se mira
let diarioDia = null;      // clave del día abierto


/* =========================== LA PANTALLA =========================== */

function pintaDiario() {
  const a = alumnoActual();
  if (!a) { estado.pantalla = 'perfiles'; return pinta(); }
  if (!a.diario) a.diario = {};
  const infantil = cursoPorId(a.curso).etapa === 'infantil';

  const hoy = new Date();
  if (!diarioMes) diarioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

  const año = diarioMes.getFullYear(), mes = diarioMes.getMonth();
  const diasMes = new Date(año, mes + 1, 0).getDate();
  // La semana empieza en lunes, como aquí: getDay() da 0 al domingo.
  const primero = (new Date(año, mes, 1).getDay() + 6) % 7;

  // ¿Se puede avanzar? Nunca más allá del mes actual: no hay futuro que enseñar.
  const haySiguiente = año < hoy.getFullYear() || (año === hoy.getFullYear() && mes < hoy.getMonth());

  /* --- Resumen del mes --- */
  let diasConAlgo = 0, preguntasMes = 0, aciertosMes = 0, juegosMes = 0;
  for (let n = 1; n <= diasMes; n++) {
    const d = a.diario[diarioClave(new Date(año, mes, n))];
    if (!d) continue;
    const jug = d.j ? Object.values(d.j).reduce((s, x) => s + x, 0) : 0;
    if (!d.p && !jug) continue;
    diasConAlgo++;
    preguntasMes += d.p || 0;
    aciertosMes += d.ok || 0;
    juegosMes += jug;
  }
  const pctMes = preguntasMes ? Math.round(aciertosMes * 100 / preguntasMes) : 0;

  /* --- Las casillas del calendario --- */
  const ladoCasilla = infantil ? 46 : 42;
  let casillas = '';
  for (let k = 0; k < primero; k++) casillas += '<span></span>';

  for (let n = 1; n <= diasMes; n++) {
    const fecha = new Date(año, mes, n);
    const k = diarioClave(fecha);
    const d = a.diario[k] || {};
    const jug = d.j ? Object.values(d.j).reduce((s, x) => s + x, 0) : 0;
    const preguntas = d.p || 0;
    const algo = preguntas > 0 || jug > 0;
    const futuro = fecha > hoy;
    const esHoy = k === diarioClave(hoy);
    const abierto = k === diarioDia;

    // Tres tonos según lo que se trabajó ese día: de un vistazo se ve si fue
    // un rato suelto o una tarde entera, sin tener que entrar en cada día.
    const fuerza = preguntas >= 25 ? 3 : preguntas >= 10 ? 2 : preguntas > 0 ? 1 : (jug ? 1 : 0);
    const fondo = ['transparent', '#3DDC973D', '#3DDC9780', '#3DDC97'][fuerza];
    const tinta = fuerza === 3 ? '#fff' : futuro ? 'var(--tinta-suave)' : 'var(--tinta)';

    casillas += `
      <button ${algo ? `onclick="abreDiaDiario('${k}')"` : 'disabled'}
        style="height:${ladoCasilla}px;border:none;border-radius:13px;font:inherit;
               cursor:${algo ? 'pointer' : 'default'};position:relative;display:grid;place-items:center;
               font-weight:${esHoy ? 900 : 700};font-size:${infantil ? 15 : 14}px;
               background:${fondo};color:${tinta};opacity:${futuro ? .35 : 1};
               box-shadow:${abierto ? 'inset 0 0 0 3px #0B2A4A'
                          : esHoy ? 'inset 0 0 0 2px #FF6B6B' : 'none'}">
        ${n}
        ${d.e ? `<span style="position:absolute;bottom:2px;right:3px;font-size:11px;
             line-height:1">${d.e}</span>` : ''}
      </button>`;
  }

  /* --- La ficha del día abierto --- */
  let ficha = '';
  if (diarioDia && a.diario[diarioDia]) {
    const d = a.diario[diarioDia];
    const [aa, mm, dd] = diarioDia.split('-').map(Number);
    const fecha = new Date(aa, mm - 1, dd);
    const pct = d.p ? Math.round((d.ok || 0) * 100 / d.p) : null;

    const materias = d.m ? Object.entries(d.m).map(([nombre, veces]) =>
      `<span class="pastilla" style="background:#12B5E52E;font-size:12px;font-weight:800">
         ${escapaHtml(nombre)}${veces > 1 ? ' ×' + veces : ''}</span>`).join(' ') : '';
    const juegos = d.j ? Object.entries(d.j).map(([nombre, veces]) =>
      `<span class="pastilla" style="background:#9B7BFF2E;font-size:12px;font-weight:800">
         ${escapaHtml(nombre)}${veces > 1 ? ' ×' + veces : ''}</span>`).join(' ') : '';

    const pegatinas = DIARIO_PEGATINAS.map(e => `
      <button onclick="ponPegatina('${diarioDia}','${e}')"
        style="width:40px;height:40px;border:none;border-radius:13px;cursor:pointer;font-size:21px;
               background:${d.e === e ? '#FFC93C' : 'rgba(11,42,74,.06)'};
               box-shadow:${d.e === e ? '0 3px 0 rgba(11,42,74,.2)' : 'none'}">${e}</button>`).join('');

    ficha = `
      <div style="background:var(--tarjeta);border-radius:22px;padding:16px;margin-top:16px;
                  box-shadow:0 2px 8px rgba(0,0,0,.1)">
        <strong style="font-size:16px;font-weight:900">
          ${dd} de ${DIARIO_MESES[mm - 1]}</strong>
        ${d.p ? `
          <div style="display:flex;gap:18px;margin-top:12px">
            <div><div style="font-size:22px;font-weight:900">${d.p}</div>
                 <small style="font-size:11px;color:var(--tinta-suave)">preguntas</small></div>
            <div><div style="font-size:22px;font-weight:900;color:#3DDC97">${pct}%</div>
                 <small style="font-size:11px;color:var(--tinta-suave)">de aciertos</small></div>
          </div>` : ''}
        ${materias ? `<div style="margin-top:12px;display:flex;flex-wrap:wrap;gap:6px">${materias}</div>` : ''}
        ${juegos ? `<div style="margin-top:8px;display:flex;flex-wrap:wrap;gap:6px">${juegos}</div>` : ''}

        <div style="margin-top:16px;border-top:1px solid rgba(11,42,74,.08);padding-top:12px">
          <small style="font-size:12px;font-weight:800;color:var(--tinta-suave)">
            ¿Cómo te fue ese día?</small>
          <div style="display:flex;gap:7px;margin-top:8px">${pegatinas}</div>
        </div>
      </div>`;
  }

  const vacio = !Object.keys(a.diario).length;

  app().innerHTML = marco(`
    <div style="display:flex;align-items:center;gap:10px">
      <button onclick="cierraDiario()" style="border:none;background:var(--tarjeta);cursor:pointer;
              border-radius:50%;width:38px;height:38px;font-size:17px;color:var(--tinta);
              box-shadow:0 1px 4px rgba(0,0,0,.1)">‹</button>
      <div>
        <h2 class="titulo-seccion" style="margin:0">Mi diario</h2>
        <p class="subtitulo" style="margin:0">Todo lo que has ido haciendo</p>
      </div>
    </div>

    ${vacio ? `
      <div style="text-align:center;margin-top:50px;opacity:.75">
        <div style="font-size:52px">📔</div>
        <strong style="display:block;margin-top:10px;font-size:17px">Tu diario está en blanco</strong>
        <p style="font-size:14px;color:var(--tinta-suave);margin-top:6px;line-height:1.5">
          Haz un cuaderno y mañana podrás ver aquí lo que hiciste hoy.</p>
      </div>` : `

      <div style="display:flex;align-items:center;gap:8px;margin-top:18px">
        <button onclick="mueveMesDiario(-1)" style="border:none;background:var(--tarjeta);cursor:pointer;
                border-radius:13px;width:38px;height:38px;font-size:17px;color:var(--tinta);
                box-shadow:0 1px 4px rgba(0,0,0,.1)">‹</button>
        <strong style="flex:1;text-align:center;font-size:16px;font-weight:900;text-transform:capitalize">
          ${DIARIO_MESES[mes]} ${año}</strong>
        <button onclick="mueveMesDiario(1)" ${haySiguiente ? '' : 'disabled'}
                style="border:none;background:var(--tarjeta);cursor:pointer;border-radius:13px;
                width:38px;height:38px;font-size:17px;color:var(--tinta);
                opacity:${haySiguiente ? 1 : .35};box-shadow:0 1px 4px rgba(0,0,0,.1)">›</button>
      </div>

      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-top:14px">
        ${['L', 'M', 'X', 'J', 'V', 'S', 'D'].map(x => `
          <span style="text-align:center;font-size:11px;font-weight:900;
                       color:var(--tinta-suave)">${x}</span>`).join('')}
      </div>
      <div style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-top:5px">${casillas}</div>

      <div style="display:flex;gap:8px;margin-top:16px">
        <div style="flex:1;background:#3DDC9729;border-radius:18px;padding:12px 6px;text-align:center">
          <div style="font-weight:900;font-size:21px">${diasConAlgo}</div>
          <small style="font-size:11px;font-weight:700;opacity:.65">
            ${diasConAlgo === 1 ? 'día' : 'días'}</small></div>
        <div style="flex:1;background:#12B5E529;border-radius:18px;padding:12px 6px;text-align:center">
          <div style="font-weight:900;font-size:21px">${preguntasMes}</div>
          <small style="font-size:11px;font-weight:700;opacity:.65">preguntas</small></div>
        <div style="flex:1;background:#FFC93C29;border-radius:18px;padding:12px 6px;text-align:center">
          <div style="font-weight:900;font-size:21px">${preguntasMes ? pctMes + '%' : '—'}</div>
          <small style="font-size:11px;font-weight:700;opacity:.65">acierto</small></div>
      </div>

      ${ficha}
      ${diasConAlgo ? '' : `<p class="subtitulo" style="text-align:center;margin-top:18px">
           En este mes todavía no hay nada apuntado.</p>`}
    `}
    <div style="height:24px"></div>`);
}

function abreDiaDiario(k) {
  diarioDia = (diarioDia === k) ? null : k;   // volver a tocarlo lo cierra
  pinta();
}

function mueveMesDiario(n) {
  const destino = new Date(diarioMes.getFullYear(), diarioMes.getMonth() + n, 1);
  // El tope va AQUÍ y no solo en el botón: el botón se puede desactivar, pero un
  // doble toque o cualquier otra llamada se saltaría la pantalla y acabaríamos
  // enseñando meses que todavía no han pasado, vacíos y sin sentido.
  const hoy = new Date();
  const tope = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
  if (destino > tope) return;
  diarioMes = destino;
  diarioDia = null;
  pinta();
}

function ponPegatina(k, e) {
  const a = alumnoActual();
  if (!a.diario || !a.diario[k]) return;
  // Volver a tocar la misma la quita: si se pone sin querer, hay forma de deshacerlo.
  a.diario[k].e = (a.diario[k].e === e) ? undefined : e;
  guardaTodo();
  pinta();
}

function abreDiario() {
  const a = alumnoActual();
  diarioMes = null;
  // Se abre con el día de hoy desplegado si hoy hay algo; si no, sin nada abierto.
  const k = diarioClave(Date.now());
  diarioDia = (a.diario && a.diario[k]) ? k : null;
  estado.pantalla = 'diario';
  pinta();
}

function cierraDiario() {
  estado.pantalla = 'principal';
  estado.pestana = 'progreso';
  pinta();
}

/** La tarjeta que lleva al diario, para ponerla en Mi progreso. */
function tarjetaDiario(a) {
  const dias = Object.keys(a.diario || {}).length;
  const hoy = (a.diario || {})[diarioClave(Date.now())];
  const jugHoy = hoy && hoy.j ? Object.values(hoy.j).reduce((s, x) => s + x, 0) : 0;
  const pie = !dias ? 'Aquí se irá guardando lo que vas haciendo'
            : hoy && (hoy.p || jugHoy)
              ? `Hoy: ${hoy.p ? hoy.p + (hoy.p === 1 ? ' pregunta' : ' preguntas') : ''}` +
                `${hoy.p && jugHoy ? ' y ' : ''}` +
                `${jugHoy ? jugHoy + (jugHoy === 1 ? ' juego' : ' juegos') : ''}`
              : `${dias} ${dias === 1 ? 'día apuntado' : 'días apuntados'}`;
  return `
    <button onclick="abreDiario()"
            style="width:100%;text-align:left;background:var(--tarjeta);border:none;cursor:pointer;
                   border-radius:22px;padding:14px;display:flex;align-items:center;gap:12px;
                   box-shadow:0 1px 4px rgba(0,0,0,.1);font:inherit;color:inherit;margin-top:10px">
      <span style="width:52px;height:52px;border-radius:17px;background:#3DDC972E;display:grid;
                   place-items:center;font-size:26px;flex:none">📔</span>
      <span style="flex:1">
        <strong style="display:block;font-size:17px">Mi diario</strong>
        <small style="display:block;font-size:var(--letra-pequena);color:var(--tinta-suave);
                      margin-top:2px">${escapaHtml(pie)}</small>
      </span>
      <span style="font-size:26px;color:var(--tinta-suave)">›</span>
    </button>`;
}

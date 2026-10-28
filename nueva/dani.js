/* ===================================================================
   DANI, EL MISMO DE LA APP.
   Traducción línea a línea de ui/components/Dani.kt: las mismas
   proporciones (todo en tantos por uno del lienzo), los mismos colores
   y los mismos gorros. Dibujado en canvas, así que no pesa nada y se
   ve nítido a cualquier tamaño.
   =================================================================== */

const DANI_COLORES = {
  cuerpo: '#26C6DA',
  barriga: '#9BE7F2',
  brote: '#3DDC97',
  ojo: '#17303E',
  mofletes: '#FF9FB0',
  sun: '#FFC93C'
};

/* Catálogo de la tienda: mismos identificadores y precios que Dani.kt */
const CATALOGO_DANI = [
  { id: 'color_azul',       nombre: 'Dani azul',       precio: 0,   tipo: 'color' },
  { id: 'color_verde',      nombre: 'Dani verde',      precio: 30,  tipo: 'color' },
  { id: 'color_morado',     nombre: 'Dani morado',     precio: 30,  tipo: 'color' },
  { id: 'color_naranja',    nombre: 'Dani naranja',    precio: 45,  tipo: 'color' },
  { id: 'color_rosa',       nombre: 'Dani rosa',       precio: 45,  tipo: 'color' },
  { id: 'gorro_gorra',      nombre: 'Gorra',           precio: 40,  tipo: 'gorro' },
  { id: 'gorro_graduacion', nombre: 'Birrete',         precio: 70,  tipo: 'gorro' },
  { id: 'gorro_fiesta',     nombre: 'Gorro de fiesta', precio: 90,  tipo: 'gorro' },
  { id: 'gorro_corona',     nombre: 'Corona',          precio: 200, tipo: 'gorro' },
  { id: 'gafas_sol',        nombre: 'Gafas de sol',    precio: 120, tipo: 'gafas' }
];

function colorDaniDe(id) {
  switch (id) {
    case 'color_verde':   return '#3DDC97';
    case 'color_morado':  return '#9B7BFF';
    case 'color_naranja': return '#FF9F68';
    case 'color_rosa':    return '#FF8FB1';
    default:              return DANI_COLORES.cuerpo;
  }
}

function gorroDe(id) {
  switch (id) {
    case 'gorro_gorra':      return 'gorra';
    case 'gorro_graduacion': return 'graduacion';
    case 'gorro_fiesta':     return 'fiesta';
    case 'gorro_corona':     return 'corona';
    default:                 return 'ninguno';
  }
}

/**
 * Dibuja a Dani dentro de un <canvas>.
 * animo: 'tranquilo' | 'alegre' | 'pensativo'
 */
function dibujaDani(canvas, { animo = 'tranquilo', cuerpo = DANI_COLORES.cuerpo,
                              gorro = 'ninguno', gafas = false, pulso = 1 } = {}) {
  const dpr = window.devicePixelRatio || 1;
  const lado = canvas.clientWidth || 96;
  canvas.width = lado * dpr;
  canvas.height = lado * dpr;
  const c = canvas.getContext('2d');
  c.setTransform(dpr, 0, 0, dpr, 0, 0);
  c.clearRect(0, 0, lado, lado);

  // La respiración: se estira desde los pies, como en la app.
  c.save();
  c.translate(0, lado);
  c.scale(1, pulso);
  c.translate(0, -lado);

  const w = lado, h = lado;
  const x = p => w * p, y = p => h * p;

  const elipse = (cx, cy, rx, ry, color) => {
    c.beginPath(); c.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2);
    c.fillStyle = color; c.fill();
  };
  const linea = (x1, y1, x2, y2, grosor, color, redonda = true) => {
    c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2);
    c.lineWidth = grosor; c.strokeStyle = color;
    c.lineCap = redonda ? 'round' : 'butt'; c.stroke();
  };

  const alegre = animo === 'alegre';

  // Brazos, detrás del cuerpo
  const grosorBrazo = w * 0.055;
  linea(x(0.26), y(0.62), alegre ? x(0.10) : x(0.13), alegre ? y(0.34) : y(0.60), grosorBrazo, cuerpo);
  linea(x(0.74), y(0.62), alegre ? x(0.90) : x(0.87), alegre ? y(0.34) : y(0.60), grosorBrazo, cuerpo);

  // Cuerpo y barriga
  elipse(x(0.50), y(0.63), w * 0.33, h * 0.30, cuerpo);
  elipse(x(0.50), y(0.695), w * 0.19, h * 0.165, DANI_COLORES.barriga);

  // Brote de la cabeza
  c.beginPath();
  c.moveTo(x(0.50), y(0.35));
  c.bezierCurveTo(x(0.50), y(0.17), x(0.60), y(0.08), x(0.72), y(0.05));
  c.bezierCurveTo(x(0.70), y(0.20), x(0.62), y(0.30), x(0.50), y(0.35));
  c.closePath(); c.fillStyle = DANI_COLORES.brote; c.fill();

  // Ojos
  const ojoR = w * 0.095, pupR = w * 0.050, ojoY = y(0.555);
  const desvio = animo === 'pensativo' ? w * 0.022 : w * 0.012;
  [x(0.385), x(0.615)].forEach(cx => {
    elipse(cx, ojoY, ojoR, ojoR, '#fff');
    elipse(cx + desvio, ojoY + w * 0.012, pupR, pupR, DANI_COLORES.ojo);
    elipse(cx - w * 0.012, ojoY - w * 0.022, w * 0.018, w * 0.018, '#fff');
  });

  // Gafas de sol, encima de los ojos
  if (gafas) {
    const cristal = w * 0.115, oscuro = '#17303E';
    [x(0.385), x(0.615)].forEach(cx => {
      elipse(cx, ojoY, cristal, cristal, oscuro);
      linea(cx - cristal * 0.45, ojoY + cristal * 0.25, cx + cristal * 0.1, ojoY - cristal * 0.5,
            w * 0.018, 'rgba(255,255,255,.45)');
    });
    linea(x(0.385) + cristal * 0.8, ojoY, x(0.615) - cristal * 0.8, ojoY, w * 0.030, oscuro, false);
  }

  // Mofletes, solo contento
  if (alegre) {
    elipse(x(0.285), y(0.645), w * 0.05, h * 0.03, 'rgba(255,159,176,.8)');
    elipse(x(0.715), y(0.645), w * 0.05, h * 0.03, 'rgba(255,159,176,.8)');
  }

  // Boca
  c.beginPath();
  if (alegre) {
    c.moveTo(x(0.40), y(0.665));
    c.quadraticCurveTo(x(0.50), y(0.775), x(0.60), y(0.665));
    c.closePath(); c.fillStyle = DANI_COLORES.ojo; c.fill();
  } else if (animo === 'tranquilo') {
    c.moveTo(x(0.425), y(0.675));
    c.quadraticCurveTo(x(0.50), y(0.730), x(0.575), y(0.675));
    c.lineWidth = w * 0.030; c.strokeStyle = DANI_COLORES.ojo; c.lineCap = 'round'; c.stroke();
  } else {
    linea(x(0.435), y(0.695), x(0.565), y(0.695), w * 0.030, DANI_COLORES.ojo);
  }

  // ── El gorro, lo último, por encima del brote ──
  if (gorro === 'gorra') {
    const rojo = '#E2574C';
    c.beginPath(); c.ellipse(x(0.50), y(0.35), w * 0.23, h * 0.13, 0, Math.PI, 0);
    c.fillStyle = rojo; c.fill();
    elipse(x(0.65), y(0.3525), w * 0.17, h * 0.0275, rojo);
    elipse(x(0.50), y(0.215), w * 0.035, w * 0.035, rojo);
  } else if (gorro === 'graduacion') {
    const negro = '#2B2B33';
    c.beginPath(); c.ellipse(x(0.50), y(0.335), w * 0.18, h * 0.10, 0, Math.PI, 0);
    c.fillStyle = negro; c.fill();
    c.beginPath();
    c.moveTo(x(0.50), y(0.175)); c.lineTo(x(0.83), y(0.265));
    c.lineTo(x(0.50), y(0.355)); c.lineTo(x(0.17), y(0.265));
    c.closePath(); c.fillStyle = negro; c.fill();
    linea(x(0.50), y(0.265), x(0.80), y(0.33), w * 0.022, DANI_COLORES.sun);
    elipse(x(0.81), y(0.365), w * 0.045, w * 0.045, DANI_COLORES.sun);
  } else if (gorro === 'fiesta') {
    c.beginPath();
    c.moveTo(x(0.50), y(0.115)); c.lineTo(x(0.345), y(0.355)); c.lineTo(x(0.655), y(0.355));
    c.closePath(); c.fillStyle = '#FF6B6B'; c.fill();
    elipse(x(0.50), y(0.225), w * 0.028, w * 0.028, '#fff');
    elipse(x(0.435), y(0.305), w * 0.024, w * 0.024, '#fff');
    elipse(x(0.565), y(0.305), w * 0.024, w * 0.024, '#fff');
    elipse(x(0.50), y(0.105), w * 0.052, w * 0.052, DANI_COLORES.sun);
  } else if (gorro === 'corona') {
    c.beginPath();
    c.moveTo(x(0.29), y(0.345)); c.lineTo(x(0.29), y(0.215));
    c.lineTo(x(0.395), y(0.295)); c.lineTo(x(0.50), y(0.185));
    c.lineTo(x(0.605), y(0.295)); c.lineTo(x(0.71), y(0.215));
    c.lineTo(x(0.71), y(0.345));
    c.closePath(); c.fillStyle = DANI_COLORES.sun; c.fill();
    elipse(x(0.50), y(0.205), w * 0.030, w * 0.030, '#FF6B6B');
    elipse(x(0.29), y(0.232), w * 0.024, w * 0.024, '#12B5E5');
    elipse(x(0.71), y(0.232), w * 0.024, w * 0.024, '#12B5E5');
  }

  c.restore();
}

/**
 * Pone a Dani en un canvas y lo deja respirando.
 * Mismo vaivén que la app: lento en reposo, rápido y amplio al celebrar.
 */
function animaDani(canvas, opciones = {}) {
  const alegre = opciones.animo === 'alegre';
  const duracion = alegre ? 420 : 2200;
  const tope = alegre ? 1.09 : 1.025;
  let inicio = null;

  if (canvas._daniAnim) cancelAnimationFrame(canvas._daniAnim);

  function paso(t) {
    if (inicio === null) inicio = t;
    const avance = ((t - inicio) % (duracion * 2)) / duracion;
    // Va y vuelve, con la misma curva suave que usa Compose.
    const v = avance <= 1 ? avance : 2 - avance;
    const suave = v * v * (3 - 2 * v);
    dibujaDani(canvas, { ...opciones, pulso: 1 + (tope - 1) * suave });
    canvas._daniAnim = requestAnimationFrame(paso);
  }
  canvas._daniAnim = requestAnimationFrame(paso);
}

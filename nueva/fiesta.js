/* ===================================================================
   LAS CELEBRACIONES

   La estrella que vuela al contador y el confeti del final.

   No son un adorno. Un niño encadena veinte preguntas porque cada
   acierto le DEVUELVE algo que ve; si la estrella se suma en silencio,
   responder bien y responder mal se parecen demasiado. Esto es lo que
   convierte una lista de preguntas en un juego.

   Todo a mano, sin librerías: son unas pocas líneas y no hay que
   descargar nada, que es justo lo que necesita una app que tiene que
   funcionar sin internet.
   =================================================================== */

/**
 * Una estrella sale de donde ha respondido el niño y viaja hasta el
 * contador de arriba, que da un respingo al recibirla.
 */
function estrellaQueVuela(desde) {
  try {
    const destino = document.getElementById('pastilla-estrellas');
    if (!destino || !desde) return;
    const o = desde.getBoundingClientRect();
    const d = destino.getBoundingClientRect();

    const est = document.createElement('span');
    est.className = 'estrella-vuela';
    est.textContent = '⭐';
    est.style.left = (o.left + o.width / 2 - 15) + 'px';
    est.style.top  = (o.top + o.height / 2 - 15) + 'px';
    est.style.setProperty('--dx', (d.left + d.width / 2 - o.left - o.width / 2) + 'px');
    est.style.setProperty('--dy', (d.top + d.height / 2 - o.top - o.height / 2) + 'px');
    document.body.appendChild(est);

    setTimeout(() => {
      est.remove();
      const n = document.getElementById('contador-estrellas');
      if (!n) return;
      n.classList.remove('sube');
      void n.offsetWidth;            // reinicia la animación aunque se repita seguida
      n.classList.add('sube');
      const a = (typeof alumnoActual === 'function') ? alumnoActual() : null;
      if (a) n.textContent = a.estrellas;
    }, 700);
  } catch (e) { /* una celebración nunca puede romper una sesión */ }
}

/**
 * Confeti. `fuerza` 1 para un buen resultado, 2 para un pleno.
 *
 * Se dibuja en un lienzo que ocupa la pantalla y se quita solo. Los papelillos
 * caen con un poco de giro y de viento, porque el confeti que baja recto no
 * parece confeti.
 */
function confeti(fuerza) {
  try {
    if (window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const lienzo = document.createElement('canvas');
    lienzo.style.cssText = 'position:fixed;inset:0;z-index:80;pointer-events:none';
    const dpr = window.devicePixelRatio || 1;
    lienzo.width = innerWidth * dpr; lienzo.height = innerHeight * dpr;
    lienzo.style.width = innerWidth + 'px'; lienzo.style.height = innerHeight + 'px';
    document.body.appendChild(lienzo);
    const c = lienzo.getContext('2d');
    c.scale(dpr, dpr);

    const colores = ['#12B5E5', '#FFC93C', '#3DDC97', '#FF6B6B', '#9B7BFF', '#FF9F68'];
    const cuantos = fuerza >= 2 ? 150 : 80;
    const papeles = [];
    for (let i = 0; i < cuantos; i++) {
      papeles.push({
        x: Math.random() * innerWidth,
        y: -20 - Math.random() * innerHeight * 0.6,
        an: 5 + Math.random() * 7,
        al: 8 + Math.random() * 10,
        color: colores[Math.floor(Math.random() * colores.length)],
        vy: 1.6 + Math.random() * 2.6,
        vx: -1 + Math.random() * 2,
        giro: Math.random() * Math.PI,
        vgiro: -0.14 + Math.random() * 0.28
      });
    }

    const final = performance.now() + (fuerza >= 2 ? 3200 : 2200);
    (function pinta(ahora) {
      c.clearRect(0, 0, innerWidth, innerHeight);
      let vivos = 0;
      papeles.forEach(p => {
        p.y += p.vy; p.x += p.vx + Math.sin((p.y + p.giro) / 28) * 0.7; p.giro += p.vgiro;
        if (p.y < innerHeight + 30) vivos++;
        c.save();
        c.translate(p.x, p.y); c.rotate(p.giro);
        c.fillStyle = p.color;
        c.fillRect(-p.an / 2, -p.al / 2, p.an, p.al);
        c.restore();
      });
      if (vivos && ahora < final) requestAnimationFrame(pinta);
      else lienzo.remove();
    })(performance.now());
  } catch (e) { /* ídem: si el confeti falla, la sesión sigue */ }
}

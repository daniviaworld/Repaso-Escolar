/* ===================================================================
   MOTOR PROVISIONAL — ANDAMIO, NO PRODUCTO.
   Sirve cuatro preguntas de muestra por materia para poder construir y
   probar las pantallas. NO es el motor de verdad: el bueno es el de
   Kotlin (317.963 preguntas distintas) y se enchufará aquí cuando esté
   compilado a JavaScript.

   El contrato es el que tendrá el motor de verdad, para que el cambio
   sea sustituir este archivo y nada más:

       generaPregunta(materiaId, cursoId, tema) -> {
           texto, tipo:'MC', opciones[], respuesta, etiqueta, visual,
           explicacion, materia, tema
       }
       temasDe(materiaId, cursoId) -> [string]
   =================================================================== */

const TEMAS_MUESTRA = {
  mates: ['Sumas', 'Restas', 'Tablas de multiplicar', 'Problemas', 'Medidas', 'Fracciones'],
  lengua: ['Vocales y consonantes', 'Acento', 'Ortografía', 'Verbos', 'Comprensión lectora'],
  valencia: ['Vocabulari', 'Ortografia', 'Verbs', 'Lectura'],
  ingles: ['Vocabulary', 'Colours and numbers', 'Verbs', 'Reading'],
  naturales: ['El cuerpo humano', 'Animales', 'Plantas', 'La materia'],
  sociales: ['El tiempo', 'Mi pueblo', 'Europa', 'Historia'],
  artistica: ['Arte', 'Técnicas', 'Formas y líneas', 'Manualidades'],
  efisica: ['Deportes', 'El cuerpo en movimiento', 'Juegos tradicionales'],
  valores: ['Convivencia', 'Derechos y deberes'],
  musica: ['Notas', 'Ritmo', 'Instrumentos'],
  logica: ['Contar', 'Formas', 'Series'],
  letras: ['Vocales', 'Primeras palabras'],
  entorno: ['Animales', 'Estaciones y tiempo'],
  valencia_inf: ['Primeres paraules'],
  ingles_inf: ['First words'],
  cuerpo: ['Mi cuerpo', 'Emociones'],
  arte_inf: ['Colores', 'Formas'],
  musica_inf: ['Sonidos', 'Ritmo']
};

const PREGUNTAS_MUESTRA = {
  mates: [
    { texto: '¿Cuánto es 7 × 8?', opciones: ['54', '56', '63', '48'], respuesta: '56',
      explicacion: 'La tabla del 7: 7, 14, 21, 28, 35, 42, 49, 56.' },
    { texto: '¿Cuánto es 145 + 78?', opciones: ['213', '223', '233', '218'], respuesta: '223' },
    { texto: '¿Cuál de estas fracciones es mayor?', opciones: ['1/2', '1/4', '1/8', '1/16'], respuesta: '1/2',
      explicacion: 'Cuanto más grande es el número de abajo, en más trozos se parte: más pequeños son.' },
    { texto: '¿Cuántos centímetros tiene un metro?', opciones: ['10', '100', '1000', '50'], respuesta: '100' }
  ],
  lengua: [
    { texto: 'Por su acento, "difícil" es una palabra...', opciones: ['llana', 'esdrújula', 'aguda'],
      respuesta: 'llana', etiqueta: 'Acento', explicacion: 'di-fí-cil' },
    { texto: '¿Cuál está bien escrita?', opciones: ['havía', 'había', 'abía', 'hávia'], respuesta: 'había' },
    { texto: '¿Qué tipo de palabra es "rápidamente"?', opciones: ['adverbio', 'adjetivo', 'verbo', 'sustantivo'],
      respuesta: 'adverbio' },
    { texto: '¿Cuántas sílabas tiene "murciélago"?', opciones: ['3', '4', '5', '2'], respuesta: '4' }
  ],
  valencia: [
    { texto: 'Com es diu "manzana" en valencià?', opciones: ['poma', 'pera', 'taronja', 'raïm'], respuesta: 'poma' },
    { texto: 'Quin article acompanya "escola"?', opciones: ["l'", 'el', 'els', 'un'], respuesta: "l'" },
    { texto: 'Com es diu "jueves"?', opciones: ['dijous', 'dimarts', 'divendres', 'dilluns'], respuesta: 'dijous' },
    { texto: 'Quina paraula està ben escrita?', opciones: ['xiquet', 'chiquet', 'xiket', 'chiket'], respuesta: 'xiquet' }
  ],
  ingles: [
    { texto: 'How do you say "mesa" in English?', opciones: ['table', 'chair', 'door', 'window'], respuesta: 'table' },
    { texto: 'What colour is the sun?', opciones: ['yellow', 'blue', 'green', 'purple'], respuesta: 'yellow' },
    { texto: 'Choose the correct sentence', opciones: ['She have a cat', 'She has a cat', 'She haves a cat'],
      respuesta: 'She has a cat' },
    { texto: 'How many days has a week?', opciones: ['seven', 'five', 'ten', 'twelve'], respuesta: 'seven' }
  ],
  naturales: [
    { texto: '¿Cuál de estos animales es un anfibio?', opciones: ['la rana', 'el lagarto', 'la paloma', 'el gato'],
      respuesta: 'la rana', visual: '🐸' },
    { texto: '¿Qué órgano bombea la sangre?', opciones: ['el corazón', 'el pulmón', 'el hígado', 'el riñón'],
      respuesta: 'el corazón', visual: '❤️' },
    { texto: '¿Qué necesitan las plantas para hacer la fotosíntesis?', opciones: ['luz', 'ruido', 'frío', 'sal'],
      respuesta: 'luz' },
    { texto: '¿En qué estado está el agua a 0 grados?', opciones: ['sólido', 'líquido', 'gaseoso'], respuesta: 'sólido' }
  ],
  sociales: [
    { texto: '¿Cuál es la capital de la Comunitat Valenciana?', opciones: ['València', 'Alacant', 'Castelló', 'Elx'],
      respuesta: 'València' },
    { texto: '¿Qué instrumento mide la temperatura?', opciones: ['el termómetro', 'la brújula', 'el barómetro'],
      respuesta: 'el termómetro', visual: '🌡️' },
    { texto: '¿Cuántos continentes hay?', opciones: ['6', '4', '8', '10'], respuesta: '6', visual: '🌍' },
    { texto: '¿Qué río pasa por València?', opciones: ['el Túria', 'el Ebro', 'el Segura', 'el Xúquer'],
      respuesta: 'el Túria' }
  ],
  artistica: [
    { texto: '¿Qué colores mezclas para obtener el verde?', opciones: ['azul y amarillo', 'rojo y azul', 'rojo y amarillo'],
      respuesta: 'azul y amarillo', visual: '🎨' },
    { texto: '¿Qué hace un escultor?', opciones: ['figuras con volumen', 'canciones', 'poemas', 'bailes'],
      respuesta: 'figuras con volumen' },
    { texto: '¿Cuántos lados tiene un hexágono?', opciones: ['6', '5', '7', '8'], respuesta: '6' },
    { texto: '¿Qué es un boceto?', opciones: ['un dibujo de prueba', 'un cuadro acabado', 'un marco'],
      respuesta: 'un dibujo de prueba' }
  ],
  efisica: [
    { texto: '¿Con cuántos jugadores juega un equipo de baloncesto en pista?', opciones: ['5', '7', '11', '6'],
      respuesta: '5', visual: '🏀' },
    { texto: '¿Qué hay que hacer antes de empezar a correr?', opciones: ['calentar', 'comer mucho', 'tumbarse'],
      respuesta: 'calentar' },
    { texto: '¿Qué músculo trabajas al saltar a la comba?', opciones: ['las piernas', 'las orejas', 'la nariz'],
      respuesta: 'las piernas' },
    { texto: '¿Cómo se llama el juego de pelota valenciano?', opciones: ['pilota', 'petanca', 'béisbol'],
      respuesta: 'pilota' }
  ],
  valores: [
    { texto: '¿Qué haces si ves que alguien se queda solo en el patio?', opciones: ['le invito a jugar', 'me río', 'me voy'],
      respuesta: 'le invito a jugar' },
    { texto: '¿Qué es un derecho?', opciones: ['algo que te corresponde', 'un castigo', 'una norma del juego'],
      respuesta: 'algo que te corresponde' },
    { texto: '¿Qué significa reciclar?', opciones: ['aprovechar de nuevo', 'tirar a la basura', 'romper'],
      respuesta: 'aprovechar de nuevo', visual: '♻️' },
    { texto: '¿Cómo se resuelve una discusión?', opciones: ['hablando', 'gritando', 'empujando'], respuesta: 'hablando' }
  ],
  musica: [
    { texto: '¿Cuántas notas tiene la escala musical?', opciones: ['7', '5', '8', '12'], respuesta: '7', visual: '🎵' },
    { texto: '¿Qué instrumento es de viento?', opciones: ['la flauta', 'el violín', 'el tambor', 'el piano'],
      respuesta: 'la flauta', visual: '🎶' },
    { texto: '¿Qué significa "forte" en música?', opciones: ['fuerte', 'flojo', 'rápido', 'lento'], respuesta: 'fuerte' },
    { texto: '¿Qué figura dura más, la blanca o la negra?', opciones: ['la blanca', 'la negra'], respuesta: 'la blanca' }
  ],
  logica: [
    { texto: '¿Cuántos patos hay?', opciones: ['3', '2', '4'], respuesta: '3', visual: '🦆🦆🦆' },
    { texto: '¿Qué número viene después del 5?', opciones: ['6', '4', '7'], respuesta: '6' },
    { texto: '¿Cuál es más grande?', opciones: ['🐘', '🐭'], respuesta: '🐘' },
    { texto: '¿Qué forma es esta?', opciones: ['círculo', 'cuadrado', 'triángulo'], respuesta: 'círculo', visual: '🔵' }
  ],
  letras: [
    { texto: '¿Con qué letra empieza CASA?', opciones: ['C', 'S', 'M'], respuesta: 'C', visual: '🏠' },
    { texto: '¿Cuál es una vocal?', opciones: ['A', 'B', 'T'], respuesta: 'A' },
    { texto: '¿Con qué letra empieza SOL?', opciones: ['S', 'L', 'O'], respuesta: 'S', visual: '☀️' },
    { texto: '¿Cuántas letras tiene PEZ?', opciones: ['3', '4', '2'], respuesta: '3', visual: '🐟' }
  ],
  entorno: [
    { texto: '¿En qué estación caen las hojas?', opciones: ['otoño', 'verano', 'primavera'], respuesta: 'otoño', visual: '🍂' },
    { texto: '¿Dónde vive el pez?', opciones: ['en el agua', 'en el árbol', 'en la cueva'], respuesta: 'en el agua', visual: '🐟' },
    { texto: '¿Qué te pones si llueve?', opciones: ['el paraguas', 'las gafas de sol', 'el bañador'],
      respuesta: 'el paraguas', visual: '☔' },
    { texto: '¿Qué animal hace "muuu"?', opciones: ['la vaca', 'el gato', 'el pato'], respuesta: 'la vaca', visual: '🐄' }
  ],
  valencia_inf: [
    { texto: 'Com es diu "gato"?', opciones: ['gat', 'gos', 'peix'], respuesta: 'gat', visual: '🐱' },
    { texto: 'Com es diu "sol"?', opciones: ['sol', 'lluna', 'estrela'], respuesta: 'sol', visual: '☀️' },
    { texto: 'Com es diu "agua"?', opciones: ['aigua', 'pa', 'llet'], respuesta: 'aigua', visual: '💧' },
    { texto: 'Com es diu "casa"?', opciones: ['casa', 'cotxe', 'cadira'], respuesta: 'casa', visual: '🏠' }
  ],
  ingles_inf: [
    { texto: 'How do you say "perro"?', opciones: ['dog', 'cat', 'fish'], respuesta: 'dog', visual: '🐶' },
    { texto: 'What colour is this?', opciones: ['red', 'blue', 'green'], respuesta: 'red', visual: '🔴' },
    { texto: 'How do you say "uno"?', opciones: ['one', 'two', 'three'], respuesta: 'one', visual: '1️⃣' },
    { texto: 'How do you say "sol"?', opciones: ['sun', 'moon', 'star'], respuesta: 'sun', visual: '☀️' }
  ],
  cuerpo: [
    { texto: '¿Con qué parte del cuerpo oyes?', opciones: ['las orejas', 'los ojos', 'la nariz'], respuesta: 'las orejas', visual: '👂' },
    { texto: '¿Cuántos dedos tienes en una mano?', opciones: ['5', '4', '6'], respuesta: '5', visual: '✋' },
    { texto: '¿Cómo te sientes cuando te regalan algo?', opciones: ['contento', 'triste', 'enfadado'],
      respuesta: 'contento', visual: '🎁' },
    { texto: '¿Con qué se huele?', opciones: ['la nariz', 'la boca', 'las manos'], respuesta: 'la nariz', visual: '👃' }
  ],
  arte_inf: [
    { texto: '¿De qué color es esta fruta?', opciones: ['amarillo', 'azul', 'verde'], respuesta: 'amarillo', visual: '🍌' },
    { texto: '¿Qué forma tiene la pelota?', opciones: ['círculo', 'cuadrado', 'triángulo'], respuesta: 'círculo', visual: '⚽' },
    { texto: '¿De qué color es la hierba?', opciones: ['verde', 'rojo', 'morado'], respuesta: 'verde', visual: '🌱' },
    { texto: '¿Qué color sale si mezclas rojo y amarillo?', opciones: ['naranja', 'verde', 'azul'], respuesta: 'naranja' }
  ],
  musica_inf: [
    { texto: '¿Qué animal hace este sonido: pío pío?', opciones: ['el pájaro', 'el perro', 'la vaca'],
      respuesta: 'el pájaro', visual: '🐦' },
    { texto: '¿Qué instrumento se toca golpeando?', opciones: ['el tambor', 'la flauta', 'el violín'],
      respuesta: 'el tambor', visual: '🥁' },
    { texto: '¿Suena fuerte o flojo un susurro?', opciones: ['flojo', 'fuerte'], respuesta: 'flojo' },
    { texto: '¿Qué hacemos al oír música alegre?', opciones: ['bailar', 'dormir', 'llorar'], respuesta: 'bailar', visual: '💃' }
  ]
};

function temasDe(materiaId) {
  return TEMAS_MUESTRA[materiaId] || ['General'];
}

function generaPregunta(materiaId, cursoId, tema) {
  const banco = PREGUNTAS_MUESTRA[materiaId] || PREGUNTAS_MUESTRA.mates;
  const base = banco[Math.floor(Math.random() * banco.length)];
  const opciones = [...base.opciones].sort(() => Math.random() - 0.5);
  return {
    texto: base.texto,
    tipo: 'MC',
    opciones,
    respuesta: base.respuesta,
    etiqueta: base.etiqueta || tema || null,
    visual: base.visual || '',
    explicacion: base.explicacion || null,
    materia: materiaId,
    tema: tema || temasDe(materiaId)[0]
  };
}

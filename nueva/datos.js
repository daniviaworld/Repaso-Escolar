/* ===================================================================
   CURSOS Y MATERIAS — copiados tal cual de data/model/Subject.kt y
   Course.kt. Mismos identificadores, nombres, iconos y colores, para
   que la web y la app no se puedan desincronizar por un despiste.

   Cuando el motor de Kotlin se compile a JavaScript, esta tabla se
   sustituirá por la suya y este archivo desaparecerá.
   =================================================================== */

const CURSOS = [
  { id: 'inf3', nombre: 'Infantil 3 años', etapa: 'infantil', lvl: 0.0 },
  { id: 'inf4', nombre: 'Infantil 4 años', etapa: 'infantil', lvl: 0.5 },
  { id: 'inf5', nombre: 'Infantil 5 años', etapa: 'infantil', lvl: 1.0 },
  { id: 'p1', nombre: '1º Primaria', etapa: 'primaria', lvl: 2.0 },
  { id: 'p2', nombre: '2º Primaria', etapa: 'primaria', lvl: 3.0 },
  { id: 'p3', nombre: '3º Primaria', etapa: 'primaria', lvl: 4.0 },
  { id: 'p4', nombre: '4º Primaria', etapa: 'primaria', lvl: 5.0 },
  { id: 'p5', nombre: '5º Primaria', etapa: 'primaria', lvl: 6.0 },
  { id: 'p6', nombre: '6º Primaria', etapa: 'primaria', lvl: 7.0 }
];

const MATERIAS_INF = [
  { id: 'logica',       nombre: 'Números y lógica',     icono: '🔢', color: '#12B5E5' },
  { id: 'letras',       nombre: 'Letras y palabras',    icono: '🔤', color: '#FF6B6B' },
  { id: 'entorno',      nombre: 'Mi entorno',           icono: '🌳', color: '#3DDC97' },
  { id: 'valencia_inf', nombre: 'Valencià',             icono: '🍊', color: '#FF9F68' },
  { id: 'ingles_inf',   nombre: 'English',              icono: '🇬🇧', color: '#9B7BFF' },
  { id: 'cuerpo',       nombre: 'Mi cuerpo y emociones',icono: '🧒', color: '#FFC93C' },
  { id: 'arte_inf',     nombre: 'Colores y formas',     icono: '🎨', color: '#F06292' },
  { id: 'musica_inf',   nombre: 'Música',               icono: '🎵', color: '#26C6DA' }
];

const MATERIAS_PRI = [
  { id: 'mates',     nombre: 'Matemáticas',       icono: '➗', color: '#12B5E5' },
  { id: 'lengua',    nombre: 'Lengua Castellana', icono: '📖', color: '#FF6B6B' },
  { id: 'valencia',  nombre: 'Valencià',          icono: '🍊', color: '#FF9F68' },
  { id: 'ingles',    nombre: 'English',           icono: '🇬🇧', color: '#9B7BFF' },
  { id: 'naturales', nombre: 'Ciencias Naturales',icono: '🔬', color: '#3DDC97' },
  { id: 'sociales',  nombre: 'Ciencias Sociales', icono: '🌍', color: '#FFC93C' },
  { id: 'artistica', nombre: 'Plástica y Visual', icono: '🎨', color: '#F06292' },
  { id: 'efisica',   nombre: 'Educación Física',  icono: '⚽', color: '#4CAF50' },
  { id: 'valores',   nombre: 'Valores cívicos',   icono: '🤝', color: '#8D6E63' },
  { id: 'musica',    nombre: 'Educación Musical', icono: '🎵', color: '#26C6DA' }
];

/** Igual que subjectsFor(): Valores solo existe en 5º y 6º. */
function materiasDe(curso) {
  if (curso.etapa === 'infantil') return MATERIAS_INF;
  return MATERIAS_PRI.filter(m => m.id !== 'valores' || curso.lvl >= 6.0);
}

function cursoPorId(id) { return CURSOS.find(c => c.id === id); }

const AVATARES = ['🦊','🐼','🐸','🐯','🦁','🐨','🐷','🐵','🦄','🐙','🐢','🦉'];

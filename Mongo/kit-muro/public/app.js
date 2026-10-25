// El muro de la clase · lógica de la web. No hace falta que toques este fichero.

const estado = { funciones: {}, mensajes: [], filtro: '', vistos: new Set(), editando: null, primeraCarga: true };
const CADA_CUANTO = 3000; // ms entre recargas, para ver los mensajes de los demás

const $ = (id) => document.getElementById(id);

function crear(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto !== undefined && texto !== null) el.textContent = texto;
  return el;
}

function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

// ── Avisos ──
let temporizadorAviso;
function avisar(texto, tipo = '') {
  const aviso = $('aviso');
  aviso.className = `aviso ${tipo}`;
  aviso.textContent = texto;
  aviso.hidden = false;
  clearTimeout(temporizadorAviso);
  temporizadorAviso = setTimeout(() => { aviso.hidden = true; }, 6000);
}

function mensaje(tipo, titulo, html) {
  const caja = crear('div', `mensaje ${tipo}`);
  caja.append(crear('h2', '', titulo));
  const p = crear('p');
  p.innerHTML = html; // los textos de aquí los escribe la propia web, no vienen de la base de datos
  caja.append(p);
  return caja;
}

// ── Llamadas al servidor ──
async function pedir(metodo, ruta, cuerpo) {
  const opciones = { method: metodo, headers: {} };
  if (cuerpo) {
    opciones.headers['Content-Type'] = 'application/json';
    opciones.body = JSON.stringify(cuerpo);
  }
  const respuesta = await fetch(ruta, opciones);
  const datos = await respuesta.json().catch(() => ({}));
  if (!respuesta.ok) throw Object.assign(new Error(datos.error || 'Error del servidor'), { pendiente: datos.pendiente });
  return datos;
}

// ── Formatos ──
const formatoFecha = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function fechaBonita(valor) {
  const fecha = new Date(valor);
  if (!valor || Number.isNaN(fecha.getTime())) return '';
  const segundos = Math.round((Date.now() - fecha) / 1000);
  if (segundos < 60) return 'ahora mismo';
  if (segundos < 3600) return `hace ${Math.floor(segundos / 60)} min`;
  return formatoFecha.format(fecha);
}

// Cada autor tiene siempre el mismo color de post-it
const COLORES = ['#fde68a', '#fecaca', '#bbf7d0', '#bfdbfe', '#ddd6fe', '#fbcfe8', '#fed7aa', '#a5f3fc'];
function numeroDe(texto) {
  let n = 0;
  for (const c of String(texto)) n = (n * 31 + c.codePointAt(0)) >>> 0;
  return n;
}

// ── Funciones de db.js ──
function pintarFunciones(lista) {
  const ul = $('funciones');
  ul.replaceChildren();
  lista.forEach((f) => {
    estado.funciones[f.nombre] = f.hecha;
    const li = crear('li', `funcion${f.hecha ? ' hecha' : ''}`);
    li.title = f.hecha ? 'Programada' : 'Pendiente: escríbela en db.js';
    li.append(crear('span', 'funcion__punto'), document.createTextNode(f.nombre));
    if (f.extra) li.append(crear('span', 'funcion__extra', '(extra)'));
    ul.append(li);
  });
}

// ── Post-its ──
function postit(m) {
  const id = String(m._id);
  const post = crear('article', 'post');
  const n = numeroDe(m.autor || '');
  post.style.setProperty('--color', COLORES[n % COLORES.length]);
  post.style.setProperty('--giro', `${(numeroDe(id) % 5) - 2}deg`);
  if (!estado.primeraCarga && !estado.vistos.has(id)) post.classList.add('post--nuevo');

  if (estado.editando === id) {
    const editor = crear('textarea', 'post__editor');
    editor.maxLength = 280;
    editor.rows = 4;
    editor.value = m.texto ?? '';
    post.append(editor);
    setTimeout(() => editor.focus());
    const pie = crear('div', 'post__pie');
    const guardar = crear('button', 'post__accion', '💾 Guardar');
    guardar.addEventListener('click', () => editar(m, editor.value));
    const cancelar = crear('button', 'post__accion', 'Cancelar');
    cancelar.addEventListener('click', () => { estado.editando = null; pintar(); });
    pie.append(guardar, cancelar);
    post.append(pie);
    return post;
  }

  post.append(crear('p', 'post__texto', m.texto ?? '(sin texto)'));

  const autor = crear('button', 'post__autor', m.autor ?? '(sin autor)');
  autor.type = 'button';
  autor.title = 'Ver solo sus mensajes';
  autor.addEventListener('click', () => filtrar(m.autor));
  post.append(autor);
  post.append(crear('span', 'post__fecha', fechaBonita(m.fecha)));

  const pie = crear('div', 'post__pie');
  const like = crear('button', 'post__accion', `❤️ ${m.likes ?? 0}`);
  like.title = 'Dar like';
  like.addEventListener('click', () => darLike(m));
  const lapiz = crear('button', 'post__accion', '✏️');
  lapiz.title = 'Editar';
  lapiz.addEventListener('click', () => {
    if (!estado.funciones.editarMensaje) return avisar('Para editar, programa editarMensaje en db.js (reto extra).');
    estado.editando = id;
    pintar();
  });
  const papelera = crear('button', 'post__accion post__accion--borrar', '🗑️');
  papelera.title = 'Borrar';
  papelera.addEventListener('click', () => borrar(m));
  pie.append(like, lapiz, papelera);
  post.append(pie);
  return post;
}

function pintar() {
  const muro = $('muro');
  const caja = $('mensaje');
  caja.replaceChildren();
  muro.replaceChildren();

  $('filtro').hidden = !estado.filtro;
  $('filtro-autor').textContent = estado.filtro;
  const n = estado.mensajes.length;
  $('cuenta').textContent = `${n} ${n === 1 ? 'mensaje' : 'mensajes'} en el muro`;

  if (!n) {
    caja.append(mensaje('', 'El muro está vacío', estado.funciones.crearMensaje
      ? 'Escribe el primer mensaje con el formulario de arriba.'
      : 'Para poder publicar, programa <code>crearMensaje</code> en <code>db.js</code>.'));
    return;
  }

  const fragmento = document.createDocumentFragment();
  estado.mensajes.forEach((m) => fragmento.append(postit(m)));
  muro.append(fragmento);
}

function pintarError(err) {
  $('cuenta').textContent = '';
  $('muro').replaceChildren();
  const caja = $('mensaje');
  caja.replaceChildren();
  if (err.pendiente === 'listarMensajes') {
    caja.append(mensaje('', 'Todavía no se ven los mensajes',
      'Programa <code>listarMensajes</code> en <code>db.js</code>: tiene que devolver (<code>return</code>) todos los mensajes, del más nuevo al más antiguo.'));
  } else {
    caja.append(mensaje('error', 'No puedo cargar el muro', escapar(err.message)));
  }
}

// ── Cargar ──
async function cargar() {
  if (estado.editando) return; // no recargamos mientras alguien escribe en un post-it
  const ruta = estado.filtro ? `/api/mensajes?autor=${encodeURIComponent(estado.filtro)}` : '/api/mensajes';
  try {
    const datos = await pedir('GET', ruta);
    estado.mensajes = datos.mensajes;
    pintar();
    estado.mensajes.forEach((m) => estado.vistos.add(String(m._id)));
    estado.primeraCarga = false;
  } catch (err) {
    if (err.pendiente === 'listarDeAutor') {
      estado.filtro = '';
      avisar('Para ver solo los mensajes de una persona, programa listarDeAutor en db.js (reto extra).');
      return cargar();
    }
    pintarError(err);
  }
}

async function cargarEstado() {
  try {
    const info = await pedir('GET', '/api/estado');
    pintarFunciones(info.funciones);
    const nombre = info.nombre && info.nombre.toLowerCase() !== 'tu nombre' ? info.nombre : '';
    if (nombre && !$('autor').value) $('autor').value = nombre;
    return true;
  } catch {
    pintarError(new Error('No hay conexión con el servidor. ¿Sigue abierta la terminal con npm start?'));
    return false;
  }
}

// Busca un mensaje en el muro tal y como está ahora en la base de datos
async function releer(id) {
  await cargar();
  return estado.mensajes.find((m) => String(m._id) === id);
}

// ── Acciones ──
async function publicar(evento) {
  evento.preventDefault();
  const texto = $('texto').value.trim();
  const autor = $('autor').value.trim();
  if (!texto || !autor) return;
  const boton = evento.submitter;
  if (boton) boton.disabled = true;
  try {
    await pedir('POST', '/api/mensajes', { texto, autor });
    $('texto').value = '';
    actualizarContador();
    try { localStorage.setItem('muro-autor', autor); } catch {}
    await cargar();
    if (estado.funciones.listarMensajes && !estado.filtro && !estado.mensajes.some((m) => m.texto === texto && m.autor === autor)) {
      avisar('El servidor no ha dado error, pero tu mensaje no aparece. ¿Has usado insertOne con los campos texto y autor?', 'error');
    }
  } catch (err) {
    avisar(err.message, 'error');
  } finally {
    if (boton) boton.disabled = false;
  }
}

async function darLike(m) {
  const id = String(m._id);
  try {
    await pedir('POST', `/api/mensajes/${id}/like`);
    const ahora = await releer(id);
    if (ahora && Number(ahora.likes ?? 0) <= Number(m.likes ?? 0)) {
      avisar('El like no se ha guardado. Revisa el filtro (¿new ObjectId(id)?) y que uses $inc sobre likes.', 'error');
    }
  } catch (err) {
    avisar(err.message, 'error');
  }
}

async function borrar(m) {
  const id = String(m._id);
  if (!confirm(`¿Borrar el mensaje de ${m.autor ?? 'alguien'}?`)) return;
  try {
    await pedir('DELETE', `/api/mensajes/${id}`);
    if (await releer(id)) avisar('El mensaje sigue ahí. Revisa el filtro: el _id hay que convertirlo con new ObjectId(id).', 'error');
  } catch (err) {
    avisar(err.message, 'error');
  }
}

async function editar(m, nuevoTexto) {
  const id = String(m._id);
  const texto = nuevoTexto.trim();
  if (!texto) return avisar('El mensaje no puede quedar vacío.');
  try {
    await pedir('PUT', `/api/mensajes/${id}`, { texto });
    estado.editando = null;
    const ahora = await releer(id);
    if (ahora && ahora.texto !== texto) avisar('El texto no ha cambiado. Revisa el filtro (¿new ObjectId(id)?) y que uses $set.', 'error');
  } catch (err) {
    avisar(err.message, 'error');
  }
}

function filtrar(autor) {
  estado.filtro = autor || '';
  cargar();
}

function actualizarContador() {
  $('contador').textContent = `${$('texto').value.length} / 280`;
}

// ── Arranque ──
async function iniciar() {
  try { $('autor').value = localStorage.getItem('muro-autor') || ''; } catch {}
  $('nuevo').addEventListener('submit', publicar);
  $('texto').addEventListener('input', actualizarContador);
  $('texto').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) $('nuevo').requestSubmit();
  });
  $('quitar-filtro').addEventListener('click', () => filtrar(''));

  if (await cargarEstado()) await cargar();

  setInterval(async () => {
    if (document.hidden) return;
    if (await cargarEstado()) await cargar();
  }, CADA_CUANTO);
}

iniciar();

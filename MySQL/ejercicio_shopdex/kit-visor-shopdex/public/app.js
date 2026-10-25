// ShopDex · lógica de la web. No hace falta que toques este fichero.

const estado = { pestanas: [], resultados: [], activa: 0 };

const $ = (id) => document.getElementById(id);

function crear(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto !== undefined && texto !== null) el.textContent = texto;
  return el;
}

const hay = (fila, c) => c in fila && fila[c] !== null && fila[c] !== '';

// ── Formatos ──
const formatoEuros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });
const COLUMNAS_EUROS = ['precio', 'precio_unitario', 'precio_medio', 'facturado', 'gastado', 'total', 'importe', 'ticket_medio'];

function euros(valor) {
  const n = Number(valor);
  return Number.isNaN(n) ? String(valor) : formatoEuros.format(n);
}

function valorBonito(columna, valor) {
  if (valor === null) return 'NULL';
  return COLUMNAS_EUROS.includes(columna) ? euros(valor) : valor;
}

function fechaBonita(valor) {
  const d = new Date(String(valor).replace(' ', 'T'));
  if (Number.isNaN(d.getTime())) return valor;
  const opciones = { day: 'numeric', month: 'short', year: 'numeric' };
  if (String(valor).length > 10) Object.assign(opciones, { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleString('es-ES', opciones);
}

// Un color estable para cada texto, para que cada categoría tenga el suyo
function tono(texto) {
  let h = 0;
  for (const letra of String(texto)) h = (h * 31 + letra.codePointAt(0)) % 360;
  return h;
}

const ICONOS = { informática: '💻', telefonía: '📱', audio: '🎧', gaming: '🎮', hogar: '🏠', deporte: '⚽', libros: '📚', fotografía: '📷' };

function listaDatos(fila, columnas) {
  const dl = crear('dl', 'tarjeta__datos');
  columnas.forEach((c) => {
    dl.append(crear('dt', '', c));
    dl.append(crear('dd', '', valorBonito(c, fila[c])));
  });
  return dl;
}

// Columnas extra que haya añadido el alumno (un COUNT, un alias propio…)
function anadirExtra(cuerpo, fila, conocidas) {
  const extra = Object.keys(fila).filter((c) => !conocidas.includes(c));
  if (extra.length) cuerpo.append(listaDatos(fila, extra));
}

// ── Tarjeta de producto ──
const COLUMNAS_PRODUCTO = ['id', 'nombre', 'precio', 'stock', 'categoria_id', 'marca_id', 'fecha_alta', 'categoria', 'marca', 'icono', 'media', 'valoraciones'];

function estrellas(media, cuantas) {
  const n = Math.round(Number(media));
  const span = crear('span', 'estrellas', '★'.repeat(n) + '☆'.repeat(Math.max(0, 5 - n)));
  span.title = `Media: ${media}`;
  span.append(crear('small', '', cuantas !== undefined ? `${media} (${cuantas})` : media));
  return span;
}

function etiquetaStock(stock) {
  const n = Number(stock);
  if (n === 0) return crear('span', 'stock agotado', 'Agotado');
  if (n < 5) return crear('span', 'stock pocas', `Últimas ${n} uds.`);
  return crear('span', 'stock', `${n} en stock`);
}

function tarjetaProducto(fila) {
  const tarjeta = crear('article', 'tarjeta');

  const nombreCategoria = hay(fila, 'categoria') ? String(fila.categoria) : '';
  const foto = crear('div', 'tarjeta__foto', fila.icono || ICONOS[nombreCategoria.toLowerCase()] || '🛍️');
  foto.style.setProperty('--tono', tono(nombreCategoria || fila.categoria_id || fila.nombre));
  tarjeta.append(foto);

  const cuerpo = crear('div', 'tarjeta__cuerpo');
  cuerpo.append(crear('h3', 'tarjeta__titulo', fila.nombre));

  const meta = [fila.marca, fila.categoria].filter((v) => v !== undefined && v !== null && v !== '');
  if (meta.length) cuerpo.append(crear('p', 'tarjeta__meta', meta.join(' · ')));
  if (hay(fila, 'media')) cuerpo.append(estrellas(fila.media, fila.valoraciones));
  anadirExtra(cuerpo, fila, COLUMNAS_PRODUCTO);

  const pie = crear('div', 'tarjeta__pie');
  pie.append(crear('span', 'precio', euros(fila.precio)));
  if (hay(fila, 'stock')) pie.append(etiquetaStock(fila.stock));
  cuerpo.append(pie);

  tarjeta.append(cuerpo);
  return tarjeta;
}

// ── Tarjeta de pedido ──
const COLUMNAS_PEDIDO = ['id', 'cliente_id', 'fecha', 'estado', 'cliente', 'ciudad', 'total'];

function tarjetaPedido(fila) {
  const tarjeta = crear('article', 'tarjeta tarjeta--simple');
  const cuerpo = crear('div', 'tarjeta__cuerpo');

  const cabecera = crear('div', 'tarjeta__pie');
  cabecera.style.marginTop = '0';
  cabecera.style.paddingTop = '0';
  cabecera.append(crear('h3', 'tarjeta__titulo', hay(fila, 'id') ? `Pedido nº ${fila.id}` : 'Pedido'));
  cabecera.append(crear('span', `estado-pedido ${String(fila.estado).toLowerCase()}`, fila.estado));
  cuerpo.append(cabecera);

  if (hay(fila, 'fecha')) cuerpo.append(crear('p', 'tarjeta__meta', fechaBonita(fila.fecha)));
  const quien = [fila.cliente, fila.ciudad].filter((v) => v !== undefined && v !== null && v !== '');
  if (quien.length) cuerpo.append(crear('p', '', quien.join(' · ')));
  if (hay(fila, 'total')) cuerpo.append(crear('span', 'tarjeta__numero', euros(fila.total)));
  anadirExtra(cuerpo, fila, COLUMNAS_PEDIDO);

  tarjeta.append(cuerpo);
  return tarjeta;
}

// ── Tarjeta de cliente ──
const COLUMNAS_CLIENTE = ['id', 'nombre', 'apellidos', 'email', 'ciudad', 'fecha_registro', 'gastado', 'pedidos'];

function tarjetaCliente(fila) {
  const tarjeta = crear('article', 'tarjeta tarjeta--simple');
  const cuerpo = crear('div', 'tarjeta__cuerpo');

  const nombre = [fila.nombre, fila.apellidos].filter(Boolean).join(' ');
  const iniciales = nombre.split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();
  const avatar = crear('div', 'avatar', iniciales || '?');
  avatar.style.setProperty('--tono', tono(nombre));
  cuerpo.append(avatar);

  cuerpo.append(crear('h3', 'tarjeta__titulo', nombre));
  const meta = [fila.ciudad, fila.email].filter((v) => v !== undefined && v !== null && v !== '');
  if (meta.length) cuerpo.append(crear('p', 'tarjeta__meta', meta.join(' · ')));
  if (hay(fila, 'gastado')) cuerpo.append(crear('span', 'tarjeta__numero', euros(fila.gastado)));
  if (hay(fila, 'pedidos')) {
    cuerpo.append(crear('p', 'tarjeta__meta', `${fila.pedidos} ${Number(fila.pedidos) === 1 ? 'pedido' : 'pedidos'}`));
  }
  anadirExtra(cuerpo, fila, COLUMNAS_CLIENTE);

  tarjeta.append(cuerpo);
  return tarjeta;
}

// ── Para cualquier otra cosa: categorías, meses, marcas… ──
const NUMEROS_DESTACADOS = ['facturado', 'gastado', 'total', 'unidades', 'pedidos', 'productos'];

function tarjetaSimple(fila) {
  const tarjeta = crear('article', 'tarjeta tarjeta--simple');
  const cuerpo = crear('div', 'tarjeta__cuerpo');
  const columnas = Object.keys(fila);
  const usadas = [];

  const columnaTitulo = ['nombre', 'mes', 'categoria', 'marca'].find((c) => c in fila) || columnas[0];
  const titulo = crear('h3', 'tarjeta__titulo', `${fila.icono ? `${fila.icono} ` : ''}${fila[columnaTitulo]}`);
  cuerpo.append(titulo);
  usadas.push(columnaTitulo, 'icono');

  const destacado = NUMEROS_DESTACADOS.find((c) => c in fila && c !== columnaTitulo);
  if (destacado) {
    cuerpo.append(crear('span', 'tarjeta__numero', valorBonito(destacado, fila[destacado])));
    cuerpo.append(crear('p', 'tarjeta__meta', destacado));
    usadas.push(destacado);
  }
  const resto = columnas.filter((c) => !usadas.includes(c));
  if (resto.length) cuerpo.append(listaDatos(fila, resto));

  tarjeta.append(cuerpo);
  return tarjeta;
}

function tarjeta(fila) {
  if ('estado' in fila) return tarjetaPedido(fila);
  if ('apellidos' in fila || 'email' in fila) return tarjetaCliente(fila);
  if ('nombre' in fila && 'precio' in fila) return tarjetaProducto(fila);
  return tarjetaSimple(fila);
}

// ── Pintar una pestaña ──
function mensaje(tipo, titulo, texto) {
  const caja = crear('div', `mensaje ${tipo}`);
  caja.append(crear('h2', '', titulo));
  const p = crear('p');
  p.innerHTML = texto; // los textos de aquí los escribe el propio visor, no vienen de la base de datos
  caja.append(p);
  return caja;
}

function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto;
  return div.innerHTML;
}

function pintar() {
  const i = estado.activa;
  const pestana = estado.pestanas[i];
  const resultado = estado.resultados[i];

  document.querySelectorAll('.pestana').forEach((b, j) => b.classList.toggle('activa', j === i));
  $('descripcion').textContent = pestana.descripcion || '';
  $('comprobaciones').replaceChildren();
  $('mensaje').replaceChildren();
  $('rejilla').replaceChildren();

  if (!resultado) {
    $('comprobaciones').append(crear('li', '', 'Cargando…'));
    return;
  }
  if (resultado.vacia) {
    $('mensaje').append(mensaje('', 'Esta pestaña está vacía',
      `Abre <code>consultas.js</code>, escribe la consulta de «${escapar(pestana.pestana)}» entre las comillas <code>\` \`</code>, guarda y recarga esta página (F5).`));
    return;
  }
  if (resultado.error) {
    $('mensaje').append(mensaje('error', 'La consulta da un error', escapar(resultado.error)));
    return;
  }

  resultado.comprobaciones.forEach((c) => $('comprobaciones').append(crear('li', c.ok ? 'ok' : 'mal', c.texto)));

  if (resultado.filas.length === 0) {
    $('mensaje').append(mensaje('', 'La consulta no devuelve ninguna fila',
      'Funciona, pero no sale nada. Revisa las condiciones del <code>WHERE</code> (o del <code>HAVING</code>) y los <code>JOIN</code>.'));
    return;
  }

  const fragmento = document.createDocumentFragment();
  resultado.filas.forEach((fila) => fragmento.append(tarjeta(fila)));
  $('rejilla').append(fragmento);
}

function pintarPuntos() {
  document.querySelectorAll('.pestana__punto').forEach((punto, i) => {
    const r = estado.resultados[i];
    punto.className = 'pestana__punto';
    if (r && r.filas) punto.classList.add(r.ok ? 'ok' : 'mal');
    else if (r && r.error) punto.classList.add('mal');
  });

  const todas = estado.pestanas.map((p, i) => ({ p, r: estado.resultados[i] }));
  if (!todas.length || !todas.every(({ r }) => r)) return;
  const obligatorias = todas.filter(({ p }) => !p.opcional);
  const retos = todas.filter(({ p }) => p.opcional);
  const bien = (lista) => lista.filter(({ r }) => r.ok).length;
  let texto = `${bien(obligatorias)} de ${obligatorias.length} pestañas correctas`;
  if (retos.length) texto += ` · retos: ${bien(retos)} de ${retos.length}`;
  if (bien(obligatorias) === obligatorias.length) texto += ' 🎉';
  $('resumen').hidden = false;
  $('resumen-numeros').textContent = texto;
}

async function cargarPestana(i) {
  const respuesta = await fetch(`/api/consulta/${i}`);
  estado.resultados[i] = await respuesta.json();
}

async function abrirPestana(i) {
  estado.activa = i;
  history.replaceState(null, '', `#${i}`);
  pintar();
  await cargarPestana(i);
  pintarPuntos();
  if (estado.activa === i) pintar();
}

// ── Arranque ──
async function iniciar() {
  let info;
  try {
    info = await (await fetch('/api/info')).json();
  } catch {
    $('mensaje').append(mensaje('error', 'No hay conexión con el servidor', '¿Sigue abierta la terminal con <code>npm start</code>?'));
    return;
  }

  const nombre = info.nombre && info.nombre.toLowerCase() !== 'tu nombre' ? info.nombre : '';
  $('titulo').textContent = nombre ? `La tienda de ${nombre}` : 'ShopDex';
  document.title = $('titulo').textContent;
  $('aviso-nombre').hidden = Boolean(nombre);

  if (info.error) {
    $('mensaje').append(mensaje('error', 'Hay un problema en consultas.js', escapar(info.error)));
    return;
  }

  estado.pestanas = info.pestanas;
  const nav = $('pestanas');
  estado.pestanas.forEach((p, i) => {
    const boton = crear('button', 'pestana');
    boton.type = 'button';
    boton.append(crear('span', 'pestana__punto'));
    boton.append(crear('span', 'pestana__num', p.opcional ? '★' : String(i + 1)));
    boton.append(document.createTextNode(p.pestana));
    if (p.opcional) boton.append(crear('span', 'pestana__opcional', '(reto)'));
    boton.addEventListener('click', () => abrirPestana(i));
    nav.append(boton);
  });

  const desdeUrl = Number(location.hash.slice(1));
  estado.activa = Number.isInteger(desdeUrl) && desdeUrl < estado.pestanas.length ? desdeUrl : 0;
  pintar();

  await Promise.all(estado.pestanas.map((_, i) => cargarPestana(i)));
  pintarPuntos();
  pintar();
}

iniciar();

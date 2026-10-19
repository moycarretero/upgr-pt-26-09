// GameDex · lógica de la web. No hace falta que toques este fichero.

const estado = { pestanas: [], resultados: [], activa: 0 };

const $ = (id) => document.getElementById(id);

function crear(etiqueta, clase, texto) {
  const el = document.createElement(etiqueta);
  if (clase) el.className = clase;
  if (texto !== undefined && texto !== null) el.textContent = texto;
  return el;
}

// ── Formatos ──
const formatoEuros = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' });

function precioBonito(valor) {
  const n = Number(valor);
  if (valor === null || valor === undefined || Number.isNaN(n)) return '';
  return n === 0 ? 'Gratis' : formatoEuros.format(n);
}

function claseNota(nota) {
  const n = Number(nota);
  if (n >= 75) return 'alta';
  if (n >= 50) return 'media';
  return 'baja';
}

// ── Tarjetas ──
const COLUMNAS_JUEGO = ['id', 'titulo', 'anio', 'precio', 'nota', 'imagen_url', 'estudio_id', 'estudio', 'pais', 'generos'];

function tarjetaJuego(fila) {
  const tarjeta = crear('article', 'tarjeta');

  const img = crear('img', 'tarjeta__imagen');
  img.alt = fila.titulo;
  img.loading = 'lazy';
  img.src = fila.imagen_url || 'sin-imagen.svg';
  img.onerror = () => { img.onerror = null; img.src = 'sin-imagen.svg'; };
  tarjeta.append(img);

  const cuerpo = crear('div', 'tarjeta__cuerpo');
  cuerpo.append(crear('h3', 'tarjeta__titulo', fila.titulo));

  const meta = [fila.anio, fila.estudio, fila.pais].filter((v) => v !== undefined && v !== null && v !== '');
  if (meta.length) cuerpo.append(crear('p', 'tarjeta__meta', meta.join(' · ')));

  if (fila.generos) {
    const etiquetas = crear('div', 'etiquetas');
    String(fila.generos).split(',').map((g) => g.trim()).filter(Boolean)
      .forEach((g) => etiquetas.append(crear('span', 'etiqueta', g)));
    cuerpo.append(etiquetas);
  }

  // Columnas extra que haya añadido el alumno (por ejemplo un COUNT o un alias propio)
  const extra = Object.keys(fila).filter((c) => !COLUMNAS_JUEGO.includes(c));
  if (extra.length) cuerpo.append(listaDatos(fila, extra));

  const pie = crear('div', 'tarjeta__pie');
  pie.append(crear('span', 'precio', precioBonito(fila.precio)));
  if (fila.nota !== undefined && fila.nota !== null) {
    const nota = crear('span', `nota ${claseNota(fila.nota)}`, fila.nota);
    nota.title = 'Nota de la crítica (Metacritic)';
    pie.append(nota);
  }
  cuerpo.append(pie);

  tarjeta.append(cuerpo);
  return tarjeta;
}

function listaDatos(fila, columnas) {
  const dl = crear('dl', 'tarjeta__datos');
  columnas.forEach((c) => {
    dl.append(crear('dt', '', c));
    dl.append(crear('dd', '', fila[c] === null ? 'NULL' : fila[c]));
  });
  return dl;
}

// Para filas que no son juegos: estudios, géneros o cualquier otra cosa
function tarjetaSimple(fila) {
  const tarjeta = crear('article', 'tarjeta tarjeta--simple');
  const cuerpo = crear('div', 'tarjeta__cuerpo');
  const columnas = Object.keys(fila);

  if ('nombre' in fila) cuerpo.append(crear('h3', 'tarjeta__titulo', fila.nombre));
  if ('pais' in fila) cuerpo.append(crear('p', 'tarjeta__meta', fila.pais));
  if ('juegos' in fila) {
    cuerpo.append(crear('span', 'tarjeta__numero', fila.juegos));
    cuerpo.append(crear('p', 'tarjeta__meta', Number(fila.juegos) === 1 ? 'juego' : 'juegos'));
  }
  const resto = columnas.filter((c) => !['nombre', 'pais', 'juegos'].includes(c));
  if (resto.length) cuerpo.append(listaDatos(fila, resto));

  tarjeta.append(cuerpo);
  return tarjeta;
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
  const cuenta = $('cuenta');
  cuenta.className = 'estado__cuenta';
  cuenta.textContent = '';
  $('mensaje').replaceChildren();
  $('rejilla').replaceChildren();

  if (!resultado) {
    cuenta.textContent = 'Cargando…';
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

  const n = resultado.filas.length;
  const esperadas = pestana.tarjetasEsperadas;
  const ok = n === esperadas;
  cuenta.classList.add(ok ? 'ok' : 'mal');
  cuenta.textContent = `${n} ${n === 1 ? 'tarjeta' : 'tarjetas'} · esperadas: ${esperadas} ${ok ? '✓' : '✗'}`;

  if (n === 0) {
    $('mensaje').append(mensaje('', 'La consulta no devuelve ninguna fila',
      'Funciona, pero no sale nada. Revisa las condiciones del <code>WHERE</code> y que las tablas tengan datos.'));
    return;
  }

  const fragmento = document.createDocumentFragment();
  resultado.filas.forEach((fila) => fragmento.append('titulo' in fila ? tarjetaJuego(fila) : tarjetaSimple(fila)));
  $('rejilla').append(fragmento);
}

function pintarPuntos() {
  document.querySelectorAll('.pestana__punto').forEach((punto, i) => {
    const r = estado.resultados[i];
    punto.className = 'pestana__punto';
    if (r && r.filas) punto.classList.add(r.filas.length === estado.pestanas[i].tarjetasEsperadas ? 'ok' : 'mal');
    else if (r && r.error) punto.classList.add('mal');
  });

  const obligatorias = estado.pestanas.map((p, i) => ({ p, r: estado.resultados[i] })).filter(({ p }) => !p.opcional);
  if (obligatorias.length && obligatorias.every(({ r }) => r)) {
    $('resumen').hidden = false;
    $('resumen-numeros').textContent = obligatorias.map(({ r }) => (r.filas ? r.filas.length : '?')).join(' · ');
  }
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
  $('titulo').textContent = nombre ? `GameDex de ${nombre}` : 'GameDex';
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

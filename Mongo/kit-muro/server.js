// ─────────────────────────────────────────────────────────────
//  El muro de la clase · servidor
//
//  No hace falta que toques este fichero. Lee tus datos de .env,
//  sirve la web (carpeta public) y, cuando la web pide algo,
//  llama a TUS funciones de db.js.
// ─────────────────────────────────────────────────────────────

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });
const { MongoClient } = require('mongodb');

const PUERTO_WEB = Number(process.env.PUERTO_WEB) || 3000;
const URI = (process.env.MONGODB_URI || '').trim();
const MAX_TEXTO = 280;
const MAX_AUTOR = 40;

if (!/^mongodb(\+srv)?:\/\//.test(URI) || URI.includes('usuario:contrasena@cluster.xxxxx')) {
  console.error('\n✗ Falta la cadena de conexión. Pega en MONGODB_URI del fichero .env la que te ha pasado el profesor (empieza por mongodb+srv://) y guarda.\n');
  process.exit(1);
}

let db;
try {
  db = require('./db.js');
} catch (err) {
  console.error(`\n✗ No puedo leer db.js: ${err.message}\n  Suele ser una llave { }, un paréntesis o una coma que falta. Arréglalo y guarda: el servidor se reinicia solo.\n`);
  process.exit(1);
}

const FUNCIONES = ['crearMensaje', 'listarMensajes', 'darLike', 'borrarMensaje', 'editarMensaje', 'listarDeAutor'];
const EXTRAS = ['editarMensaje', 'listarDeAutor'];

// Una función está «pendiente» si no existe o si dentro solo hay comentarios
function estaPendiente(nombre) {
  const fn = db[nombre];
  if (typeof fn !== 'function') return true;
  const codigo = fn.toString();
  const cuerpo = codigo.slice(codigo.indexOf('{') + 1, codigo.lastIndexOf('}'));
  return cuerpo.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/[^\n]*/g, '').trim() === '';
}

class Pendiente extends Error {
  constructor(nombre) {
    super(`Todavía no has programado ${nombre} en db.js.`);
    this.funcion = nombre;
  }
}

async function llamar(nombre, ...args) {
  if (estaPendiente(nombre)) throw new Pendiente(nombre);
  return db[nombre](...args);
}

// Traduce los errores más habituales a algo que se entienda
function explicarError(err) {
  const texto = String(err && err.message);
  if (err instanceof Pendiente) return err.message;
  if (err.name === 'MongoParseError' || (err.name === 'MongoAPIError' && /URI|connection string/i.test(texto))) {
    return 'La cadena de MONGODB_URI del .env está mal copiada. Pégala otra vez entera. Si la contraseña tiene símbolos como @ / : %, pide otra al profesor.';
  }
  if (err.code === 18 || /auth(entication)? failed|bad auth/i.test(texto)) {
    return 'Atlas no acepta el usuario o la contraseña de MONGODB_URI. Revisa la cadena del .env, guarda y espera a que el servidor se reinicie.';
  }
  if (err.code === 13 || /not authorized|unauthorized/i.test(texto)) {
    return 'Tu usuario de Atlas no tiene permiso para esto. Comprueba que usas la base de datos «muro» (client.db(\'muro\')).';
  }
  if (/ENOTFOUND|querySrv|EREFUSED/i.test(texto)) {
    return 'No encuentro el clúster de Atlas. ¿Tienes internet? Revisa que la dirección de MONGODB_URI esté bien copiada.';
  }
  if (err.name === 'MongoServerSelectionError' || /timed out|ECONNREFUSED|ETIMEDOUT/i.test(texto)) {
    return 'No consigo conectar con Atlas. Puede que tu IP no esté permitida (Network Access en Atlas) o que la red bloquee la conexión. Avisa al profesor.';
  }
  if (err.name === 'BSONError' || /24 character hex string|ObjectId/i.test(texto)) {
    return `Problema con el id: ${texto}. ¿Has usado new ObjectId(id)?`;
  }
  if (err instanceof ReferenceError) {
    return `En db.js usas algo que no existe: ${texto}. Revisa cómo está escrito (mayúsculas incluidas).`;
  }
  if (err instanceof TypeError && /is not a function/.test(texto)) {
    return `En db.js llamas a algo que no es una función: ${texto}. Revisa el nombre del método (insertOne, find, updateOne, deleteOne…).`;
  }
  return `Error en db.js: ${texto}`;
}

// listarMensajes y listarDeAutor tienen que devolver una lista
function comprobarLista(nombre, resultado) {
  if (Array.isArray(resultado)) return resultado;
  if (resultado && typeof resultado.toArray === 'function') {
    throw new Error(`${nombre} devuelve un cursor, no la lista. Añade .toArray() al final del find().`);
  }
  if (resultado === undefined) {
    throw new Error(`${nombre} no devuelve nada. ¿Te falta el return delante de mensajes.find()…?`);
  }
  throw new Error(`${nombre} tiene que devolver una lista de mensajes, pero devuelve otra cosa.`);
}

const esId = (id) => /^[0-9a-f]{24}$/i.test(id);

function limpiarTexto(valor, maximo) {
  return String(valor ?? '').trim().slice(0, maximo);
}

// ── Peticiones de la web ──
async function api(metodo, partes, url, cuerpo) {
  // GET /api/estado
  if (metodo === 'GET' && partes[0] === 'estado') {
    const funciones = FUNCIONES.map((nombre) => ({ nombre, hecha: !estaPendiente(nombre), extra: EXTRAS.includes(nombre) }));
    return { nombre: (process.env.NOMBRE || '').trim(), maxTexto: MAX_TEXTO, funciones };
  }

  if (partes[0] !== 'mensajes') return { estado: 404, error: 'No encontrado' };
  const id = partes[1];
  if (id !== undefined && !esId(id)) return { estado: 400, error: 'Ese id no es válido.' };

  // GET /api/mensajes  ·  GET /api/mensajes?autor=Ana
  if (metodo === 'GET' && !id) {
    const autor = limpiarTexto(url.searchParams.get('autor'), MAX_AUTOR);
    if (autor) return { mensajes: comprobarLista('listarDeAutor', await llamar('listarDeAutor', autor)), autor };
    return { mensajes: comprobarLista('listarMensajes', await llamar('listarMensajes')) };
  }

  // POST /api/mensajes   { texto, autor }
  if (metodo === 'POST' && !id) {
    const texto = limpiarTexto(cuerpo.texto, MAX_TEXTO);
    const autor = limpiarTexto(cuerpo.autor, MAX_AUTOR);
    if (!texto || !autor) return { estado: 400, error: 'El mensaje necesita texto y autor.' };
    await llamar('crearMensaje', texto, autor);
    return { ok: true };
  }

  // POST /api/mensajes/:id/like
  if (metodo === 'POST' && id && partes[2] === 'like') {
    await llamar('darLike', id);
    return { ok: true };
  }

  // PUT /api/mensajes/:id   { texto }
  if (metodo === 'PUT' && id) {
    const texto = limpiarTexto(cuerpo.texto, MAX_TEXTO);
    if (!texto) return { estado: 400, error: 'El mensaje no puede quedar vacío.' };
    await llamar('editarMensaje', id, texto);
    return { ok: true };
  }

  // DELETE /api/mensajes/:id
  if (metodo === 'DELETE' && id) {
    await llamar('borrarMensaje', id);
    return { ok: true };
  }

  return { estado: 404, error: 'No encontrado' };
}

function leerCuerpo(req) {
  return new Promise((resolver) => {
    let datos = '';
    req.on('data', (trozo) => {
      datos += trozo;
      if (datos.length > 10_000) req.destroy();
    });
    req.on('end', () => {
      try { resolver(JSON.parse(datos || '{}')); } catch { resolver({}); }
    });
  });
}

// ── Servidor web ──
const TIPOS = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript' };
const PUBLICOS = ['index.html', 'estilos.css', 'app.js'];

function responderJson(res, datos, estado = 200) {
  res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(datos));
}

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname.startsWith('/api/')) {
    const partes = url.pathname.slice('/api/'.length).split('/').filter(Boolean);
    const cuerpo = ['POST', 'PUT'].includes(req.method) ? await leerCuerpo(req) : {};
    try {
      const { estado = 200, ...datos } = await api(req.method, partes, url, cuerpo);
      return responderJson(res, datos, estado);
    } catch (err) {
      if (!(err instanceof Pendiente)) console.error(`✗ ${req.method} ${url.pathname}: ${err.message}`);
      return responderJson(res, { error: explicarError(err), pendiente: err.funcion }, err instanceof Pendiente ? 501 : 500);
    }
  }

  const fichero = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
  if (PUBLICOS.includes(fichero)) {
    const tipo = TIPOS[path.extname(fichero)] || 'text/plain';
    res.writeHead(200, { 'Content-Type': `${tipo}; charset=utf-8` });
    return fs.createReadStream(path.join(__dirname, 'public', fichero)).pipe(res);
  }

  res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end('No encontrado');
});

servidor.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`\n✗ El puerto ${PUERTO_WEB} ya está en uso. ¿Tienes el muro abierto en otra terminal? Ciérralo o cambia PUERTO_WEB en .env.\n`);
  } else {
    console.error(err);
  }
  process.exit(1);
});

servidor.listen(PUERTO_WEB, async () => {
  console.log('\n📌 El muro de la clase · servidor arrancado');

  // Comprobación de la conexión, con un cliente propio para no depender de db.js
  const prueba = new MongoClient(URI, { serverSelectionTimeoutMS: 8000 });
  try {
    const total = await prueba.db('muro').collection('mensajes').countDocuments();
    console.log(`✓ Conectado a MongoDB: el muro tiene ${total} ${total === 1 ? 'mensaje' : 'mensajes'}.`);
  } catch (err) {
    console.log(`✗ Aviso: ${explicarError(err)}`);
  } finally {
    await prueba.close();
  }

  const hechas = FUNCIONES.filter((f) => !estaPendiente(f));
  console.log(`✓ Funciones de db.js programadas: ${hechas.length} de ${FUNCIONES.length}${hechas.length ? ` (${hechas.join(', ')})` : ''}.`);
  console.log(`\nAbre en el navegador: http://localhost:${PUERTO_WEB}`);
  console.log('Al guardar db.js el servidor se reinicia solo. Para pararlo: Ctrl+C\n');
});

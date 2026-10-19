// ─────────────────────────────────────────────────────────────
//  GameDex · servidor del visor
//
//  No hace falta que toques este fichero. Lee tus datos de .env,
//  se conecta a MySQL, ejecuta las consultas de consultas.js y
//  le pasa los resultados a la web (carpeta public).
// ─────────────────────────────────────────────────────────────

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });
const mysql = require('mysql2/promise');

const PUERTO_WEB = Number(process.env.PUERTO_WEB) || 3000;
const BASE_DE_DATOS = process.env.MYSQL_BASE_DE_DATOS || 'gamedex';

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PUERTO) || 3306,
  user: process.env.MYSQL_USUARIO,
  password: process.env.MYSQL_CONTRASENA,
  database: BASE_DE_DATOS,
  connectionLimit: 5,
  dateStrings: true,
});

// ── consultas.js se vuelve a leer en cada petición, para que basten guardar y recargar ──
function leerConsultas() {
  const ruta = require.resolve('./consultas.js');
  delete require.cache[ruta];
  const consultas = require(ruta);
  if (!Array.isArray(consultas)) throw new Error('consultas.js debe exportar una lista [ ... ].');
  return consultas;
}

const ORDENES_QUE_MODIFICAN = ['INSERT', 'UPDATE', 'DELETE', 'DROP', 'ALTER', 'CREATE', 'TRUNCATE', 'REPLACE', 'RENAME', 'GRANT', 'REVOKE'];
const PISTA_CONSULTAS = 'Suele ser una comilla invertida ` o una coma que falta.';

// Quita comentarios y espacios para saber con qué empieza la consulta
function limpiarSql(sql) {
  return String(sql || '')
    .replace(/\/\*[\s\S]*?\*\//g, ' ')
    .replace(/(--|#)[^\n]*/g, ' ')
    .trim();
}

// Traduce los errores más habituales a algo que se entienda
function explicarError(err) {
  switch (err.code) {
    case 'ER_ACCESS_DENIED_ERROR':
      return 'MySQL no acepta tu usuario o tu contraseña. Revisa MYSQL_USUARIO y MYSQL_CONTRASENA en el fichero .env, guarda y reinicia el servidor (Ctrl+C y npm start).';
    case 'ECONNREFUSED':
    case 'ENOTFOUND':
      return 'No consigo conectar con MySQL. ¿Está arrancado? Ábrelo en Workbench para comprobarlo. Si usas otro puerto, cámbialo en MYSQL_PUERTO del .env.';
    case 'ER_BAD_DB_ERROR':
      return `No existe la base de datos «${BASE_DE_DATOS}». Ejecuta tu gamedex.sql en Workbench (empieza con CREATE DATABASE gamedex;).`;
    case 'ER_NO_SUCH_TABLE':
      return `Esa tabla no existe: ${err.sqlMessage}. Revisa el nombre (en minúsculas y sin tildes) o comprueba que la creaste en gamedex.sql.`;
    case 'ER_BAD_FIELD_ERROR':
      return `Esa columna no existe: ${err.sqlMessage}. Revisa cómo se llama en tu CREATE TABLE.`;
    case 'ER_PARSE_ERROR':
      return `Hay un error de escritura en la consulta. MySQL dice: ${err.sqlMessage}`;
    case 'ER_NON_UNIQ_ERROR':
      return `Hay una columna que está en dos tablas y MySQL no sabe cuál usar: ${err.sqlMessage}. Ponle delante el alias de la tabla (por ejemplo j.id o e.id).`;
    default:
      return err.sqlMessage || err.message;
  }
}

async function ejecutarConsulta(indice) {
  let consultas;
  try {
    consultas = leerConsultas();
  } catch (err) {
    return { error: `No puedo leer consultas.js: ${err.message}. ${PISTA_CONSULTAS}` };
  }
  const consulta = consultas[indice];
  if (!consulta) return { error: 'Esa pestaña no existe.' };

  const sql = limpiarSql(consulta.sql);
  if (!sql) return { vacia: true };

  // El visor solo enseña datos: no deja que una pestaña borre o cambie nada
  const primeraPalabra = sql.split(/\s+/)[0].toUpperCase();
  if (ORDENES_QUE_MODIFICAN.includes(primeraPalabra)) {
    return { error: `En el visor solo se pueden escribir consultas SELECT. Esta empieza por ${primeraPalabra}: ejecútala en Workbench si de verdad la necesitas.` };
  }

  try {
    const [filas] = await pool.query(consulta.sql);
    return { filas };
  } catch (err) {
    return { error: explicarError(err) };
  }
}

// ── Servidor web ──
const TIPOS = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
const PUBLICOS = ['index.html', 'estilos.css', 'app.js', 'sin-imagen.svg'];

function responderJson(res, datos, estado = 200) {
  res.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
  res.end(JSON.stringify(datos));
}

const servidor = http.createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');

  if (url.pathname === '/api/info') {
    try {
      const pestanas = leerConsultas().map((c) => ({
        pestana: c.pestana,
        descripcion: c.descripcion,
        tarjetasEsperadas: c.tarjetasEsperadas,
        opcional: Boolean(c.opcional),
      }));
      return responderJson(res, { nombre: (process.env.NOMBRE || '').trim(), pestanas });
    } catch (err) {
      return responderJson(res, { nombre: process.env.NOMBRE || '', pestanas: [], error: `No puedo leer consultas.js: ${err.message}. ${PISTA_CONSULTAS}` });
    }
  }

  const coincide = url.pathname.match(/^\/api\/consulta\/(\d+)$/);
  if (coincide) return responderJson(res, await ejecutarConsulta(Number(coincide[1])));

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
    console.error(`\n✗ El puerto ${PUERTO_WEB} ya está en uso. ¿Tienes el visor abierto en otra terminal? Ciérralo o cambia PUERTO_WEB en .env.\n`);
  } else {
    console.error(err);
  }
  process.exit(1);
});

servidor.listen(PUERTO_WEB, async () => {
  console.log('\n🎮 GameDex · visor arrancado');
  try {
    const [[{ total }]] = await pool.query('SELECT COUNT(*) AS total FROM juegos');
    console.log(`✓ Conectado a MySQL: la tabla juegos tiene ${total} filas.`);
  } catch (err) {
    console.log(`✗ Aviso: ${explicarError(err)}`);
  }
  console.log(`\nAbre en el navegador: http://localhost:${PUERTO_WEB}`);
  console.log('Para pararlo: Ctrl+C\n');
});

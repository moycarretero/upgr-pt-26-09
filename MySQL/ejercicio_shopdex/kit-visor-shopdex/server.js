// ─────────────────────────────────────────────────────────────
//  ShopDex · servidor del visor
//
//  No hace falta que toques este fichero. Lee tus datos de .env,
//  se conecta a MySQL, ejecuta las consultas de consultas.js,
//  comprueba si el resultado es el esperado y le pasa todo a la
//  web (carpeta public).
// ─────────────────────────────────────────────────────────────

const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
require('dotenv').config({ path: path.join(__dirname, '.env'), quiet: true });
const mysql = require('mysql2/promise');

const PUERTO_WEB = Number(process.env.PUERTO_WEB) || 3000;
const BASE_DE_DATOS = process.env.MYSQL_BASE_DE_DATOS || 'shopdex';

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
      return `No existe la base de datos «${BASE_DE_DATOS}». Ejecuta el fichero shopdex.sql en Workbench.`;
    case 'ER_NO_SUCH_TABLE':
      return `Esa tabla no existe: ${err.sqlMessage}. Revisa el nombre: las tablas son categorias, marcas, productos, clientes, pedidos, lineas_pedido y valoraciones.`;
    case 'ER_BAD_FIELD_ERROR':
      return `Esa columna no existe: ${err.sqlMessage}. Revisa el nombre en shopdex.sql o, si usas un alias, que esté bien escrito.`;
    case 'ER_PARSE_ERROR':
      return `Hay un error de escritura en la consulta. MySQL dice: ${err.sqlMessage}`;
    case 'ER_NON_UNIQ_ERROR':
      return `Hay una columna que está en dos tablas y MySQL no sabe cuál usar: ${err.sqlMessage}. Ponle delante el alias de la tabla (por ejemplo p.nombre o c.nombre).`;
    case 'ER_WRONG_FIELD_WITH_GROUP':
    case 'ER_MIX_OF_GROUP_FUNC_AND_FIELDS':
      return `Con GROUP BY, todas las columnas del SELECT tienen que estar en el GROUP BY o dentro de una función (COUNT, SUM, AVG…). MySQL dice: ${err.sqlMessage}`;
    case 'ER_INVALID_GROUP_FUNC_USE':
      return 'No puedes usar COUNT, SUM, AVG… dentro del WHERE. Para filtrar por un resultado agrupado usa HAVING, después del GROUP BY.';
    case 'ER_SUBQUERY_NO_1_ROW':
      return 'Una subconsulta que usas con =, < o > devuelve más de una fila. Haz que devuelva un solo valor o usa IN.';
    default:
      return err.sqlMessage || err.message;
  }
}

// ── Comprobaciones del resultado ──
function comoNumero(valor) {
  if (valor === null || valor === undefined || valor === '') return null;
  const n = Number(valor);
  return Number.isNaN(n) ? null : n;
}

function comparar(a, b) {
  const na = comoNumero(a);
  const nb = comoNumero(b);
  if (na !== null && nb !== null) return na - nb;
  return String(a ?? '').localeCompare(String(b ?? ''), 'es');
}

function comprobar(consulta, filas) {
  const resultado = [];
  const columnas = filas.length ? Object.keys(filas[0]) : [];

  const esperadas = consulta.tarjetasEsperadas;
  resultado.push({
    ok: filas.length === esperadas,
    texto: `${esperadas} ${esperadas === 1 ? 'tarjeta' : 'tarjetas'} (te salen ${filas.length})`,
  });

  (consulta.columnas || []).forEach((c) => {
    resultado.push({ ok: columnas.includes(c), texto: `Tiene una columna llamada «${c}»` });
  });

  if (consulta.orden) {
    const { columna, sentido } = consulta.orden;
    const texto = `Ordenado por «${columna}» ${sentido === 'desc' ? 'de mayor a menor' : 'de menor a mayor'}`;
    let ok = columnas.includes(columna);
    for (let i = 1; ok && i < filas.length; i++) {
      const diferencia = comparar(filas[i - 1][columna], filas[i][columna]);
      if (sentido === 'desc' ? diferencia < 0 : diferencia > 0) ok = false;
    }
    resultado.push({ ok, texto });
  }

  // suma puede ser una comprobación { columna, valor } o una lista de ellas
  [].concat(consulta.suma || []).forEach(({ columna, valor }) => {
    let ok = columnas.includes(columna);
    if (ok) {
      const total = filas.reduce((s, f) => s + (comoNumero(f[columna]) || 0), 0);
      ok = Math.abs(total - valor) < 0.01 * filas.length + 0.01;
    }
    resultado.push({ ok, texto: `La columna «${columna}» suma ${valor.toLocaleString('es-ES')}` });
  });

  return resultado;
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
    if (!Array.isArray(filas) || Array.isArray(filas[0])) {
      return { error: 'Escribe una sola consulta SELECT por pestaña (sin varias separadas por ;).' };
    }
    const comprobaciones = comprobar(consulta, filas);
    return { filas, comprobaciones, ok: comprobaciones.every((c) => c.ok) };
  } catch (err) {
    return { error: explicarError(err) };
  }
}

// ── Servidor web ──
const TIPOS = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml' };
const PUBLICOS = ['index.html', 'estilos.css', 'app.js'];

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
  console.log('\n🛒 ShopDex · visor arrancado');
  try {
    const [[{ productos, pedidos }]] = await pool.query(
      'SELECT (SELECT COUNT(*) FROM productos) AS productos, (SELECT COUNT(*) FROM pedidos) AS pedidos'
    );
    console.log(`✓ Conectado a MySQL: hay ${productos} productos y ${pedidos} pedidos.`);
  } catch (err) {
    console.log(`✗ Aviso: ${explicarError(err)}`);
  }
  console.log(`\nAbre en el navegador: http://localhost:${PUERTO_WEB}`);
  console.log('Para pararlo: Ctrl+C\n');
});

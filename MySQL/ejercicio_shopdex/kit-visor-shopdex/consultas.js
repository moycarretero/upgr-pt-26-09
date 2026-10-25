// ─────────────────────────────────────────────────────────────
//  ShopDex · TUS CONSULTAS
//
//  Este es el único fichero que tienes que tocar (además de .env).
//  Escribe tu consulta SQL entre las dos comillas invertidas ` `
//  de cada pestaña. Guarda el fichero y recarga la web (F5):
//  no hace falta reiniciar el servidor.
//
//  Debajo de la descripción de cada pestaña, la web te enseña
//  qué comprueba: cuántas tarjetas deben salir, qué columnas
//  tienen que estar, en qué orden y, a veces, cuánto debe sumar
//  una columna. Cuando todo sale en verde, la consulta está bien.
//
//  NO cambies los campos tarjetasEsperadas, columnas, orden ni
//  suma: son las comprobaciones. Solo escribe dentro de sql.
//
//  Consejo: prueba primero la consulta en Workbench y, cuando
//  funcione, cópiala aquí.
// ─────────────────────────────────────────────────────────────

module.exports = [
  {
    pestana: 'Catálogo',
    descripcion: 'Todos los productos con el nombre de su categoría (alias «categoria»), el icono de la categoría y el nombre de su marca (alias «marca»), del más caro al más barato.',
    tarjetasEsperadas: 40,
    columnas: ['categoria', 'icono', 'marca'],
    orden: { columna: 'precio', sentido: 'desc' },
    sql: `

    `,
  },
  {
    pestana: 'Últimas unidades',
    descripcion: 'Los productos de los que quedan menos de 5 unidades (también los agotados), del que menos stock tiene al que más.',
    tarjetasEsperadas: 10,
    columnas: ['stock'],
    orden: { columna: 'stock', sentido: 'asc' },
    sql: `

    `,
  },
  {
    pestana: 'Hecho en España',
    descripcion: 'Los productos de marcas españolas que cuestan entre 20 y 100 € (ambos incluidos), con el nombre de la marca (alias «marca»), del más barato al más caro.',
    tarjetasEsperadas: 6,
    columnas: ['marca'],
    orden: { columna: 'precio', sentido: 'asc' },
    sql: `

    `,
  },
  {
    pestana: 'Pedidos en curso',
    descripcion: 'Los pedidos que están pendientes o enviados, con el nombre del cliente (alias «cliente») y su ciudad, del más antiguo al más reciente.',
    tarjetasEsperadas: 7,
    columnas: ['estado', 'cliente', 'ciudad'],
    orden: { columna: 'fecha', sentido: 'asc' },
    sql: `

    `,
  },
  {
    pestana: 'Sin estrenar',
    descripcion: 'Los productos que no se han vendido nunca: no aparecen en ninguna línea de pedido.',
    tarjetasEsperadas: 7,
    sql: `

    `,
  },
  {
    pestana: 'Por encima de la media',
    descripcion: 'Los productos que cuestan más que el precio medio de todos los productos, del más caro al más barato. El precio medio lo tiene que calcular la consulta: no lo escribas a mano.',
    tarjetasEsperadas: 14,
    orden: { columna: 'precio', sentido: 'desc' },
    sql: `

    `,
  },
  {
    pestana: 'Ventas por categoría',
    descripcion: 'Cada categoría que tenga ventas (nombre e icono), las unidades vendidas (alias «unidades») y lo facturado (alias «facturado», cantidad × precio_unitario). No cuentes los pedidos cancelados. De más a menos facturado.',
    tarjetasEsperadas: 7,
    columnas: ['nombre', 'icono', 'unidades', 'facturado'],
    orden: { columna: 'facturado', sentido: 'desc' },
    suma: [
      { columna: 'unidades', valor: 124 },
      { columna: 'facturado', valor: 16482.33 },
    ],
    sql: `

    `,
  },
  {
    pestana: 'Los más valorados',
    descripcion: 'Los productos con 3 valoraciones o más y una puntuación media de 4 o más. Añade la media redondeada a un decimal (alias «media») y el número de valoraciones (alias «valoraciones»). De mayor a menor media.',
    tarjetasEsperadas: 4,
    columnas: ['nombre', 'precio', 'media', 'valoraciones'],
    orden: { columna: 'media', sentido: 'desc' },
    sql: `

    `,
  },
  {
    pestana: 'Top 5 clientes',
    descripcion: 'Los 5 clientes que más han gastado, sin contar pedidos cancelados. Columnas: nombre, apellidos, ciudad, cuántos pedidos ha hecho (alias «pedidos») y cuánto ha gastado (alias «gastado»). Del que más gasta al que menos.',
    tarjetasEsperadas: 5,
    columnas: ['nombre', 'apellidos', 'ciudad', 'pedidos', 'gastado'],
    orden: { columna: 'gastado', sentido: 'desc' },
    suma: [
      { columna: 'pedidos', valor: 29 },
      { columna: 'gastado', valor: 13392.09 },
    ],
    sql: `

    `,
  },
  {
    pestana: 'Ventas por mes',
    opcional: true,
    descripcion: 'RETO: cada mes con ventas, con el mes en formato 2026-01 (alias «mes»), cuántos pedidos hubo (alias «pedidos») y lo facturado (alias «facturado»), sin contar los cancelados. En orden cronológico.',
    tarjetasEsperadas: 10,
    columnas: ['mes', 'pedidos', 'facturado'],
    orden: { columna: 'mes', sentido: 'asc' },
    suma: [
      { columna: 'pedidos', valor: 45 },
      { columna: 'facturado', valor: 16482.33 },
    ],
    sql: `

    `,
  },
  {
    pestana: 'Caros para su categoría',
    opcional: true,
    descripcion: 'RETO: los productos que cuestan más que la media de SU categoría (no la de toda la tienda), con el nombre de la categoría (alias «categoria»). Ordenados por categoría.',
    tarjetasEsperadas: 14,
    columnas: ['categoria'],
    orden: { columna: 'categoria', sentido: 'asc' },
    sql: `

    `,
  },
];

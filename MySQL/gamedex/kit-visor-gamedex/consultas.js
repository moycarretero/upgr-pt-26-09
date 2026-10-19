// ─────────────────────────────────────────────────────────────
//  GameDex · TUS CONSULTAS
//
//  Este es el único fichero que tienes que tocar (además de .env).
//  Escribe tu consulta SQL entre las dos comillas invertidas ` `
//  de cada pestaña. Guarda el fichero y recarga la web (F5):
//  no hace falta reiniciar el servidor.
//
//  Cada pestaña dice cuántas tarjetas deben salir. Si te salen
//  esas, la consulta está bien.
//
//  Consejo: prueba primero la consulta en Workbench y, cuando
//  funcione, cópiala aquí.
// ─────────────────────────────────────────────────────────────

module.exports = [
  {
    pestana: 'Catálogo',
    descripcion: 'Todos los juegos, de mejor a peor nota.',
    tarjetasEsperadas: 30,
    sql: `

    `,
  },
  {
    pestana: 'Menos de 15 €',
    descripcion: 'Los juegos que cuestan menos de 15 €, del más barato al más caro.',
    tarjetasEsperadas: 11,
    sql: `

    `,
  },
  {
    pestana: 'Hecho en España',
    descripcion: 'Los juegos de estudios españoles, con el nombre del estudio (ponle el alias «estudio»).',
    tarjetasEsperadas: 5,
    sql: `

    `,
  },
  {
    pestana: 'Indies',
    descripcion: 'Los juegos del género Indie.',
    tarjetasEsperadas: 16,
    sql: `

    `,
  },
  {
    pestana: 'Joyas recientes',
    descripcion: 'Los juegos de 2020 en adelante con una nota de 90 o más, de mejor a peor nota.',
    tarjetasEsperadas: 6,
    sql: `

    `,
  },
  {
    pestana: 'Estudios',
    opcional: true,
    descripcion: 'RETO OPCIONAL: todos los estudios con cuántos juegos tiene cada uno, también los que tienen 0 (columnas: nombre, pais y juegos).',
    tarjetasEsperadas: 21,
    sql: `

    `,
  },
];

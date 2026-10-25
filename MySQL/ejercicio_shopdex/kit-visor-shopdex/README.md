# Kit visor de ShopDex

Este kit convierte la base de datos `shopdex`, una tienda online, en una web de tarjetas. Cada pestaña de la web muestra el resultado de una consulta SQL que escribes tú.

Solo tienes que tocar dos ficheros:

- **`.env`**: tu usuario y contraseña de MySQL, y tu nombre.
- **`consultas.js`**: las consultas de cada pestaña.

El resto ya está hecho.

## Antes de empezar

1. **Crea la base de datos.** Abre `shopdex.sql` en Workbench y ejecútalo entero (icono del rayo). Comprueba que tienes 8 categorías, 14 marcas, 40 productos, 20 clientes, 48 pedidos, 100 líneas de pedido y 56 valoraciones.
2. **Necesitas Node.js.** Si no lo tienes, instala la versión LTS desde [nodejs.org](https://nodejs.org). Para comprobarlo, abre una terminal y escribe `node -v`: debe salir un número de versión (20 o superior).

Si en algún momento estropeas los datos, vuelve a ejecutar `shopdex.sql`: borra la base de datos y la crea de nuevo.

## Ponerlo en marcha

1. Abre esta carpeta en VS Code y abre una terminal en ella (menú *Terminal → New Terminal*).
2. Instala lo que necesita el kit. Solo hace falta la primera vez:

   ```
   npm install
   ```

3. Abre el fichero `.env` y cambia estos tres valores:

   ```
   MYSQL_USUARIO=root
   MYSQL_CONTRASENA=la contraseña que pusiste al instalar MySQL
   NOMBRE=tu nombre
   ```

   La web se titulará «La tienda de» seguido de tu nombre.

   > En Mac, el Finder oculta los ficheros que empiezan por punto. En VS Code sí lo verás. Si no aparece en el Finder, pulsa `Cmd + Mayús + .` para mostrarlo.

4. Arranca el visor:

   ```
   npm start
   ```

   Si todo va bien, la terminal dirá `✓ Conectado a MySQL: hay 40 productos y 48 pedidos.`

5. Abre en el navegador **http://localhost:3000**.

Para parar el visor, pulsa `Ctrl + C` en la terminal.

## Las tablas

| Tabla | Qué guarda | Se relaciona con |
|---|---|---|
| `categorias` | id, nombre, icono (un emoji) | — |
| `marcas` | id, nombre, pais | — |
| `productos` | id, nombre, precio, stock, fecha_alta | `categoria_id` → categorias, `marca_id` → marcas |
| `clientes` | id, nombre, apellidos, email, ciudad, fecha_registro | — |
| `pedidos` | id, fecha, estado (`pendiente`, `enviado`, `entregado` o `cancelado`) | `cliente_id` → clientes |
| `lineas_pedido` | cantidad, precio_unitario | `pedido_id` → pedidos, `producto_id` → productos |
| `valoraciones` | id, puntuacion (de 1 a 5), comentario, fecha | `producto_id` → productos, `cliente_id` → clientes |

Dos detalles importantes:

- Un pedido puede tener varios productos: cada uno es una fila de `lineas_pedido`. Lo que cuesta una línea es `cantidad * precio_unitario`.
- `precio_unitario` es el precio **al que se vendió**, que puede ser más bajo que el `precio` actual del producto (rebajas). Para calcular lo facturado usa siempre `precio_unitario`.

## Escribir las consultas

Abre `consultas.js`. Cada pestaña tiene un hueco entre dos comillas invertidas `` ` ` `` para tu consulta:

```js
{
  pestana: 'Últimas unidades',
  descripcion: 'Los productos de los que quedan menos de 5 unidades…',
  tarjetasEsperadas: 10,
  columnas: ['stock'],
  orden: { columna: 'stock', sentido: 'asc' },
  sql: `
    escribe aquí tu SELECT
  `,
},
```

Guarda el fichero y recarga la web con F5. No hace falta reiniciar el visor.

**No cambies** `tarjetasEsperadas`, `columnas`, `orden` ni `suma`: son las comprobaciones que hace la web. Debajo de la descripción de cada pestaña verás una lista con cada comprobación en verde (✓) o en rojo (✗):

- cuántas tarjetas deben salir;
- qué columnas tiene que tener el resultado (con ese nombre exacto: usa alias con `AS`);
- en qué orden deben salir;
- en algunas pestañas, cuánto tiene que sumar una columna. Si el número de tarjetas cuadra pero la suma no, el fallo suele estar en el cálculo: ¿has quitado los pedidos cancelados?, ¿has usado `precio_unitario`?, ¿necesitas `COUNT(DISTINCT …)`?

| | Pestaña | Qué se practica | Tarjetas |
|---|---|---|---|
| 1 | Catálogo | `JOIN` de tres tablas, alias | 40 |
| 2 | Últimas unidades | `WHERE`, `ORDER BY` | 10 |
| 3 | Hecho en España | `JOIN`, `BETWEEN` | 6 |
| 4 | Pedidos en curso | `IN`, `JOIN`, fechas | 7 |
| 5 | Sin estrenar | `LEFT JOIN … IS NULL` o `NOT IN` | 7 |
| 6 | Por encima de la media | subconsulta | 14 |
| 7 | Ventas por categoría | `GROUP BY`, `SUM`, cuatro tablas | 7 |
| 8 | Los más valorados | `AVG`, `ROUND`, `HAVING` | 4 |
| 9 | Top 5 clientes | `COUNT(DISTINCT)`, `LIMIT` | 5 |
| ★ | Ventas por mes (reto) | `DATE_FORMAT`, agrupar por una expresión | 10 |
| ★ | Caros para su categoría (reto) | subconsulta correlacionada | 14 |

Al lado de cada pestaña hay un punto:

- **verde** si todas las comprobaciones salen bien;
- **rojo** si alguna falla o la consulta da error;
- **gris** si todavía está vacía.

Arriba verás **«Tu progreso»**: cuántas pestañas tienes bien.

Algunos consejos:

- Prueba cada consulta primero en Workbench y, cuando funcione, cópiala aquí.
- La web elige el tipo de tarjeta según las columnas: si hay `nombre` y `precio` dibuja un producto; si hay `estado`, un pedido; si hay `apellidos`, un cliente. Si añades `icono`, la tarjeta del producto lleva el emoji de su categoría.
- Con `JOIN`, varias tablas tienen columnas `id` y `nombre`. Pon el alias delante (`p.nombre`, `c.nombre`) y renombra con `AS` las que necesites.
- El visor solo ejecuta consultas `SELECT`. Si escribes un `DELETE` o un `UPDATE` no lo ejecuta, así que no puedes estropear tus datos desde aquí.

## Si algo falla

La web y la terminal te dicen qué pasa. Estos son los mensajes más habituales:

| Mensaje | Qué hacer |
|---|---|
| *MySQL no acepta tu usuario o tu contraseña* | Revisa `MYSQL_USUARIO` y `MYSQL_CONTRASENA` en `.env`, guarda y reinicia el visor (`Ctrl + C` y `npm start`). |
| *No consigo conectar con MySQL* | MySQL no está arrancado. Ábrelo desde Workbench. |
| *No existe la base de datos «shopdex»* | Ejecuta `shopdex.sql` en Workbench. |
| *Esa tabla no existe* / *Esa columna no existe* | Revisa el nombre en la tabla de arriba: en minúsculas y sin tildes. |
| *Hay una columna que está en dos tablas* | Con JOIN, pon el alias delante: `p.id`, `c.nombre`… |
| *Con GROUP BY, todas las columnas…* | Añade al `GROUP BY` las columnas del `SELECT` que no estén dentro de `COUNT`, `SUM`, `AVG`… |
| *No puedes usar COUNT, SUM, AVG… dentro del WHERE* | Pasa esa condición a un `HAVING` después del `GROUP BY`. |
| *No puedo leer consultas.js* | Falta una comilla invertida `` ` `` o una coma en `consultas.js`. |
| *El puerto 3000 ya está en uso* | Ya tienes el visor abierto en otra terminal. Ciérralo o cambia `PUERTO_WEB` en `.env`. |
| `npm` no se reconoce | Node.js no está instalado, o hay que cerrar y volver a abrir VS Code después de instalarlo. |

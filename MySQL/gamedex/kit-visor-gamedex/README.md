# Kit visor de GameDex

Este kit convierte tu base de datos `gamedex` en una web de tarjetas. Cada pestaña de la web muestra el resultado de una consulta SQL que escribes tú.

Solo tienes que tocar dos ficheros:

- **`.env`**: tu usuario y contraseña de MySQL, y tu nombre.
- **`consultas.js`**: las consultas de cada pestaña.

El resto ya está hecho.

## Antes de empezar

1. **Tu base de datos `gamedex` tiene que estar creada y llena.** Comprueba en Workbench que tienes 21 estudios, 7 géneros, 30 juegos y 66 filas en `juego_genero`.
2. **Necesitas Node.js.** Si no lo tienes, instala la versión LTS desde [nodejs.org](https://nodejs.org). Para comprobarlo, abre una terminal y escribe `node -v`: debe salir un número de versión (20 o superior).

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

   La web se titulará «GameDex de» seguido de tu nombre.

   > En Mac, el Finder oculta los ficheros que empiezan por punto. En VS Code sí lo verás. Si no aparece en el Finder, pulsa `Cmd + Mayús + .` para mostrarlo.

4. Arranca el visor:

   ```
   npm start
   ```

   Si todo va bien, la terminal dirá `✓ Conectado a MySQL: la tabla juegos tiene 30 filas`.

5. Abre en el navegador **http://localhost:3000**.

Para parar el visor, pulsa `Ctrl + C` en la terminal.

## Escribir las consultas

Abre `consultas.js`. Cada pestaña tiene un hueco entre dos comillas invertidas `` ` ` `` para tu consulta:

```js
{
  pestana: 'Catálogo',
  descripcion: 'Todos los juegos, de mejor a peor nota.',
  tarjetasEsperadas: 30,
  sql: `
    escribe aquí tu SELECT
  `,
},
```

Guarda el fichero y recarga la web con F5. No hace falta reiniciar el visor.

Cada pestaña te dice cuántas tarjetas deben salir:

| Pestaña | Qué debe mostrar | Tarjetas |
|---|---|---|
| Catálogo | Todos los juegos, de mejor a peor nota | 30 |
| Menos de 15 € | Los juegos de menos de 15 €, del más barato al más caro | 11 |
| Hecho en España | Los juegos de estudios españoles, con el nombre del estudio | 5 |
| Indies | Los juegos del género Indie | 16 |
| Joyas recientes | Juegos de 2020 en adelante con nota de 90 o más, de mejor a peor nota | 6 |
| Estudios (reto opcional) | Todos los estudios con cuántos juegos tiene cada uno, también los que tienen 0 | 21 |

Al lado de cada pestaña hay un punto:

- **verde** si salen las tarjetas esperadas;
- **rojo** si salen otras o la consulta da error;
- **gris** si todavía está vacía.

Arriba verás **«Tus 5 números»**, que son los que escribirás en el chat al empezar la sesión 4.

Algunos consejos:

- Prueba cada consulta primero en Workbench y, cuando funcione, cópiala aquí.
- Para que la tarjeta muestre el estudio, pon a esa columna el alias `estudio`, por ejemplo `e.nombre AS estudio`.
- En «Estudios», llama `juegos` a la columna con el recuento para que se vea como número grande.
- El visor solo ejecuta consultas `SELECT`. Si escribes un `DELETE` o un `UPDATE` no lo ejecuta, así que no puedes estropear tus datos desde aquí.

## Tu juego favorito

Cuando los cinco números cuadren, añade tu juego favorito en Workbench, con su estudio y sus géneros. Recarga la web y aparecerá en el Catálogo.

En ese momento el Catálogo pasará a tener 31 tarjetas y su punto se pondrá rojo. Es normal: los números de comprobación son los de antes de añadirlo.

La imagen de la tarjeta es la URL de `imagen_url`. Para los juegos de Steam puedes usar este formato, cambiando el número por el de tu juego (es el número que aparece en la URL de su página de Steam):

```
https://cdn.akamai.steamstatic.com/steam/apps/NUMERO/header.jpg
```

## Si algo falla

La web y la terminal te dicen qué pasa. Estos son los mensajes más habituales:

| Mensaje | Qué hacer |
|---|---|
| *MySQL no acepta tu usuario o tu contraseña* | Revisa `MYSQL_USUARIO` y `MYSQL_CONTRASENA` en `.env`, guarda y reinicia el visor (`Ctrl + C` y `npm start`). |
| *No consigo conectar con MySQL* | MySQL no está arrancado. Ábrelo desde Workbench. |
| *No existe la base de datos «gamedex»* | Ejecuta tu `gamedex.sql` en Workbench. |
| *Esa tabla no existe* / *Esa columna no existe* | Revisa el nombre en tu `CREATE TABLE`: en minúsculas y sin tildes. |
| *Hay una columna que está en dos tablas* | Con JOIN, pon el alias delante: `j.id`, `e.nombre`… |
| *No puedo leer consultas.js* | Falta una comilla invertida `` ` `` o una coma en `consultas.js`. |
| *El puerto 3000 ya está en uso* | Ya tienes el visor abierto en otra terminal. Ciérralo o cambia `PUERTO_WEB` en `.env`. |
| `npm` no se reconoce | Node.js no está instalado, o hay que cerrar y volver a abrir VS Code después de instalarlo. |

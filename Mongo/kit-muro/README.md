# El muro de la clase

Una web de post-its donde escribe toda la clase a la vez. Los mensajes se guardan en **MongoDB Atlas**, en la misma base de datos para todos: lo que publiques tú aparece en el muro de tus compañeros, y al revés.

La web y el servidor ya están hechos. Tú programas la parte de MongoDB: **6 funciones en `db.js`**. Cada vez que completas una, algo nuevo funciona en la web.

Solo tienes que tocar dos ficheros:

- **`.env`**: la cadena de conexión que pasa el profesor y tu nombre.
- **`db.js`**: tus funciones.

## Antes de empezar

**Necesitas Node.js.** Si no lo tienes, instala la versión LTS desde [nodejs.org](https://nodejs.org). Para comprobarlo, abre una terminal y escribe `node -v`: debe salir un número de versión (20 o superior).

## Ponerlo en marcha

1. Abre esta carpeta en VS Code y abre una terminal en ella (menú *Terminal → New Terminal*).
2. Instala lo que necesita el kit. Solo hace falta la primera vez:

   ```
   npm install
   ```

3. Abre el fichero `.env` y cambia estos dos valores:

   ```
   MONGODB_URI=la cadena que ha pasado el profesor por el chat
   NOMBRE=tu nombre
   ```

   > En Mac, el Finder oculta los ficheros que empiezan por punto. En VS Code sí lo verás.

4. Arranca el servidor:

   ```
   npm start
   ```

   Si todo va bien, la terminal dirá `✓ Conectado a MongoDB: el muro tiene … mensajes`.

5. Abre en el navegador **http://localhost:3000**.

Cada vez que guardas `db.js`, el servidor se reinicia solo. Recarga la web (F5) para ver el cambio. Para parar el servidor, pulsa `Ctrl + C` en la terminal.

## Las funciones

Arriba de la web verás las 6 funciones con un punto: **verde** si ya está programada y **gris** si todavía está vacía.

| Función | Qué hace | Qué se activa en la web |
|---|---|---|
| `crearMensaje(texto, autor)` | Guarda `{ texto, autor, likes: 0, fecha: new Date() }` | El botón **Publicar** |
| `listarMensajes()` | Devuelve todos los mensajes, del más nuevo al más antiguo | Se ven los post-its |
| `darLike(id)` | Suma 1 a `likes` del mensaje con ese `_id` | El botón ❤️ |
| `borrarMensaje(id)` | Borra el mensaje con ese `_id` | El botón 🗑️ |
| `editarMensaje(id, texto)` *(extra)* | Cambia el texto del mensaje con ese `_id` | El botón ✏️ |
| `listarDeAutor(autor)` *(extra)* | Devuelve solo los mensajes de esa persona | Pulsar el nombre de un post-it |

Algunos consejos:

- Son los mismos métodos que usaste en mongosh (`insertOne`, `find`, `updateOne`, `deleteOne`…), con `await` delante.
- `find()` no da la lista directamente: hay que terminar con `.toArray()`.
- Las funciones que «devuelven» algo necesitan `return`.
- El `id` llega como texto. Para buscar por `_id` hay que convertirlo: `{ _id: new ObjectId(id) }`.
- Antes de borrar o modificar, piensa qué filtro usas: con `{}` afectaría a **todos** los mensajes de la clase.

## Si algo falla

La web y la terminal te dicen qué pasa. Estos son los mensajes más habituales:

| Mensaje | Qué hacer |
|---|---|
| *Falta la cadena de conexión* | Pega en `MONGODB_URI` del `.env` la cadena del profesor y guarda. |
| *Atlas no acepta el usuario o la contraseña* | La cadena está mal copiada. Cópiala otra vez entera. |
| *No consigo conectar con Atlas* | Comprueba tu conexión a internet y avisa al profesor (puede que tu IP no esté permitida). |
| *Todavía no has programado …* | Esa función de `db.js` sigue vacía. |
| *… devuelve un cursor, no la lista* | Añade `.toArray()` al final del `find()`. |
| *… no devuelve nada* | Falta `return` delante de `mensajes.find()…`. |
| *El like no se ha guardado* / *El mensaje sigue ahí* | El filtro no encuentra el mensaje. ¿Has usado `new ObjectId(id)`? |
| *No puedo leer db.js* | Falta una llave `{ }`, un paréntesis o una coma. |
| *El puerto 3000 ya está en uso* | Ya tienes el muro abierto en otra terminal. Ciérralo o cambia `PUERTO_WEB` en `.env`. |
| `npm` no se reconoce | Node.js no está instalado, o hay que cerrar y volver a abrir VS Code después de instalarlo. |

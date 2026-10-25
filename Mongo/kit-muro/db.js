// ─────────────────────────────────────────────────────────────
//  El muro de la clase · TUS FUNCIONES
//
//  Este es el único fichero que tienes que tocar (además de .env).
//  Cada función está vacía: escribe dentro el código de MongoDB.
//  Son los mismos métodos que en mongosh, pero con await delante.
//
//  Al guardar, el servidor se reinicia solo. Recarga la web (F5)
//  y verás que algo nuevo funciona.
//
//  Recuerda:
//   · find() necesita .toArray() al final para darte la lista.
//   · El id llega como texto: conviértelo con new ObjectId(id).
// ─────────────────────────────────────────────────────────────

const { MongoClient, ObjectId } = require('mongodb');

const client = new MongoClient(process.env.MONGODB_URI);
const mensajes = client.db('muro').collection('mensajes');

// Guarda un mensaje nuevo con este formato:
// { texto, autor, likes: 0, fecha: new Date() }
async function crearMensaje(texto, autor) {
  // Escribe aquí tu código
}

// Devuelve (return) todos los mensajes, del más nuevo al más antiguo
async function listarMensajes() {
  // Escribe aquí tu código
}

// Suma 1 a los likes del mensaje que tiene ese _id
async function darLike(id) {
  // Escribe aquí tu código
}

// Borra el mensaje que tiene ese _id
async function borrarMensaje(id) {
  // Escribe aquí tu código
}

// ── Retos extra ──

// Cambia el texto del mensaje que tiene ese _id
async function editarMensaje(id, texto) {
  // Escribe aquí tu código
}

// Devuelve (return) solo los mensajes de esa persona, del más nuevo al más antiguo
async function listarDeAutor(autor) {
  // Escribe aquí tu código
}

module.exports = { crearMensaje, listarMensajes, darLike, borrarMensaje, editarMensaje, listarDeAutor };

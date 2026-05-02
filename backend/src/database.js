/**
 * database.js - Conexión a MongoDB usando Mongoose.
 * Lee la cadena de conexión desde MONGO_URI en el archivo .env.
 */
const mongoose = require('mongoose');

const URI = process.env.MONGO_URI || 'mongodb://localhost:27017/SistemaPrestamos';

const connect = async () => {
  try {
    await mongoose.connect(URI);
    console.log(`[db] Conectado a MongoDB → ${URI}`);
  } catch (err) {
    console.error('[db] Error de conexión a MongoDB:', err.message);
    process.exit(1);
  }
};

module.exports = { connect, mongoose };

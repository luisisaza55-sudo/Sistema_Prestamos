/**
 * index.js - Punto de entrada del backend.
 * Configura Express, conecta a MongoDB, ejecuta el seed y levanta el servidor.
 */
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { connect } = require('./database');
const seed = require('./seed');
const herramientasRoutes = require('./routes/herramientas');
const prestamosRoutes = require('./routes/prestamos');
const informesRoutes = require('./routes/informes');

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/herramientas', herramientasRoutes);
app.use('/prestamos', prestamosRoutes);
app.use('/informes', informesRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: err.message || 'Error interno del servidor' });
});

(async () => {
  await connect();
  await seed();
  app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
  });
})();

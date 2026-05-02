/**
 * Ruta de Informes: GET /resumen para estadísticas del dashboard.
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/informesController');

router.get('/resumen', ctrl.resumen);

module.exports = router;

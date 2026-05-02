/**
 * Rutas REST para Préstamos: GET, POST, PUT (devolver), GET vencidos.
 */
const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/prestamosController');

// /vencidos debe ir antes de /:id para que Express no lo interprete como ID
router.get('/vencidos', ctrl.getVencidos);
router.get('/', ctrl.getAll);
router.post('/', ctrl.create);
router.put('/:id/devolver', ctrl.devolver);

module.exports = router;

/**
 * Controller de Prestamos - Capa HTTP.
 * Maneja registro, devolución y consulta de préstamos.
 */
const service = require('../services/prestamosService');

const getAll = async (req, res) => {
  try {
    res.json(await service.getAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { herramienta_id, nombre_vecino, descripcion_vecino, fecha_inicio, fecha_fin } = req.body;
    if (!herramienta_id || !nombre_vecino || !fecha_inicio || !fecha_fin) {
      return res.status(400).json({
        error: 'herramienta_id, nombre_vecino, fecha_inicio y fecha_fin son requeridos',
      });
    }
    const creado = await service.create({ herramienta_id, nombre_vecino, descripcion_vecino, fecha_inicio, fecha_fin });
    res.status(201).json(creado);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const devolver = async (req, res) => {
  try {
    res.json(await service.devolver(req.params.id));
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

const getVencidos = async (req, res) => {
  try {
    res.json(await service.getVencidos());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getAll, create, devolver, getVencidos };

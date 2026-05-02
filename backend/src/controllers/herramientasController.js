/**
 * Controller de Herramientas - Capa HTTP.
 * Recibe requests, valida, llama al service y devuelve respuestas JSON.
 */
const service = require('../services/herramientasService');

const getAll = async (req, res) => {
  try {
    res.json(await service.getAll());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getById = async (req, res) => {
  try {
    const herramienta = await service.getById(req.params.id);
    if (!herramienta) return res.status(404).json({ error: 'Herramienta no encontrada' });
    res.json(herramienta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const create = async (req, res) => {
  try {
    const { nombre, descripcion, cantidad_total } = req.body;
    if (!nombre || cantidad_total === undefined) {
      return res.status(400).json({ error: 'nombre y cantidad_total son requeridos' });
    }
    const creada = await service.create({ nombre, descripcion, cantidad_total });
    res.status(201).json(creada);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const update = async (req, res) => {
  try {
    const herramienta = await service.update(req.params.id, req.body);
    if (!herramienta) return res.status(404).json({ error: 'Herramienta no encontrada' });
    res.json(herramienta);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const remove = async (req, res) => {
  try {
    const herramienta = await service.remove(req.params.id);
    if (!herramienta) return res.status(404).json({ error: 'Herramienta no encontrada' });
    res.json({ message: 'Herramienta eliminada', herramienta });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

module.exports = { getAll, getById, create, update, remove };

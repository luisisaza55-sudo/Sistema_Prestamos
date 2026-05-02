/**
 * Service de Herramientas - Lógica de negocio.
 * CRUD + validaciones (no eliminar si tiene préstamos activos, ajuste de stock).
 */
const Herramienta = require('../models/herramienta');
const Prestamo = require('../models/prestamo');

const getAll = async () => {
  return Herramienta.find().sort({ createdAt: -1 });
};

const getById = async (id) => {
  return Herramienta.findById(id);
};

const create = async ({ nombre, descripcion = '', cantidad_total }) => {
  const qty = Number(cantidad_total);
  return Herramienta.create({
    nombre,
    descripcion,
    cantidad_total: qty,
    cantidad_disponible: qty,
  });
};

const update = async (id, datos) => {
  const herramienta = await Herramienta.findById(id);
  if (!herramienta) return null;

  const { nombre, descripcion, cantidad_total, estado } = datos;

  if (nombre !== undefined)      herramienta.nombre = nombre;
  if (descripcion !== undefined) herramienta.descripcion = descripcion;
  if (estado !== undefined)      herramienta.estado = estado;

  if (cantidad_total !== undefined) {
    const nueva = Number(cantidad_total);
    const diff = nueva - herramienta.cantidad_total;
    herramienta.cantidad_total = nueva;
    herramienta.cantidad_disponible = Math.max(0, herramienta.cantidad_disponible + diff);
  }

  await herramienta.save();

  // Si cambió el nombre, propagar a los préstamos asociados
  if (nombre !== undefined) {
    await Prestamo.updateMany(
      { herramienta_id: herramienta._id },
      { $set: { herramienta_nombre: herramienta.nombre } }
    );
  }

  return herramienta;
};

const remove = async (id) => {
  const herramienta = await Herramienta.findById(id);
  if (!herramienta) return null;

  const activos = await Prestamo.countDocuments({
    herramienta_id: herramienta._id,
    estado: { $in: ['prestado', 'vencido'] },
  });

  if (activos > 0) {
    throw new Error('No se puede eliminar una herramienta con préstamos activos o vencidos');
  }

  await Herramienta.deleteOne({ _id: herramienta._id });
  return herramienta;
};

module.exports = { getAll, getById, create, update, remove };

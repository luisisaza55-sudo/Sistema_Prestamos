/**
 * Service de Prestamos - Lógica de negocio.
 * Valida stock, marca vencidos automáticamente, gestiona devoluciones.
 */
const Prestamo = require('../models/prestamo');
const Herramienta = require('../models/herramienta');

const actualizarVencidos = async () => {
  const hoy = new Date().toISOString().split('T')[0];
  await Prestamo.updateMany(
    { estado: 'prestado', fecha_fin: { $lt: hoy } },
    { $set: { estado: 'vencido' } }
  );
};

const getAll = async () => {
  await actualizarVencidos();
  return Prestamo.find().sort({ createdAt: -1 });
};

const create = async ({ herramienta_id, nombre_vecino, descripcion_vecino = '', fecha_inicio, fecha_fin }) => {
  const herramienta = await Herramienta.findById(herramienta_id);

  if (!herramienta) throw new Error('Herramienta no encontrada');
  if (herramienta.estado !== 'activo') throw new Error('La herramienta no está activa');
  if (herramienta.cantidad_disponible <= 0) throw new Error('No hay unidades disponibles de esta herramienta');

  const prestamo = await Prestamo.create({
    herramienta_id: herramienta._id,
    herramienta_nombre: herramienta.nombre,
    nombre_vecino,
    descripcion_vecino,
    fecha_inicio,
    fecha_fin,
  });

  herramienta.cantidad_disponible -= 1;
  await herramienta.save();

  return prestamo;
};

const devolver = async (id) => {
  const prestamo = await Prestamo.findById(id);
  if (!prestamo) throw new Error('Préstamo no encontrado');
  if (prestamo.estado === 'devuelto') throw new Error('Este préstamo ya fue devuelto');

  prestamo.estado = 'devuelto';
  prestamo.fecha_devolucion = new Date().toISOString().split('T')[0];
  await prestamo.save();

  await Herramienta.updateOne(
    { _id: prestamo.herramienta_id },
    { $inc: { cantidad_disponible: 1 } }
  );

  return prestamo;
};

const getVencidos = async () => {
  await actualizarVencidos();
  return Prestamo.find({ estado: 'vencido' }).sort({ fecha_fin: 1 });
};

module.exports = { getAll, create, devolver, getVencidos, actualizarVencidos };

/**
 * Controller de Informes - Estadísticas para el dashboard.
 * Devuelve totales: herramientas, préstamos activos/vencidos y sin stock.
 */
const Herramienta = require('../models/herramienta');
const Prestamo = require('../models/prestamo');
const { actualizarVencidos } = require('../services/prestamosService');

const resumen = async (req, res) => {
  try {
    await actualizarVencidos();

    const [
      total_herramientas,
      prestamos_activos,
      prestamos_vencidos,
      herramientas_sin_stock,
    ] = await Promise.all([
      Herramienta.countDocuments(),
      Prestamo.countDocuments({ estado: 'prestado' }),
      Prestamo.countDocuments({ estado: 'vencido' }),
      Herramienta.countDocuments({ cantidad_disponible: 0, estado: 'activo' }),
    ]);

    res.json({ total_herramientas, prestamos_activos, prestamos_vencidos, herramientas_sin_stock });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { resumen };

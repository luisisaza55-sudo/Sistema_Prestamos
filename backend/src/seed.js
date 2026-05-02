/**
 * seed.js - Carga datos de ejemplo (10 herramientas + 5 préstamos).
 * Solo se ejecuta si la colección de herramientas está vacía.
 */
const Herramienta = require('./models/herramienta');
const Prestamo = require('./models/prestamo');

module.exports = async () => {
  const existe = await Herramienta.countDocuments();
  if (existe > 0) return;

  const datosHerr = [
    { nombre: 'Taladro Eléctrico',        descripcion: 'Taladro percutor 750W, maletín con 18 brocas incluido', cantidad_total: 3 },
    { nombre: 'Escalera 6 metros',        descripcion: 'Escalera extensible de aluminio, carga máx. 150 kg',    cantidad_total: 2 },
    { nombre: 'Martillo de Demolición',   descripcion: 'Martillo eléctrico SDS-Plus 1500W con 5 cinceles',       cantidad_total: 1 },
    { nombre: 'Llave Inglesa Ajustable',  descripcion: 'Llave de boca ajustable 12 pulgadas, mango ergonómico',  cantidad_total: 4 },
    { nombre: 'Sierra Circular',          descripcion: 'Sierra circular 1200W hoja 185 mm, guía incluida',       cantidad_total: 2 },
    { nombre: 'Nivel de Burbuja',         descripcion: 'Nivel magnético de aluminio 60 cm, triple vial',         cantidad_total: 5 },
    { nombre: 'Destornillador Eléctrico', descripcion: 'Destornillador inalámbrico 12V con 2 baterías',          cantidad_total: 3 },
    { nombre: 'Cinta Métrica 5m',         descripcion: 'Cinta con freno automático y clip de cinturón',          cantidad_total: 8 },
    { nombre: 'Lijadora Orbital',         descripcion: 'Lijadora orbital 300W, bolsa recolectora de polvo',      cantidad_total: 2 },
    { nombre: 'Alicate Universal',        descripcion: 'Alicate multiusos con mango aislante 8 pulgadas',        cantidad_total: 6 },
  ];

  const herramientas = await Herramienta.insertMany(
    datosHerr.map((h) => ({ ...h, cantidad_disponible: h.cantidad_total }))
  );

  const idDe = (nombre) => herramientas.find((h) => h.nombre === nombre);

  const datosPrest = [
    { nombre: 'Taladro Eléctrico',       vecino: 'Carlos Ramírez',  ref: 'Torre 1, Apto 302', fi: '2026-04-20', ff: '2026-04-30', fd: null,         est: 'prestado' },
    { nombre: 'Escalera 6 metros',       vecino: 'María López',     ref: 'Torre 2, Apto 105', fi: '2026-04-22', ff: '2026-04-25', fd: null,         est: 'vencido'  },
    { nombre: 'Martillo de Demolición',  vecino: 'Juan García',     ref: 'Torre 3, Apto 201', fi: '2026-04-10', ff: '2026-04-15', fd: null,         est: 'vencido'  },
    { nombre: 'Sierra Circular',         vecino: 'Ana Martínez',    ref: 'Torre 1, Apto 410', fi: '2026-04-25', ff: '2026-05-05', fd: null,         est: 'prestado' },
    { nombre: 'Nivel de Burbuja',        vecino: 'Pedro Jiménez',   ref: 'Torre 2, Apto 308', fi: '2026-04-18', ff: '2026-04-23', fd: '2026-04-22', est: 'devuelto' },
  ];

  for (const p of datosPrest) {
    const h = idDe(p.nombre);
    if (!h) continue;
    await Prestamo.create({
      herramienta_id: h._id,
      herramienta_nombre: h.nombre,
      nombre_vecino: p.vecino,
      descripcion_vecino: p.ref,
      fecha_inicio: p.fi,
      fecha_fin: p.ff,
      fecha_devolucion: p.fd,
      estado: p.est,
    });
    if (p.est === 'prestado' || p.est === 'vencido') {
      h.cantidad_disponible -= 1;
      await h.save();
    }
  }

  console.log('[seed] Datos de ejemplo cargados en MongoDB.');
};

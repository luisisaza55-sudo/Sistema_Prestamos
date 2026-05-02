/**
 * Modelo Prestamo - Schema de Mongoose para la colección Prestamos.
 * Referencia a Herramienta y guarda nombre denormalizado para evitar populate.
 */
const mongoose = require('mongoose');

const PrestamoSchema = new mongoose.Schema(
  {
    herramienta_id:     { type: mongoose.Schema.Types.ObjectId, ref: 'Herramienta', required: true },
    herramienta_nombre: { type: String, required: true },
    nombre_vecino:      { type: String, required: true },
    descripcion_vecino: { type: String, default: '' },
    fecha_inicio:       { type: String, required: true },
    fecha_fin:          { type: String, required: true },
    fecha_devolucion:   { type: String, default: null },
    estado:             { type: String, enum: ['prestado', 'vencido', 'devuelto'], default: 'prestado' },
  },
  {
    collection: 'Prestamos',
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        ret.id = String(ret._id);
        ret.herramienta_id = String(ret.herramienta_id);
        delete ret._id;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Prestamo', PrestamoSchema);

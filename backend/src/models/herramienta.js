/**
 * Modelo Herramienta - Schema de Mongoose para la colección Herramientas.
 * Campos: nombre, descripcion, cantidad_total, cantidad_disponible, estado.
 */
const mongoose = require('mongoose');

const HerramientaSchema = new mongoose.Schema(
  {
    nombre:               { type: String, required: true, trim: true },
    descripcion:          { type: String, default: '' },
    cantidad_total:       { type: Number, required: true, min: 1 },
    cantidad_disponible:  { type: Number, required: true, min: 0 },
    estado:               { type: String, enum: ['activo', 'inactivo'], default: 'activo' },
  },
  {
    collection: 'Herramientas',
    timestamps: true,
    toJSON: {
      virtuals: true,
      versionKey: false,
      transform: (_, ret) => {
        ret.id = String(ret._id);
        delete ret._id;
        return ret;
      },
    },
  }
);

module.exports = mongoose.model('Herramienta', HerramientaSchema);

import mongoose from "mongoose";

const productoSchema = new mongoose.Schema({
    nombre: { type: String, required: true, trim: true, minlength: 2, maxlength: 100 },
    descripcion: { type: String, trim: true, maxlength: 1000 },
    precio: { type: Number, required: true, min: 0 },
    categoria: { type: String, required: true, trim: true, lowercase: true },
    stock: { type: Number, default: 0, min: 0 },
    imagen: { type: String, default: null },
    sku: { type: String, unique: true, sparse: true },
    activo: { type: Boolean, default: true }
}, { timestamps: true });

export default mongoose.model("Producto", productoSchema);

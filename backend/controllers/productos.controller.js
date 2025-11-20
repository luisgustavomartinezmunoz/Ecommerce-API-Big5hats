import Producto from "../models/producto.model.js";
import mongoose from "mongoose";

// Validación ligera de payload
const validatePayload = (body) => {
  const errors = [];
  if (!body.nombre || typeof body.nombre !== 'string' || body.nombre.trim().length < 2) errors.push('nombre inválido');
  if (body.precio === undefined || isNaN(Number(body.precio)) || Number(body.precio) < 0) errors.push('precio inválido');
  if (!body.categoria || typeof body.categoria !== 'string') errors.push('categoria inválida');
  if (body.stock !== undefined && (isNaN(Number(body.stock)) || Number(body.stock) < 0)) errors.push('stock inválido');
  return errors;
};

export const obtenerProductos = async (req, res, next) => {
  try {
    const { categoria, q, sort = 'default', page = 1, limit = 20 } = req.query;
    const filter = { activo: true };
    if (categoria) filter.categoria = categoria.toLowerCase();
    if (q) filter.$or = [ { nombre: { $regex: q, $options: 'i' } }, { descripcion: { $regex: q, $options: 'i' } } ];

    let sortObj = { createdAt: -1 };
    if (sort === 'price-asc') sortObj = { precio: 1 };
    if (sort === 'price-desc') sortObj = { precio: -1 };

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

    const total = await Producto.countDocuments(filter);
    const productos = await Producto.find(filter).sort(sortObj).skip((pageNum - 1) * limitNum).limit(limitNum).lean();
    return res.json({ success: true, data: productos, meta: { total, page: pageNum, limit: limitNum } });
  } catch (err) {
    next(err);
  }
};

export const obtenerCategorias = async (req, res, next) => {
  try {
    const categorias = await Producto.distinct('categoria', { activo: true });
    return res.json({ success: true, data: categorias.sort() });
  } catch (err) {
    next(err);
  }
};

export const obtenerProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ mensaje: 'ID inválido' });
    const producto = await Producto.findById(id).lean();
    if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    return res.json({ success: true, data: producto });
  } catch (err) {
    next(err);
  }
};

export const crearProducto = async (req, res, next) => {
  try {
    const body = req.body || {};
    const errors = validatePayload(body);
    if (errors.length) return res.status(400).json({ mensaje: 'Datos inválidos', errors });
    if (body.categoria) body.categoria = body.categoria.toLowerCase();
    const producto = new Producto(body);
    await producto.save();
    return res.status(201).json({ success: true, data: producto });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ mensaje: 'SKU duplicado', detalle: err.keyValue });
    next(err);
  }
};

export const actualizarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ mensaje: 'ID inválido' });
    const body = req.body || {};
    const errors = validatePayload(body);
    if (errors.length) return res.status(400).json({ mensaje: 'Datos inválidos', errors });
    if (body.categoria) body.categoria = body.categoria.toLowerCase();
    const updated = await Producto.findByIdAndUpdate(id, body, { new: true, runValidators: true }).lean();
    if (!updated) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    return res.json({ success: true, data: updated });
  } catch (err) {
    if (err.code === 11000) return res.status(409).json({ mensaje: 'SKU duplicado', detalle: err.keyValue });
    next(err);
  }
};

export const eliminarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ mensaje: 'ID inválido' });
    const deleted = await Producto.findByIdAndDelete(id).lean();
    if (!deleted) return res.status(404).json({ mensaje: 'Producto no encontrado' });
    return res.json({ success: true, mensaje: 'Producto eliminado' });
  } catch (err) {
    next(err);
  }
};

export default { obtenerProductos, obtenerCategorias, obtenerProducto, crearProducto, actualizarProducto, eliminarProducto };

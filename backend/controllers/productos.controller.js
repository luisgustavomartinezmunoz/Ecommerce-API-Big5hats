import Producto from "../models/producto.model.js";
import mongoose from "mongoose";

// Helper: validate basic product payload and return array of errors (empty if valid)
const validateProductPayload = (payload = {}) => {
	const errors = [];
	const { nombre, precio, categoria, stock, descripcion, imagen, sku } = payload;
	if (!nombre || typeof nombre !== 'string' || nombre.trim().length < 2) errors.push('nombre es obligatorio y debe tener al menos 2 caracteres');
	if (precio === undefined || isNaN(Number(precio)) || Number(precio) < 0) errors.push('precio es obligatorio y debe ser numérico >= 0');
	if (!categoria || typeof categoria !== 'string') errors.push('categoria es obligatoria');
	if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0)) errors.push('stock debe ser numérico y >= 0');
	if (descripcion && typeof descripcion !== 'string') errors.push('descripcion debe ser texto');
	if (imagen && typeof imagen !== 'string') errors.push('imagen debe ser la url de la imagen');
	if (sku && typeof sku !== 'string') errors.push('sku debe ser texto');
	return errors;
};

// GET /api/productos
export const obtenerProductos = async (req, res, next) => {
	try {
		const { categoria, q, page = 1, limit = 20, sort = 'default' } = req.query;
		const pageNum = Math.max(1, parseInt(page, 10) || 1);
		const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

		const filter = { activo: true };
		if (categoria) filter.categoria = categoria.toString().toLowerCase();
		if (q) filter.$or = [
			{ nombre: { $regex: q, $options: 'i' } },
			{ descripcion: { $regex: q, $options: 'i' } }
		];

		let mongoSort = { createdAt: -1 };
		if (sort === 'price-asc') mongoSort = { precio: 1 };
		if (sort === 'price-desc') mongoSort = { precio: -1 };

		const total = await Producto.countDocuments(filter);
		const productos = await Producto.find(filter)
			.sort(mongoSort)
			.skip((pageNum - 1) * limitNum)
			.limit(limitNum)
			.lean();

		return res.json({ success: true, data: productos, meta: { total, page: pageNum, limit: limitNum } });
	} catch (err) {
		return next(err);
	}
};

// GET /api/productos/categorias
export const obtenerCategorias = async (req, res, next) => {
	try {
		const categorias = await Producto.distinct('categoria', { activo: true });
		return res.json({ success: true, data: categorias.sort() });
	} catch (err) {
		next(err);
	}
};

// GET /api/productos/:id
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

// POST /api/productos  (admin)
export const crearProducto = async (req, res, next) => {
	try {
		const payload = req.body || {};
		const errors = validateProductPayload(payload);
		if (errors.length) return res.status(400).json({ mensaje: 'Datos inválidos', errors });

		// normalizar categoría a minúsculas
		if (payload.categoria) payload.categoria = payload.categoria.toLowerCase();

		const producto = new Producto(payload);
		await producto.save();
		return res.status(201).json({ success: true, data: producto });
	} catch (err) {
		// Unique index error for sku
		if (err.code === 11000) return res.status(409).json({ mensaje: 'SKU duplicado', detalle: err.keyValue });
		next(err);
	}
};

// PUT /api/productos/:id  (admin)
export const actualizarProducto = async (req, res, next) => {
	try {
		const { id } = req.params;
		const payload = req.body || {};
		if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ mensaje: 'ID inválido' });

		const errors = validateProductPayload(payload);
		if (errors.length) return res.status(400).json({ mensaje: 'Datos inválidos', errors });

		if (payload.categoria) payload.categoria = payload.categoria.toLowerCase();

		const producto = await Producto.findByIdAndUpdate(id, payload, { new: true, runValidators: true }).lean();
		if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
		return res.json({ success: true, data: producto });
	} catch (err) {
		if (err.code === 11000) return res.status(409).json({ mensaje: 'SKU duplicado', detalle: err.keyValue });
		next(err);
	}
};

// DELETE /api/productos/:id  (admin)
export const eliminarProducto = async (req, res, next) => {
	try {
		const { id } = req.params;
		if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).json({ mensaje: 'ID inválido' });

		const producto = await Producto.findByIdAndDelete(id).lean();
		if (!producto) return res.status(404).json({ mensaje: 'Producto no encontrado' });
		return res.json({ success: true, mensaje: 'Producto eliminado' });
	} catch (err) {
		next(err);
	}
};

export default { obtenerProductos, obtenerCategorias, obtenerProducto, crearProducto, actualizarProducto, eliminarProducto };


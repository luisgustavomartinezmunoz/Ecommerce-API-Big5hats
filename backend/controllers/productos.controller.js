import {
  listProductos,
  getProducto,
  createProducto,
  updateProducto,
  deleteProducto,
  listCategorias,
} from "../models/producto.repo.js";

// Helper: validate basic product payload and return array of errors (empty if valid)
const validateProductPayload = (payload = {}) => {
  const errors = [];
  const { nombre, precio, categoria, stock, descripcion, imagen } = payload;
  if (!nombre || typeof nombre !== "string" || nombre.trim().length < 2)
    errors.push("nombre es obligatorio y debe tener al menos 2 caracteres");
  if (precio === undefined || isNaN(Number(precio)) || Number(precio) < 0)
    errors.push("precio es obligatorio y debe ser numerico >= 0");
  if (!categoria || typeof categoria !== "string")
    errors.push("categoria es obligatoria");
  if (stock !== undefined && (isNaN(Number(stock)) || Number(stock) < 0))
    errors.push("stock debe ser numerico y >= 0");
  if (descripcion && typeof descripcion !== "string")
    errors.push("descripcion debe ser texto");
  if (imagen && typeof imagen !== "string")
    errors.push("imagen debe ser la url o ruta de la imagen");
  return errors;
};

// Helper: build absolute URL for images stored in backend /img folder
const buildImageUrl = (req, imagen) => {
  if (!imagen) return null;
  if (/^https?:\/\//i.test(imagen)) return imagen; // external URL already
  const normalized = imagen.startsWith("/") ? imagen : `/${imagen}`;
  return `${req.protocol}://${req.get("host")}${normalized}`;
};

const mapProductoImagen = (producto, req) => {
  if (!producto) return null;
  return { ...producto, imagen: buildImageUrl(req, producto.imagen) };
};

// GET /api/productos
export const obtenerProductos = async (req, res, next) => {
  try {
    const {
      categoria,
      q,
      page = 1,
      limit = 20,
      sort = "default",
      minPrecio,
      maxPrecio,
      oferta,
      disponible,
    } = req.query;

    const filters = {
      categoria,
      q,
      page,
      limit,
      sort: sort === "default" ? "created_at" : sort,
    };
    if (minPrecio !== undefined) filters.minPrecio = Number(minPrecio);
    if (maxPrecio !== undefined) filters.maxPrecio = Number(maxPrecio);
    if (oferta !== undefined) filters.oferta = oferta === "true" || oferta === "1";
    if (disponible !== undefined) filters.disponible = disponible === "true" || disponible === "1";

    const result = await listProductos(filters);
    const data = (result.data || []).map((p) => mapProductoImagen(p, req));
    return res.json({ success: true, data, meta: result.meta });
  } catch (err) {
    return next(err);
  }
};

// GET /api/productos/categorias
export const obtenerCategorias = async (req, res, next) => {
  try {
    const categorias = await listCategorias();
    return res.json({ success: true, data: categorias });
  } catch (err) {
    next(err);
  }
};

// GET /api/productos/:id
export const obtenerProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const producto = mapProductoImagen(await getProducto(id), req);
    if (!producto) return res.status(404).json({ mensaje: "Producto no encontrado" });
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
    if (errors.length) return res.status(400).json({ mensaje: "Datos invalidos", errors });

    const producto = mapProductoImagen(await createProducto(payload), req);
    return res.status(201).json({ success: true, data: producto });
  } catch (err) {
    next(err);
  }
};

// PUT /api/productos/:id  (admin)
export const actualizarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const payload = req.body || {};
    const errors = validateProductPayload({
      ...payload,
      nombre: payload.nombre ?? "temp",
      precio: payload.precio ?? 0,
      categoria: payload.categoria ?? "temp",
    });
    if (errors.length) return res.status(400).json({ mensaje: "Datos invalidos", errors });

    const producto = mapProductoImagen(await updateProducto(id, payload), req);
    if (!producto) return res.status(404).json({ mensaje: "Producto no encontrado" });
    return res.json({ success: true, data: producto });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/productos/:id  (admin)
export const eliminarProducto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const producto = await getProducto(id);
    if (!producto) return res.status(404).json({ mensaje: "Producto no encontrado" });
    await deleteProducto(id);
    return res.json({ success: true, mensaje: "Producto eliminado" });
  } catch (err) {
    next(err);
  }
};

export default {
  obtenerProductos,
  obtenerCategorias,
  obtenerProducto,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
};

import { pool } from "../config/db.js";

const buildError = (status, mensaje) => {
  const err = new Error(mensaje);
  err.status = status;
  err.mensaje = mensaje;
  return err;
};

export async function crearOrdenConDetalles(payload = {}) {
  const {
    usuarioId,
    items = [],
    shipping = 0,
    tax = 0,
    discount = 0,
    metodoPago = "card",
    promoCode = null,
    datosEnvio = {},
  } = payload;

  if (!usuarioId) throw buildError(401, "Usuario no autenticado");
  if (!Array.isArray(items) || !items.length) throw buildError(400, "Se requieren items para generar la orden");

  const conn = await pool.getConnection();

  try {
    await conn.beginTransaction();

    let subtotal = 0;
    const detalles = [];

    for (const raw of items) {
      const productoId = Number(raw.productoId || raw.id);
      const cantidad = Number(raw.cantidad);

      if (!productoId || !cantidad || cantidad <= 0) {
        throw buildError(400, "Item de producto invalido");
      }

      const [rows] = await conn.execute(
        "SELECT id, nombre, precio, stock, disponible FROM productos WHERE id = ? FOR UPDATE",
        [productoId]
      );
      const producto = rows?.[0];
      if (!producto) throw buildError(404, `Producto ${productoId} no encontrado`);
      if (!producto.disponible) throw buildError(400, `Producto ${producto.nombre} no esta disponible`);
      if (producto.stock < cantidad) throw buildError(400, `Stock insuficiente para ${producto.nombre}`);

      const precioUnit = Number(producto.precio);
      subtotal += precioUnit * cantidad;
      detalles.push({ productoId, cantidad, precioUnit, nombre: producto.nombre });
    }

    const shippingNum = Number(shipping || 0);
    const taxNum = Number(tax || 0);
    const discountNum = Math.max(0, Number(discount || 0));
    const total = Math.max(0, subtotal + shippingNum + taxNum - discountNum);

    const [ordenResult] = await conn.execute(
      "INSERT INTO ordenes (usuario_id, total, estado) VALUES (?, ?, 'pagada')",
      [usuarioId, total]
    );
    const ordenId = ordenResult.insertId;

    for (const det of detalles) {
      await conn.execute(
        "INSERT INTO orden_detalles (orden_id, producto_id, cantidad, precio_unit) VALUES (?, ?, ?, ?)",
        [ordenId, det.productoId, det.cantidad, det.precioUnit]
      );
      const [updateResult] = await conn.execute(
        "UPDATE productos SET stock = stock - ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
        [det.cantidad, det.productoId]
      );
      // Si el stock qued�� en 0, marcar como no disponible
      const [stockRows] = await conn.execute("SELECT stock FROM productos WHERE id = ?", [det.productoId]);
      const currentStock = Number(stockRows?.[0]?.stock || 0);
      if (currentStock <= 0) {
        await conn.execute(
          "UPDATE productos SET disponible = 0, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
          [det.productoId]
        );
      }
    }

    await conn.commit();

    return {
      id: ordenId,
      usuarioId,
      subtotal,
      shipping: shippingNum,
      tax: taxNum,
      discount: discountNum,
      total,
      metodoPago,
      promoCode,
      datosEnvio,
      estado: "pagada",
      items: detalles,
    };
  } catch (err) {
    await conn.rollback();
    throw err;
  } finally {
    conn.release();
  }
}

export default {
  crearOrdenConDetalles,
};

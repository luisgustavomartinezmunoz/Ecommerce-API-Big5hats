import { pool } from "../db.js";
import { getProducto } from "../models/producto.repo.js";

export async function listarWishlist(req, res) {
  const userId = req.user?.id;
  try {
    const [rows] = await pool.execute(
      `SELECT w.producto_id AS productoId, p.nombre, p.precio, p.imagen, p.categoria_slug AS categoria
       FROM wishlist w
       INNER JOIN productos p ON p.id = w.producto_id
       WHERE w.usuario_id = ?
       ORDER BY w.created_at DESC`,
      [userId]
    );
    return res.json({ ok: true, data: rows });
  } catch (err) {
    console.error("wishlist list error", err?.message);
    return res.status(500).json({ ok: false, mensaje: "No pudimos obtener tu lista de deseos" });
  }
}

export async function agregarWishlist(req, res) {
  const userId = req.user?.id;
  const { productoId } = req.body || {};
  if (!productoId) {
    return res.status(400).json({ ok: false, mensaje: "Falta productoId" });
  }
  try {
    const producto = await getProducto(productoId);
    if (!producto) {
      return res.status(404).json({ ok: false, mensaje: "Producto no encontrado" });
    }
    await pool.execute(
      `INSERT IGNORE INTO wishlist (usuario_id, producto_id) VALUES (?, ?)`,
      [userId, productoId]
    );
    return res.json({ ok: true, mensaje: "Agregado a tu lista de deseos" });
  } catch (err) {
    console.error("wishlist add error", err?.message);
    return res.status(500).json({ ok: false, mensaje: "No pudimos agregar el producto" });
  }
}

export async function eliminarWishlist(req, res) {
  const userId = req.user?.id;
  const { id } = req.params;
  if (!id) {
    return res.status(400).json({ ok: false, mensaje: "Falta productoId" });
  }
  try {
    await pool.execute(
      `DELETE FROM wishlist WHERE usuario_id = ? AND producto_id = ?`,
      [userId, id]
    );
    return res.json({ ok: true, mensaje: "Eliminado de tu lista de deseos" });
  } catch (err) {
    console.error("wishlist delete error", err?.message);
    return res.status(500).json({ ok: false, mensaje: "No pudimos eliminar el producto" });
  }
}

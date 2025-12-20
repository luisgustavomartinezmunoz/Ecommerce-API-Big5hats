import { pool } from "../db.js";

export const ventasPorCategoria = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      `SELECT c.slug AS categoria_slug, c.nombre AS categoria, 
              COALESCE(SUM(od.cantidad * od.precio_unit), 0) AS total,
              COALESCE(SUM(od.cantidad), 0) AS unidades
       FROM orden_detalles od
       INNER JOIN ordenes o ON o.id = od.orden_id
       INNER JOIN productos p ON p.id = od.producto_id
       INNER JOIN categorias c ON c.slug = p.categoria_slug
       WHERE o.estado = 'pagada'
       GROUP BY c.slug, c.nombre
       ORDER BY total DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

export const totalVentas = async (req, res, next) => {
  try {
    const [rows] = await pool.execute(
      "SELECT COALESCE(SUM(total), 0) AS totalVentas FROM ordenes WHERE estado = 'pagada'"
    );
    res.json({ success: true, data: { total: Number(rows?.[0]?.totalVentas || 0) } });
  } catch (err) {
    next(err);
  }
};

export const reporteInventario = async (req, res, next) => {
  try {
    const { categoria } = req.query;
    const where = [];
    const params = [];
    if (categoria) {
      where.push("p.categoria_slug = ?");
      params.push(categoria);
    }
    const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";
    const [rows] = await pool.execute(
      `SELECT p.id, p.nombre, p.stock, p.disponible, c.nombre AS categoria, p.categoria_slug
       FROM productos p
       INNER JOIN categorias c ON c.slug = p.categoria_slug
       ${whereSql}
       ORDER BY p.stock ASC, p.nombre ASC`,
      params
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
};

export default {
  ventasPorCategoria,
  totalVentas,
  reporteInventario,
};

import { pool } from "../config/db.js";

const baseSelect = `
  SELECT
    p.id,
    p.nombre,
    p.descripcion,
    p.precio,
    p.imagen,
    p.disponible,
    p.stock,
    p.oferta,
    p.categoria_slug AS categoria,
    c.nombre AS categoria_nombre,
    p.created_at,
    p.updated_at
  FROM productos p
  INNER JOIN categorias c ON c.slug = p.categoria_slug
`;

export async function listProductos(filters = {}) {
  const {
    categoria,
    q,
    minPrecio,
    maxPrecio,
    oferta,
    disponible,
    page = 1,
    limit = 20,
    sort = "created_at",
  } = filters;

  const where = [];
  const params = [];

  if (categoria) {
    where.push("p.categoria_slug = ?");
    params.push(categoria.toLowerCase());
  }
  if (q) {
    where.push("(p.nombre LIKE ? OR p.descripcion LIKE ?)");
    params.push(`%${q}%`, `%${q}%`);
  }
  if (minPrecio !== undefined) {
    where.push("p.precio >= ?");
    params.push(Number(minPrecio));
  }
  if (maxPrecio !== undefined) {
    where.push("p.precio <= ?");
    params.push(Number(maxPrecio));
  }
  if (oferta !== undefined) {
    where.push("p.oferta = ?");
    params.push(oferta ? 1 : 0);
  }
  if (disponible !== undefined) {
    where.push("p.disponible = ?");
    params.push(disponible ? 1 : 0);
  }

  const whereSql = where.length ? `WHERE ${where.join(" AND ")}` : "";

  const sortMap = {
    "price-asc": "p.precio ASC",
    "price-desc": "p.precio DESC",
    "name": "p.nombre ASC",
    "created_at": "p.created_at DESC",
  };
  const sortSql = sortMap[sort] || sortMap.created_at;

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));
  const offset = (pageNum - 1) * limitNum;

  const [rows] = await pool.execute(
    `${baseSelect} ${whereSql} ORDER BY ${sortSql} LIMIT ? OFFSET ?`,
    [...params, limitNum, offset]
  );

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM productos p ${whereSql}`,
    params
  );
  const total = countRows?.[0]?.total || 0;

  const data = (rows || []).map((p) => ({
    ...p,
    disponible: !!p.disponible && Number(p.stock) > 0,
  }));

  return { data, meta: { total, page: pageNum, limit: limitNum } };
}

export async function getProducto(id) {
  const [rows] = await pool.execute(`${baseSelect} WHERE p.id = ?`, [id]);
  const row = rows[0] || null;
  if (!row) return null;
  return { ...row, disponible: !!row.disponible && Number(row.stock) > 0 };
}

export async function createProducto(payload) {
  const {
    nombre,
    descripcion = "",
    precio,
    categoria,
    imagen = "",
    disponible = true,
    stock = 0,
    oferta = false,
  } = payload;

  const stockNum = Number(stock || 0);
  const disponibleFlag = stockNum > 0 && disponible ? 1 : 0;

  const [result] = await pool.execute(
    `INSERT INTO productos
      (nombre, descripcion, precio, categoria_slug, imagen, disponible, stock, oferta)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      nombre,
      descripcion,
      Number(precio),
      categoria.toLowerCase(),
      imagen,
      disponibleFlag,
      stockNum,
      oferta ? 1 : 0,
    ]
  );

  return await getProducto(result.insertId);
}

export async function updateProducto(id, payload) {
  const fields = [];
  const params = [];

  const allowed = ["nombre", "descripcion", "precio", "categoria", "imagen", "disponible", "stock", "oferta"];
  let autoDisable = false;
  if (payload.stock !== undefined && Number(payload.stock) <= 0) autoDisable = true;

  for (const key of allowed) {
    if (payload[key] === undefined) continue;
    if (key === "categoria") {
      fields.push("categoria_slug = ?");
      params.push(payload[key].toLowerCase());
      continue;
    }
    fields.push(`${key} = ?`.replace("categoria", "categoria_slug"));
    params.push(
      key === "precio" ? Number(payload[key]) :
      key === "disponible" || key === "oferta" ? (payload[key] ? 1 : 0) :
      key === "stock" ? Number(payload[key]) :
      payload[key]
    );
  }

  if (autoDisable && !fields.some((f) => f.startsWith("disponible"))) {
    fields.push("disponible = 0");
  }

  if (!fields.length) return await getProducto(id);

  params.push(id);
  await pool.execute(
    `UPDATE productos SET ${fields.join(", ")}, updated_at = CURRENT_TIMESTAMP WHERE id = ?`,
    params
  );

  return await getProducto(id);
}

export async function deleteProducto(id) {
  await pool.execute(`DELETE FROM productos WHERE id = ?`, [id]);
}

export async function listCategorias() {
  const [rows] = await pool.execute(
    `SELECT slug, nombre, descripcion FROM categorias ORDER BY nombre ASC`
  );
  return rows;
}

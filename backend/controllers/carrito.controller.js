// Controlador de carrito simplificado (sin persistencia, solo demo)

export const obtenerCarrito = (req, res) => {
  // Retorna carrito vacío de ejemplo
  return res.json({ success: true, data: [] });
};

export const agregarAlCarrito = (req, res) => {
  return res.status(201).json({ success: true, mensaje: "Producto agregado al carrito (demo)" });
};

export const eliminarDelCarrito = (req, res) => {
  return res.json({ success: true, mensaje: "Producto eliminado del carrito (demo)" });
};

export const vaciarCarrito = (req, res) => {
  return res.json({ success: true, mensaje: "Carrito vaciado (demo)" });
};

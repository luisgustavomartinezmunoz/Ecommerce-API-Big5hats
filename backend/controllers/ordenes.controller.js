import { crearOrdenConDetalles } from "../models/orden.repo.js";

export const checkout = async (req, res, next) => {
  try {
    const usuarioId = req.user?.id;
    const { items, shipping, tax, discount, metodoPago, promoCode, datosEnvio } = req.body || {};

    if (!usuarioId) return res.status(401).json({ mensaje: "No autenticado" });
    if (!Array.isArray(items) || !items.length) {
      return res.status(400).json({ mensaje: "Debes enviar al menos un producto" });
    }

    const sanitized = items.map((it) => ({
      productoId: it.productoId || it.id,
      cantidad: Number(it.cantidad),
    }));

    const orden = await crearOrdenConDetalles({
      usuarioId,
      items: sanitized,
      shipping,
      tax,
      discount,
      metodoPago,
      promoCode,
      datosEnvio,
    });

    return res.status(201).json({
      success: true,
      data: {
        ordenId: orden.id,
        estado: orden.estado,
        total: orden.total,
        subtotal: orden.subtotal,
        discount: orden.discount,
        tax: orden.tax,
        shipping: orden.shipping,
        items: orden.items,
        promoCode: orden.promoCode,
      },
    });
  } catch (err) {
    next(err);
  }
};

export default { checkout };

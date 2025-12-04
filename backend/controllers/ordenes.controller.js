import { crearOrdenConDetalles } from "../models/orden.repo.js";
import { enviarCorreo } from "../utils/mailer.js";
import { generarNotaCompraPDF } from "../utils/notaCompra.js";

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

    const usuario = req.user || {};
    let notaEnviada = false;
    let notaError = null;

    try {
      const pdf = await generarNotaCompraPDF({ orden, usuario });
      const ahora = new Date();
      const fecha = ahora.toLocaleDateString("es-MX");
      const hora = ahora.toLocaleTimeString("es-MX");

      await enviarCorreo(usuario.correo, `Nota de compra #${orden.id} - Big5hats`, {
        html: `<p><strong>Compra finalizada</strong></p>
               <p>La nota se envi&oacute; a tu correo electr&oacute;nico.</p>
               <p>Fecha: ${fecha} Hora: ${hora}</p>
               <p>Cliente: ${usuario.nombre || ""}</p>`,
        attachments: [
          {
            filename: `nota-${orden.id}.pdf`,
            content: pdf,
          },
        ],
      });
      notaEnviada = true;
    } catch (err) {
      notaError = err?.message || "No se pudo enviar el correo con la nota";
      console.error("Error enviando nota de compra", err);
    }

    return res.status(201).json({
      success: true,
      messages: {
        compra: "Compra finalizada",
        correo: notaEnviada
          ? "La nota se envio a tu correo electronico"
          : "La compra se confirmo pero no pudimos enviar la nota por correo.",
      },
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
        datosEnvio: orden.datosEnvio,
      },
      notaEnviada,
      correoDestino: usuario.correo,
      notaError,
    });
  } catch (err) {
    next(err);
  }
};

export default { checkout };

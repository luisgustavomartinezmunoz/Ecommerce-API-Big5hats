import { fileURLToPath } from "url";
import path from "path";
import { enviarCorreo } from "../utils/mailer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const enviarSuscripcion = async (req, res) => {
  const correo = req.user?.correo;
  const nombre = req.user?.nombre || "cliente";

  if (!correo) {
    return res.status(400).json({ ok: false, mensaje: "Falta el correo del usuario" });
  }

  try {
    const logoPath = path.join(__dirname, "..", "..", "frontend", "img", "logo.PNG");
    await enviarCorreo(correo, "Suscripcion Big5hats", {
      html: `<div style="font-family:Arial,sans-serif;">
        <p><img src="cid:logo-big5hats" alt="Big5hats" style="height:72px;"></p>
        <p>Hola ${nombre},</p>
        <p>Gracias por suscribirte. Muy pronto recibiras novedades y un cupon exclusivo.</p>
        <p><strong>CUPON: BIGFIVE</strong></p>
        <p><strong>Big5hats</strong> · Estilo que te distingue</p>
      </div>`,
      attachments: [
        {
          filename: "logo.png",
          path: logoPath,
          cid: "logo-big5hats",
        },
      ],
    });

    return res.json({
      ok: true,
      mensaje: "Suscripcion confirmada. Revisa tu correo.",
      empresa: "Big5hats",
      logo: "B5",
      lema: "Estilo que te distingue",
      logoUrl: "/img/logo.PNG",
    });
  } catch (err) {
    console.error("Error enviando correo de suscripcion:", err?.message);
    return res.status(500).json({
      ok: false,
      mensaje: "No pudimos completar la suscripcion. Intenta mas tarde.",
    });
  }
};

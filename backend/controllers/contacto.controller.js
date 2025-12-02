import { fileURLToPath } from "url";
import path from "path";
import { enviarCorreo } from "../utils/mailer.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const enviarMensaje = async (req, res) => {
  const { nombre, email, mensaje } = req.body;

  if (!email) {
    return res.status(400).json({ ok: false, mensaje: "Falta el correo" });
  }

  console.log("Mensaje recibido:", nombre, email, mensaje);

  try {
    const logoPath = path.join(__dirname, "..", "..", "frontend", "img", "logo.PNG");
    await enviarCorreo(email, "Recibimos tu mensaje - Big5hats", {
      html: `<div style="font-family:Arial,sans-serif;">
        <p><img src="cid:logo-big5hats" alt="Big5hats" style="height:72px;"></p>
        <p>Hola ${nombre || "amigo"},</p>
        <p>Recibimos tu mensaje y serás atendido brevemente.</p>
        <blockquote style="border-left:4px solid #d4a126;padding-left:8px;color:#555;">${mensaje || ""}</blockquote>
        <p>Gracias por contactarnos.<br>Equipo Big5hats</p>
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
      mensaje: "Mensaje enviado. Revisa tu correo de confirmación.",
      empresa: "Big5hats",
      logo: "B5",
      logoUrl: "/img/logo.PNG",
      lema: "Estilo que te distingue",
    });
  } catch (err) {
    console.error("Error enviando correo de contacto:", err?.message);
    return res.status(500).json({
      ok: false,
      mensaje: "No pudimos enviar el correo de confirmación. Intenta más tarde.",
    });
  }
};

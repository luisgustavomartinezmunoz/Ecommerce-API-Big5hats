import dotenv from "dotenv";
import nodemailer from "nodemailer";

dotenv.config();

// Configura el transport con los datos del .env
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: Number(process.env.SMTP_PORT) === 465, // true para 465, false para 587/STARTTLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function enviarCorreo(destinatario, subject, contenido) {
  const base = {
    from: process.env.FROM_EMAIL || process.env.SMTP_USER,
    to: destinatario,
    subject,
  };

  // Permite pasar string (html) o un objeto { html, attachments, text, ... }
  const payload = typeof contenido === "string" ? { html: contenido } : contenido;

  const info = await transporter.sendMail({ ...base, ...payload });
  return info;
}

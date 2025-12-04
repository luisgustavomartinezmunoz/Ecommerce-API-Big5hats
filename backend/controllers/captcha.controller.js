import { generarCaptcha, verificarCaptcha } from "../utils/generarCaptcha.js";

export const generar = (_req, res) => {
  try {
    const { captchaId, codigo, img } = generarCaptcha();
    // Devolver id y la imagen (base64 SVG). En producción no devuelvas el código plano.
    res.json({ captchaId, img, codigo, mensaje: "CAPTCHA generado" });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al generar CAPTCHA" });
  }
};

export const validar = (req, res) => {
  try {
    const { captchaId, codigo } = req.body || {};
    if (!captchaId || !codigo) {
      return res.status(400).json({ mensaje: "Falta captchaId o código" });
    }
    const resultado = verificarCaptcha(captchaId, codigo);
    if (resultado.valido) return res.json({ valido: true, mensaje: resultado.mensaje });
    return res.status(400).json({ valido: false, mensaje: resultado.mensaje });
  } catch (err) {
    res.status(500).json({ mensaje: "Error al validar CAPTCHA" });
  }
};

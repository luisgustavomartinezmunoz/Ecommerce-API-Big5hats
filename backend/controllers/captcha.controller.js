import { generarCaptcha, verificarCaptcha } from "../utils/generarCaptcha.js";

export const generar = (req, res) => {
    try {
        const { captchaId, codigo } = generarCaptcha();
        // En producción, enviar solo el ID y la imagen del CAPTCHA
        // El código nunca debe enviarse al frontend en producción
        res.json({ 
            captchaId, 
            codigo, // Solo para desarrollo, comentar en producción
            mensaje: "CAPTCHA generado" 
        });
    } catch (err) {
        res.status(500).json({ mensaje: "Error al generar CAPTCHA" });
    }
};

export const validar = (req, res) => {
    try {
        const { captchaId, codigo } = req.body;
        
        if (!captchaId || !codigo) {
            return res.status(400).json({ mensaje: "Falta captchaId o código" });
        }
        
        const resultado = verificarCaptcha(captchaId, codigo);
        
        if (resultado.valido) {
            return res.json({ valido: true, mensaje: resultado.mensaje });
        }
        
        return res.status(400).json({ valido: false, mensaje: resultado.mensaje });
    } catch (err) {
        res.status(500).json({ mensaje: "Error al validar CAPTCHA" });
    }
};

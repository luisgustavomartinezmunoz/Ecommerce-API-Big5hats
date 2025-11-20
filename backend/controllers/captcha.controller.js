import { generarCaptcha } from "../utils/generarCaptcha.js";

export const generar = (req, res) => {
    const captcha = generarCaptcha();
    req.session = captcha;

    res.json({ captcha });
};

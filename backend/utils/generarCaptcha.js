// Almacenamiento temporal de CAPTCHAs (en producción usar Redis)
const captchaStore = new Map();

export function generarCaptcha() {
    // Generar código alfanumérico de 6 caracteres
    const caracteres = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let codigo = '';
    for (let i = 0; i < 6; i++) {
        codigo += caracteres.charAt(Math.floor(Math.random() * caracteres.length));
    }
    
    // ID único para este CAPTCHA
    const captchaId = Date.now().toString();
    
    // Guardar con expiración de 10 minutos
    captchaStore.set(captchaId, {
        codigo,
        createdAt: Date.now(),
        expiresAt: Date.now() + 10 * 60 * 1000, // 10 minutos
        intentos: 0
    });
    
    // Limpiar CAPTCHAs expirados
    limpiarCaptchasExpirados();
    
    return { captchaId, codigo };
}

export function verificarCaptcha(captchaId, codigoIngresado) {
    const captcha = captchaStore.get(captchaId);
    
    if (!captcha) {
        return { valido: false, mensaje: "CAPTCHA no encontrado o expirado" };
    }
    
    if (captcha.expiresAt < Date.now()) {
        captchaStore.delete(captchaId);
        return { valido: false, mensaje: "CAPTCHA expirado" };
    }
    
    captcha.intentos++;
    
    if (captcha.intentos > 3) {
        captchaStore.delete(captchaId);
        return { valido: false, mensaje: "Demasiados intentos de CAPTCHA" };
    }
    
    const esValido = captcha.codigo.toUpperCase() === codigoIngresado.toUpperCase();
    
    if (esValido) {
        captchaStore.delete(captchaId);
    }
    
    return { valido: esValido, mensaje: esValido ? "CAPTCHA válido" : "CAPTCHA incorrecto" };
}

function limpiarCaptchasExpirados() {
    for (const [id, data] of captchaStore.entries()) {
        if (data.expiresAt < Date.now()) {
            captchaStore.delete(id);
        }
    }
}

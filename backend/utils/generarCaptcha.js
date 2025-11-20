export function generarCaptcha() {
    const texto = Math.random().toString(36).substring(2, 7).toUpperCase();
    return texto;
}

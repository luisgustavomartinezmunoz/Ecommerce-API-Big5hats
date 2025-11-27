import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "../models/conexion.js";
import Usuario from "../models/usuario.model.js";
import { verificarCaptcha } from "../utils/generarCaptcha.js";

const JWT_SECRET = "big5hats_secret"; // Cambia esto en producción

export const registro = async (req, res) => {
    const { nombre, correo, contrasena } = req.body;
    try {
        // Verificar si el usuario ya existe
        const existe = await Usuario.findOne({ correo });
        if (existe) {
            return res.status(400).json({ mensaje: "El correo ya está registrado" });
        }
        // Hash de la contraseña
        const hash = await bcrypt.hash(contrasena, 10);
        const nuevoUsuario = new Usuario({ nombre, correo, contrasena: hash });
        await nuevoUsuario.save();
        res.status(201).json({ mensaje: "Usuario registrado correctamente" });
    } catch (err) {
        res.status(500).json({ mensaje: "Error en el registro" });
    }
};

export const login = async (req, res) => {
    const { correo, contrasena, captchaId, codigoCaptcha } = req.body;
    try {
        // Validar CAPTCHA primero
        if (!captchaId || !codigoCaptcha) {
            return res.status(400).json({ mensaje: "CAPTCHA requerido" });
        }

        const resultadoCaptcha = verificarCaptcha(captchaId, codigoCaptcha);
        if (!resultadoCaptcha.valido) {
            return res.status(400).json({ mensaje: resultadoCaptcha.mensaje });
        }

        const usuario = await Usuario.findOne({ correo });
        if (!usuario) {
            return res.status(400).json({ mensaje: "Usuario no encontrado" });
        }
        
        // Verificar bloqueo por intentos fallidos
        if (usuario.lockUntil && usuario.lockUntil > Date.now()) {
            const msLeft = usuario.lockUntil - Date.now();
            const seconds = Math.ceil(msLeft / 1000);
            return res.status(403).json({ mensaje: `Cuenta bloqueada. Intenta en ${seconds} segundos.` });
        }

        const valido = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!valido) {
            // Incrementar intentos fallidos
            usuario.failedLoginAttempts = (usuario.failedLoginAttempts || 0) + 1;
            // Si alcanza 5 intentos, bloquear por 5 minutos
            if (usuario.failedLoginAttempts >= 5) {
                usuario.lockUntil = new Date(Date.now() + 5 * 60 * 1000); // 5 minutos
                await usuario.save();
                return res.status(403).json({ mensaje: "Cuenta bloqueada por demasiados intentos. Intenta de nuevo en 5 minutos." });
            }
            await usuario.save();
            return res.status(400).json({ mensaje: `Contraseña incorrecta. Intentos: ${usuario.failedLoginAttempts}/5` });
        }

        // Login correcto: resetear contadores y bloqueo
        usuario.failedLoginAttempts = 0;
        usuario.lockUntil = null;
        await usuario.save();

        // Generar JWT incluyendo role
        const payload = { id: usuario._id, correo: usuario.correo, role: usuario.role };
        const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
        res.json({ mensaje: "Login exitoso", token, role: usuario.role });
    } catch (err) {
        res.status(500).json({ mensaje: "Error al iniciar sesión" });
    }
};

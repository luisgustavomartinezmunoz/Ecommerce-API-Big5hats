import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  createUser,
  resetLockAndAttempts,
  registerFailedAttempt,
} from "../models/usuario.repo.js";
import { verificarCaptcha } from "../utils/generarCaptcha.js";

const JWT_SECRET = process.env.JWT_SECRET || "big5hats_secret";

export const registro = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body || {};
    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ mensaje: "Nombre, correo y contraseña son requeridos" });
    }

    const existe = await findUserByEmail(correo);
    if (existe) {
      return res.status(400).json({ mensaje: "El correo ya está registrado" });
    }

    const hash = await bcrypt.hash(contrasena, 10);
    const user = await createUser({ nombre, correo, contrasena: hash, role: "user" });

    return res.status(201).json({ mensaje: "Usuario registrado correctamente", usuario: { id: user.id, nombre: user.nombre, correo: user.correo } });
  } catch (err) {
    console.error("registro error", err);
    return res.status(500).json({ mensaje: "Error en el registro" });
  }
};

export const login = async (req, res) => {
  try {
    const { correo, contrasena, captchaId, captchaTexto } = req.body || {};
    if (!correo || !contrasena || !captchaId || !captchaTexto) {
      return res.status(400).json({ mensaje: "Correo, contraseña y CAPTCHA son requeridos" });
    }

    const cap = verificarCaptcha(captchaId, captchaTexto);
    if (!cap.valido) {
      return res.status(400).json({ mensaje: cap.mensaje || "CAPTCHA inválido" });
    }

    const usuario = await findUserByEmail(correo);
    if (!usuario) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    if (usuario.lock_until && new Date(usuario.lock_until) > new Date()) {
      const segundos = Math.ceil((new Date(usuario.lock_until) - new Date()) / 1000);
      return res.status(403).json({ mensaje: `Cuenta bloqueada. Intenta en ${segundos} segundos.` });
    }

    const valido = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!valido) {
      const lockInfo = await registerFailedAttempt(usuario.id);
      if (lockInfo.locked) {
        return res.status(403).json({ mensaje: "Cuenta bloqueada por demasiados intentos. Intenta de nuevo en 5 minutos." });
      }
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    await resetLockAndAttempts(usuario.id);

    const payload = { id: usuario.id, correo: usuario.correo, role: usuario.role, nombre: usuario.nombre };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
    return res.json({ mensaje: "Login exitoso", token, role: usuario.role, nombre: usuario.nombre, correo: usuario.correo });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ mensaje: "Error al iniciar sesión" });
  }
};

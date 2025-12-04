
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import {
  findUserByEmail,
  createUser,
  updatePassword,
  resetLockAndAttempts,
  registerFailedAttempt,
} from "../models/usuario.repo.js";
import { getUserPreferences, saveUserPreferences } from "../models/usuario.repo.js";
import { verificarCaptcha } from "../utils/generarCaptcha.js";

const JWT_SECRET = process.env.JWT_SECRET || "big5hats_secret";
const resetTokens = new Map(); // correo -> { token, exp }
const MAX_INTENTOS_FALLIDOS = 3;
const BLOQUEO_MINUTOS = 5;

function generarCodigoReset(size = 6) {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = "";
  for (let i = 0; i < size; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const registro = async (req, res) => {
  try {
    const { nombre, correo, contrasena } = req.body || {};
    if (!nombre || !correo || !contrasena) {
      return res.status(400).json({ mensaje: "Nombre, correo y contraseA?a son requeridos" });
    }

    const existe = await findUserByEmail(correo);
    if (existe) {
      return res.status(400).json({ mensaje: "El correo ya estA? registrado" });
    }

    const hash = await bcrypt.hash(contrasena, 10);
    const user = await createUser({ nombre, correo, contrasena: hash, role: "user" });

    return res.status(201).json({ mensaje: "Usuario registrado correctamente", usuario: { id: user.id, nombre: user.nombre, correo: user.correo } });
  } catch (err) {
    console.error("registro error", err);
    return res.status(500).json({ mensaje: "Error en el registro" });
  }
};

export const solicitarReset = async (req, res) => {
  try {
    const { correo } = req.body || {};
    if (!correo) return res.status(400).json({ mensaje: "El correo es requerido" });

    const user = await findUserByEmail(correo);
    if (!user) {
      // No revelamos si existe; respondemos genAcrico
      return res.status(200).json({ mensaje: "Si el correo existe, se ha enviado un cA3digo de recuperaciA3n" });
    }

    const token = generarCodigoReset();
    const exp = Date.now() + 10 * 60 * 1000; // 10 minutos
    resetTokens.set(correo, { token, exp });

    // Para ambiente demo/academico devolvemos el token para que el front lo muestre
    return res.status(200).json({
      mensaje: "CA3digo generado. Vence en 10 minutos.",
      tokenDemo: token,
    });
  } catch (err) {
    console.error("solicitarReset error", err);
    return res.status(500).json({ mensaje: "Error al solicitar recuperaciA3n" });
  }
};

export const restablecerPassword = async (req, res) => {
  try {
    const { correo, token, nuevaContrasena } = req.body || {};
    if (!correo || !token || !nuevaContrasena) {
      return res.status(400).json({ mensaje: "Correo, token y nueva contraseA???a son requeridos" });
    }
    if (nuevaContrasena.length < 8) {
      return res.status(400).json({ mensaje: "La contraseA???a debe tener al menos 8 caracteres" });
    }

    const user = await findUserByEmail(correo);
    if (!user) return res.status(400).json({ mensaje: "Token o correo invA???lidos" });

    const info = resetTokens.get(correo);
    if (!info || info.token !== token || info.exp < Date.now()) {
      return res.status(400).json({ mensaje: "Token invA???lido o vencido" });
    }

    const hash = await bcrypt.hash(nuevaContrasena, 10);
    await updatePassword(user.id, hash);
    resetTokens.delete(correo);
    return res.status(200).json({ mensaje: "ContraseA???a actualizada, ahora puedes iniciar sesiA3n" });
  } catch (err) {
    console.error("restablecerPassword error", err);
    return res.status(500).json({ mensaje: "Error al restablecer contraseA???a" });
  }
};

export const login = async (req, res) => {
  try {
    const { correo, contrasena, captchaId, captchaTexto } = req.body || {};
    if (!correo || !contrasena || !captchaId || !captchaTexto) {
      return res.status(400).json({ mensaje: "Correo, contraseA?a y CAPTCHA son requeridos" });
    }

    const cap = verificarCaptcha(captchaId, captchaTexto);
    if (!cap.valido) {
      return res.status(400).json({ mensaje: cap.mensaje || "CAPTCHA invA?lido" });
    }

    const usuario = await findUserByEmail(correo);
    if (!usuario) {
      return res.status(401).json({ mensaje: "Credenciales invA?lidas" });
    }

    if (usuario.lock_until) {
      const lockDate = new Date(usuario.lock_until);
      if (lockDate > new Date()) {
        const segundos = Math.ceil((lockDate - new Date()) / 1000);
        return res.status(403).json({
          mensaje: `Cuenta bloqueada. Intenta en ${segundos} segundos.`,
          bloqueado: true,
          lockUntil: lockDate.toISOString(),
          restanteSegundos: segundos,
        });
      } else {
        await resetLockAndAttempts(usuario.id);
      }
    }

    const valido = await bcrypt.compare(contrasena, usuario.contrasena);
    if (!valido) {
      const lockInfo = await registerFailedAttempt(usuario.id, MAX_INTENTOS_FALLIDOS, BLOQUEO_MINUTOS);
      if (lockInfo.locked) {
        return res.status(403).json({
          mensaje: "Cuenta bloqueada por demasiados intentos. Intenta de nuevo en 5 minutos.",
          bloqueado: true,
          lockUntil: lockInfo.lockUntil?.toISOString?.(),
          restanteSegundos: BLOQUEO_MINUTOS * 60,
        });
      }
      return res.status(401).json({
        mensaje: "Credenciales invA?lidas",
        intentosRestantes: lockInfo.remaining,
      });
    }

    await resetLockAndAttempts(usuario.id);

    const payload = { id: usuario.id, correo: usuario.correo, role: usuario.role, nombre: usuario.nombre };
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: "2h" });
    return res.json({ mensaje: "Login exitoso", token, role: usuario.role, nombre: usuario.nombre, correo: usuario.correo });
  } catch (err) {
    console.error("login error", err);
    return res.status(500).json({ mensaje: "Error al iniciar sesiA3n" });
  }
};

export const perfil = async (req, res) => {
  const user = req.user;
  if (!user) return res.status(401).json({ mensaje: "Token invalido" });
  return res.json({
    ok: true,
    user: {
      id: user.id,
      nombre: user.nombre,
      correo: user.correo,
      role: user.role,
    },
  });
};

export const getPreferences = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ mensaje: "Token invalido" });
    const prefs = await getUserPreferences(user.id);
    return res.json({ ok: true, preferences: prefs || { theme: null, textSize: null } });
  } catch (err) {
    console.error('getPreferences error', err);
    return res.status(500).json({ mensaje: 'Error al obtener preferencias' });
  }
};

export const savePreferences = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ mensaje: "Token invalido" });
    const { theme, textSize } = req.body || {};
    const ok = await saveUserPreferences(user.id, { theme, textSize });
    if (!ok) return res.status(500).json({ mensaje: 'No se pudieron guardar las preferencias' });
    return res.json({ ok: true, mensaje: 'Preferencias guardadas' });
  } catch (err) {
    console.error('savePreferences error', err);
    return res.status(500).json({ mensaje: 'Error al guardar preferencias' });
  }
};

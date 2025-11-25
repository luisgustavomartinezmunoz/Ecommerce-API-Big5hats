import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import "../models/conexion.js";
import Usuario from "../models/usuario.model.js";

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
    const { correo, contrasena } = req.body;
    try {
        const usuario = await Usuario.findOne({ correo });
        if (!usuario) {
            return res.status(400).json({ mensaje: "Usuario no encontrado" });
        }
        const valido = await bcrypt.compare(contrasena, usuario.contrasena);
        if (!valido) {
            return res.status(400).json({ mensaje: "Contraseña incorrecta" });
        }
        // Generar JWT
        const token = jwt.sign({ id: usuario._id, correo: usuario.correo }, JWT_SECRET, { expiresIn: "2h" });
        res.json({ mensaje: "Login exitoso", token });
    } catch (err) {
        res.status(500).json({ mensaje: "Error al iniciar sesión" });
    }
};

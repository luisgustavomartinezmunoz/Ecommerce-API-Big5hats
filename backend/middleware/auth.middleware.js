import jwt from "jsonwebtoken";
import Usuario from "../models/usuario.model.js";

const JWT_SECRET = "big5hats_secret";

export const verificarToken = async (req, res, next) => {
	const authHeader = req.headers["authorization"] || req.headers["Authorization"];
	if (!authHeader || !authHeader.startsWith("Bearer ")) {
		return res.status(401).json({ mensaje: "Token no proporcionado" });
	}
	const token = authHeader.split(" ")[1];
	try {
		const payload = jwt.verify(token, JWT_SECRET);
		// opcional: recuperar usuario completo desde DB
		const usuario = await Usuario.findById(payload.id).select("_id correo role");
		if (!usuario) return res.status(401).json({ mensaje: "Usuario no encontrado" });
		req.user = { id: usuario._id, correo: usuario.correo, role: usuario.role };
		next();
	} catch (err) {
		return res.status(401).json({ mensaje: "Token inválido" });
	}
};

export default verificarToken;

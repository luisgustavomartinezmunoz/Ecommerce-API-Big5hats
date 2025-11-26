import { Router } from "express";
import { enviarMensaje } from "../controllers/contacto.controller.js";
import verificarToken from "../middleware/auth.middleware.js";
import requireRole from "../middleware/roles.middleware.js";

const router = Router();

// Ruta pública
router.post("/enviar", enviarMensaje);

// Ejemplo de ruta protegida (solo usuarios autenticados)
router.get("/mi-buzon", verificarToken, (req, res) => {
	return res.json({ ok: true, mensaje: `Acceso concedido a ${req.user.correo}`, user: req.user });
});

// Ejemplo de ruta admin
router.get("/admin-stats", verificarToken, requireRole(["admin"]), (req, res) => {
	return res.json({ ok: true, mensaje: "Estadísticas administrativas" });
});

export default router;

import { Router } from "express";
import { enviarSuscripcion } from "../controllers/suscripcion.controller.js";
import verificarToken from "../middleware/auth.middleware.js";

const router = Router();

router.post("/enviar", verificarToken, enviarSuscripcion);

export default router;

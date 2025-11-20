import { Router } from "express";
import { enviarMensaje } from "../controllers/contacto.controller.js";

const router = Router();

router.post("/enviar", enviarMensaje);

export default router;

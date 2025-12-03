import express from "express";
import verificarToken from "../middleware/auth.middleware.js";
import { login, registro, solicitarReset, restablecerPassword, perfil } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/registro", registro);
router.post("/olvide-password", solicitarReset);
router.post("/restablecer-password", restablecerPassword);
router.get("/me", verificarToken, perfil);

export default router;

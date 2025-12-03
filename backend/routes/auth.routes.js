import express from "express";
import verificarToken from "../middleware/auth.middleware.js";
import { login, registro, solicitarReset, restablecerPassword, perfil, getPreferences, savePreferences } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/registro", registro);
router.post("/olvide-password", solicitarReset);
router.post("/restablecer-password", restablecerPassword);
router.get("/me", verificarToken, perfil);
router.get("/me/preferences", verificarToken, getPreferences);
router.post("/me/preferences", verificarToken, savePreferences);

export default router;

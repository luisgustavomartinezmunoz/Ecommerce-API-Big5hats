import express from "express";
import { login, registro, solicitarReset, restablecerPassword } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/login", login);
router.post("/registro", registro);
router.post("/olvide-password", solicitarReset);
router.post("/restablecer-password", restablecerPassword);

export default router;

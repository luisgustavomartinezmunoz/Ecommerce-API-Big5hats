import { Router } from "express";
import { generar, validar } from "../controllers/captcha.controller.js";

const router = Router();

router.get("/generar", generar);
router.post("/validar", validar);

export default router;

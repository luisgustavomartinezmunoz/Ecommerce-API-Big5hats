import { Router } from "express";
import { generar } from "../controllers/captcha.controller.js";

const router = Router();

router.get("/generar", generar);

export default router;

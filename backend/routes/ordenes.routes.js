import { Router } from "express";
import { checkout } from "../controllers/ordenes.controller.js";

const router = Router();

// POST /api/ordenes/checkout
router.post("/checkout", checkout);

export default router;

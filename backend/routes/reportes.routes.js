import { Router } from "express";
import { ventasPorCategoria, totalVentas, reporteInventario } from "../controllers/reportes.controller.js";
import { verificarAdmin } from "../middleware/auth.middleware.js";

const router = Router();

router.get("/ventas/categorias", verificarAdmin, ventasPorCategoria);
router.get("/ventas/total", verificarAdmin, totalVentas);
router.get("/inventario", verificarAdmin, reporteInventario);

export default router;

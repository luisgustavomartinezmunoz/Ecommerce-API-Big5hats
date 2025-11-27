import express from "express";
import { obtenerCarrito, agregarAlCarrito, eliminarDelCarrito, vaciarCarrito } from "../controllers/carrito.controller.js";
import requireRole from "../middleware/roles.middleware.js";

const router = express.Router();

// Todos los usuarios autenticados pueden acceder a su carrito
router.get("/", obtenerCarrito);
router.post("/agregar", agregarAlCarrito);
router.delete("/eliminar/:id", eliminarDelCarrito);
router.delete("/vaciar", vaciarCarrito);

export default router;

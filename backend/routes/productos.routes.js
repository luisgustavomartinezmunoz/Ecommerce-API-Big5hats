import express from "express";
import { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto } from "../controllers/productos.controller.js";
import requireRole from "../middleware/roles.middleware.js";

const router = express.Router();

// Todos los usuarios autenticados pueden obtener productos
router.get("/", obtenerProductos);

// Solo admins pueden crear, actualizar y eliminar productos
router.post("/", requireRole(["admin"]), crearProducto);
router.put("/:id", requireRole(["admin"]), actualizarProducto);
router.delete("/:id", requireRole(["admin"]), eliminarProducto);

export default router;

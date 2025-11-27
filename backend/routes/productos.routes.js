import express from "express";
import { obtenerProductos, crearProducto, actualizarProducto, eliminarProducto, obtenerCategorias, obtenerProducto } from "../controllers/productos.controller.js";
import requireRole from "../middleware/roles.middleware.js";
import verificarToken from "../middleware/auth.middleware.js";

const router = express.Router();

// Rutas públicas: listar productos, obtener producto por ID y obtener categorías
router.get("/", obtenerProductos);
router.get("/categorias", obtenerCategorias);
router.get("/:id", obtenerProducto);

// Solo admins pueden crear, actualizar y eliminar productos (requieren token y rol)
router.post("/", verificarToken, requireRole(["admin"]), crearProducto);
router.put("/:id", verificarToken, requireRole(["admin"]), actualizarProducto);
router.delete("/:id", verificarToken, requireRole(["admin"]), eliminarProducto);

export default router;

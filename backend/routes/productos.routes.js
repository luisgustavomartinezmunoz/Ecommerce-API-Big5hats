import express from "express";
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerCategorias,
  obtenerProducto,
} from "../controllers/productos.controller.js";
import { verificarAdmin } from "../middleware/auth.middleware.js";

const router = express.Router();

// Rutas publicas: listar productos, obtener producto por ID y obtener categorias
router.get("/", obtenerProductos);
router.get("/categorias", obtenerCategorias);
router.get("/:id", obtenerProducto);

// CRUD (agrega middleware de auth si lo necesitas)
router.post("/", verificarAdmin, crearProducto);
router.put("/:id", verificarAdmin, actualizarProducto);
router.delete("/:id", verificarAdmin, eliminarProducto);

export default router;

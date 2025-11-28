import express from "express";
import {
  obtenerProductos,
  crearProducto,
  actualizarProducto,
  eliminarProducto,
  obtenerCategorias,
  obtenerProducto,
} from "../controllers/productos.controller.js";

const router = express.Router();

// Rutas publicas: listar productos, obtener producto por ID y obtener categorias
router.get("/", obtenerProductos);
router.get("/categorias", obtenerCategorias);
router.get("/:id", obtenerProducto);

// CRUD (agrega middleware de auth si lo necesitas)
router.post("/", crearProducto);
router.put("/:id", actualizarProducto);
router.delete("/:id", eliminarProducto);

export default router;

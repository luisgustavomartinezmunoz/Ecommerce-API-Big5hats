import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import captchaRoutes from "./routes/captcha.routes.js";
import contactoRoutes from "./routes/contacto.routes.js";
import productosRoutes from "./routes/productos.routes.js";
import carritoRoutes from "./routes/carrito.routes.js";
import verificarToken from "./middleware/auth.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";

const app = express();
app.use(cors());
app.use(express.json());

// Rutas públicas
app.use("/api/auth", authRoutes);
app.use("/api/captcha", captchaRoutes);
app.use("/api/contacto", contactoRoutes);

// Rutas protegidas (requieren autenticación)
// Productos: rutas públicas (listado, detalle, categorías) y rutas protegidas dentro del router
app.use("/api/productos", productosRoutes);
app.use("/api/carrito", verificarToken, carritoRoutes);

// Middleware de errores
app.use(errorMiddleware);

app.listen(3000, () => {
    console.log("Servidor Big5hats backend corriendo en http://localhost:3000");
});

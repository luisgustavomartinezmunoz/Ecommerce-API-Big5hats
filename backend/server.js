import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";
import captchaRoutes from "./routes/captcha.routes.js";
import contactoRoutes from "./routes/contacto.routes.js";
import productosRoutes from "./routes/productos.routes.js";
import errorMiddleware from "./middleware/error.middleware.js";
import "./models/conexion.js"; // conectar a mongo al iniciar servidor

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/captcha", captchaRoutes);
app.use("/api/contacto", contactoRoutes);
app.use("/api/productos", productosRoutes);

// Error handler
app.use(errorMiddleware);

app.listen(3000, () => {
    console.log("Servidor Big5hats backend corriendo en http://localhost:3000");
});

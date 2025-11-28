import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { testConnection } from "./db.js";

import authRoutes from "./routes/auth.routes.js";
import captchaRoutes from "./routes/captcha.routes.js";
import contactoRoutes from "./routes/contacto.routes.js";
import productosRoutes from "./routes/productos.routes.js";
import carritoRoutes from "./routes/carrito.routes.js";
import verificarToken from "./middleware/auth.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Servir frontend estatico
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

// Rutas publicas API
app.use("/api/auth", authRoutes);
app.use("/api/captcha", captchaRoutes);
app.use("/api/contacto", contactoRoutes);
app.use("/api/productos", productosRoutes);

// Rutas protegidas API (puedes reactivar auth cuando conectes login)
app.use("/api/carrito", verificarToken, carritoRoutes);

// Fallback: devolver index.html para rutas frontend
app.get("*", (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// Middleware de errores
app.use(errorMiddleware);

const PORT = process.env.PORT || 4700;

async function start() {
  try {
    await testConnection();
    console.log("Conexion a la base de datos establecida.");
    app.listen(PORT, () => {
      console.log(`Servidor escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("No se pudo conectar a la base de datos:", err?.message);
    process.exit(1);
  }
}

start();

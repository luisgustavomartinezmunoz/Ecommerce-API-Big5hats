import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { pool, testConnection } from "./config/db.js";

import authRoutes from "./routes/auth.routes.js";
import captchaRoutes from "./routes/captcha.routes.js";
import contactoRoutes from "./routes/contacto.routes.js";
import productosRoutes from "./routes/productos.routes.js";
import carritoRoutes from "./routes/carrito.routes.js";
import suscripcionRoutes from "./routes/suscripcion.routes.js";
import wishlistRoutes from "./routes/wishlist.routes.js";
import ordenesRoutes from "./routes/ordenes.routes.js";
import reportesRoutes from "./routes/reportes.routes.js";
import verificarToken from "./middleware/auth.middleware.js";
import errorMiddleware from "./middleware/error.middleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

// Servir imagenes estaticas almacenadas en el backend (por ejemplo /img/archivo.jpg)
const imagesPath = path.join(__dirname, "img");
app.use("/img", express.static(imagesPath));

// Servir frontend estatico
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

// Rutas publicas API
app.use("/api/auth", authRoutes);
app.use("/api/captcha", captchaRoutes);
app.use("/api/contacto", contactoRoutes);
app.use("/api/productos", productosRoutes);
app.use("/api/suscripcion", suscripcionRoutes);
app.use("/api/wishlist", wishlistRoutes);
app.use("/api/ordenes", verificarToken, ordenesRoutes);
app.use("/api/reportes", reportesRoutes);

// Rutas protegidas API (puedes reactivar auth cuando conectes login)
app.use("/api/carrito", verificarToken, carritoRoutes);

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ ok: true, message: "API online y conectada a base de datos" });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

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

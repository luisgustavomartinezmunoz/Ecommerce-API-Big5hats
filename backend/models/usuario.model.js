import mongoose from "mongoose";

const usuarioSchema = new mongoose.Schema({
    nombre: { type: String, required: true },
    correo: { type: String, required: true, unique: true },
    contrasena: { type: String, required: true },
    role: { type: String, enum: ["user", "admin"], default: "user" },
    // Seguridad: intentos fallidos y bloqueo temporal
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, default: null }
});

export default mongoose.model("Usuario", usuarioSchema);

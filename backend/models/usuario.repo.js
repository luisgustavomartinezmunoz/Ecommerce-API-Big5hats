import { pool } from "../db.js";

export async function findUserByEmail(correo) {
  try {
    const [rows] = await pool.execute(
      "SELECT id, nombre, correo, contrasena, role, failed_attempts, lock_until FROM usuarios WHERE correo = ? LIMIT 1",
      [correo]
    );
    if (!rows?.[0]) return null;
    return rows[0];
  } catch (err) {
    // Si las columnas de bloqueo no existen, hacemos fallback sin ellas
    const [rows] = await pool.execute(
      "SELECT id, nombre, correo, contrasena, role FROM usuarios WHERE correo = ? LIMIT 1",
      [correo]
    );
    if (!rows?.[0]) return null;
    return { ...rows[0], failed_attempts: 0, lock_until: null };
  }
}

export async function createUser({ nombre, correo, contrasena, role = "user" }) {
  const [result] = await pool.execute(
    "INSERT INTO usuarios (nombre, correo, contrasena, role) VALUES (?, ?, ?, ?)",
    [nombre, correo, contrasena, role]
  );
  return { id: result.insertId, nombre, correo, role };
}

export async function resetLockAndAttempts(id) {
  try {
    await pool.execute(
      "UPDATE usuarios SET failed_attempts = 0, lock_until = NULL WHERE id = ?",
      [id]
    );
  } catch (err) {
    // Si no existen columnas, no pasa nada
  }
}

export async function registerFailedAttempt(id, maxAttempts = 5, lockMinutes = 5) {
  try {
    const [rows] = await pool.execute(
      "SELECT failed_attempts FROM usuarios WHERE id = ?",
      [id]
    );
    const current = rows?.[0]?.failed_attempts || 0;
    const next = current + 1;
    if (next >= maxAttempts) {
      const lockUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
      await pool.execute(
        "UPDATE usuarios SET failed_attempts = ?, lock_until = ? WHERE id = ?",
        [next, lockUntil, id]
      );
      return { locked: true, lockUntil };
    } else {
      await pool.execute(
        "UPDATE usuarios SET failed_attempts = ? WHERE id = ?",
        [next, id]
      );
      return { locked: false };
    }
  } catch (err) {
    // Si no existen columnas, no bloqueamos
    return { locked: false };
  }
}

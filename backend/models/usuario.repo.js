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

export async function updatePassword(id, hash) {
  await pool.execute(
    "UPDATE usuarios SET contrasena = ? WHERE id = ?",
    [hash, id]
  );
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

export async function registerFailedAttempt(id, maxAttempts = 3, lockMinutes = 5) {
  try {
    const [rows] = await pool.execute(
      "SELECT failed_attempts FROM usuarios WHERE id = ?",
      [id]
    );
    const current = rows?.[0]?.failed_attempts || 0;
    const next = current + 1;
    const remaining = Math.max(0, maxAttempts - next);
    if (next >= maxAttempts) {
      const lockUntil = new Date(Date.now() + lockMinutes * 60 * 1000);
      await pool.execute(
        "UPDATE usuarios SET failed_attempts = ?, lock_until = ? WHERE id = ?",
        [next, lockUntil, id]
      );
      return { locked: true, lockUntil, remaining: 0 };
    } else {
      await pool.execute(
        "UPDATE usuarios SET failed_attempts = ? WHERE id = ?",
        [next, id]
      );
      return { locked: false, remaining };
    }
  } catch (err) {
    // Si no existen columnas, no bloqueamos
    return { locked: false, remaining: maxAttempts - 1 };
  }
}

// Preferences storage: create table if needed and get/set user preferences
export async function getUserPreferences(userId) {
  try {
    // ensure table exists
    await pool.execute(`CREATE TABLE IF NOT EXISTS user_preferences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      theme VARCHAR(16),
      text_size VARCHAR(16),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    const [rows] = await pool.execute(
      "SELECT theme, text_size FROM user_preferences WHERE user_id = ? LIMIT 1",
      [userId]
    );
    if (!rows?.[0]) return null;
    return { theme: rows[0].theme, textSize: rows[0].text_size };
  } catch (err) {
    console.error('getUserPreferences error', err);
    return null;
  }
}

export async function saveUserPreferences(userId, { theme, textSize }) {
  try {
    await pool.execute(`CREATE TABLE IF NOT EXISTS user_preferences (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL UNIQUE,
      theme VARCHAR(16),
      text_size VARCHAR(16),
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4`);

    await pool.execute(
      `INSERT INTO user_preferences (user_id, theme, text_size) VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE theme = VALUES(theme), text_size = VALUES(text_size), updated_at = CURRENT_TIMESTAMP`,
      [userId, theme || null, textSize || null]
    );
    return true;
  } catch (err) {
    console.error('saveUserPreferences error', err);
    return false;
  }
}

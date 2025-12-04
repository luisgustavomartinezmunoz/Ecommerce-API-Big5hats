import dotenv from "dotenv";
import mysql from "mysql2/promise";

dotenv.config();

const useSsl = process.env.DB_SSL === "true";

export const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
  port: Number(process.env.DB_PORT) || 3306,
  ...(useSsl ? { ssl: { rejectUnauthorized: true } } : {}),
});

export async function testConnection() {
  const conn = await pool.getConnection();
  try {
    await conn.ping();
    console.log("Conectado a la BD correctamente");
  } finally {
    conn.release();
  }
}

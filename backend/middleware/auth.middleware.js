import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "big5hats_secret";

export const verificarToken = (req, res, next) => {
  const payload = decodeToken(req, res);
  if (!payload) return;
  req.user = payload;
  next();
};

export const verificarAdmin = (req, res, next) => {
  const payload = decodeToken(req, res);
  if (!payload) return;
  if (payload.role !== "admin") {
    return res.status(403).json({ mensaje: "Requiere rol de administrador" });
  }
  req.user = payload;
  next();
};

function decodeToken(req, res) {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ mensaje: "Token no proporcionado" });
    return null;
  }
  const token = authHeader.split(" ")[1];
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (err) {
    res.status(401).json({ mensaje: "Token invalido" });
    return null;
  }
}

export default verificarToken;

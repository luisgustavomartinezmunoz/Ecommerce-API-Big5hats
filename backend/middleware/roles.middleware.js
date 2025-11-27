export const requireRole = (allowedRoles = []) => {
	return (req, res, next) => {
		if (!req.user) return res.status(401).json({ mensaje: "No autenticado" });
		const userRole = req.user.role;
		if (Array.isArray(allowedRoles)) {
			if (allowedRoles.includes(userRole)) return next();
		} else {
			if (userRole === allowedRoles) return next();
		}
		return res.status(403).json({ mensaje: "Permisos insuficientes" });
	};
};

export default requireRole;

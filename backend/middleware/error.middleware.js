const errorMiddleware = (err, req, res, next) => {
    console.error("Error:", err.message);
    
    const status = err.status || 500;
    const mensaje = err.mensaje || "Error interno del servidor";
    
    res.status(status).json({
        error: true,
        mensaje,
        ...(process.env.NODE_ENV === 'development' && { details: err.message })
    });
};

export default errorMiddleware;

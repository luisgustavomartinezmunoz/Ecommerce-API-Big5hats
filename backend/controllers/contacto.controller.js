export const enviarMensaje = (req, res) => {
    const { nombre, email, mensaje } = req.body;

    console.log("Mensaje recibido:", nombre, email, mensaje);

    return res.json({
        ok: true,
        mensaje: "En breve te atenderemos",
        empresa: "Big5hats",
        logo: "🧢",
        lema: "Estilo que te distingue"
    });
};

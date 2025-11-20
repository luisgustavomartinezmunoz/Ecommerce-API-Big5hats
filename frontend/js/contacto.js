document.querySelector("#formContacto").addEventListener("submit", async e => {
    e.preventDefault();

    const datos = {
        nombre: document.querySelector("#nombre").value,
        email: document.querySelector("#email").value,
        mensaje: document.querySelector("#mensaje").value
    };

    const respuesta = await fetch("http://localhost:3000/api/contacto/enviar", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(datos)
    });

    const json = await respuesta.json();

    document.querySelector("#respuesta").innerText = json.mensaje;
});

const API_BASE = window.API_BASE || "http://localhost:4700/api";

document.querySelector("#formContacto").addEventListener("submit", async e => {
  e.preventDefault();
  const respuestaEl = document.querySelector("#respuesta");
  respuestaEl.textContent = "Enviando...";

  const datos = {
    nombre: document.querySelector("#nombre").value,
    email: document.querySelector("#email").value,
    mensaje: document.querySelector("#mensaje").value,
  };

  try {
    const respuesta = await fetch(`${API_BASE}/contacto/enviar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(datos),
    });

    const json = await respuesta.json();

    if (!respuesta.ok || !json.ok) {
      throw new Error(json.mensaje || "Error al enviar");
    }

    respuestaEl.textContent = "Mensaje enviado. Revisa tu correo de confirmación.";
  } catch (err) {
    respuestaEl.textContent = "No pudimos enviar el correo. Intenta más tarde.";
  }
});

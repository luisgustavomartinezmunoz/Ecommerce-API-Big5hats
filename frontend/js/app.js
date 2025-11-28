// Define API_BASE global una sola vez
if (!window.API_BASE) {
  window.API_BASE = "http://localhost:4700/api";
}

function renderUserNav() {
  const pill = document.querySelector(".pill-button");
  const nav = document.querySelector(".navbar");
  const nombre = localStorage.getItem("userNombre");
  const role = localStorage.getItem("role");
  if (!nav || !pill) return;

  if (nombre) {
    const btn = document.createElement("button");
    btn.className = "pill-button";
    btn.textContent = `Hola, ${nombre}${role === "admin" ? " (admin)" : ""} · Salir`;
    btn.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userNombre");
      localStorage.removeItem("userCorreo");
      window.location.href = "index.html";
    });
    pill.replaceWith(btn);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderUserNav();
});

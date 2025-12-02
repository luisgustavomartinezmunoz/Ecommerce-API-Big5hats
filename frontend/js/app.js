// Define API_BASE global una sola vez
if (!window.API_BASE) {
  window.API_BASE = "http://localhost:4700/api";
}

function showNotice(message, type = "info") {
  const toast = document.createElement("div");
  toast.textContent = message;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.right = "20px";
  toast.style.padding = "12px 16px";
  toast.style.borderRadius = "10px";
  toast.style.background = type === "error" ? "#c0392b" : "#1e8c4a";
  toast.style.color = "#fff";
  toast.style.fontWeight = "600";
  toast.style.boxShadow = "0 10px 30px rgba(0,0,0,0.25)";
  toast.style.zIndex = "2000";
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2200);
}

function renderUserNav() {
  const pill = document.querySelector(".pill-button");
  const nav = document.querySelector(".navbar");
  const nombre = localStorage.getItem("userNombre");
  const role = localStorage.getItem("role");
  if (!nav || !pill) return;

  if (nombre) {
    const wrapper = document.createElement("div");
    wrapper.style.display = "flex";
    wrapper.style.gap = "8px";
    wrapper.style.alignItems = "center";

    const greeting = document.createElement("span");
    greeting.textContent = `Hola, ${nombre}${role === "admin" ? " (admin)" : ""}`;
    greeting.style.color = "var(--text-primary, #f5f5f5)";
    greeting.style.fontWeight = "600";

    const btnWishlist = document.createElement("button");
    btnWishlist.className = "pill-button ghost";
    btnWishlist.textContent = "Wishlist";
    btnWishlist.addEventListener("click", () => {
      window.location.href = "wishlist.html";
    });

    const btnSub = document.createElement("button");
    btnSub.className = "pill-button";
    btnSub.textContent = "Suscribirme";
    btnSub.addEventListener("click", async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        showNotice("Debes iniciar sesión para suscribirte.", "error");
        return;
      }
      try {
        const res = await fetch(`${window.API_BASE}/suscripcion/enviar`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await res.json();
        if (res.ok && data.ok) {
          showNotice(data.mensaje || "Suscripción confirmada.", "success");
        } else {
          showNotice(data.mensaje || "No pudimos completar la suscripción.", "error");
        }
      } catch (err) {
        showNotice("Error de conexión al suscribirte.", "error");
      }
    });

    const btnLogout = document.createElement("button");
    btnLogout.className = "pill-button";
    btnLogout.textContent = "Salir";
    btnLogout.addEventListener("click", () => {
      localStorage.removeItem("token");
      localStorage.removeItem("role");
      localStorage.removeItem("userNombre");
      localStorage.removeItem("userCorreo");
      window.location.href = "index.html";
    });

    wrapper.appendChild(greeting);
    wrapper.appendChild(btnWishlist);
    wrapper.appendChild(btnSub);
    wrapper.appendChild(btnLogout);
    pill.replaceWith(wrapper);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  renderUserNav();
});

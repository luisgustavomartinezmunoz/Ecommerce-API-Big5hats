const API_BASE_AUTH = window.API_BASE || "http://localhost:4700/api";

async function cargarCaptcha() {
  const img = document.getElementById("captchaCode");
  const hiddenId = document.getElementById("captchaId");
  if (!img || !hiddenId) return;
  try {
    const res = await fetch(`${API_BASE_AUTH}/captcha/generar`);
    const data = await res.json();
    if (res.ok && data.captchaId) {
      hiddenId.value = data.captchaId;
      // Si el backend devuelve una imagen (data URI) la mostramos; si no, mostramos el código en texto
      if (data.img) {
        img.innerHTML = `<img src="${data.img}" alt="captcha" style="max-width:220px;border-radius:8px;">`;
      } else if (data.codigo) {
        img.textContent = data.codigo;
      } else {
        img.textContent = "CAPTCHA";
      }
    } else {
      img.textContent = "CAPTCHA";
    }
  } catch (err) {
    img.textContent = "CAPTCHA";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  cargarCaptcha();

  const statusBox = document.getElementById("loginStatus");
  const showStatus = (msg, type = "info") => {
    if (!statusBox) return;
    statusBox.textContent = msg;
    statusBox.className = `auth-status ${type}`;
  };

  const btnReload = document.getElementById("btnReloadCaptcha");
  if (btnReload) {
    btnReload.addEventListener("click", (e) => {
      e.preventDefault();
      cargarCaptcha();
      showStatus("Nuevo CAPTCHA generado", "info");
    });
  }

  const toast = document.getElementById("loginSuccess");
  const showToast = () => {
    if (!toast) return;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1200);
  };

  // LOGIN
  const formLogin = document.getElementById("formLogin");
  if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      showStatus("Validando...", "info");
      const correo = document.getElementById("correo").value;
      const contrasena = document.getElementById("contrasena").value;
      const captchaTexto = document.getElementById("captchaTexto").value;
      const captchaId = document.getElementById("captchaId").value;
      try {
        const res = await fetch(`${API_BASE_AUTH}/auth/login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, contrasena, captchaId, captchaTexto }),
        });
        const data = await res.json();
        if (res.ok) {
          if (data.token) localStorage.setItem("token", data.token);
          if (data.role) localStorage.setItem("role", data.role);
          if (data.nombre) localStorage.setItem("userNombre", data.nombre);
          if (data.correo) localStorage.setItem("userCorreo", data.correo);
          showStatus("Login exitoso. Redirigiendo...", "success");
          showToast();
          setTimeout(() => window.location.href = "index.html", 600);
        } else {
          showStatus(data.mensaje || "Error al iniciar sesión", "error");
          cargarCaptcha();
        }
      } catch (err) {
        showStatus("Error de conexión", "error");
      }
    });
  }

  // REGISTRO
  const formRegistro = document.getElementById("formRegistro");
  if (formRegistro) {
    formRegistro.addEventListener("submit", async (e) => {
      e.preventDefault();
      showStatus("Registrando...", "info");
      const nombre = document.getElementById("nombre").value;
      const correo = document.getElementById("correoRegistro").value;
      const contrasena = document.getElementById("contrasenaRegistro").value;
      try {
        const res = await fetch(`${API_BASE_AUTH}/auth/registro`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, correo, contrasena }),
        });
        const data = await res.json();
        if (res.ok) {
          showStatus("Registro exitoso, ahora puedes iniciar sesión", "success");
          setTimeout(() => window.location.href = "login.html", 800);
        } else {
          showStatus(data.mensaje || "Error al registrar", "error");
        }
      } catch (err) {
        showStatus("Error de conexión", "error");
      }
    });
  }
});

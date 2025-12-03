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

  const makeStatusHelper = (id) => {
    const el = document.getElementById(id);
    return (msg, type = "info") => {
      if (!el) return;
      el.textContent = msg;
      el.className = `auth-status ${type}`;
    };
  };
  const showLoginStatus = makeStatusHelper("loginStatus");
  const showRegistroStatus = makeStatusHelper("registroStatus");
  const showOlvideStatus = makeStatusHelper("olvideStatus");
  const showResetStatus = makeStatusHelper("resetStatus");

  const btnReload = document.getElementById("btnReloadCaptcha");
  if (btnReload) {
    btnReload.addEventListener("click", (e) => {
      e.preventDefault();
      cargarCaptcha();
      showLoginStatus("Nuevo CAPTCHA generado", "info");
    });
  }

  const toast = document.getElementById("loginSuccess");
  const showToast = () => {
    if (!toast) return;
    toast.classList.add("show");
    setTimeout(() => toast.classList.remove("show"), 1200);
  };

  // Toggle recuperaciA3n
  const resetContainer = document.getElementById("resetContainer");
  const btnToggleReset = document.getElementById("btnToggleReset");
  if (btnToggleReset && resetContainer) {
    btnToggleReset.addEventListener("click", () => {
      const visible = resetContainer.style.display !== "none";
      resetContainer.style.display = visible ? "none" : "block";
    });
  }

  // LOGIN
  const formLogin = document.getElementById("formLogin");
  if (formLogin) {
    formLogin.addEventListener("submit", async (e) => {
      e.preventDefault();
      showLoginStatus("Validando...", "info");
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
          showLoginStatus("Login exitoso. Redirigiendo...", "success");
          showToast();
          setTimeout(() => window.location.href = "index.html", 600);
        } else {
          showLoginStatus(data.mensaje || "Error al iniciar sesión", "error");
          cargarCaptcha();
        }
      } catch (err) {
        showLoginStatus("Error de conexión", "error");
      }
    });
  }

  // OLVIDE MI CONTRASENA (solicitar codigo)
  const formOlvide = document.getElementById("formOlvide");
  if (formOlvide) {
    formOlvide.addEventListener("submit", async (e) => {
      e.preventDefault();
      const correo = document.getElementById("correoOlvido").value.trim();
      if (!correo) {
        showOlvideStatus("El correo es requerido.", "error");
        return;
      }
      showOlvideStatus("Generando codigo de recuperacion...", "info");
      try {
        const res = await fetch(`${API_BASE_AUTH}/auth/olvide-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo }),
        });
        const data = await res.json();
        if (res.ok) {
          const token = data.tokenDemo ? ` Codigo: ${data.tokenDemo}` : "";
          if (data.tokenDemo) {
            const tokenField = document.getElementById("tokenReset");
            if (tokenField) tokenField.value = data.tokenDemo;
            const correoField = document.getElementById("correoReset");
            if (correoField) correoField.value = correo;
          }
          showOlvideStatus((data.mensaje || "Codigo generado.") + token, "success");
        } else {
          showOlvideStatus(data.mensaje || "No se pudo generar el codigo", "error");
        }
      } catch (err) {
        showOlvideStatus("Error de conexion", "error");
      }
    });
  }

  // RESTABLECER PASSWORD
  const formReset = document.getElementById("formReset");
  if (formReset) {
    formReset.addEventListener("submit", async (e) => {
      e.preventDefault();
      const correo = document.getElementById("correoReset").value.trim();
      const token = document.getElementById("tokenReset").value.trim();
      const nueva = document.getElementById("nuevaContrasena").value;
      const confirm = document.getElementById("confirmacionReset").value;
      if (!correo || !token || !nueva || !confirm) {
        showResetStatus("Todos los campos son requeridos.", "error");
        return;
      }
      if (nueva !== confirm) {
        showResetStatus("Las contrasenas no coinciden.", "error");
        return;
      }
      if (nueva.length < 8) {
        showResetStatus("La contrasena debe tener al menos 8 caracteres.", "error");
        return;
      }
      showResetStatus("Validando codigo...", "info");
      try {
        const res = await fetch(`${API_BASE_AUTH}/auth/restablecer-password`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo, token, nuevaContrasena: nueva }),
        });
        const data = await res.json();
        if (res.ok) {
          showResetStatus(data.mensaje || "Contraseña actualizada", "success");
        } else {
          showResetStatus(data.mensaje || "No se pudo restablecer", "error");
        }
      } catch (err) {
        showResetStatus("Error de conexion", "error");
      }
    });
  }
  // REGISTRO
  const formRegistro = document.getElementById("formRegistro");
  if (formRegistro) {
    formRegistro.addEventListener("submit", async (e) => {
      e.preventDefault();
      showRegistroStatus("Validando campos requeridos...", "info");
      const nombre = document.getElementById("nombre").value.trim();
      const telefono = document.getElementById("telefonoRegistro").value.trim();
      const correo = document.getElementById("correoRegistro").value.trim();
      const contrasena = document.getElementById("contrasenaRegistro").value;
      const confirmacion = document.getElementById("contrasenaConfirmacion").value;

      if (!nombre || !correo || !telefono || !contrasena || !confirmacion) {
        showRegistroStatus("Todos los campos son requeridos.", "error");
        return;
      }

      if (!/^[0-9]{10}$/.test(telefono)) {
        showRegistroStatus("Ingresa un número de teléfono de 10 dígitos.", "error");
        return;
      }

      if (contrasena !== confirmacion) {
        showRegistroStatus("Las contraseñas no coinciden. Vuelve a capturarlas.", "error");
        return;
      }

      if (contrasena.length < 8) {
        showRegistroStatus("La contraseña debe tener al menos 8 caracteres.", "error");
        return;
      }

      try {
        const res = await fetch(`${API_BASE_AUTH}/auth/registro`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ nombre, correo, contrasena }),
        });
        const data = await res.json();
        if (res.ok) {
          showRegistroStatus("Registro exitoso, ahora puedes iniciar sesión", "success");
          setTimeout(() => window.location.href = "login.html", 800);
        } else {
          showRegistroStatus(data.mensaje || "Error al registrar", "error");
        }
      } catch (err) {
        showRegistroStatus("Error de conexión", "error");
      }
    });
  }
});

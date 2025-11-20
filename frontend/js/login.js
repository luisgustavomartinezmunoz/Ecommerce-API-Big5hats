// login.js - Manejo básico de login y registro

document.addEventListener('DOMContentLoaded', function () {
    // LOGIN
    const formLogin = document.getElementById('formLogin');
    if (formLogin) {
        formLogin.addEventListener('submit', async function (e) {
            e.preventDefault();
            const correo = document.getElementById('correo').value;
            const contrasena = document.getElementById('contrasena').value;
            const captcha = document.getElementById('captchaTexto').value;
            try {
                const res = await fetch('http://localhost:3000/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ correo, contrasena, captcha })
                });
                const data = await res.json();
                if (res.ok) {
                    alert('Login exitoso');
                    window.location.href = 'index.html';
                } else {
                    alert(data.mensaje || 'Error al iniciar sesión');
                }
            } catch (err) {
                alert('Error de conexión');
            }
        });
    }

    // REGISTRO
    const formRegistro = document.getElementById('formRegistro');
    if (formRegistro) {
        formRegistro.addEventListener('submit', async function (e) {
            e.preventDefault();
            const nombre = document.getElementById('nombre').value;
            const correo = document.getElementById('correoRegistro').value;
            const contrasena = document.getElementById('contrasenaRegistro').value;
            try {
                const res = await fetch('http://localhost:3000/api/auth/registro', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nombre, correo, contrasena })
                });
                const data = await res.json();
                if (res.ok) {
                    alert('Registro exitoso, ahora puedes iniciar sesión');
                    window.location.href = 'login.html';
                } else {
                    alert(data.mensaje || 'Error al registrar');
                }
            } catch (err) {
                alert('Error de conexión');
            }
        });
    }
});

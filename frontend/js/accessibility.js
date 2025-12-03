// Funcionalidad para el botón de accesibilidad
document.addEventListener('DOMContentLoaded', function() {
    const accessibilityBtn = document.querySelector('.accessibility-btn');
    
    if (accessibilityBtn) {
        accessibilityBtn.addEventListener('click', function() {
            // Redirigir a la página de accesibilidad
            window.location.href = 'accesibilidad.html';
        });
    }

    // Aplicar tema guardado al cargar cualquier página
    const savedTheme = localStorage.getItem('theme') || 'dark';
    applyThemeGlobally(savedTheme);
    // Aplicar tamaño de texto guardado
    const savedTextSize = localStorage.getItem('textSize') || 'normal';
    applyTextSizeGlobally(savedTextSize);
});

// Escuchar cambios en localStorage desde otras pestañas
window.addEventListener('storage', function(e) {
    if (e.key === 'theme') {
        applyThemeGlobally(e.newValue);
    }
    if (e.key === 'textSize') {
        applyTextSizeGlobally(e.newValue || 'normal');
    }
});

function applyThemeGlobally(theme) {
    const html = document.documentElement;
    const body = document.body;

    if (theme === 'light') {
        html.classList.add('light-mode');
        body.classList.add('light-mode');
    } else {
        html.classList.remove('light-mode');
        body.classList.remove('light-mode');
    }
}

function applyTextSizeGlobally(size) {
    const html = document.documentElement;
    // remove any previous classes
    html.classList.remove('text-size-small', 'text-size-large');
    if (size === 'small') {
        html.classList.add('text-size-small');
    } else if (size === 'large') {
        html.classList.add('text-size-large');
    }
}

const API_BASE = window.API_BASE || "http://localhost:4700/api";
const params = new URLSearchParams(location.search);
const id = params.get("id");
const $title = document.getElementById("productTitle");
const $media = document.getElementById("productMedia");
const $info = document.getElementById("productInfo");

function notify(msg, type = "info") {
  if (typeof window.showNotice === "function") {
    window.showNotice(msg, type);
  } else {
    alert(msg);
  }
}

async function fetchProducto(pid) {
  const res = await fetch(`${API_BASE}/productos/${encodeURIComponent(pid)}`);
  if (!res.ok) throw new Error("Producto no encontrado");
  const body = await res.json();
  return body.data;
}

async function addWishlist(productId) {
  const token = localStorage.getItem("token");
  if (!token) {
    notify("Inicia sesión para guardar en deseos.", "error");
    return;
  }
  try {
    const res = await fetch(`${API_BASE}/wishlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ productoId: productId }),
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      notify(data.mensaje || "Agregado a tu lista de deseos.", "success");
    } else {
      notify(data.mensaje || "No pudimos agregarlo.", "error");
    }
  } catch (err) {
    notify("Error de conexión.", "error");
  }
}

function render(product) {
  if (!product) {
    $title.textContent = "No encontrado";
    $media.innerHTML = "";
    $info.innerHTML = '<p class="muted">El producto solicitado no existe o no está disponible.</p>';
    return;
  }
  $title.textContent = product.nombre;
  $media.innerHTML = product.imagen
    ? `<img src="${product.imagen}" alt="${product.nombre}">`
    : '<div class="media-hint">Sin imagen</div>';
  $info.innerHTML = `
    <p class="muted">Categoría: ${product.categoria}</p>
    <p>${product.descripcion || ""}</p>
    <p class="price">$${Number(product.precio).toFixed(2)}</p>
    <p>${product.disponible ? "Disponible" : "No disponible"} · Stock: ${product.stock ?? 0}</p>
    <div style="display:flex; gap:10px; flex-wrap:wrap;">
      <button class="btn"${product.disponible ? "" : " disabled"} id="btnAddCart">Agregar al carrito</button>
      <button class="btn ghost" id="btnWishlist">Agregar a deseos</button>
    </div>
  `;

  const btnWishlist = document.getElementById("btnWishlist");
  if (btnWishlist) {
    btnWishlist.addEventListener("click", () => addWishlist(product.id));
  }

  // Añadir funcionalidad de agregar al carrito respetando inicio de sesión
  const btnAddCart = document.getElementById('btnAddCart');
  if (btnAddCart) {
    btnAddCart.addEventListener('click', async (e) => {
      e.preventDefault();
      const token = localStorage.getItem('token');
      if (!token) {
        notify('Debes iniciar sesión para añadir productos al carrito.', 'error');
        // Llevar al login opcionalmente
        setTimeout(() => { window.location.href = 'login.html'; }, 800);
        return;
      }

      try {
        // Usaremos carrito en localStorage para esta demo
        const raw = localStorage.getItem('big5hats_cart');
        const cart = raw ? JSON.parse(raw) : [];
        const existing = cart.find((it) => it.id === product.id);
        if (existing) {
          existing.cantidad = Number(existing.cantidad || 0) + 1;
        } else {
          cart.push({ id: product.id, nombre: product.nombre, precio: Number(product.precio) || 0, cantidad: 1 });
        }
        localStorage.setItem('big5hats_cart', JSON.stringify(cart));
        notify('Producto agregado al carrito.', 'success');
        if (typeof window.updateCartBadge === 'function') window.updateCartBadge();
      } catch (err) {
        console.error(err);
        notify('No pudimos añadir el producto al carrito.', 'error');
      }
    });
  }
}

(async function () {
  if (!id) {
    render(null);
    return;
  }
  try {
    const product = await fetchProducto(id);
    render(product);
  } catch (err) {
    console.error(err);
    render(null);
  }
})();

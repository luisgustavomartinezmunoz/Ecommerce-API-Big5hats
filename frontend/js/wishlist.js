const API_BASE_WISHLIST = window.API_BASE || "http://localhost:4700/api";
const grid = document.getElementById("wishlistGrid");

function notify(msg, type = "info") {
  if (typeof window.showNotice === "function") {
    window.showNotice(msg, type);
  } else {
    alert(msg);
  }
}

async function fetchWishlist() {
  const token = localStorage.getItem("token");
  if (!token) {
    if (grid) grid.innerHTML = '<p class="muted">Inicia sesión para ver tu wishlist.</p>';
    return [];
  }
  const res = await fetch(`${API_BASE_WISHLIST}/wishlist`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("No se pudo cargar la wishlist");
  }
  const body = await res.json();
  return body.data || [];
}

async function removeFromWishlist(productoId) {
  const token = localStorage.getItem("token");
  if (!token) {
    notify("Inicia sesión.", "error");
    return;
  }
  try {
    const res = await fetch(`${API_BASE_WISHLIST}/wishlist/${encodeURIComponent(productoId)}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok && data.ok) {
      notify("Quitado de tu wishlist", "success");
      loadWishlist();
    } else {
      notify(data.mensaje || "No se pudo quitar", "error");
    }
  } catch (err) {
    notify("Error de conexión", "error");
  }
}

function renderWishlist(items) {
  if (!grid) return;
  if (!items.length) {
    grid.innerHTML = '<p class="muted">Tu lista de deseos está vacía.</p>';
    return;
  }
  grid.innerHTML = "";
  items.forEach((item) => {
    const card = document.createElement("article");
    card.className = "producto-card";
    const imgSrc = item.imagen || "";
    card.innerHTML = `
      <div class="producto-media">
        ${imgSrc ? `<img src="${imgSrc}" alt="${item.nombre || ""}">` : `<span class="media-hint">Sin imagen</span>`}
      </div>
      <div class="product-info">
        <h3>${item.nombre || ""}</h3>
        <p class="muted">${item.categoria || ""}</p>
        <div class="product-meta">
          <div class="price">$${Number(item.precio || 0).toFixed(2)}</div>
        </div>
        <div class="product-actions" style="gap:8px;">
          <a class="btn ghost" href="producto-detalle.html?id=${encodeURIComponent(item.productoId)}">Ver detalle</a>
          <button class="btn danger" data-remove="${item.productoId}">Quitar</button>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });

  grid.querySelectorAll("button[data-remove]").forEach((btn) => {
    btn.addEventListener("click", (e) => {
      const pid = e.currentTarget.getAttribute("data-remove");
      removeFromWishlist(pid);
    });
  });
}

async function loadWishlist() {
  if (grid) grid.innerHTML = '<p class="muted">Cargando...</p>';
  try {
    const data = await fetchWishlist();
    renderWishlist(data);
  } catch (err) {
    console.error(err);
    if (grid) grid.innerHTML = '<p class="muted">No se pudo cargar tu wishlist.</p>';
  }
}

document.addEventListener("DOMContentLoaded", loadWishlist);

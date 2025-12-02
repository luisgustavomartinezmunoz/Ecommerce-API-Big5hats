const API_BASE_PRODUCTS = window.API_BASE || "http://localhost:4700/api";

const $grid = document.getElementById("productoGrid");
const $catalogTitle = document.getElementById("catalogTitle");
const $cat = document.getElementById("fCategoria");
const $min = document.getElementById("fMin");
const $max = document.getElementById("fMax");
const $oferta = document.getElementById("fOferta");
const $sort = document.getElementById("fSort");
const $btn = document.getElementById("btnAplicarFiltros");

const urlParams = new URLSearchParams(location.search);
const categoriaInicial = urlParams.get("categoria") || "";

function currency(valor) {
  try {
    return "$" + Number(valor).toLocaleString("es-MX", { minimumFractionDigits: 2 });
  } catch (e) {
    return "$0.00";
  }
}

async function fetchCategorias() {
  try {
    const res = await fetch(`${API_BASE_PRODUCTS}/productos/categorias`);
    if (!res.ok) throw new Error("Error al cargar categorias");
    const body = await res.json();
    const cats = body.data || [];
    cats.forEach((c) => {
      const opt = document.createElement("option");
      opt.value = c.slug;
      opt.textContent = c.nombre;
      $cat.appendChild(opt);
    });
  } catch (err) {
    console.error(err);
  }
}

async function fetchProductos(params = {}) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") query.append(k, v);
  });
  const res = await fetch(`${API_BASE_PRODUCTS}/productos?${query.toString()}`);
  if (!res.ok) throw new Error("Error al obtener productos");
  const body = await res.json();
  return body;
}

function renderProductoCard(producto) {
  const link = document.createElement("a");
  link.className = "producto-card";
  link.href = `producto-detalle.html?id=${encodeURIComponent(producto.id)}`;
  link.setAttribute("data-category", producto.categoria || "");

  const media = document.createElement("div");
  media.className = "producto-media";
  if (producto.imagen) {
    const img = document.createElement("img");
    img.src = producto.imagen;
    img.alt = producto.nombre || "";
    media.appendChild(img);
  } else {
    media.innerHTML = `<span class="media-hint">Sin imagen</span>`;
  }
  if (!producto.disponible) {
    const badge = document.createElement("span");
    badge.className = "pill-chip danger";
    badge.textContent = "Sin stock";
    media.appendChild(badge);
  } else if (producto.oferta) {
    const badge = document.createElement("span");
    badge.className = "pill-chip success";
    badge.textContent = "Oferta";
    media.appendChild(badge);
  }

  const info = document.createElement("div");
  info.className = "product-info";
  info.innerHTML = `
    <h3>${producto.nombre}</h3>
    <p class="muted">${producto.descripcion || ""}</p>
    <div class="product-meta">
      <div class="price">${currency(producto.precio)}</div>
      ${producto.oferta ? '<span class="pill-chip success">Promo</span>' : ""}
    </div>
  `;

  const actions = document.createElement("div");
  actions.className = "product-actions";
  const btn = document.createElement("button");
  btn.className = "btn";
  btn.textContent = producto.disponible ? "Agregar al carrito" : "No disponible";
  btn.disabled = !producto.disponible;
  // Evitar que el click en el botón navegue al detalle y agregar al carrito en sitio
  btn.addEventListener('click', (ev) => {
    ev.preventDefault();
    ev.stopPropagation();
    const token = localStorage.getItem('token');
    if (!token) {
      if (typeof window.showNotice === 'function') window.showNotice('Debes iniciar sesión para añadir productos al carrito.', 'error');
      setTimeout(() => window.location.href = 'login.html', 700);
      return;
    }
    try {
      const raw = localStorage.getItem('big5hats_cart');
      const cart = raw ? JSON.parse(raw) : [];
      const existing = cart.find((it) => it.id === producto.id);
      if (existing) existing.cantidad = Number(existing.cantidad || 0) + 1;
      else cart.push({ id: producto.id, nombre: producto.nombre, precio: Number(producto.precio) || 0, cantidad: 1 });
      localStorage.setItem('big5hats_cart', JSON.stringify(cart));
      if (typeof window.updateCartBadge === 'function') window.updateCartBadge();
      if (typeof window.showNotice === 'function') window.showNotice('Producto agregado al carrito.', 'success');
    } catch (err) {
      console.error('Error añadiendo al carrito', err);
      if (typeof window.showNotice === 'function') window.showNotice('No pudimos añadir el producto al carrito.', 'error');
    }
  });
  actions.appendChild(btn);
  info.appendChild(actions);

  link.appendChild(media);
  link.appendChild(info);
  return link;
}

async function loadAndRender() {
  if ($grid) $grid.innerHTML = '<p class="muted">Cargando productos...</p>';
  try {
    const params = {
      categoria: $cat?.value || "",
      minPrecio: $min?.value || "",
      maxPrecio: $max?.value || "",
      oferta: $oferta?.checked ? "1" : "",
      sort: $sort?.value || "created_at",
    };
    const { data = [], meta } = await fetchProductos(params);
    if ($catalogTitle && params.categoria) {
      const selected = $cat.options[$cat.selectedIndex]?.textContent || params.categoria;
      $catalogTitle.textContent = `Categoria: ${selected}`;
    } else if ($catalogTitle) {
      $catalogTitle.textContent = "Todos los productos";
    }

    if (!$grid) return;
    $grid.innerHTML = "";
    if (!data.length) {
      $grid.innerHTML = '<p class="muted">No se encontraron productos.</p>';
      return;
    }
    data.forEach((p) => $grid.appendChild(renderProductoCard(p)));

    if (meta) {
      console.log("Meta", meta);
    }
  } catch (err) {
    console.error(err);
    if ($grid) $grid.innerHTML = '<p class="muted">Error al cargar productos. Verifica que el backend en puerto 4700 esté encendido.</p>';
  }
}

function bindUI() {
  if ($btn) $btn.addEventListener("click", loadAndRender);
  [$cat, $min, $max, $oferta, $sort].forEach((el) => {
    if (!el) return;
    el.addEventListener("change", () => {
      if (el === $cat && el.value) {
        urlParams.set("categoria", el.value);
        history.replaceState(null, "", `${location.pathname}?${urlParams.toString()}`);
      }
      loadAndRender();
    });
  });
}

async function init() {
  await fetchCategorias();
  if (categoriaInicial && $cat) {
    $cat.value = categoriaInicial;
    if ($catalogTitle) $catalogTitle.textContent = `Categoria: ${categoriaInicial}`;
  }
  bindUI();
  loadAndRender();
}

init();

// Helpers para pruebas manuales desde la consola (alta, baja, cambio)
window.Big5hatsAdmin = {
  crear: (payload) =>
    fetch(`${API_BASE}/productos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => r.json()),
  actualizar: (id, payload) =>
    fetch(`${API_BASE}/productos/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }).then((r) => r.json()),
  eliminar: (id) =>
    fetch(`${API_BASE}/productos/${id}`, { method: "DELETE" }).then((r) => r.json()),
  refrescar: loadAndRender,
};

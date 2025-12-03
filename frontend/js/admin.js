const API_BASE_ADMIN = window.API_BASE || "http://localhost:4700/api";

const els = {
  unauthorized: document.getElementById("unauthorized"),
  content: document.getElementById("adminContent"),
  adminName: document.getElementById("adminUserName"),
  totalVentas: document.getElementById("totalVentasMonto"),
  productosActivos: document.getElementById("productosActivos"),
  productosBody: document.getElementById("productosBody"),
  inventarioBody: document.getElementById("inventarioBody"),
  filtroInventario: document.getElementById("filtroInventario"),
  chartCategorias: document.getElementById("chartCategorias"),
  modal: document.getElementById("productModal"),
  form: document.getElementById("productForm"),
  formTitle: document.getElementById("formTitle"),
  btnCerrarModal: document.getElementById("btnCerrarModal"),
  btnCancelar: document.getElementById("btnCancelar"),
  nombre: document.getElementById("nombreProducto"),
  precio: document.getElementById("precioProducto"),
  categoria: document.getElementById("categoriaProducto"),
  stock: document.getElementById("stockProducto"),
  imagen: document.getElementById("imagenProducto"),
  descripcion: document.getElementById("descripcionProducto"),
  disponible: document.getElementById("disponibleProducto"),
  oferta: document.getElementById("ofertaProducto"),
};

const state = {
  categorias: [],
  productos: [],
  inventario: [],
  ventasCategorias: [],
};

let editingId = null;
const token = localStorage.getItem("token");

const money = (n) => {
  const num = Number(n) || 0;
  return "$" + num.toLocaleString("es-MX", { minimumFractionDigits: 2 }) + " MXN";
};

const toast = (msg, type = "info") => {
  if (typeof window.showNotice === "function") {
    window.showNotice(msg, type === "error" ? "error" : "success");
  } else {
    alert(msg);
  }
};

const fetchJSON = async (url, options = {}) => {
  const res = await fetch(url, options);
  let data = {};
  try {
    data = await res.json();
  } catch (err) {
    data = {};
  }
  if (!res.ok) {
    const mensaje = data?.mensaje || "Ocurrió un error al consultar la API";
    throw new Error(mensaje);
  }
  return data;
};

const authHeaders = (extra = {}) => ({
  Authorization: `Bearer ${token}`,
  ...extra,
});

async function asegurarAdmin() {
  if (!token) throw new Error("Falta token");
  const data = await fetchJSON(`${API_BASE_ADMIN}/auth/me`, {
    headers: authHeaders(),
  });
  if (!data?.user || data.user.role !== "admin") {
    throw new Error("No autorizado");
  }
  if (els.adminName) els.adminName.textContent = data.user.nombre || data.user.correo || "Admin";
  return data.user;
}

function mostrarNoAutorizado() {
  if (els.unauthorized) els.unauthorized.style.display = "block";
  if (els.content) els.content.style.display = "none";
}

function mostrarContenido() {
  if (els.unauthorized) els.unauthorized.style.display = "none";
  if (els.content) els.content.style.display = "flex";
}

function renderCategoriasSelects() {
  if (els.categoria) {
    els.categoria.innerHTML = '<option value="">Selecciona una categor\u00eda</option>';
    state.categorias.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.slug;
      opt.textContent = cat.nombre;
      els.categoria.appendChild(opt);
    });
  }
  if (els.filtroInventario) {
    els.filtroInventario.innerHTML = '<option value="">Todas</option>';
    state.categorias.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat.slug;
      opt.textContent = cat.nombre;
      els.filtroInventario.appendChild(opt);
    });
  }
}

async function cargarCategorias() {
  const { data = [] } = await fetchJSON(`${API_BASE_ADMIN}/productos/categorias`);
  state.categorias = data;
  renderCategoriasSelects();
}

function renderProductos() {
  if (!els.productosBody) return;
  if (!state.productos.length) {
    els.productosBody.innerHTML = '<tr><td colspan="8" class="muted">No hay productos.</td></tr>';
    return;
  }
  const rows = state.productos
    .map((p) => {
      const disponible = Boolean(p.disponible);
      const stock = Number(p.stock || 0);
      const estadoClass = disponible ? "ok" : "off";
      const estadoText = disponible ? "Disponible" : "No disponible";
      const desc = (p.descripcion || "").slice(0, 70) + ((p.descripcion || "").length > 70 ? "…" : "");
      return `<tr>
        <td>${p.imagen ? `<img src="${p.imagen}" alt="${p.nombre || ""}">` : "<span class='muted'>Sin imagen</span>"}</td>
        <td><strong>${p.nombre || ""}</strong></td>
        <td class="muted">${desc}</td>
        <td>${money(p.precio)}</td>
        <td>${p.categoria_nombre || p.categoria || ""}</td>
        <td>${stock}</td>
        <td><span class="status ${estadoClass}">${estadoText}${p.oferta ? " · Oferta" : ""}</span></td>
        <td class="actions">
          <button class="btn ghost small" data-edit="${p.id}">Editar</button>
          <button class="btn danger small" data-delete="${p.id}">Eliminar</button>
        </td>
      </tr>`;
    })
    .join("");
  els.productosBody.innerHTML = rows;
  const activos = state.productos.filter((p) => p.disponible).length;
  if (els.productosActivos) els.productosActivos.textContent = activos;
}

async function cargarProductos() {
  const { data = [] } = await fetchJSON(`${API_BASE_ADMIN}/productos?limit=100&page=1`, {
    headers: authHeaders(),
  });
  state.productos = data;
  renderProductos();
}

async function cargarTotalVentas() {
  const { data } = await fetchJSON(`${API_BASE_ADMIN}/reportes/ventas/total`, {
    headers: authHeaders(),
  });
  if (els.totalVentas) els.totalVentas.textContent = money(data?.total || 0);
}

function renderChart() {
  if (!els.chartCategorias) return;
  const data = state.ventasCategorias || [];
  if (!data.length) {
    els.chartCategorias.innerHTML = '<p class="muted">No hay ventas registradas.</p>';
    return;
  }
  const total = data.reduce((acc, item) => acc + (Number(item.total) || 0), 0);
  if (!total) {
    els.chartCategorias.innerHTML = '<p class="muted">Sin datos de ventas.</p>';
    return;
  }
  const colors = [
    "#d6a74f",
    "#56ccf2",
    "#bb6bd9",
    "#2ecc71",
    "#f2994a",
    "#e74c3c",
    "#9b59b6",
  ];
  let cursor = 0;
  const segments = data
    .map((item, idx) => {
      const value = Math.max(0, Number(item.total) || 0);
      const pct = value / total;
      const start = cursor * 100;
      cursor += pct;
      const end = cursor * 100;
      const color = colors[idx % colors.length];
      return { color, start, end, item, pct };
    });

  const gradient = segments
    .map((seg) => `${seg.color} ${seg.start}% ${seg.end}%`)
    .join(", ");

  const legend = segments
    .map(
      (seg) => `<div class="legend-item">
        <span class="legend-swatch" style="background:${seg.color};"></span>
        <div>
          <strong>${seg.item.categoria || seg.item.categoria_slug}</strong>
          <div class="muted">${money(seg.item.total || 0)} · ${(seg.pct * 100).toFixed(1)}%</div>
        </div>
      </div>`
    )
    .join("");

  els.chartCategorias.innerHTML = `
    <div class="pie-wrapper">
      <div class="pie" style="background: conic-gradient(${gradient});">
        <div class="pie-center">${money(total)}</div>
      </div>
      <div class="pie-legend">${legend}</div>
    </div>
  `;
}

async function cargarVentasCategorias() {
  const { data = [] } = await fetchJSON(`${API_BASE_ADMIN}/reportes/ventas/categorias`, {
    headers: authHeaders(),
  });
  state.ventasCategorias = data;
  renderChart();
}

function renderInventario() {
  if (!els.inventarioBody) return;
  if (!state.inventario.length) {
    els.inventarioBody.innerHTML = '<tr><td colspan="4" class="muted">Sin registros.</td></tr>';
    return;
  }
  els.inventarioBody.innerHTML = state.inventario
    .map((item) => {
      const stock = Number(item.stock || 0);
      const cls = stock === 0 ? "zero-stock" : stock <= 5 ? "low-stock" : "";
      const estado = stock === 0 ? "Sin stock" : stock <= 5 ? "Stock bajo" : "OK";
      const estadoClass = stock === 0 ? "off" : stock <= 5 ? "warn" : "ok";
      return `<tr class="${cls}">
        <td>${item.nombre}</td>
        <td>${item.categoria}</td>
        <td>${stock}</td>
        <td><span class="status ${estadoClass}">${estado}</span></td>
      </tr>`;
    })
    .join("");
}

async function cargarInventario() {
  const categoria = els.filtroInventario?.value || "";
  const query = categoria ? `?categoria=${encodeURIComponent(categoria)}` : "";
  const { data = [] } = await fetchJSON(`${API_BASE_ADMIN}/reportes/inventario${query}`, {
    headers: authHeaders(),
  });
  state.inventario = data;
  renderInventario();
}

function abrirModal(producto = null) {
  editingId = producto?.id || null;
  if (els.formTitle) els.formTitle.textContent = editingId ? "Editar producto" : "Nuevo producto";
  if (els.nombre) els.nombre.value = producto?.nombre || "";
  if (els.precio) els.precio.value = producto?.precio || "";
  if (els.categoria) els.categoria.value = producto?.categoria || producto?.categoria_slug || "";
  if (els.stock) els.stock.value = producto?.stock ?? 0;
  if (els.imagen) els.imagen.value = producto?.imagen || "";
  if (els.descripcion) els.descripcion.value = producto?.descripcion || "";
  if (els.disponible) els.disponible.checked = producto?.disponible !== false;
  if (els.oferta) els.oferta.checked = Boolean(producto?.oferta);
  if (els.modal) els.modal.classList.add("open");
}

function cerrarModal() {
  if (els.modal) els.modal.classList.remove("open");
  if (els.form) els.form.reset();
  editingId = null;
}

async function guardarProducto(e) {
  e.preventDefault();
  if (!els.nombre || !els.precio || !els.categoria) return;
  const payload = {
    nombre: els.nombre.value.trim(),
    descripcion: els.descripcion?.value?.trim() || "",
    precio: Number(els.precio.value),
    categoria: els.categoria.value,
    stock: Number(els.stock?.value || 0),
    imagen: els.imagen?.value?.trim() || "",
    disponible: els.disponible?.checked || false,
    oferta: els.oferta?.checked || false,
  };

  const method = editingId ? "PUT" : "POST";
  const url = editingId
    ? `${API_BASE_ADMIN}/productos/${encodeURIComponent(editingId)}`
    : `${API_BASE_ADMIN}/productos`;

  await fetchJSON(url, {
    method,
    headers: authHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify(payload),
  });
  toast(editingId ? "Producto actualizado" : "Producto creado", "success");
  cerrarModal();
  await Promise.all([cargarProductos(), cargarInventario()]);
}

async function eliminarProducto(id) {
  if (!id) return;
  const confirmado = confirm("¿Eliminar este producto?");
  if (!confirmado) return;
  await fetchJSON(`${API_BASE_ADMIN}/productos/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: authHeaders(),
  });
  toast("Producto eliminado", "success");
  await Promise.all([cargarProductos(), cargarInventario()]);
}

function wireActions() {
  if (els.form) els.form.addEventListener("submit", guardarProducto);
  if (els.btnCerrarModal) els.btnCerrarModal.addEventListener("click", cerrarModal);
  if (els.btnCancelar) els.btnCancelar.addEventListener("click", cerrarModal);
  const addBtn = document.getElementById("btnAgregarProducto");
  if (addBtn) addBtn.addEventListener("click", () => abrirModal());

  const refreshProductos = document.getElementById("btnRefrescarProductos");
  if (refreshProductos) refreshProductos.addEventListener("click", cargarProductos);

  const refreshInventario = document.getElementById("btnRefrescarInventario");
  if (refreshInventario) refreshInventario.addEventListener("click", cargarInventario);

  const refreshVentas = document.getElementById("btnRefrescarVentas");
  if (refreshVentas) refreshVentas.addEventListener("click", () => {
    cargarVentasCategorias();
    cargarTotalVentas();
  });

  const refreshTodo = document.getElementById("btnRefrescarTodo");
  if (refreshTodo) refreshTodo.addEventListener("click", () => {
    cargarProductos();
    cargarInventario();
    cargarVentasCategorias();
    cargarTotalVentas();
  });

  if (els.filtroInventario) {
    els.filtroInventario.addEventListener("change", cargarInventario);
  }

  if (els.productosBody) {
    els.productosBody.addEventListener("click", (e) => {
      const editId = e.target?.dataset?.edit;
      const delId = e.target?.dataset?.delete;
      if (editId) {
        const prod = state.productos.find((p) => String(p.id) === String(editId));
        abrirModal(prod);
      } else if (delId) {
        eliminarProducto(delId);
      }
    });
  }
}

async function initAdmin() {
  try {
    await asegurarAdmin();
    mostrarContenido();
    await cargarCategorias();
    await Promise.all([
      cargarProductos(),
      cargarInventario(),
      cargarVentasCategorias(),
      cargarTotalVentas(),
    ]);
  } catch (err) {
    console.error(err);
    mostrarNoAutorizado();
    toast(err.message || "No autorizado", "error");
  }
}

document.addEventListener("DOMContentLoaded", () => {
  wireActions();
  initAdmin();
});

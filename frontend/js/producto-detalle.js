const API_BASE_DETAIL = window.API_BASE || "http://localhost:4700/api";
const params = new URLSearchParams(location.search);
const id = params.get("id");
const $title = document.getElementById("productTitle");
const $media = document.getElementById("productMedia");
const $info = document.getElementById("productInfo");

async function fetchProducto(pid) {
  const res = await fetch(`${API_BASE_DETAIL}/productos/${encodeURIComponent(pid)}`);
  if (!res.ok) throw new Error("Producto no encontrado");
  const body = await res.json();
  return body.data;
}

function render(product) {
  if (!product) {
    $title.textContent = "No encontrado";
    $media.innerHTML = "";
    $info.innerHTML = '<p class="muted">El producto solicitado no existe o no esta disponible.</p>';
    return;
  }
  $title.textContent = product.nombre;
  $media.innerHTML = product.imagen
    ? `<img src="${product.imagen}" alt="${product.nombre}">`
    : '<div class="media-hint">Sin imagen</div>';
  $info.innerHTML = `
    <p class="muted">Categoria: ${product.categoria}</p>
    <p>${product.descripcion || ""}</p>
    <p class="price">$${Number(product.precio).toFixed(2)}</p>
    <p>${product.disponible ? "Disponible" : "No disponible"} · Stock: ${product.stock ?? 0}</p>
    <button class="btn"${product.disponible ? "" : " disabled"}>Agregar al carrito</button>
  `;
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

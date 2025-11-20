const API_BASE = '/api';
const params = new URLSearchParams(location.search);
const id = params.get('id');
const $title = document.getElementById('productTitle');
const $media = document.getElementById('productMedia');
const $info = document.getElementById('productInfo');

async function fetchProducto(id){
  try{
    const res = await fetch(`${API_BASE}/productos/${encodeURIComponent(id)}`);
    if(!res.ok) throw new Error('Producto no encontrado');
    const body = await res.json();
    return body.data;
  }catch(err){
    console.error('fetchProducto', err);
    return null;
  }
}

function render(product){
  if(!product){
    if($title) $title.textContent = 'No encontrado';
    if($media) $media.textContent = '';
    if($info) $info.innerHTML = '<p class="muted">El producto solicitado no existe o no está disponible.</p>';
    return;
  }
  if($title) $title.textContent = product.nombre;
  if($media) $media.innerHTML = product.imagen ? `<img src="${product.imagen}" alt="${product.nombre}" style="max-width:100%">` : '<div class="media-hint">Sin imagen</div>';
  if($info) $info.innerHTML = `\n    <p class="muted">Categoría: ${product.categoria}</p>\n    <p>${product.descripcion || ''}</p>\n    <p class="price">$${Number(product.precio).toFixed(2)}</p>\n    <p>Stock: ${product.stock}</p>\n  `;
}

(async function(){
  if(!id){
    render(null);
    return;
  }
  const product = await fetchProducto(id);
  render(product);
})();

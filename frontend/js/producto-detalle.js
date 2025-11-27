// Lógica para cargar un producto por id y mostrar la información
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
    $title.textContent = 'No encontrado';
    $media.textContent = '';
    $info.innerHTML = '<p class="muted">El producto solicitado no existe o no está disponible.</p>';
    return;
  }
  $title.textContent = product.nombre;
  $media.innerHTML = product.imagen ? `<img src="${product.imagen}" alt="${product.nombre}" style="max-width:100%">` : '<div class="media-hint">Sin imagen</div>';
  $info.innerHTML = `
    <p class="muted">Categoría: ${product.categoria}</p>
    <p>${product.descripcion || ''}</p>
    <p class="price">$${Number(product.precio).toFixed(2)}</p>
    <p>Stock: ${product.stock}</p>
  `;
}

(async function(){
  if(!id){
    render(null);
    return;
  }
  const product = await fetchProducto(id);
  render(product);
})();

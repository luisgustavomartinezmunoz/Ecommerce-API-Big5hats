// Lógica para cargar productos desde la API
const API_BASE = '/api';
const $grid = document.getElementById('productoGrid');
const $catalogTitle = document.getElementById('catalogTitle');
const urlParams = new URLSearchParams(location.search);
let categoria = urlParams.get('categoria') || '';
let sortValue = document.getElementById('sortSelectHidden') ? document.getElementById('sortSelectHidden').value : 'default';

async function fetchProductos({ categoria, sort } = {}){
  try{
    const q = [];
    if(categoria) q.push(`categoria=${encodeURIComponent(categoria)}`);
    if(sort && sort !== 'default') q.push(`sort=${encodeURIComponent(sort)}`);
    const query = q.length ? `?${q.join('&')}` : '';
    const res = await fetch(`${API_BASE}/productos${query}`);
    if(!res.ok) throw new Error('Error al obtener productos');
    const body = await res.json();
    return body.data || [];
  }catch(err){
    console.error('fetchProductos', err);
    return [];
  }
}

function currency(valor){
  try{ return '$' + Number(valor).toLocaleString('es-MX', { minimumFractionDigits: 2 }); }
  catch(e){ return '$0.00'; }
}

function renderProductoCard(producto){
  const a = document.createElement('article');
  a.className = 'producto-card';
  a.setAttribute('data-category', producto.categoria || '');

  const media = document.createElement('div');
  media.className = 'producto-media';
  if(producto.imagen){
    const img = document.createElement('img');
    img.src = producto.imagen;
    img.alt = producto.nombre || '';
    media.appendChild(img);
  } else {
    media.innerHTML = `<span class="media-hint">Sin imagen</span>`;
  }

  const info = document.createElement('div');
  info.className = 'product-info';
  info.innerHTML = `
    <h3>
      ${producto.nombre}
    </h3>
    <p class="muted">${producto.descripcion || ''}</p>
    <div class="product-meta">
      <div class="price">${currency(producto.precio)}</div>
      <div class="product-actions"><a class="btn" href="producto-detalle.html?id=${producto._id}">Ver detalle</a></div>
    </div>
  `;

  a.appendChild(media);
  a.appendChild(info);
  return a;
}

async function loadAndRender(){
  const products = await fetchProductos({ categoria, sort: sortValue });
  if(!$grid) return;
  $grid.innerHTML = '';
  if(!products.length){
    $grid.innerHTML = '<p class="muted">No se encontraron productos.</p>';
    return;
  }
  products.forEach(p => $grid.appendChild(renderProductoCard(p)));
}

// Configuración de eventos de orden (dropdown)
document.addEventListener('change', (e) =>{
  if(e.target && e.target.id === 'sortSelectHidden'){
    sortValue = e.target.value;
    loadAndRender();
  }
});

if(categoria && $catalogTitle) {
  $catalogTitle.textContent = 'Categoría: ' + decodeURIComponent(categoria).replace(/(^|\s)\S/g, s => s.toUpperCase());
}

loadAndRender();

// Expose helper
window.__Big5_Products = { loadAndRender, fetchProductos };

// Admin helper
window.__Big5_Products.crearProductoAdmin = async function(payload){
  const token = localStorage.getItem('token');
  if(!token) throw new Error('No autenticado');
  const res = await fetch(`${API_BASE}/productos`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
    body: JSON.stringify(payload)
  });
  return await res.json();
};

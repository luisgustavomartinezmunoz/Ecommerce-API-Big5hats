# 🧢 Ecommerce-API-Big5hats

Proyecto final - Programación Web  
Equipo liderado por **Luis Gustavo Martínez Muñoz (246888)**

## Estructura inicial
- **/frontend/** → HTML, CSS y JS del cliente  
- **/backend/** → Servidor Node.js y API’s

- EL PROYECTO ES EJECUTADO CORRECTAMENTE CON
- npm install
- npm run dev
- Esto abre la conexcion establecida con la base de datos alojada en phpMyadmin, y manda al servidor escuchando en el localhost correctamente, desde index.html - open with live server o bien crl+click en el localhost se le redirige a la pagina totalmente funcional.
- Ademas de considerar tener SQL importado en phpmyadmin y XAMPP inicializado correctamente.

---

## Endpoints principales (Productos)

Se agregó una API REST para productos con endpoints públicos para listar y obtener detalle, y rutas protegidas para administración (crear/editar/eliminar).

- GET /api/productos → listar productos (opciones: ?categoria=, ?q=, ?page=, ?limit=, ?sort=)
- GET /api/productos/categorias → listar categorías disponibles
- GET /api/productos/:id → detalle de producto
- POST /api/productos → crear producto (admin, Authorization Bearer token)
- PUT /api/productos/:id → actualizar producto (admin)
- DELETE /api/productos/:id → eliminar producto (admin)

Ver `backend/PRODUCTS_API.md` para más detalles y ejemplos de fetch desde el frontend.


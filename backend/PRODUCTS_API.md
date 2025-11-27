# API Productos - Big5hats

Descripción general de los endpoints y ejemplos de uso desde el frontend (fetch).

Base URL (ejemplo local): http://localhost:3000/api

1) GET /productos
- Descripción: Obtener lista de productos. Soporta filtros y paginación.
- Query params:
  - categoria: filtrar por categoría (ej. ?categoria=clasicos)
  - q: búsqueda por nombre/descripcion
  - page: número de página (default 1)
  - limit: items por página (default 20)
  - sort: 'price-asc' | 'price-desc' | 'default'
- Respuesta (200): { success: true, data: [ ...productos ], meta: { total, page, limit } }

Ejemplo fetch:
```
fetch('/api/productos')
  .then(res => res.json())
  .then(data => console.log(data));
```

2) GET /productos/categorias
- Descripción: Obtener lista de categorías activas.
- Respuesta (200): { success: true, data: ['clasicos','gorras','beanies', ...] }

Ejemplo fetch:
```
fetch('/api/productos/categorias')
  .then(res => res.json())
  .then(data => console.log(data));
```

3) GET /productos/:id
- Descripción: Obtener detalle de un solo producto por su ID.
- Respuesta (200): { success: true, data: { /* producto */ } }

Ejemplo fetch:
```
fetch('/api/productos/6495d0a7ad41f7b4ec123456')
  .then(res => res.json())
  .then(data => console.log(data));
```

4) POST /productos  (admin)
- Descripción: Crear nuevo producto. Requiere `Authorization: Bearer <token>` y rol `admin`.
- Body (JSON):
```json
{
  "nombre": "Gorra Nueva",
  "descripcion": "Descripción...",
  "precio": 799,
  "categoria": "gorras",
  "stock": 10,
  "imagen": "https://.../img.jpg",
  "sku": "SKU-001"
}
```
- Respuesta (201): { success: true, data: { /* producto creado */ } }

Ejemplo fetch:
```
fetch('/api/productos', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer ' + token
  },
  body: JSON.stringify(payload)
})
```

5) PUT /productos/:id (admin)
- Descripción: Actualiza un producto existente. Requiere token admin.
- Body es similar a POST; solo los campos enviados se actualizan.
- Respuesta (200): { success: true, data: { /* producto actualizado */ } }

6) DELETE /productos/:id (admin)
- Descripción: Elimina un producto (borrado físico). Requiere token admin.
- Respuesta (200): { success: true, mensaje: 'Producto eliminado' }

Errores comunes:
- 400: Datos inválidos (validación).
- 401: Token no proporcionado o inválido.
- 403: Permisos insuficientes (no admin).
- 404: Producto no encontrado.
- 500: Error interno.

Notas:
- Para pruebas desde el frontend habilita CORS y asegúrate que la ruta base sea correcta.
- Recomiendo usar `run` o `nodemon` en modo `development` y establecer variable NODE_ENV para ver detalles de errores en la respuesta.

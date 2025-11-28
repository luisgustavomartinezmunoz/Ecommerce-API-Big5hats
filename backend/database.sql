-- Base de datos para Big5hats con MySQL (phpMyAdmin)
CREATE DATABASE IF NOT EXISTS big5hats_store CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE big5hats_store;

-- Tabla de categorias (3 categorias fijas)
CREATE TABLE IF NOT EXISTS categorias (
  slug VARCHAR(50) PRIMARY KEY,
  nombre VARCHAR(120) NOT NULL,
  descripcion VARCHAR(255) DEFAULT NULL
);

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL,
  descripcion TEXT,
  precio DECIMAL(10,2) NOT NULL,
  categoria_slug VARCHAR(50) NOT NULL,
  imagen VARCHAR(500),
  disponible TINYINT(1) DEFAULT 1,
  stock INT DEFAULT 0,
  oferta TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_categoria FOREIGN KEY (categoria_slug) REFERENCES categorias(slug)
);

CREATE INDEX idx_productos_categoria ON productos (categoria_slug);
CREATE INDEX idx_productos_precio ON productos (precio);
CREATE INDEX idx_productos_oferta ON productos (oferta);

-- Semillas de categorias (3)
INSERT INTO categorias (slug, nombre, descripcion) VALUES
('clasicas', 'Gorras Clasicas', 'Silhouette limpia y combinable para el dia a dia'),
('deportivas', 'Gorras Deportivas', 'Tejidos ligeros y respirables para entrenar con estilo'),
('edicion-especial', 'Edicion Especial', 'Colaboraciones limitadas con detalles unicos')
ON DUPLICATE KEY UPDATE nombre = VALUES(nombre), descripcion = VALUES(descripcion);

-- Semillas de productos (8 por categoria = 24)
INSERT INTO productos (nombre, descripcion, precio, categoria_slug, imagen, disponible, stock, oferta) VALUES
-- Clasicas
('Classic Navy', 'Algodon premium color azul marino con visera curva.', 549.00, 'clasicas', 'img/classic.jpg', 1, 25, 0),
('Classic Black', 'Negra minimalista con logo bordado tono a tono.', 579.00, 'clasicas', 'img/classic.jpg', 1, 18, 1),
('Classic White', 'Blanca fresca con banda interna absorbente.', 529.00, 'clasicas', 'img/classic.jpg', 1, 15, 0),
('Classic Khaki', 'Tono arena con ajuste de hebilla metalica.', 559.00, 'clasicas', 'img/classic.jpg', 1, 12, 0),
('Classic Denim', 'Denim ligero con pespunte contrastante.', 589.00, 'clasicas', 'img/classic.jpg', 1, 10, 0),
('Classic Olive', 'Verde olivo con parche rectangular bordado.', 569.00, 'clasicas', 'img/classic.jpg', 1, 9, 0),
('Classic Burgundy', 'Burdeos con under visor gris para menos reflejo.', 579.00, 'clasicas', 'img/classic.jpg', 1, 8, 1),
('Classic Gray', 'Gris jaspeado, ajuste strapback.', 539.00, 'clasicas', 'img/classic.jpg', 0, 0, 0),
-- Deportivas
('Sport Run Black', 'Paneles perforados y cinta reflectante lateral.', 619.00, 'deportivas', 'img/sport.jpg', 1, 22, 1),
('Sport Mesh Blue', 'Malla ligera con cierre de clip rapido.', 599.00, 'deportivas', 'img/sport.jpg', 1, 20, 0),
('Sport Mesh Lime', 'Color lima neón con visera curveada.', 609.00, 'deportivas', 'img/sport.jpg', 1, 17, 0),
('Performance Dry Red', 'Tela quick-dry y banda anti sudor.', 639.00, 'deportivas', 'img/sport.jpg', 1, 14, 0),
('Training Vent', 'Aperturas laser-cut y logo frontal siliconado.', 629.00, 'deportivas', 'img/sport.jpg', 1, 13, 0),
('Trail Shield', 'Revestimiento repelente al agua para trail.', 679.00, 'deportivas', 'img/sport.jpg', 1, 11, 1),
('Runner Flash', 'Detalles reflectivos 360 para correr de noche.', 659.00, 'deportivas', 'img/sport.jpg', 1, 9, 0),
('Speed Aero', 'Ultra ligera con ventilacion total.', 649.00, 'deportivas', 'img/sport.jpg', 0, 0, 0),
-- Edicion especial
('Collab Neon', 'Colaboracion limitada con acentos neon y bordado 3D.', 749.00, 'edicion-especial', 'img/special.jpg', 1, 16, 1),
('Midnight Limited', 'Negro profundo con firma interna numerada.', 789.00, 'edicion-especial', 'img/special.jpg', 1, 14, 0),
('Street Graffiti', 'Arte graffiti en panel lateral, serie corta.', 799.00, 'edicion-especial', 'img/special.jpg', 1, 10, 0),
('Heritage Gold', 'Parche dorado y visera suede, solo 200 piezas.', 829.00, 'edicion-especial', 'img/special.jpg', 1, 9, 0),
('Patchwork Drop', 'Paneles mixtos de canvas y denim premium.', 759.00, 'edicion-especial', 'img/special.jpg', 1, 12, 0),
('Reflective Night', 'Tela iridiscente que refleja luz nocturna.', 779.00, 'edicion-especial', 'img/special.jpg', 1, 11, 1),
('Artist Series', 'Ilustracion de artista invitado en sub-visor.', 809.00, 'edicion-especial', 'img/special.jpg', 1, 10, 0),
('Urban Camo', 'Camuflaje urbano gris, actualmente sin stock.', 739.00, 'edicion-especial', 'img/special.jpg', 0, 0, 0);

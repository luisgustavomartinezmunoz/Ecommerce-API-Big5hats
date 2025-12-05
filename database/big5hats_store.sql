-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 02-12-2025 a las 21:37:06
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `big5hats_store`
--

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carritos`
--

CREATE TABLE `carritos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `carrito_items`
--

CREATE TABLE `carrito_items` (
  `id` int(11) NOT NULL,
  `carrito_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  `precio_unit` decimal(10,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `slug` varchar(50) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`slug`, `nombre`, `descripcion`) VALUES
('clasicas', 'Gorras Clasicas', 'Silhouette limpia y combinable para el dia a dia'),
('deportivas', 'Gorras Deportivas', 'Tejidos ligeros y respirables para entrenar con estilo'),
('edicion-especial', 'Edicion Especial', 'Colaboraciones limitadas con detalles unicos');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ordenes`
--

CREATE TABLE `ordenes` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `total` decimal(10,2) NOT NULL,
  `creada_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `estado` enum('pagada','cancelada') DEFAULT 'pagada'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `orden_detalles`
--

CREATE TABLE `orden_detalles` (
  `id` int(11) NOT NULL,
  `orden_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unit` decimal(10,2) NOT NULL,
  `subtotal` decimal(10,2) GENERATED ALWAYS AS (`cantidad` * `precio_unit`) STORED
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(10,2) NOT NULL,
  `categoria_slug` varchar(50) NOT NULL,
  `imagen` varchar(500) DEFAULT NULL,
  `disponible` tinyint(1) DEFAULT 1,
  `stock` int(11) DEFAULT 0,
  `oferta` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `descripcion`, `precio`, `categoria_slug`, `imagen`, `disponible`, `stock`, `oferta`, `created_at`, `updated_at`) VALUES
(1, 'gorra hurley fairway trucker', 'Algodon premium color marron con visera curva.', 549.00, 'clasicas', 'img/trucker.jpg', 1, 25, 0, '2025-11-28 04:19:15', '2025-12-01 21:18:15'),
(2, 'gorra vuori signal', 'Esta gorra se ha sido diseñado para brindar un ajuste confortable gracias a su estructura ergonómica.', 579.00, 'clasicas', 'img/vuorisignal.jpg', 1, 18, 1, '2025-11-28 04:19:15', '2025-12-02 17:56:32'),
(3, 'gorra nike club', 'La gorra Nike Club es un accesorio clásico y versátil que ofrece comodidad y estilo para cualquier ocasión.', 529.00, 'clasicas', 'img/nikeclub.jpg', 1, 15, 0, '2025-11-28 04:19:15', '2025-12-02 17:58:58'),
(4, 'gorra hurley clare', 'Tono arena con ajuste fresco.', 559.00, 'clasicas', 'img/clare.jpg', 1, 12, 0, '2025-11-28 04:19:15', '2025-12-02 18:01:11'),
(5, 'gorra adidas 3 stripes', 'Denim ligero con pespunte contrastante.', 589.00, 'clasicas', 'img/3stripes.jpg', 1, 10, 0, '2025-11-28 04:19:15', '2025-12-02 18:02:30'),
(6, 'gorra nike rise trucker', 'Gorra Nike Rise Cap Structured Trucker', 569.00, 'clasicas', 'img/niketrucker.jpg', 1, 9, 0, '2025-11-28 04:19:15', '2025-12-02 18:04:40'),
(7, 'gorra puma ess cat', 'La gorra Puma ESS Cat combina estilo deportivo y funcionalidad en un diseño clásico y versátil.', 579.00, 'clasicas', 'img/pumaclasic.jpg', 1, 8, 1, '2025-11-28 04:19:15', '2025-12-02 18:07:16'),
(8, 'Classic Gray', 'Gris jaspeado, ajuste strapback.', 539.00, 'clasicas', 'img/clasicgrey.jpg', 0, 0, 0, '2025-11-28 04:19:15', '2025-12-02 18:05:40'),
(9, 'Sport Run Black', 'Paneles perforados y cinta reflectante lateral.', 619.00, 'deportivas', 'img/SportRunBlack.jpg', 1, 22, 1, '2025-11-28 04:19:15', '2025-11-28 19:19:14'),
(10, 'gorra nike dri-fit club', 'Cuenta con ventilaciones en la coronilla que son ligeras.', 599.00, 'deportivas', 'img/gorradrifitblanca.jpg', 1, 20, 0, '2025-11-28 04:19:15', '2025-12-01 19:59:41'),
(11, 'gorra under armour blitzing', 'De materiales suaves y altamente resistentes. ', 609.00, 'deportivas', 'img/gorraunderrosa.jpg', 1, 17, 0, '2025-11-28 04:19:15', '2025-12-01 19:55:03'),
(12, 'gorra under armour blitzing low brushed', 'Tela quick-dry y banda anti sudor.', 639.00, 'deportivas', 'img/undermorada.jpg', 1, 14, 0, '2025-11-28 04:19:15', '2025-12-01 20:08:47'),
(13, 'Training Vent', 'Aperturas laser-cut y logo frontal siliconado.', 629.00, 'deportivas', 'img/sportvent.jpg', 1, 13, 0, '2025-11-28 04:19:15', '2025-11-28 18:56:18'),
(14, 'gorra under armour sportstyle', 'Esta gorra fue confeccionada con un tejido 100% de algodón.', 679.00, 'deportivas', 'img/sportstyle.jpg', 1, 11, 1, '2025-11-28 04:19:15', '2025-12-01 20:06:13'),
(15, 'gorra adidas climacool sport', 'Detalles reflectivos 360 para correr de noche.', 659.00, 'deportivas', 'img/climacool.jpg', 1, 9, 0, '2025-11-28 04:19:15', '2025-12-01 20:01:09'),
(16, 'gorra nike dri-fit fly', 'Ultra ligera con ventilacion total.', 649.00, 'deportivas', 'img/nikefly.jpg', 0, 0, 0, '2025-11-28 04:19:15', '2025-12-01 20:03:53'),
(17, 'gorra new era 9forty ny yankees', 'Gorra New Era 9FORTY NY Yankees World Series', 949.00, 'edicion-especial', 'img/yankees.jpg', 1, 16, 1, '2025-11-28 04:19:15', '2025-12-02 18:13:20'),
(18, 'gorra new era los angeles dodgers', 'Gorra New Era Los Angeles Dodgers MLB World Series Champions 2024', 789.00, 'edicion-especial', 'img/dodgers.jpg', 1, 14, 0, '2025-11-28 04:19:15', '2025-12-02 18:17:39'),
(19, 'gorra new era 59fifty boston', 'Esta Gorra New Era 59fifty Boston Red Sox World Series presenta el logotipo de los Red Sox bordado en los paneles frontales y un parche del título de la World Series 1997 en el lado izquierdo. ', 799.00, 'edicion-especial', 'img/boston.jpg', 1, 10, 0, '2025-11-28 04:19:15', '2025-12-02 18:18:58'),
(20, 'gorra new era 9seventy oracle red bull racing', 'Gorra New Era 9SEVENTY Oracle Red Bull Racing Max Verstappen', 829.00, 'edicion-especial', 'img/redbull.jpg', 1, 9, 0, '2025-11-28 04:19:15', '2025-12-02 18:20:25'),
(21, 'gorra new era 59fifty diablos rojos del méxico lmb juego de estrellas 2025', 'Apoya incondicionalmente a los Diablos Rojos en todos sus partidos de la temporada y demuestra tu fanatismo por el equipo de la capital de México, usando la Gorra New Era 59FIFTY Diablos Rojos del México LMB Juego de Estrellas 2025.', 759.00, 'edicion-especial', 'img/diablos.jpg', 1, 12, 0, '2025-11-28 04:19:15', '2025-12-02 18:22:27'),
(22, 'gorra new era 9seventy diablos rojos', 'Gorra New Era 9SEVENTY Diablos Rojos del México LMB Campeones Serie del Rey 2025', 779.00, 'edicion-especial', 'img/serierey.jpg', 1, 11, 1, '2025-11-28 04:19:15', '2025-12-02 18:23:48'),
(23, 'gorra new era 9seventy mclaren f1', 'Gorra New Era 9SEVENTY McLaren F1 Team Lando Norris GP México 2025', 809.00, 'edicion-especial', 'img/landonorris.jpg', 1, 10, 0, '2025-11-28 04:19:15', '2025-12-02 18:24:53'),
(24, 'gorra new era 59fifty charros de jalisco lmb juego de estrellas 2025', 'Apoya a los Charros en todos sus partidos de la temporada y sigue apasionadamente su camino por llevar el título de la LMB a sus vitrinas, usando la Gorra New Era 59FIFTY Charros de Jalisco LMB Juego de Estrellas 2025.', 2039.00, 'edicion-especial', 'img/charros.jpg', 0, 0, 0, '2025-11-28 04:19:15', '2025-12-02 18:27:47');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `promocodes`
--

CREATE TABLE `promocodes` (
  `Id` int(11) NOT NULL,
  `Code` varchar(50) NOT NULL,
  `Description` varchar(255) DEFAULT NULL,
  `DiscountType` enum('percentage','fixed','shipping') NOT NULL,
  `DiscountValue` decimal(10,2) DEFAULT NULL,
  `IsActive` tinyint(1) NOT NULL DEFAULT 1,
  `ExpirationDate` date DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `promocodes`
--

INSERT INTO `promocodes` (`Id`, `Code`, `Description`, `DiscountType`, `DiscountValue`, `IsActive`, `ExpirationDate`) VALUES
(1, 'WELCOME10', '10% de descuento en tu primera compra', 'percentage', 10.00, 1, '2025-12-31'),
(2, 'VERANO50', 'Descuento fijo de $50 MXN en compras de verano', 'fixed', 50.00, 1, '2025-08-31'),
(3, 'FREESHIPMX', 'Envío gratis dentro de México', 'shipping', NULL, 1, '2025-12-31'),
(4, 'STUDENT15', '15% de descuento exclusivo para estudiantes', 'percentage', 15.00, 1, '2026-01-15'),
(5, 'HIM20', '20% de descuento especial de temporada', 'percentage', 20.00, 1, '2025-09-30'),
(6, 'NAVIDAD100', 'Descuento fijo de $100 MXN por temporada navideña', 'fixed', 100.00, 1, '2025-12-28');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(120) NOT NULL,
  `correo` varchar(180) NOT NULL,
  `contrasena` varchar(255) NOT NULL,
  `role` enum('admin','user') NOT NULL DEFAULT 'user',
  `creado_en` timestamp NOT NULL DEFAULT current_timestamp(),
  `failed_attempts` int(11) DEFAULT 0,
  `lock_until` datetime DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `correo`, `contrasena`, `role`, `creado_en`, `failed_attempts`, `lock_until`) VALUES
(1, 'Admin Big5hats', 'admin@big5hats.local', '$2a$10$7pUnwdciKv38S9PSSWqiRe7Wr60xP/O3ZKr6VUWsh8s2uPpcU3oY.', 'admin', '2025-11-28 05:02:50', 0, NULL),
(2, 'Jesus', 'jesus@big5hats.local', '$2a$10$7pUnwdciKv38S9PSSWqiRe7Wr60xP/O3ZKr6VUWsh8s2uPpcU3oY.', 'user', '2025-11-28 05:02:50', 0, NULL),
(3, 'Gustavo', 'gustavo@big5hats.local', '$2a$10$7pUnwdciKv38S9PSSWqiRe7Wr60xP/O3ZKr6VUWsh8s2uPpcU3oY.', 'user', '2025-11-28 05:02:50', 0, NULL),
(4, 'Fernando', 'fernando@big5hats.local', '$2a$10$7pUnwdciKv38S9PSSWqiRe7Wr60xP/O3ZKr6VUWsh8s2uPpcU3oY.', 'user', '2025-11-28 05:02:50', 0, NULL),
(5, 'Luis', 'luis@big5hats.local', '$2a$10$7pUnwdciKv38S9PSSWqiRe7Wr60xP/O3ZKr6VUWsh8s2uPpcU3oY.', 'user', '2025-11-28 05:02:50', 0, NULL);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `wishlist`
--

CREATE TABLE `wishlist` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `wishlist`
--

INSERT INTO `wishlist` (`id`, `usuario_id`, `producto_id`, `created_at`) VALUES
(1, 3, 3, '2025-12-02 19:03:23');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `carritos`
--
ALTER TABLE `carritos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `carrito_items`
--
ALTER TABLE `carrito_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `carrito_id` (`carrito_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`slug`);

--
-- Indices de la tabla `ordenes`
--
ALTER TABLE `ordenes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_ordenes_usuario` (`usuario_id`);

--
-- Indices de la tabla `orden_detalles`
--
ALTER TABLE `orden_detalles`
  ADD PRIMARY KEY (`id`),
  ADD KEY `orden_id` (`orden_id`),
  ADD KEY `idx_orden_detalles_producto` (`producto_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_productos_categoria` (`categoria_slug`),
  ADD KEY `idx_productos_precio` (`precio`),
  ADD KEY `idx_productos_oferta` (`oferta`);

--
-- Indices de la tabla `promocodes`
--
ALTER TABLE `promocodes`
  ADD PRIMARY KEY (`Id`),
  ADD UNIQUE KEY `Code` (`Code`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`),
  ADD KEY `idx_usuarios_correo` (`correo`);

--
-- Indices de la tabla `wishlist`
--
ALTER TABLE `wishlist`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `uq_usuario_producto` (`usuario_id`,`producto_id`),
  ADD KEY `fk_wishlist_producto` (`producto_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `carritos`
--
ALTER TABLE `carritos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `carrito_items`
--
ALTER TABLE `carrito_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `ordenes`
--
ALTER TABLE `ordenes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `orden_detalles`
--
ALTER TABLE `orden_detalles`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=25;

--
-- AUTO_INCREMENT de la tabla `promocodes`
--
ALTER TABLE `promocodes`
  MODIFY `Id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT de la tabla `wishlist`
--
ALTER TABLE `wishlist`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `carritos`
--
ALTER TABLE `carritos`
  ADD CONSTRAINT `carritos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `carrito_items`
--
ALTER TABLE `carrito_items`
  ADD CONSTRAINT `carrito_items_ibfk_1` FOREIGN KEY (`carrito_id`) REFERENCES `carritos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `carrito_items_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `ordenes`
--
ALTER TABLE `ordenes`
  ADD CONSTRAINT `ordenes_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `orden_detalles`
--
ALTER TABLE `orden_detalles`
  ADD CONSTRAINT `orden_detalles_ibfk_1` FOREIGN KEY (`orden_id`) REFERENCES `ordenes` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `orden_detalles_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE;

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `fk_categoria` FOREIGN KEY (`categoria_slug`) REFERENCES `categorias` (`slug`);

--
-- Filtros para la tabla `wishlist`
--
ALTER TABLE `wishlist`
  ADD CONSTRAINT `fk_wishlist_producto` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`) ON DELETE CASCADE,
  ADD CONSTRAINT `fk_wishlist_usuario` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;


-- Actualizaciones a la estructura de base de datos existente

-- Verificar que existan todas las tablas necesarias para el sistema de botiquín

-- Tabla de usuarios (debe existir)
CREATE TABLE IF NOT EXISTS usuarios (
  id_usuario INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(100) UNIQUE NOT NULL,
  contrasena TEXT NOT NULL,
  fecha_registro DATE DEFAULT CURRENT_DATE,
  telefono VARCHAR(20),
  es_administrador BOOLEAN DEFAULT FALSE
);

-- Tablas de items por tipo de botiquín (deben existir)
CREATE TABLE IF NOT EXISTS escolar_items (
  id_item INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS hogar_items (
  id_item INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL
);

CREATE TABLE IF NOT EXISTS industria_items (
  id_item INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS montania_items (
  id_item INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL
);

CREATE TABLE IF NOT EXISTS oficina_items (
  id_item INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
  nombre VARCHAR(150) NOT NULL
);

-- Registro de inventario (cabecera)
CREATE TABLE IF NOT EXISTS registro_inventario (
  id_registro INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
  id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  fecha_registro DATE DEFAULT CURRENT_DATE
);

-- Detalle de inventario
CREATE TABLE IF NOT EXISTS detalle_inventario (
  id_detalle INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
  id_registro INT REFERENCES registro_inventario(id_registro) ON DELETE CASCADE,
  tipo_kit VARCHAR(20) CHECK (tipo_kit IN ('escolar', 'hogar', 'industria', 'montania', 'oficina')),
  id_item INT NOT NULL,
  cantidad INT NOT NULL CHECK (cantidad >= 0)
);

-- Registro de compras (cabecera)
CREATE TABLE IF NOT EXISTS compras (
  id_compra INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
  id_usuario INT REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
  fecha_compra DATE DEFAULT CURRENT_DATE,
  estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada', 'enviada', 'entregada')),
  telefono_contacto VARCHAR(20),
  direccion_entrega TEXT,
  notas TEXT,
  total_estimado DECIMAL(10,2) DEFAULT 0.00
);

-- Detalle de compras
CREATE TABLE IF NOT EXISTS detalle_compras (
  id_detalle INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
  id_compra INT REFERENCES compras(id_compra) ON DELETE CASCADE,
  tipo_kit VARCHAR(20) CHECK (tipo_kit IN ('escolar', 'hogar', 'industria', 'montania', 'oficina')),
  id_item INT NOT NULL,
  cantidad INT NOT NULL CHECK (cantidad > 0),
  precio_unitario DECIMAL(10,2) DEFAULT 0.00,
  subtotal DECIMAL(10,2) DEFAULT 0.00
);

-- Tabla de precios por item (nueva)
CREATE TABLE IF NOT EXISTS precios_items (
  id_precio INT GENERATED ALWAYS AS IDENTITY (START WITH 1 INCREMENT BY 1) PRIMARY KEY,
  tipo_kit VARCHAR(20) CHECK (tipo_kit IN ('escolar', 'hogar', 'industria', 'montania', 'oficina')),
  id_item INT NOT NULL,
  precio DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  fecha_actualizacion DATE DEFAULT CURRENT_DATE,
  activo BOOLEAN DEFAULT TRUE
);

-- Insertar precios ejemplo (puedes ajustar según tus necesidades)
INSERT INTO precios_items (tipo_kit, id_item, precio) 
SELECT 'oficina', id_item, 
  CASE 
    WHEN LOWER(nombre) LIKE '%termómetro%' THEN 25.00
    WHEN LOWER(nombre) LIKE '%gasas%' THEN 8.50
    WHEN LOWER(nombre) LIKE '%vendas%' THEN 12.00
    WHEN LOWER(nombre) LIKE '%alcohol%' THEN 6.00
    WHEN LOWER(nombre) LIKE '%guantes%' THEN 15.00
    WHEN LOWER(nombre) LIKE '%tijeras%' THEN 18.00
    WHEN LOWER(nombre) LIKE '%pinzas%' THEN 20.00
    ELSE 10.00
  END
FROM oficina_items
WHERE NOT EXISTS (
  SELECT 1 FROM precios_items WHERE tipo_kit = 'oficina' AND precios_items.id_item = oficina_items.id_item
);

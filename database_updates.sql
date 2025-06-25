-- Actualizaciones a la estructura de base de datos existente

-- Agregar campos a la tabla usuarios
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS telefono VARCHAR(20);
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS es_administrador BOOLEAN DEFAULT FALSE;

-- Agregar campos a la tabla compras
ALTER TABLE compras ADD COLUMN IF NOT EXISTS estado VARCHAR(20) DEFAULT 'pendiente' CHECK (estado IN ('pendiente', 'aprobada', 'rechazada', 'enviada', 'entregada'));
ALTER TABLE compras ADD COLUMN IF NOT EXISTS telefono_contacto VARCHAR(20);
ALTER TABLE compras ADD COLUMN IF NOT EXISTS direccion_entrega TEXT;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS notas TEXT;
ALTER TABLE compras ADD COLUMN IF NOT EXISTS total_estimado DECIMAL(10,2) DEFAULT 0.00;

-- Agregar campos a la tabla detalle_compras
ALTER TABLE detalle_compras ADD COLUMN IF NOT EXISTS precio_unitario DECIMAL(10,2) DEFAULT 0.00;
ALTER TABLE detalle_compras ADD COLUMN IF NOT EXISTS subtotal DECIMAL(10,2) DEFAULT 0.00;

-- Tabla de precios por item (nueva)
CREATE TABLE IF NOT EXISTS precios_items (
  id_precio INT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
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

-- Script para verificar la estructura actual de detalle_reserva_botiquin
-- Y agregar la columna precio_unitario si es necesaria

-- Verificar estructura actual de detalle_reserva_botiquin
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'detalle_reserva_botiquin'
ORDER BY ordinal_position;

-- Agregar la columna precio_unitario para almacenar el precio histórico
-- (precio al momento de la reserva)
ALTER TABLE detalle_reserva_botiquin 
ADD COLUMN IF NOT EXISTS precio_unitario DECIMAL(10,2) NOT NULL DEFAULT 0.00;

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'detalle_reserva_botiquin'
ORDER BY ordinal_position;

-- Actualizar precios existentes basándose en los productos actuales
UPDATE detalle_reserva_botiquin 
SET precio_unitario = (
    SELECT precio 
    FROM productos 
    WHERE productos.id_producto = detalle_reserva_botiquin.id_producto
)
WHERE precio_unitario = 0.00;

-- Verificar los datos actualizados
SELECT d.id_detalle, d.id_reserva, d.id_producto, d.cantidad, d.precio_unitario, p.nombre, p.precio
FROM detalle_reserva_botiquin d
JOIN productos p ON d.id_producto = p.id_producto
LIMIT 10;

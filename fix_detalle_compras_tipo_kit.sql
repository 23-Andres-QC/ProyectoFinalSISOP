-- Add tipo_kit column to detalle_compras if it doesn't exist
ALTER TABLE detalle_compras 
ADD COLUMN IF NOT EXISTS tipo_kit TEXT;

-- For existing records without tipo_kit, we need to try to infer it from the items
-- This is tricky because we need to check which table the id_item exists in

-- First, let's see what records are missing tipo_kit
SELECT dc.*, c.fecha_compra 
FROM detalle_compras dc
JOIN compras c ON dc.id_compra = c.id_compra
WHERE dc.tipo_kit IS NULL
ORDER BY c.fecha_compra DESC;

-- Try to update tipo_kit for existing records by checking which item table contains the id_item
-- Check hogar_items
UPDATE detalle_compras 
SET tipo_kit = 'hogar'
WHERE tipo_kit IS NULL 
AND id_item IN (SELECT id_item FROM hogar_items);

-- Check escolar_items
UPDATE detalle_compras 
SET tipo_kit = 'escolar'
WHERE tipo_kit IS NULL 
AND id_item IN (SELECT id_item FROM escolar_items);

-- Check oficina_items
UPDATE detalle_compras 
SET tipo_kit = 'oficina'
WHERE tipo_kit IS NULL 
AND id_item IN (SELECT id_item FROM oficina_items);

-- Check industria_items
UPDATE detalle_compras 
SET tipo_kit = 'industria'
WHERE tipo_kit IS NULL 
AND id_item IN (SELECT id_item FROM industria_items);

-- Check montania_items (note: we store as 'montania' in DB but show as 'montaña' in UI)
UPDATE detalle_compras 
SET tipo_kit = 'montania'
WHERE tipo_kit IS NULL 
AND id_item IN (SELECT id_item FROM montania_items);

-- Verify the updates
SELECT 
    tipo_kit,
    COUNT(*) as count
FROM detalle_compras 
GROUP BY tipo_kit;

-- Show any remaining records without tipo_kit
SELECT * FROM detalle_compras WHERE tipo_kit IS NULL;

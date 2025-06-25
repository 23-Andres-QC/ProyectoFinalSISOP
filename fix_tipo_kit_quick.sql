-- Quick fix: Add tipo_kit column to detalle_compras if it doesn't exist
-- Run this in Supabase SQL editor

-- Step 1: Add the column if it doesn't exist
ALTER TABLE detalle_compras 
ADD COLUMN IF NOT EXISTS tipo_kit TEXT;

-- Step 2: Update existing records by checking which item table contains each id_item
-- This might take a moment for large datasets

-- Update records with hogar items
UPDATE detalle_compras 
SET tipo_kit = 'hogar'
WHERE tipo_kit IS NULL 
  AND id_item IN (SELECT id_item FROM hogar_items);

-- Update records with escolar items  
UPDATE detalle_compras 
SET tipo_kit = 'escolar'
WHERE tipo_kit IS NULL 
  AND id_item IN (SELECT id_item FROM escolar_items);

-- Update records with oficina items
UPDATE detalle_compras 
SET tipo_kit = 'oficina'
WHERE tipo_kit IS NULL 
  AND id_item IN (SELECT id_item FROM oficina_items);

-- Update records with industria items
UPDATE detalle_compras 
SET tipo_kit = 'industria'
WHERE tipo_kit IS NULL 
  AND id_item IN (SELECT id_item FROM industria_items);

-- Update records with montania items (stored as 'montania' in DB)
UPDATE detalle_compras 
SET tipo_kit = 'montania'
WHERE tipo_kit IS NULL 
  AND id_item IN (SELECT id_item FROM montania_items);

-- Step 3: Check the results
SELECT 
    tipo_kit,
    COUNT(*) as count
FROM detalle_compras 
GROUP BY tipo_kit
ORDER BY count DESC;

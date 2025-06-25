-- Query to check the structure of detalle_compras table
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'detalle_compras' 
ORDER BY ordinal_position;

-- Also check actual data
SELECT * FROM detalle_compras LIMIT 5;

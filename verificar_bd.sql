-- Script de verificación para la base de datos del sistema de botiquín
-- Ejecuta este script para verificar que todas las tablas necesarias existan

-- Verificar existencia de tablas
SELECT 
  'usuarios' as tabla,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'usuarios'
  ) as existe;

SELECT 
  'registro_inventario' as tabla,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'registro_inventario'
  ) as existe;

SELECT 
  'detalle_inventario' as tabla,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'detalle_inventario'
  ) as existe;

SELECT 
  'hogar_items' as tabla,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'hogar_items'
  ) as existe;

SELECT 
  'oficina_items' as tabla,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'oficina_items'
  ) as existe;

SELECT 
  'escolar_items' as tabla,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'escolar_items'
  ) as existe;

SELECT 
  'industria_items' as tabla,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'industria_items'
  ) as existe;

SELECT 
  'montania_items' as tabla,
  EXISTS (
    SELECT 1 FROM information_schema.tables 
    WHERE table_name = 'montania_items'
  ) as existe;

-- Verificar que las tablas de items tengan datos
SELECT 'hogar_items', COUNT(*) as items FROM hogar_items;
SELECT 'oficina_items', COUNT(*) as items FROM oficina_items;
SELECT 'escolar_items', COUNT(*) as items FROM escolar_items;
SELECT 'industria_items', COUNT(*) as items FROM industria_items;
SELECT 'montania_items', COUNT(*) as items FROM montania_items;

-- Verificar estructura de las tablas principales
\d usuarios;
\d registro_inventario;
\d detalle_inventario;

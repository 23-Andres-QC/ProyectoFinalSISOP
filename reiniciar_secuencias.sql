-- Script para reiniciar las secuencias de auto-incremento en 1
-- Ejecuta esto solo si las tablas ya existen y quieres reiniciar los IDs

-- Reiniciar secuencia de usuarios
ALTER TABLE usuarios ALTER COLUMN id_usuario RESTART WITH 1;

-- Reiniciar secuencia de registro_inventario
ALTER TABLE registro_inventario ALTER COLUMN id_registro RESTART WITH 1;

-- Reiniciar secuencia de detalle_inventario
ALTER TABLE detalle_inventario ALTER COLUMN id_detalle RESTART WITH 1;

-- Reiniciar secuencia de compras
ALTER TABLE compras ALTER COLUMN id_compra RESTART WITH 1;

-- Reiniciar secuencia de detalle_compras
ALTER TABLE detalle_compras ALTER COLUMN id_detalle RESTART WITH 1;

-- Reiniciar secuencia de precios_items
ALTER TABLE precios_items ALTER COLUMN id_precio RESTART WITH 1;

-- Reiniciar secuencias de items
ALTER TABLE escolar_items ALTER COLUMN id_item RESTART WITH 1;
ALTER TABLE hogar_items ALTER COLUMN id_item RESTART WITH 1;
ALTER TABLE industria_items ALTER COLUMN id_item RESTART WITH 1;
ALTER TABLE montania_items ALTER COLUMN id_item RESTART WITH 1;
ALTER TABLE oficina_items ALTER COLUMN id_item RESTART WITH 1;

-- Nota: Este script eliminará todos los datos existentes y reiniciará los IDs desde 1
-- Solo ejecutar si quieres limpiar completamente la base de datos

-- TRUNCATE TABLE detalle_inventario CASCADE;
-- TRUNCATE TABLE registro_inventario CASCADE;
-- TRUNCATE TABLE detalle_compras CASCADE;
-- TRUNCATE TABLE compras CASCADE;
-- TRUNCATE TABLE precios_items CASCADE;
-- TRUNCATE TABLE usuarios CASCADE;

-- Descomenta las líneas TRUNCATE de arriba solo si quieres eliminar todos los datos

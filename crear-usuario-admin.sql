-- Script para crear un usuario administrador
-- Ejecuta este script en tu base de datos de Supabase

-- Primero, verificar si ya existe un usuario admin
SELECT * FROM usuarios WHERE tipo_usuario = 'admin';

-- Si no existe, crear uno nuevo
INSERT INTO usuarios (nombre, correo, contrasena_hash, tipo_usuario, fecha_creacion)
VALUES (
  'Administrador',
  'admin@admin.com',
  '$2b$10$dummy.hash.for.testing.purposes.only',
  'admin',
  NOW()
);

-- Verificar que se creó correctamente
SELECT id_usuario, nombre, correo, tipo_usuario, fecha_creacion 
FROM usuarios 
WHERE tipo_usuario = 'admin';

-- Script para convertir usuario a administrador
-- Ejecutar este SQL en el SQL Editor de Supabase

-- Verificar el usuario actual
SELECT id_usuario, nombre, correo, tipo_usuario, fecha_registro
FROM usuarios 
WHERE correo = '22200144@ue.edu.pe';

-- Convertir a administrador
UPDATE usuarios 
SET tipo_usuario = 'admin'
WHERE correo = '22200144@ue.edu.pe';

-- Verificar el cambio
SELECT id_usuario, nombre, correo, tipo_usuario, fecha_registro
FROM usuarios 
WHERE correo = '22200144@ue.edu.pe';

-- Ver todos los administradores
SELECT id_usuario, nombre, correo, tipo_usuario, fecha_registro
FROM usuarios 
WHERE tipo_usuario = 'admin'
ORDER BY fecha_registro DESC;

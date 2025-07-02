-- Convertir usuario específico en administrador
UPDATE usuarios 
SET tipo_usuario = 'admin' 
WHERE correo = 'tu-email-admin@ejemplo.com';

-- Verificar el cambio
SELECT correo, tipo_usuario 
FROM usuarios 
WHERE correo = 'tu-email-admin@ejemplo.com';

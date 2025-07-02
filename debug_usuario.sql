-- Script para verificar usuarios y su tipo
-- Este script nos ayudará a entender el estado actual de los usuarios

-- Ver todos los usuarios y sus tipos
SELECT id_usuario, nombre, correo, tipo_usuario, fecha_registro
FROM usuarios 
ORDER BY fecha_registro DESC;

-- Ver específicamente el usuario del problema
SELECT id_usuario, nombre, correo, tipo_usuario, fecha_registro
FROM usuarios 
WHERE correo = '22200144@ue.edu.pe';

-- Ver todos los inventarios de botiquín para este usuario
SELECT 
    ib.id_inventario,
    ib.id_usuario,
    ib.fecha_registro,
    u.correo,
    COUNT(dib.id_producto) as total_productos
FROM inventario_botiquin ib
JOIN usuarios u ON ib.id_usuario = u.id_usuario
LEFT JOIN detalle_inventario_botiquin dib ON ib.id_inventario = dib.id_inventario
WHERE u.correo = '22200144@ue.edu.pe'
GROUP BY ib.id_inventario, ib.id_usuario, ib.fecha_registro, u.correo
ORDER BY ib.fecha_registro DESC;

-- Ver detalles de productos en cada inventario
SELECT 
    ib.id_inventario,
    ib.fecha_registro,
    p.nombre as producto_nombre,
    p.tipo_botiquin,
    dib.cantidad
FROM inventario_botiquin ib
JOIN usuarios u ON ib.id_usuario = u.id_usuario
JOIN detalle_inventario_botiquin dib ON ib.id_inventario = dib.id_inventario
JOIN productos p ON dib.id_producto = p.id_producto
WHERE u.correo = '22200144@ue.edu.pe'
ORDER BY ib.fecha_registro DESC, p.tipo_botiquin;

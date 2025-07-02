-- Script para actualizar reservas existentes sin estado
-- Esto asignará el estado 'por_revisar' a todas las reservas que no tengan estado

-- Actualizar reservas sin estado
UPDATE reserva_botiquin 
SET estado = 'por_revisar' 
WHERE estado IS NULL OR estado = '';

-- Verificar el resultado
SELECT id_reserva, id_usuario, fecha, monto_total, estado,
       CASE 
           WHEN estado = 'por_revisar' THEN '🟡 Por Revisar'
           WHEN estado = 'revisado' THEN '🟢 Revisado'
           WHEN estado = 'finalizado' THEN '🔵 Finalizado'
           ELSE '❓ ' || estado
       END as estado_visual
FROM reserva_botiquin
ORDER BY fecha DESC
LIMIT 10;

-- Contar reservas por estado
SELECT estado, COUNT(*) as total
FROM reserva_botiquin
GROUP BY estado
ORDER BY total DESC;

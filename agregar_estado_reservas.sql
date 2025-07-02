-- Script para agregar la columna estado a la tabla reserva_botiquin
-- Estados: 'por_revisar', 'revisado', 'finalizado'

-- Agregar la columna estado
ALTER TABLE reserva_botiquin 
ADD COLUMN IF NOT EXISTS estado VARCHAR(20) NOT NULL DEFAULT 'por_revisar';

-- Verificar que la columna se agregó correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'reserva_botiquin'
ORDER BY ordinal_position;

-- Actualizar registros existentes para que tengan estado 'por_revisar'
UPDATE reserva_botiquin 
SET estado = 'por_revisar' 
WHERE estado IS NULL OR estado = '';

-- Verificar los datos
SELECT id_reserva, id_usuario, tipo_botiquin, fecha, monto_total, estado
FROM reserva_botiquin
ORDER BY fecha DESC
LIMIT 10;

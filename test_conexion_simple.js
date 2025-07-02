// Script para verificar conexión básica con Supabase
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dfzzgvvhqvqlfvonltzg.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmenpndnZocXZxbGZ2b25sdHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzNDA3MzgsImV4cCI6MjA1MDkxNjczOH0.qMNaT4c4cADUrhHRYS_xxaOt9NqPK_a-XNbqO7wpWa0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarConexion() {
  try {
    console.log('🔗 Verificando conexión con Supabase...')

    // Consulta simple a una tabla que sabemos que existe
    const { data, error } = await supabase.from('productos').select('count').limit(1)

    if (error) {
      console.error('❌ Error de conexión:', error.message)
    } else {
      console.log('✅ Conexión exitosa con Supabase')
      console.log('📋 Debes ejecutar el siguiente SQL en la consola de Supabase:')
      console.log('')
      console.log('-- 1. Verificar estructura actual')
      console.log(
        "SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'detalle_reserva_botiquin';",
      )
      console.log('')
      console.log('-- 2. Agregar columna precio_unitario')
      console.log(
        'ALTER TABLE detalle_reserva_botiquin ADD COLUMN IF NOT EXISTS precio_unitario DECIMAL(10,2) NOT NULL DEFAULT 0.00;',
      )
      console.log('')
      console.log('-- 3. Actualizar precios existentes')
      console.log(
        'UPDATE detalle_reserva_botiquin SET precio_unitario = (SELECT precio FROM productos WHERE productos.id_producto = detalle_reserva_botiquin.id_producto) WHERE precio_unitario = 0.00;',
      )
    }
  } catch (error) {
    console.error('❌ Error general:', error.message)
  }
}

verificarConexion()

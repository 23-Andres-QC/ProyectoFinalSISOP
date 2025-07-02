import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://dfzzgvvhqvqlfvonltzg.supabase.co'
const supabaseKey =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRmenpndnZocXZxbGZ2b25sdHpnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzUzNDA3MzgsImV4cCI6MjA1MDkxNjczOH0.qMNaT4c4cADUrhHRYS_xxaOt9NqPK_a-XNbqO7wpWa0'

const supabase = createClient(supabaseUrl, supabaseKey)

async function verificarEstructuraDetalle() {
  try {
    console.log('🔍 Verificando estructura de detalle_reserva_botiquin...')

    // Obtener información de las columnas
    const { data, error } = await supabase.from('detalle_reserva_botiquin').select('*').limit(1)

    if (error) {
      console.error('❌ Error al consultar tabla:', error)
      return
    }

    console.log('✅ Tabla existe')

    if (data && data.length > 0) {
      console.log('📊 Columnas encontradas en el primer registro:')
      Object.keys(data[0]).forEach((column) => {
        console.log(`  - ${column}`)
      })
    } else {
      console.log('⚠️  La tabla está vacía, intentando obtener estructura desde metadatos...')

      // Hacer una consulta simple para ver qué columnas están disponibles
      const { error: testError } = await supabase
        .from('detalle_reserva_botiquin')
        .select('id_detalle, id_reserva, id_producto, cantidad')
        .limit(1)

      if (testError) {
        console.log('Error con columnas básicas:', testError.message)
      } else {
        console.log('✅ Columnas básicas existen: id_detalle, id_reserva, id_producto, cantidad')
      }

      // Probar si existe precio_unitario
      const { error: precioError } = await supabase
        .from('detalle_reserva_botiquin')
        .select('precio_unitario')
        .limit(1)

      if (precioError) {
        console.log('❌ La columna precio_unitario NO existe:', precioError.message)
      } else {
        console.log('✅ La columna precio_unitario SÍ existe')
      }
    }
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

verificarEstructuraDetalle()

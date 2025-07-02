// Script de prueba para la gestión de órdenes en AdminSimplePage
const { createClient } = require('@supabase/supabase-js')

// Configuración de Supabase (usar tus credenciales reales)
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testOrdenesGestion() {
  console.log('🔍 Iniciando pruebas de gestión de órdenes...\n')

  try {
    // 1. Verificar estructura de tabla reserva_botiquin
    console.log('1. Verificando estructura de tabla reserva_botiquin...')
    const { data: ordenes, error: ordenesError } = await supabase
      .from('reserva_botiquin')
      .select('*')
      .limit(5)

    if (ordenesError) {
      console.error('❌ Error al consultar reserva_botiquin:', ordenesError)
    } else {
      console.log('✅ Tabla reserva_botiquin accesible')
      console.log('📊 Estructura de datos de ejemplo:')
      if (ordenes && ordenes.length > 0) {
        console.log('Columnas encontradas:', Object.keys(ordenes[0]))
        console.log('Primer registro:', ordenes[0])
      } else {
        console.log('⚠️ No hay datos en la tabla')
      }
    }

    // 2. Probar consulta con las columnas correctas
    console.log('\n2. Probando consulta con columnas específicas...')
    const { data: ordenesEspecificas, error: especificasError } = await supabase
      .from('reserva_botiquin')
      .select('id_reserva, id_usuario, fecha, monto_total, Estado')
      .order('fecha', { ascending: false })
      .limit(10)

    if (especificasError) {
      console.error('❌ Error en consulta específica:', especificasError)
    } else {
      console.log('✅ Consulta específica exitosa')
      console.log(`📈 Total de órdenes encontradas: ${ordenesEspecificas.length}`)

      if (ordenesEspecificas.length > 0) {
        console.log('\n📋 Ejemplo de órdenes:')
        ordenesEspecificas.slice(0, 3).forEach((orden, index) => {
          console.log(
            `  ${index + 1}. ID: ${orden.id_reserva}, Usuario: ${orden.id_usuario}, Estado: ${orden.Estado}, Monto: $${orden.monto_total}`,
          )
        })
      }
    }

    // 3. Verificar estados disponibles
    console.log('\n3. Verificando estados disponibles...')
    const { data: estados, error: estadosError } = await supabase
      .from('reserva_botiquin')
      .select('Estado')

    if (estadosError) {
      console.error('❌ Error al consultar estados:', estadosError)
    } else {
      const estadosUnicos = [...new Set(estados.map((e) => e.Estado).filter(Boolean))]
      console.log('✅ Estados únicos encontrados:', estadosUnicos)
    }

    // 4. Probar actualización de estado (simulación)
    console.log('\n4. Simulando actualización de estado...')
    if (ordenesEspecificas && ordenesEspecificas.length > 0) {
      const primeraOrden = ordenesEspecificas[0]
      console.log(
        `📝 Orden a actualizar: ID ${primeraOrden.id_reserva}, Estado actual: ${primeraOrden.Estado}`,
      )

      // Solo simular, no actualizar realmente
      console.log('✅ Simulación de actualización exitosa (no se realizó cambio real)')
    }

    console.log('\n🎉 Todas las pruebas de gestión de órdenes completadas exitosamente!')
  } catch (error) {
    console.error('💥 Error general en las pruebas:', error)
  }
}

// Función para probar la conexión
async function testConnection() {
  try {
    const { data, error } = await supabase.from('usuarios').select('count').limit(1)
    if (error) throw error
    console.log('✅ Conexión a Supabase exitosa')
    return true
  } catch (error) {
    console.error('❌ Error de conexión a Supabase:', error.message)
    return false
  }
}

// Ejecutar pruebas
async function main() {
  console.log('🚀 Iniciando script de prueba para gestión de órdenes\n')

  // Verificar si las credenciales están configuradas
  if (supabaseUrl === 'YOUR_SUPABASE_URL' || supabaseKey === 'YOUR_SUPABASE_ANON_KEY') {
    console.log('⚠️ NOTA: Para ejecutar este script, necesitas:')
    console.log('1. Reemplazar YOUR_SUPABASE_URL con tu URL real de Supabase')
    console.log('2. Reemplazar YOUR_SUPABASE_ANON_KEY con tu clave anónima real')
    console.log(
      '3. Instalar @supabase/supabase-js si no está instalado: npm install @supabase/supabase-js',
    )
    return
  }

  const isConnected = await testConnection()
  if (isConnected) {
    await testOrdenesGestion()
  }
}

main()

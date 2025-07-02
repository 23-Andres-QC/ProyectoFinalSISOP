// Script para verificar el estado de las tablas de reservas en Supabase
import { createClient } from '@supabase/supabase-js'

// Configuración de Supabase (reemplaza con tus valores reales)
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseKey = 'YOUR_SUPABASE_ANON_KEY'
const supabase = createClient(supabaseUrl, supabaseKey)

async function testReservasTables() {
  console.log('🔍 Verificando estado de las tablas de reservas...')

  try {
    // 1. Verificar tabla reserva_botiquin
    console.log('\n📋 Consultando tabla reserva_botiquin...')
    const {
      data: reservas,
      error: reservasError,
      count,
    } = await supabase.from('reserva_botiquin').select('*', { count: 'exact' })

    if (reservasError) {
      console.error('❌ Error en tabla reserva_botiquin:', reservasError)
    } else {
      console.log('✅ reserva_botiquin - Total registros:', count)
      console.log('📄 Primeros 3 registros:', reservas?.slice(0, 3))
    }

    // 2. Verificar tabla detalle_reserva_botiquin
    console.log('\n📋 Consultando tabla detalle_reserva_botiquin...')
    const {
      data: detalles,
      error: detallesError,
      count: countDetalles,
    } = await supabase.from('detalle_reserva_botiquin').select('*', { count: 'exact' })

    if (detallesError) {
      console.error('❌ Error en tabla detalle_reserva_botiquin:', detallesError)
    } else {
      console.log('✅ detalle_reserva_botiquin - Total registros:', countDetalles)
      console.log('📄 Primeros 3 registros:', detalles?.slice(0, 3))
    }

    // 3. Verificar tabla productos para referencia
    console.log('\n📋 Consultando tabla productos...')
    const {
      data: productos,
      error: productosError,
      count: countProductos,
    } = await supabase
      .from('productos')
      .select('id_producto, nombre, precio, tipo', { count: 'exact' })

    if (productosError) {
      console.error('❌ Error en tabla productos:', productosError)
    } else {
      console.log('✅ productos - Total registros:', countProductos)
      console.log('📄 Primeros 3 productos:', productos?.slice(0, 3))
    }

    // 4. Verificar tabla usuarios
    console.log('\n📋 Consultando tabla usuarios...')
    const {
      data: usuarios,
      error: usuariosError,
      count: countUsuarios,
    } = await supabase
      .from('usuarios')
      .select('id_usuario, nombre, correo, tipo_usuario', { count: 'exact' })

    if (usuariosError) {
      console.error('❌ Error en tabla usuarios:', usuariosError)
    } else {
      console.log('✅ usuarios - Total registros:', countUsuarios)
      console.log('📄 Primeros 3 usuarios:', usuarios?.slice(0, 3))
    }
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar la verificación
testReservasTables()

// Script para verificar las tablas de reservas usando la configuración existente
import { supabase } from './src/supabase.js'

async function verificarTablasReservas() {
  console.log('🔍 Verificando estado de las tablas de reservas en Supabase...')

  try {
    // 1. Verificar estructura y datos de reserva_botiquin
    console.log('\n📋 Tabla: reserva_botiquin')
    const {
      data: reservas,
      error: errorReservas,
      count: totalReservas,
    } = await supabase.from('reserva_botiquin').select('*', { count: 'exact' }).limit(5)

    if (errorReservas) {
      console.error('❌ Error:', errorReservas.message)
      console.error('📝 Detalles:', errorReservas)
    } else {
      console.log(`✅ Total de registros: ${totalReservas}`)
      if (reservas && reservas.length > 0) {
        console.log('📄 Estructura detectada:', Object.keys(reservas[0]))
        console.log('📄 Primeros registros:', reservas)
      } else {
        console.log('📄 La tabla existe pero está vacía')
      }
    }

    // 2. Verificar estructura y datos de detalle_reserva_botiquin
    console.log('\n📋 Tabla: detalle_reserva_botiquin')
    const {
      data: detalles,
      error: errorDetalles,
      count: totalDetalles,
    } = await supabase.from('detalle_reserva_botiquin').select('*', { count: 'exact' }).limit(5)

    if (errorDetalles) {
      console.error('❌ Error:', errorDetalles.message)
      console.error('📝 Detalles:', errorDetalles)
    } else {
      console.log(`✅ Total de registros: ${totalDetalles}`)
      if (detalles && detalles.length > 0) {
        console.log('📄 Estructura detectada:', Object.keys(detalles[0]))
        console.log('📄 Primeros registros:', detalles)
      } else {
        console.log('📄 La tabla existe pero está vacía')
      }
    }

    // 3. Verificar tabla productos (para referencia)
    console.log('\n📋 Tabla: productos (referencia)')
    const {
      data: productos,
      error: errorProductos,
      count: totalProductos,
    } = await supabase
      .from('productos')
      .select('id_producto, nombre, precio, tipo', { count: 'exact' })
      .limit(3)

    if (errorProductos) {
      console.error('❌ Error:', errorProductos.message)
    } else {
      console.log(`✅ Total de productos: ${totalProductos}`)
      if (productos && productos.length > 0) {
        console.log('📄 Productos ejemplo:', productos)
      }
    }

    // 4. Verificar tabla usuarios (para referencia)
    console.log('\n📋 Tabla: usuarios (referencia)')
    const {
      data: usuarios,
      error: errorUsuarios,
      count: totalUsuarios,
    } = await supabase
      .from('usuarios')
      .select('id_usuario, nombre, correo', { count: 'exact' })
      .limit(3)

    if (errorUsuarios) {
      console.error('❌ Error:', errorUsuarios.message)
    } else {
      console.log(`✅ Total de usuarios: ${totalUsuarios}`)
      if (usuarios && usuarios.length > 0) {
        console.log('📄 Usuarios ejemplo:', usuarios)
      }
    }

    console.log('\n✅ Verificación completada')
  } catch (error) {
    console.error('❌ Error general:', error)
  }
}

// Ejecutar verificación
verificarTablasReservas()

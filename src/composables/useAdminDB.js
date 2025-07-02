import { ref } from 'vue'
import { supabase } from '../supabase'
import { useAuth } from './useAuth'

export function useAdminDB() {
  const { user } = useAuth()
  const loading = ref(false)
  const error = ref(null)

  // ===============================
  // GESTIÓN DE USUARIOS
  // ===============================

  const obtenerUsuarios = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: dbError } = await supabase
        .from('usuarios')
        .select('id_usuario, nombre, correo, tipo_usuario, fecha_creacion')
        .order('fecha_creacion', { ascending: false })

      if (dbError) {
        console.error('❌ Error obteniendo usuarios:', dbError)
        throw dbError
      }

      console.log('✅ Usuarios obtenidos:', data.length)
      return data
    } catch (err) {
      error.value = err.message
      console.error('Error obteniendo usuarios:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const actualizarTipoUsuario = async (idUsuario, nuevoTipo) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: dbError } = await supabase
        .from('usuarios')
        .update({ tipo_usuario: nuevoTipo })
        .eq('id_usuario', idUsuario)
        .select()

      if (dbError) {
        console.error('❌ Error actualizando tipo de usuario:', dbError)
        throw dbError
      }

      console.log('✅ Tipo de usuario actualizado exitosamente:', data[0])
      return data[0]
    } catch (err) {
      error.value = err.message
      console.error('Error actualizando tipo de usuario:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const eliminarUsuario = async (idUsuario) => {
    try {
      loading.value = true
      error.value = null

      const { error: dbError } = await supabase
        .from('usuarios')
        .delete()
        .eq('id_usuario', idUsuario)

      if (dbError) {
        console.error('❌ Error eliminando usuario:', dbError)
        throw dbError
      }

      console.log('✅ Usuario eliminado exitosamente')
    } catch (err) {
      error.value = err.message
      console.error('Error eliminando usuario:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===============================
  // GESTIÓN DE PRODUCTOS
  // ===============================

  const obtenerTodosLosProductos = async () => {
    try {
      loading.value = true
      error.value = null

      const { data, error: dbError } = await supabase
        .from('productos')
        .select('*')
        .order('nombre', { ascending: true })

      if (dbError) {
        console.error('❌ Error obteniendo productos:', dbError)
        throw dbError
      }

      console.log('✅ Productos obtenidos:', data.length)
      return data.map((producto) => ({
        id: producto.id_producto,
        item: producto.nombre,
        precio_unitario: producto.precio,
        tipo_kit: producto.tipo,
      }))
    } catch (err) {
      error.value = err.message
      console.error('Error obteniendo productos:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const crearProducto = async (nuevoProducto) => {
    try {
      loading.value = true
      error.value = null

      if (!nuevoProducto.item || !nuevoProducto.tipo_kit || !nuevoProducto.precio_unitario) {
        throw new Error('Nombre del producto, tipo y precio son requeridos')
      }

      const { data, error: dbError } = await supabase
        .from('productos')
        .insert([
          {
            nombre: nuevoProducto.item,
            precio: parseFloat(nuevoProducto.precio_unitario),
            tipo: nuevoProducto.tipo_kit,
          },
        ])
        .select()

      if (dbError) {
        console.error('❌ Error creando producto:', dbError)
        throw dbError
      }

      console.log('✅ Producto creado exitosamente:', data[0])
      return {
        id: data[0].id_producto,
        item: data[0].nombre,
        precio_unitario: data[0].precio,
        tipo_kit: data[0].tipo,
      }
    } catch (err) {
      error.value = err.message
      console.error('Error creando producto:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const actualizarProducto = async (producto, datosActualizados) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: dbError } = await supabase
        .from('productos')
        .update({
          nombre: datosActualizados.item,
          precio: parseFloat(datosActualizados.precio_unitario),
          tipo: datosActualizados.tipo_kit,
        })
        .eq('id_producto', producto.id)
        .select()

      if (dbError) {
        console.error('❌ Error actualizando producto:', dbError)
        throw dbError
      }

      console.log('✅ Producto actualizado exitosamente:', data[0])
      return {
        id: data[0].id_producto,
        item: data[0].nombre,
        precio_unitario: data[0].precio,
        tipo_kit: data[0].tipo,
      }
    } catch (err) {
      error.value = err.message
      console.error('Error actualizando producto:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const eliminarProducto = async (producto) => {
    try {
      loading.value = true
      error.value = null

      const { error: dbError } = await supabase
        .from('productos')
        .delete()
        .eq('id_producto', producto.id)

      if (dbError) {
        console.error('❌ Error eliminando producto:', dbError)
        throw dbError
      }

      console.log('✅ Producto eliminado exitosamente')
    } catch (err) {
      error.value = err.message
      console.error('Error eliminando producto:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===============================
  // GESTIÓN DE ÓRDENES/RESERVAS
  // ===============================

  const obtenerTodasLasOrdenes = async () => {
    try {
      loading.value = true
      error.value = null

      // Como admin, obtener TODAS las reservas de TODOS los usuarios
      // Solo traer los campos estrictamente necesarios de reserva_botiquin
      const { data, error: dbError } = await supabase
        .from('reserva_botiquin')
        .select(
          `
          id_reserva,
          fecha,
          monto_total,
          Estado,
          usuarios (nombre, correo)
        `,
        )
        .order('fecha', { ascending: false })

      if (dbError) {
        console.error('Error obteniendo órdenes:', dbError)
        throw dbError
      }

      return data || []
    } catch (err) {
      error.value = err.message
      console.error('Error obteniendo órdenes:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const cambiarEstadoOrden = async (idOrden, nuevoEstado) => {
    try {
      loading.value = true
      error.value = null

      if (!idOrden) {
        throw new Error('ID de orden inválido')
      }

      const { data, error: dbError } = await supabase
        .from('reserva_botiquin')
        .update({ Estado: nuevoEstado })
        .eq('id_reserva', idOrden)
        .select('id_reserva, Estado')

      if (dbError) {
        console.error('Error cambiando estado de orden:', dbError)
        throw dbError
      }

      return data[0]
    } catch (err) {
      error.value = err.message
      console.error('Error cambiando estado de orden:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  const obtenerDetalleReserva = async (idReserva) => {
    try {
      loading.value = true
      error.value = null

      const { data, error: dbError } = await supabase
        .from('detalle_reserva_botiquin')
        .select(
          `
          id_detalle,
          id_reserva,
          cantidad,
          precio_unitario,
          productos(
            nombre,
            tipo
          )
        `,
        )
        .eq('id_reserva', idReserva)
        .order('id_detalle', { ascending: true })

      if (dbError) {
        console.error('Error obteniendo detalle de reserva:', dbError)
        throw dbError
      }

      return data || []
    } catch (err) {
      error.value = err.message
      console.error('Error obteniendo detalle de reserva:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  // ===============================
  // REPORTES Y ESTADÍSTICAS
  // ===============================

  const obtenerEstadisticas = async () => {
    try {
      loading.value = true
      error.value = null

      const { data: statsUsuarios, error: errorUsuarios } = await supabase
        .from('usuarios')
        .select('tipo_usuario')

      if (errorUsuarios) throw errorUsuarios

      const { data: statsReservas, error: errorReservas } = await supabase
        .from('reserva_botiquin')
        .select('estado, monto_total, fecha')

      if (errorReservas) throw errorReservas

      const estadisticas = {
        usuarios: {
          total: statsUsuarios.length,
          admin: statsUsuarios.filter((u) => u.tipo_usuario === 'admin').length,
          cliente: statsUsuarios.filter((u) => u.tipo_usuario === 'cliente').length,
        },
        ordenes: {
          total: statsReservas.length,
          pendientes: statsReservas.filter((r) => !r.estado || r.estado === 'por_revisar').length,
          revisadas: statsReservas.filter((r) => r.estado === 'revisado').length,
          finalizadas: statsReservas.filter((r) => r.estado === 'finalizado').length,
          ingresos_total: statsReservas.reduce((sum, r) => sum + (r.monto_total || 0), 0),
        },
      }

      console.log('✅ Estadísticas obtenidas:', estadisticas)
      return estadisticas
    } catch (err) {
      error.value = err.message
      console.error('Error obteniendo estadísticas:', err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,

    // Usuarios
    obtenerUsuarios,
    actualizarTipoUsuario,
    eliminarUsuario,

    // Productos
    obtenerTodosLosProductos,
    crearProducto,
    actualizarProducto,
    eliminarProducto,

    // Órdenes
    obtenerTodasLasOrdenes,
    cambiarEstadoOrden,
    obtenerDetalleReserva,

    // Estadísticas
    obtenerEstadisticas,
  }
}

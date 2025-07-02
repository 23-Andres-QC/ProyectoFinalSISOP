import { ref } from 'vue'
import { supabase } from '../supabase.js'

export function useBotiquin() {
  const loading = ref(false)
  const error = ref(null)

  // Obtener productos por tipo desde la BD
  const getProductsByType = async (type) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('productos')
        .select('*')
        .eq('tipo', type)

      if (supabaseError) throw supabaseError
      return data || []
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Registrar inventario de botiquín (modo registro)
  const registerBotiquin = async (tipo, items) => {
    loading.value = true
    error.value = null

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // 1. Crear registro en inventario_botiquin
      const { data: inventario, error: inventarioError } = await supabase
        .from('inventario_botiquin')
        .insert({
          id_usuario: user.id,
          fecha: new Date().toISOString(),
        })
        .select()
        .single()

      if (inventarioError) throw inventarioError

      // 2. Crear detalles del inventario
      const detalles = items.map((item) => ({
        id_inventario: inventario.id_inventario,
        id_producto: item.id_producto,
        cantidad: item.cantidad,
      }))

      const { error: detallesError } = await supabase
        .from('detalle_inventario_botiquin')
        .insert(detalles)

      if (detallesError) throw detallesError

      return inventario
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Crear reserva de compra (modo reserva)
  const createReserva = async (items, montoTotal) => {
    loading.value = true
    error.value = null

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // 1. Crear registro en reserva_botiquin
      const { data: reserva, error: reservaError } = await supabase
        .from('reserva_botiquin')
        .insert({
          id_usuario: user.id,
          fecha: new Date().toISOString(),
          monto_total: montoTotal,
        })
        .select()
        .single()

      if (reservaError) throw reservaError

      return reserva
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener historial de botiquines del usuario
  const getBotiquinHistory = async () => {
    loading.value = true
    error.value = null

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { data, error: supabaseError } = await supabase
        .from('inventario_botiquin')
        .select(
          `
          *,
          detalle_inventario_botiquin (
            *,
            productos (*)
          )
        `,
        )
        .eq('id_usuario', user.id)
        .order('fecha', { ascending: false })

      if (supabaseError) throw supabaseError
      return data || []
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener historial de reservas del usuario
  const getReservasHistory = async () => {
    loading.value = true
    error.value = null

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { data, error: supabaseError } = await supabase
        .from('reserva_botiquin')
        .select('*')
        .eq('id_usuario', user.id)
        .order('fecha', { ascending: false })

      if (supabaseError) throw supabaseError
      return data || []
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener detalles de un botiquín específico
  const getBotiquinDetails = async (idInventario) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('detalle_inventario_botiquin')
        .select(
          `
          *,
          productos (*)
        `,
        )
        .eq('id_inventario', idInventario)

      if (supabaseError) throw supabaseError
      return data || []
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actualizar detalle de inventario
  const updateBotiquinDetail = async (idDetalle, cantidad) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('detalle_inventario_botiquin')
        .update({ cantidad })
        .eq('id_detalle', idDetalle)
        .select()

      if (supabaseError) throw supabaseError
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Eliminar detalle de inventario
  const deleteBotiquinDetail = async (idDetalle) => {
    loading.value = true
    error.value = null

    try {
      const { error: supabaseError } = await supabase
        .from('detalle_inventario_botiquin')
        .delete()
        .eq('id_detalle', idDetalle)

      if (supabaseError) throw supabaseError
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Agregar nuevo producto al botiquín
  const addProductToBotiquin = async (idInventario, idProducto, cantidad) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('detalle_inventario_botiquin')
        .insert({
          id_inventario: idInventario,
          id_producto: idProducto,
          cantidad,
        })
        .select()

      if (supabaseError) throw supabaseError
      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    getProductsByType,
    registerBotiquin,
    createReserva,
    getBotiquinHistory,
    getReservasHistory,
    getBotiquinDetails,
    updateBotiquinDetail,
    deleteBotiquinDetail,
    addProductToBotiquin,
  }
}

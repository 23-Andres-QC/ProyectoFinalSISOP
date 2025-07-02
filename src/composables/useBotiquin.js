import { ref } from 'vue'
import { supabase } from '../supabase.js'

export function useBotiquin() {
  const loading = ref(false)
  const error = ref(null)

  // Helper: Obtener el ID entero del usuario desde la tabla usuarios
  const getUserIntegerId = async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) throw new Error('Usuario no autenticado')

    // Buscar el usuario en la tabla usuarios por su email
    const { data: usuarioData, error: usuarioError } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('correo', user.email)
      .single()

    if (usuarioError) {
      // Si no existe el usuario en la tabla, intentar crearlo
      const newUserData = {
        nombre: user.user_metadata?.name || user.email.split('@')[0],
        correo: user.email,
        contrasena: 'hash_handled_by_supabase',
        tipo_usuario: 'normal',
        fecha_creacion: new Date().toISOString(),
      }

      const { data: newUser, error: createError } = await supabase
        .from('usuarios')
        .insert(newUserData)
        .select('id_usuario')
        .single()

      if (createError) throw createError

      return newUser.id_usuario
    }

    return usuarioData.id_usuario
  }

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
    console.log('📦 registerBotiquin: Iniciando registro de botiquín...')
    console.log('📦 registerBotiquin: Parámetros recibidos:', { tipo, items })

    loading.value = true
    error.value = null

    try {
      // Obtener el ID entero del usuario
      const userId = await getUserIntegerId()
      console.log('📦 registerBotiquin: ID de usuario obtenido:', userId)

      // 1. Crear registro en inventario_botiquin
      const inventarioData = {
        id_usuario: userId,
        fecha: new Date().toISOString(),
      }

      console.log('📦 registerBotiquin: Datos para crear inventario:', inventarioData)

      const { data: inventario, error: inventarioError } = await supabase
        .from('inventario_botiquin')
        .insert(inventarioData)
        .select()
        .single()

      console.log('📦 registerBotiquin: Resultado de creación de inventario:', {
        inventario,
        inventarioError,
      })

      if (inventarioError) throw inventarioError

      // 2. Crear detalles del inventario
      const detalles = items.map((item) => ({
        id_inventario: inventario.id_inventario,
        id_producto: item.id_producto,
        cantidad: item.cantidad,
      }))

      console.log('📦 registerBotiquin: Detalles a insertar:', detalles)

      const { error: detallesError } = await supabase
        .from('detalle_inventario_botiquin')
        .insert(detalles)

      console.log('📦 registerBotiquin: Resultado de inserción de detalles:', {
        detallesError,
      })

      if (detallesError) throw detallesError

      console.log('✅ registerBotiquin: Botiquín registrado exitosamente:', inventario)
      return inventario
    } catch (err) {
      console.error('❌ registerBotiquin: Error en registro:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Crear reserva de compra (modo reserva)
  const createReserva = async (items, montoTotal) => {
    console.log('🛒 createReserva: Iniciando...', { items, montoTotal })
    loading.value = true
    error.value = null

    try {
      // Obtener el ID entero del usuario
      const userId = await getUserIntegerId()
      console.log('🛒 createReserva: Usuario ID obtenido:', userId)

      // 1. Crear registro en reserva_botiquin
      const reservaData = {
        id_usuario: userId,
        fecha: new Date().toISOString(),
        monto_total: montoTotal,
        Estado: 'por_revisar', // Usar 'Estado' con mayúscula según la imagen
      }
      console.log('🛒 createReserva: Datos de reserva a insertar:', reservaData)

      const { data: reserva, error: reservaError } = await supabase
        .from('reserva_botiquin')
        .insert(reservaData)
        .select()
        .single()

      console.log('🛒 createReserva: Resultado inserción reserva:', { reserva, reservaError })

      if (reservaError) throw reservaError

      // 2. Crear detalles de la reserva
      const detalles = items.map((item) => ({
        id_reserva: reserva.id_reserva,
        id_producto: item.id_producto,
        cantidad: item.cantidad,
      }))
      console.log('🛒 createReserva: Detalles a insertar:', detalles)

      const { error: detallesError } = await supabase
        .from('detalle_reserva_botiquin')
        .insert(detalles)

      console.log('🛒 createReserva: Resultado inserción detalles:', { detallesError })

      if (detallesError) throw detallesError

      console.log('✅ createReserva: Reserva creada exitosamente:', reserva)
      return reserva
    } catch (err) {
      console.error('❌ createReserva: Error completo:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener historial de botiquines del usuario - VERSIÓN SIMPLIFICADA
  const getBotiquinHistory = async () => {
    console.log('📋 getBotiquinHistory: Iniciando obtención de historial...')

    loading.value = true
    error.value = null

    try {
      // Obtener el ID entero del usuario
      const userId = await getUserIntegerId()
      console.log('📋 getBotiquinHistory: ID de usuario obtenido:', userId)

      // 1. Obtener inventarios básicos
      console.log('📋 getBotiquinHistory: Consultando inventarios...')
      const { data: inventarios, error: inventariosError } = await supabase
        .from('inventario_botiquin')
        .select('*')
        .eq('id_usuario', userId)
        .order('fecha', { ascending: false })

      console.log('📋 getBotiquinHistory: Resultado de inventarios:', {
        inventarios,
        inventariosError,
        cantidad: inventarios?.length,
      })

      if (inventariosError) throw inventariosError

      // 2. Para cada inventario, obtener sus detalles y productos
      const inventariosConDetalles = []

      for (const inventario of inventarios || []) {
        // Obtener detalles del inventario
        const { data: detalles, error: detallesError } = await supabase
          .from('detalle_inventario_botiquin')
          .select('*')
          .eq('id_inventario', inventario.id_inventario)

        if (detallesError) {
          console.error('Error obteniendo detalles:', detallesError)
          continue
        }

        // Obtener productos para cada detalle
        let tipo_botiquin = 'Sin tipo'
        const detallesConProductos = []

        for (const detalle of detalles || []) {
          const { data: producto, error: productoError } = await supabase
            .from('productos')
            .select('*')
            .eq('id_producto', detalle.id_producto)
            .single()

          if (!productoError && producto) {
            detallesConProductos.push({
              ...detalle,
              productos: producto,
            })

            // Obtener tipo del primer producto
            if (tipo_botiquin === 'Sin tipo') {
              tipo_botiquin = producto.tipo || 'Sin tipo'
            }
          }
        }

        inventariosConDetalles.push({
          ...inventario,
          detalle_inventario_botiquin: detallesConProductos,
          tipo_botiquin,
          total_productos: detallesConProductos.length,
        })
      }

      return inventariosConDetalles
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener historial de reservas del usuario - VERSIÓN SIMPLIFICADA
  const getReservasHistory = async () => {
    console.log('📋 getReservasHistory: Iniciando consulta...')
    loading.value = true
    error.value = null

    try {
      // Obtener el ID entero del usuario
      const userId = await getUserIntegerId()
      console.log('📋 getReservasHistory: Usuario ID:', userId)

      // 1. Obtener reservas básicas
      const { data: reservas, error: reservasError } = await supabase
        .from('reserva_botiquin')
        .select('*')
        .eq('id_usuario', userId)
        .order('fecha', { ascending: false })

      console.log('📋 getReservasHistory: Consulta reservas básicas:', {
        reservas,
        reservasError,
        cantidadReservas: reservas?.length || 0,
      })

      if (reservasError) throw reservasError

      // 2. Para cada reserva, obtener sus detalles y productos
      const reservasConDetalles = []

      for (const reserva of reservas || []) {
        // Obtener detalles de la reserva
        const { data: detalles, error: detallesError } = await supabase
          .from('detalle_reserva_botiquin')
          .select('*')
          .eq('id_reserva', reserva.id_reserva)

        if (detallesError) {
          console.error('Error obteniendo detalles de reserva:', detallesError)
          continue
        }

        // Obtener productos para cada detalle
        let total = 0
        let tipo_botiquin = 'Sin tipo'
        const detallesConProductos = []

        for (const detalle of detalles || []) {
          const { data: producto, error: productoError } = await supabase
            .from('productos')
            .select('*')
            .eq('id_producto', detalle.id_producto)
            .single()

          if (!productoError && producto) {
            const subtotal = (producto.precio || 0) * (detalle.cantidad || 0)
            total += subtotal

            detallesConProductos.push({
              ...detalle,
              productos: producto,
              subtotal,
            })

            // Obtener tipo del primer producto
            if (tipo_botiquin === 'Sin tipo') {
              tipo_botiquin = producto.tipo || 'Sin tipo'
            }
          }
        }

        reservasConDetalles.push({
          ...reserva,
          detalle_reserva_botiquin: detallesConProductos,
          tipo_botiquin,
          total_productos: detallesConProductos.length,
          total_calculado: total,
        })
      }

      return reservasConDetalles
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener detalles de un botiquín específico - VERSIÓN SIMPLIFICADA
  const getBotiquinDetails = async (idInventario) => {
    loading.value = true
    error.value = null

    try {
      // 1. Obtener detalles básicos
      const { data: detalles, error: detallesError } = await supabase
        .from('detalle_inventario_botiquin')
        .select('*')
        .eq('id_inventario', idInventario)

      if (detallesError) throw detallesError

      // 2. Para cada detalle, obtener el producto
      const detallesConProductos = []

      for (const detalle of detalles || []) {
        const { data: producto, error: productoError } = await supabase
          .from('productos')
          .select('*')
          .eq('id_producto', detalle.id_producto)
          .single()

        if (!productoError && producto) {
          detallesConProductos.push({
            ...detalle,
            productos: producto,
          })
        }
      }

      return detallesConProductos
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener detalles de una reserva específica - VERSIÓN SIMPLIFICADA
  const getReservaDetails = async (idReserva) => {
    loading.value = true
    error.value = null

    try {
      // 1. Obtener detalles básicos
      const { data: detalles, error: detallesError } = await supabase
        .from('detalle_reserva_botiquin')
        .select('*')
        .eq('id_reserva', idReserva)

      if (detallesError) throw detallesError

      // 2. Para cada detalle, obtener el producto y calcular subtotal
      const detallesConProductos = []

      for (const detalle of detalles || []) {
        const { data: producto, error: productoError } = await supabase
          .from('productos')
          .select('*')
          .eq('id_producto', detalle.id_producto)
          .single()

        if (!productoError && producto) {
          // Usar precio del producto actual (siempre disponible)
          const precioActual = producto.precio || 0

          detallesConProductos.push({
            ...detalle,
            productos: producto,
            precio_unitario: precioActual, // Usar precio actual del producto
            subtotal: precioActual * (detalle.cantidad || 0),
          })
        }
      }

      return detallesConProductos
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

  // Actualizar detalle de reserva
  const updateReservaDetail = async (idDetalle, cantidad) => {
    console.log('🔄 updateReservaDetail: Iniciando actualización de detalle de reserva...')
    console.log('🔄 updateReservaDetail: Parámetros:', { idDetalle, cantidad })

    loading.value = true
    error.value = null

    try {
      const updateData = {
        cantidad: cantidad,
      }

      console.log('🔄 updateReservaDetail: Datos a actualizar:', updateData)

      const { error: supabaseError } = await supabase
        .from('detalle_reserva_botiquin')
        .update(updateData)
        .eq('id_detalle', idDetalle)

      console.log('🔄 updateReservaDetail: Resultado de actualización:', { supabaseError })

      if (supabaseError) throw supabaseError

      console.log('✅ updateReservaDetail: Detalle actualizado exitosamente')
    } catch (err) {
      console.error('❌ updateReservaDetail: Error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Eliminar detalle de reserva
  const deleteReservaDetail = async (idDetalle) => {
    console.log('🗑️ deleteReservaDetail: Iniciando eliminación de detalle de reserva...')
    console.log('🗑️ deleteReservaDetail: ID detalle:', idDetalle)

    loading.value = true
    error.value = null

    try {
      const { error: supabaseError } = await supabase
        .from('detalle_reserva_botiquin')
        .delete()
        .eq('id_detalle', idDetalle)

      console.log('🗑️ deleteReservaDetail: Resultado de eliminación:', { supabaseError })

      if (supabaseError) throw supabaseError

      console.log('✅ deleteReservaDetail: Detalle eliminado exitosamente')
    } catch (err) {
      console.error('❌ deleteReservaDetail: Error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Agregar producto a reserva
  const addProductToReserva = async (idReserva, idProducto, cantidad) => {
    console.log('➕ addProductToReserva: Iniciando adición de producto a reserva...')
    console.log('➕ addProductToReserva: Parámetros:', {
      idReserva,
      idProducto,
      cantidad,
    })

    loading.value = true
    error.value = null

    try {
      const detalleData = {
        id_reserva: idReserva,
        id_producto: idProducto,
        cantidad: cantidad,
      }

      console.log('➕ addProductToReserva: Datos del detalle:', detalleData)

      const { data, error: supabaseError } = await supabase
        .from('detalle_reserva_botiquin')
        .insert(detalleData)
        .select()
        .single()

      console.log('➕ addProductToReserva: Resultado de inserción:', { data, supabaseError })

      if (supabaseError) throw supabaseError

      console.log('✅ addProductToReserva: Producto agregado exitosamente:', data)
      return data
    } catch (err) {
      console.error('❌ addProductToReserva: Error:', err)
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actualizar monto total de reserva
  const updateReservaTotalAmount = async (idReserva, montoTotal) => {
    console.log('💰 updateReservaTotalAmount: Iniciando actualización de monto total...')
    console.log('💰 updateReservaTotalAmount: Parámetros:', { idReserva, montoTotal })

    loading.value = true
    error.value = null

    try {
      const { error: supabaseError } = await supabase
        .from('reserva_botiquin')
        .update({ monto_total: montoTotal })
        .eq('id_reserva', idReserva)

      console.log('💰 updateReservaTotalAmount: Resultado de actualización:', { supabaseError })

      if (supabaseError) throw supabaseError

      console.log('✅ updateReservaTotalAmount: Monto total actualizado exitosamente')
    } catch (err) {
      console.error('❌ updateReservaTotalAmount: Error:', err)
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
    getReservaDetails,
    updateBotiquinDetail,
    deleteBotiquinDetail,
    addProductToBotiquin,
    updateReservaDetail,
    deleteReservaDetail,
    addProductToReserva,
    updateReservaTotalAmount,
  }
}

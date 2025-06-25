import { ref } from 'vue'
import { supabase } from '../supabase.js'

export function useBotiquin() {
  const loading = ref(false)
  const error = ref(null)

  // Registrar inventario
  const registerInventory = async (type, items) => {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Insertar en la tabla inventory
      const inventoryData = items.map(item => ({
        type,
        item_name: item.item_name,
        quantity: item.quantity,
        user_id: user.id
      }))

      const { data, error: supabaseError } = await supabase
        .from('inventory')
        .insert(inventoryData)
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

  // Obtener historial de inventario del usuario
  const getUserInventoryHistory = async (type) => {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { data, error: supabaseError } = await supabase
        .from('inventory')
        .select(`
          id,
          type,
          created_at,
          items:inventory_items(
            id,
            item_name,
            quantity
          )
        `)
        .eq('user_id', user.id)
        .eq('type', type)
        .order('created_at', { ascending: false })

      if (supabaseError) throw supabaseError

      // Agrupar por fecha de creación para mostrar registros por sesión
      const groupedData = []
      const processedDates = new Set()

      for (const item of data) {
        const dateKey = new Date(item.created_at).toDateString()
        if (!processedDates.has(dateKey)) {
          processedDates.add(dateKey)
          
          // Obtener todos los items de esta fecha
          const itemsFromDate = data.filter(d => 
            new Date(d.created_at).toDateString() === dateKey
          )
          
          groupedData.push({
            id: item.id,
            created_at: item.created_at,
            type: item.type,
            items: itemsFromDate.flatMap(d => d.items || [])
          })
        }
      }

      return groupedData
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener precios de items
  const getItemPrices = async (itemNames) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('item_prices')
        .select('item_name, price')
        .in('item_name', itemNames)

      if (supabaseError) throw supabaseError

      return data || []
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Crear orden de compra
  const createPurchaseOrder = async (orderData) => {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Crear la orden de compra
      const { data: purchaseData, error: purchaseError } = await supabase
        .from('purchases')
        .insert({
          user_id: user.id,
          type: orderData.type,
          total: orderData.total,
          status: 'pending',
          contact_info: orderData.contact_info
        })
        .select()

      if (purchaseError) throw purchaseError

      const purchaseId = purchaseData[0].id

      // Crear los detalles de la orden
      const purchaseDetails = orderData.items.map(item => ({
        purchase_id: purchaseId,
        item_name: item.item_name,
        quantity: item.quantity,
        price: item.price,
        total: item.total
      }))

      const { error: detailsError } = await supabase
        .from('purchase_details')
        .insert(purchaseDetails)

      if (detailsError) throw detailsError

      return purchaseData[0]
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener historial de compras del usuario
  const getUserPurchaseHistory = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      let query = supabase
        .from('purchases')
        .select(`
          id,
          type,
          total,
          status,
          contact_info,
          created_at,
          items:purchase_details(
            id,
            item_name,
            quantity,
            price,
            total
          )
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.type) {
        query = query.eq('type', filters.type)
      }

      const { data, error: supabaseError } = await query

      if (supabaseError) throw supabaseError

      return data || []
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener todas las órdenes de compra (solo admin)
  const getAllPurchaseOrders = async (filters = {}) => {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Verificar si es admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (userError) throw userError
      if (!userData.is_admin) throw new Error('Acceso denegado')

      let query = supabase
        .from('purchases')
        .select(`
          id,
          type,
          total,
          status,
          contact_info,
          created_at,
          user_email:users(email),
          items:purchase_details(
            id,
            item_name,
            quantity,
            price,
            total
          )
        `)
        .order('created_at', { ascending: false })

      if (filters.status) {
        query = query.eq('status', filters.status)
      }
      if (filters.type) {
        query = query.eq('type', filters.type)
      }
      if (filters.user_search) {
        // Para búsqueda de usuario necesitamos hacer un join más complejo
        query = query.ilike('users.email', `%${filters.user_search}%`)
      }

      const { data, error: supabaseError } = await query

      if (supabaseError) throw supabaseError

      // Reformatear los datos para extraer el email del usuario
      const formattedData = data.map(order => ({
        ...order,
        user_email: order.user_email?.email || 'N/A'
      }))

      return formattedData || []
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actualizar estado de orden de compra
  const updatePurchaseOrderStatus = async (orderId, newStatus) => {
    loading.value = true
    error.value = null

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Verificar si es admin
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('is_admin')
        .eq('id', user.id)
        .single()

      if (userError) throw userError
      if (!userData.is_admin) throw new Error('Acceso denegado')

      const { data, error: supabaseError } = await supabase
        .from('purchases')
        .update({ status: newStatus })
        .eq('id', orderId)
        .select()

      if (supabaseError) throw supabaseError

      return data[0]
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
    registerInventory,
    getUserInventoryHistory,
    getItemPrices,
    createPurchaseOrder,
    getUserPurchaseHistory,
    getAllPurchaseOrders,
    updatePurchaseOrderStatus
  }
}

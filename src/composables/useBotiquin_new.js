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
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Insertar en la tabla inventory
      const inventoryData = items.map((item) => ({
        type,
        item_name: item.item_name,
        quantity: item.quantity,
        user_id: user.id,
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
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { data, error: supabaseError } = await supabase
        .from('inventory')
        .select('*')
        .eq('user_id', user.id)
        .eq('type', type)
        .order('created_at', { ascending: false })

      if (supabaseError) throw supabaseError

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener precios de items
  const getItemPrices = async (type) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('item_prices')
        .select('*')
        .eq('type', type)

      if (supabaseError) throw supabaseError

      return data
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
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      // Crear la orden principal
      const orderInfo = {
        user_id: user.id,
        type: orderData.type,
        total_amount: orderData.total_amount,
        contact_name: orderData.contact_name,
        contact_phone: orderData.contact_phone,
        contact_email: orderData.contact_email,
        status: 'pendiente',
      }

      const { data: order, error: orderError } = await supabase
        .from('purchases')
        .insert(orderInfo)
        .select()
        .single()

      if (orderError) throw orderError

      // Crear los detalles de la orden
      const orderDetails = orderData.items.map((item) => ({
        purchase_id: order.id,
        item_name: item.item_name,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total_price: item.total_price,
      }))

      const { error: detailsError } = await supabase.from('purchase_details').insert(orderDetails)

      if (detailsError) throw detailsError

      return order
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener historial de compras del usuario
  const getUserPurchaseHistory = async () => {
    loading.value = true
    error.value = null

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (!user) throw new Error('Usuario no autenticado')

      const { data, error: supabaseError } = await supabase
        .from('purchases')
        .select(
          `
          *,
          purchase_details (*)
        `,
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (supabaseError) throw supabaseError

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Obtener todas las compras (admin)
  const getAllPurchases = async () => {
    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('purchases')
        .select(
          `
          *,
          users (email),
          purchase_details (*)
        `,
        )
        .order('created_at', { ascending: false })

      if (supabaseError) throw supabaseError

      return data
    } catch (err) {
      error.value = err.message
      throw err
    } finally {
      loading.value = false
    }
  }

  // Actualizar estado de compra (admin)
  const updatePurchaseStatus = async (purchaseId, status) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: supabaseError } = await supabase
        .from('purchases')
        .update({ status })
        .eq('id', purchaseId)
        .select()
        .single()

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
    registerInventory,
    getUserInventoryHistory,
    getItemPrices,
    createPurchaseOrder,
    getUserPurchaseHistory,
    getAllPurchases,
    updatePurchaseStatus,
  }
}

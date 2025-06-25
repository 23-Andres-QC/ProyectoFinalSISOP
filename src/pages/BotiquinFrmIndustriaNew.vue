<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="text-white">Formulario Botiquín - Industria</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="flex flex-center page-scroll">
      <q-form @submit.prevent="onSubmit" class="q-gutter-md form-grid">
        <div>
          <div class="grid-container">
            <div v-for="(item, idx) in industriaItems" :key="idx" class="grid-item">
              <q-input
                v-model.number="cantidades[item]"
                :label="item"
                type="number"
                min="0"
                :step="1"
                :rules="[(val) => val >= 0 || 'No puede ser negativo']"
                filled
                class="q-mb-sm"
              />
            </div>
          </div>
        </div>
        <q-btn
          label="Guardar inventario"
          type="submit"
          color="primary"
          class="q-mt-md"
          :loading="loading"
        />
        <q-btn
          label="Ver historial"
          color="secondary"
          class="q-mt-md"
          @click="mostrarHistorial = !mostrarHistorial"
        />
        <q-btn
          label="Generar orden de compra"
          color="accent"
          class="q-mt-md"
          @click="generarOrdenCompra"
          :loading="loading"
        />
      </q-form>
      <div v-if="mostrarHistorial" class="q-mt-lg" style="max-width: 700px; width: 100%">
        <q-card class="bg-grey-1 shadow-3">
          <q-card-section>
            <div class="text-h6 text-primary flex items-center q-mb-md">
              <q-icon name="history" color="primary" class="q-mr-sm" />
              Historial de inventarios
            </div>
            <div v-if="historial.length === 0" class="text-grey-7 text-subtitle2 q-pa-md">
              <q-spinner color="primary" size="20px" class="q-mr-sm" v-if="loading" />
              <span v-else>No hay registros guardados.</span>
            </div>
            <div v-else>
              <q-list bordered separator>
                <q-item
                  v-for="(registro, idx) in historial"
                  :key="idx"
                  class="q-pa-md bg-white q-mb-sm rounded-borders shadow-1"
                >
                  <q-item-section top class="q-gutter-y-xs">
                    <div class="row items-center q-mb-xs">
                      <q-icon name="event" color="secondary" size="20px" class="q-mr-xs" />
                      <span class="text-weight-medium text-secondary">Fecha:</span>
                      <span class="q-ml-xs">{{ formatDate(registro.created_at) }}</span>
                    </div>
                    <q-separator spaced color="grey-3" />
                    <div class="q-mt-xs">
                      <span class="text-weight-medium text-accent">Objetos registrados:</span>
                      <div class="q-mt-xs">
                        <q-chip
                          v-for="item in registro.items"
                          :key="item.id"
                          color="primary"
                          text-color="white"
                          class="q-mr-xs q-mb-xs"
                        >
                          <q-icon name="medical_services" size="16px" class="q-mr-xs" />
                          {{ item.item_name }}: <b>{{ item.quantity }}</b>
                        </q-chip>
                      </div>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card>
      </div>

      <!-- Modal de orden de compra -->
      <OrdenCompraModal
        v-model="showOrderModal"
        :items="ordenCompraItems"
        :total="totalCompra"
        @confirmar="confirmarOrden"
      />
    </q-page>
  </q-layout>
</template>

<script setup>
import { reactive, ref, onMounted, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useBotiquin } from '../composables/useBotiquin.js'
import { useAuth } from '../composables/useAuth.js'
import OrdenCompraModal from '../components/OrdenCompraModal.vue'

const $q = useQuasar()
const { user } = useAuth()
const { registerInventory, getUserInventoryHistory, getItemPrices, createPurchaseOrder } =
  useBotiquin()

const mostrarHistorial = ref(false)
const historial = ref([])
const showOrderModal = ref(false)
const ordenCompraItems = ref([])
const totalCompra = ref(0)
const loading = ref(false)

const industriaItems = [
  'Gasas estériles',
  'Vendas elásticas',
  'Curitas impermeables',
  'Alcohol antiséptico 70%',
  'Agua oxigenada',
  'Guantes desechables de nitrilo',
  'Mascarillas N95 o FFP2',
  'Lentes de seguridad',
  'Manta térmica',
  'Vendaje triangular',
  'Tijeras de acero inoxidable',
  'Pinzas metálicas',
  'Linterna con pilas',
  'Analgésicos (paracetamol)',
  'Antihistamínicos',
  'Suero fisiológico',
  'Termómetro',
  'Bolsas de hielo instantáneo',
  'Crema para quemaduras',
  'Manual de primeros auxilios',
]

const cantidades = reactive({})
industriaItems.forEach((item) => (cantidades[item] = 0))

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

async function onSubmit() {
  if (!user.value) {
    $q.notify({
      type: 'negative',
      message: 'Debes estar autenticado para guardar el inventario',
    })
    return
  }

  loading.value = true
  try {
    // Filtrar solo items con cantidad > 0
    const items = Object.entries(cantidades)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([nombre, cantidad]) => ({ item_name: nombre, quantity: cantidad }))

    if (items.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'Debes agregar al menos un item con cantidad mayor a 0',
      })
      return
    }

    await registerInventory('industria', items)

    $q.notify({
      type: 'positive',
      message: 'Inventario guardado exitosamente',
    })

    // Limpiar cantidades
    industriaItems.forEach((item) => (cantidades[item] = 0))

    // Recargar historial
    await loadHistorial()
  } catch (error) {
    console.error('Error al guardar inventario:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al guardar el inventario: ' + error.message,
    })
  } finally {
    loading.value = false
  }
}

async function generarOrdenCompra() {
  if (!user.value) {
    $q.notify({
      type: 'negative',
      message: 'Debes estar autenticado para generar una orden',
    })
    return
  }

  loading.value = true
  try {
    // Solo insumos con cantidad > 0
    const items = Object.entries(cantidades)
      .filter(([, cantidad]) => cantidad > 0)
      .map(([nombre, cantidad]) => ({ item_name: nombre, quantity: cantidad }))

    if (items.length === 0) {
      $q.notify({
        type: 'warning',
        message: 'Debes seleccionar al menos un item para la orden de compra',
      })
      return
    }

    // Obtener precios
    const prices = await getItemPrices(items.map((item) => item.item_name))

    // Combinar items con precios
    const itemsWithPrices = items.map((item) => {
      const price = prices.find((p) => p.item_name === item.item_name)?.price || 0
      return {
        ...item,
        price,
        total: item.quantity * price,
      }
    })

    const total = itemsWithPrices.reduce((sum, item) => sum + item.total, 0)

    ordenCompraItems.value = itemsWithPrices
    totalCompra.value = total
    showOrderModal.value = true
  } catch (error) {
    console.error('Error al generar orden:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar la orden: ' + error.message,
    })
  } finally {
    loading.value = false
  }
}

async function confirmarOrden(contactInfo) {
  loading.value = true
  try {
    const orderData = {
      user_id: user.value.id,
      type: 'industria',
      items: ordenCompraItems.value,
      total: totalCompra.value,
      contact_info: contactInfo,
    }

    await createPurchaseOrder(orderData)

    $q.notify({
      type: 'positive',
      message: 'Orden de compra creada exitosamente',
    })

    showOrderModal.value = false

    // Limpiar cantidades
    industriaItems.forEach((item) => (cantidades[item] = 0))
  } catch (error) {
    console.error('Error al confirmar orden:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al crear la orden: ' + error.message,
    })
  } finally {
    loading.value = false
  }
}

async function loadHistorial() {
  if (!user.value) return

  try {
    historial.value = await getUserInventoryHistory('industria')
  } catch (error) {
    console.error('Error al cargar historial:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el historial',
    })
  }
}

onMounted(async () => {
  if (mostrarHistorial.value) {
    await loadHistorial()
  }
})

// Watch para cargar historial cuando se muestre
watch(
  () => mostrarHistorial.value,
  async (newVal) => {
    if (newVal) {
      await loadHistorial()
    }
  },
)
</script>

<style scoped>
.form-grid {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  padding: 32px 24px;
  max-width: 700px;
  width: 100%;
  overflow: visible;
  margin: 40px auto;
}
.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 32px;
}
.grid-item {
  width: 100%;
}
.page-scroll {
  min-height: 100vh;
  align-items: flex-start;
  overflow-y: auto;
  height: auto;
  max-height: none;
  width: 100vw;
  box-sizing: border-box;
}
.q-layout__section--center {
  overflow: visible !important;
}
.q-page {
  overflow-y: auto !important;
  height: auto !important;
  min-height: 100vh !important;
}
</style>

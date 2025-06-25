<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="text-white"
          >Panel de Administración - Órdenes de Compra</q-toolbar-title
        >
      </q-toolbar>
    </q-header>
    <q-page class="q-pa-md">
      <div class="row q-mb-md">
        <div class="col">
          <h4 class="text-h4 q-ma-none">Gestión de Órdenes de Compra</h4>
          <p class="text-grey-7">Administra todas las órdenes de compra del sistema</p>
        </div>
        <div class="col-auto">
          <q-btn
            icon="refresh"
            label="Actualizar"
            color="primary"
            @click="loadOrders"
            :loading="loading"
          />
        </div>
      </div>

      <!-- Filtros -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row q-gutter-md items-center">
            <div class="col-md-3 col-sm-6 col-xs-12">
              <q-select
                v-model="filtroEstado"
                :options="estadosOptions"
                label="Estado"
                emit-value
                map-options
                clearable
                @update:model-value="loadOrders"
              />
            </div>
            <div class="col-md-3 col-sm-6 col-xs-12">
              <q-select
                v-model="filtroTipo"
                :options="tiposOptions"
                label="Tipo de Botiquín"
                clearable
                @update:model-value="loadOrders"
              />
            </div>
            <div class="col-md-4 col-sm-12 col-xs-12">
              <q-input
                v-model="filtroUsuario"
                label="Buscar por usuario"
                debounce="500"
                @update:model-value="loadOrders"
              >
                <template v-slot:append>
                  <q-icon name="search" />
                </template>
              </q-input>
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Lista de órdenes -->
      <div v-if="loading" class="text-center q-pa-lg">
        <q-spinner color="primary" size="50px" />
        <p class="q-mt-md">Cargando órdenes...</p>
      </div>

      <div v-else-if="orders.length === 0" class="text-center q-pa-lg">
        <q-icon name="shopping_cart_off" size="100px" color="grey-5" />
        <p class="text-h6 text-grey-7 q-mt-md">No hay órdenes de compra</p>
        <p class="text-grey-6">No se encontraron órdenes con los filtros seleccionados</p>
      </div>

      <div v-else class="q-gutter-md">
        <q-card
          v-for="order in orders"
          :key="order.id"
          class="order-card"
          :class="getOrderCardClass(order.status)"
        >
          <q-card-section>
            <div class="row items-center justify-between">
              <div class="col">
                <div class="row items-center q-gutter-sm q-mb-xs">
                  <q-chip
                    :color="getStatusColor(order.status)"
                    text-color="white"
                    :icon="getStatusIcon(order.status)"
                    size="sm"
                  >
                    {{ getStatusLabel(order.status) }}
                  </q-chip>
                  <q-chip color="secondary" text-color="white" icon="category" size="sm">
                    {{ order.type.toUpperCase() }}
                  </q-chip>
                </div>
                <h6 class="text-h6 q-ma-none">Orden #{{ order.id }}</h6>
                <p class="text-grey-7 q-ma-none">
                  Usuario: {{ order.user_email || 'N/A' }} | Fecha:
                  {{ formatDate(order.created_at) }}
                </p>
              </div>
              <div class="col-auto">
                <div class="text-h5 text-weight-bold text-primary">
                  ${{ order.total.toFixed(2) }}
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section>
            <div class="row q-gutter-md">
              <div class="col">
                <h6 class="text-subtitle1 text-weight-medium q-mb-sm">Items Solicitados:</h6>
                <div class="q-gutter-xs">
                  <q-chip
                    v-for="item in order.items"
                    :key="item.id"
                    color="grey-3"
                    text-color="dark"
                    size="sm"
                  >
                    {{ item.item_name }}: {{ item.quantity }}
                  </q-chip>
                </div>
              </div>
            </div>

            <div v-if="order.contact_info" class="q-mt-md">
              <h6 class="text-subtitle1 text-weight-medium q-mb-sm">Información de Contacto:</h6>
              <div class="row q-gutter-md">
                <div class="col-md-6">
                  <q-input :model-value="order.contact_info.name" label="Nombre" readonly dense />
                </div>
                <div class="col-md-6">
                  <q-input :model-value="order.contact_info.phone" label="Teléfono" readonly dense>
                    <template v-slot:append>
                      <q-btn
                        icon="chat"
                        color="green"
                        round
                        dense
                        @click="contactWhatsApp(order)"
                        :title="`Contactar por WhatsApp a ${order.contact_info.phone}`"
                      />
                    </template>
                  </q-input>
                </div>
                <div class="col-12" v-if="order.contact_info.email">
                  <q-input :model-value="order.contact_info.email" label="Email" readonly dense />
                </div>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions class="row q-pa-md">
            <q-btn
              v-if="order.status === 'pending'"
              icon="check"
              label="Aprobar"
              color="positive"
              @click="updateOrderStatus(order.id, 'approved')"
              :loading="updatingOrder === order.id"
            />
            <q-btn
              v-if="order.status === 'pending'"
              icon="close"
              label="Rechazar"
              color="negative"
              @click="updateOrderStatus(order.id, 'rejected')"
              :loading="updatingOrder === order.id"
            />
            <q-btn
              v-if="order.status === 'approved'"
              icon="done_all"
              label="Completar"
              color="primary"
              @click="updateOrderStatus(order.id, 'completed')"
              :loading="updatingOrder === order.id"
            />
            <q-space />
            <q-btn
              v-if="order.contact_info?.phone"
              icon="chat"
              label="WhatsApp"
              color="green"
              @click="contactWhatsApp(order)"
            />
          </q-card-actions>
        </q-card>
      </div>
    </q-page>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useBotiquin } from '../composables/useBotiquin.js'
import { useWhatsApp } from '../composables/useWhatsApp.js'
import { useAuth } from '../composables/useAuth.js'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()
const { user } = useAuth()
const { getAllPurchaseOrders, updatePurchaseOrderStatus } = useBotiquin()
const { generateAdminMessage, openWhatsApp } = useWhatsApp()

const orders = ref([])
const loading = ref(false)
const updatingOrder = ref(null)

// Filtros
const filtroEstado = ref(null)
const filtroTipo = ref(null)
const filtroUsuario = ref('')

const estadosOptions = [
  { label: 'Pendiente', value: 'pending' },
  { label: 'Aprobado', value: 'approved' },
  { label: 'Rechazado', value: 'rejected' },
  { label: 'Completado', value: 'completed' },
]

const tiposOptions = ['hogar', 'oficina', 'escolar', 'industria', 'montaña']

const formatDate = (dateString) => {
  return new Date(dateString).toLocaleString()
}

const getStatusColor = (status) => {
  const colors = {
    pending: 'orange',
    approved: 'positive',
    rejected: 'negative',
    completed: 'blue',
  }
  return colors[status] || 'grey'
}

const getStatusIcon = (status) => {
  const icons = {
    pending: 'schedule',
    approved: 'check_circle',
    rejected: 'cancel',
    completed: 'done_all',
  }
  return icons[status] || 'help'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    completed: 'Completado',
  }
  return labels[status] || status
}

const getOrderCardClass = (status) => {
  const classes = {
    pending: 'border-warning',
    approved: 'border-positive',
    rejected: 'border-negative',
    completed: 'border-info',
  }
  return classes[status] || ''
}

async function loadOrders() {
  if (!user.value?.is_admin) {
    $q.notify({
      type: 'negative',
      message: 'Acceso denegado. Solo administradores pueden acceder.',
    })
    router.push('/')
    return
  }

  loading.value = true
  try {
    const filters = {}
    if (filtroEstado.value) filters.status = filtroEstado.value
    if (filtroTipo.value) filters.type = filtroTipo.value
    if (filtroUsuario.value) filters.user_search = filtroUsuario.value

    orders.value = await getAllPurchaseOrders(filters)
  } catch (error) {
    console.error('Error al cargar órdenes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar las órdenes: ' + error.message,
    })
  } finally {
    loading.value = false
  }
}

async function updateOrderStatus(orderId, newStatus) {
  updatingOrder.value = orderId
  try {
    await updatePurchaseOrderStatus(orderId, newStatus)

    // Actualizar la orden local
    const orderIndex = orders.value.findIndex((o) => o.id === orderId)
    if (orderIndex >= 0) {
      orders.value[orderIndex].status = newStatus
    }

    $q.notify({
      type: 'positive',
      message: `Orden ${getStatusLabel(newStatus).toLowerCase()} exitosamente`,
    })

    // Si se aprueba una orden, enviar mensaje por WhatsApp
    if (newStatus === 'approved') {
      const order = orders.value.find((o) => o.id === orderId)
      if (order?.contact_info?.phone) {
        await contactWhatsApp(order, true)
      }
    }
  } catch (error) {
    console.error('Error al actualizar orden:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al actualizar la orden: ' + error.message,
    })
  } finally {
    updatingOrder.value = null
  }
}

async function contactWhatsApp(order, isApproval = false) {
  try {
    const phone = order.contact_info.phone
    const name = order.contact_info.name

    let message
    if (isApproval) {
      message = generateAdminMessage(order, 'approved')
    } else {
      message = generateAdminMessage(order, order.status)
    }

    openWhatsApp(phone, message)

    $q.notify({
      type: 'positive',
      message: `Redirigiendo a WhatsApp para contactar a ${name}`,
    })
  } catch (error) {
    console.error('Error al generar mensaje WhatsApp:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al generar el mensaje de WhatsApp',
    })
  }
}

onMounted(() => {
  // Verificar si el usuario es admin
  if (!user.value?.is_admin) {
    $q.notify({
      type: 'negative',
      message: 'Acceso denegado. Solo administradores pueden acceder.',
    })
    router.push('/')
    return
  }

  loadOrders()
})
</script>

<style scoped>
.order-card {
  border-left: 4px solid #e0e0e0;
  transition: all 0.3s ease;
}

.order-card:hover {
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.border-warning {
  border-left-color: #ff9800;
}

.border-positive {
  border-left-color: #4caf50;
}

.border-negative {
  border-left-color: #f44336;
}

.border-info {
  border-left-color: #2196f3;
}
</style>

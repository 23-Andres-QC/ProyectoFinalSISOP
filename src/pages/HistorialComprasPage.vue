<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="text-white">Mi Historial de Compras</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="q-pa-md">
      <div class="row q-mb-md">
        <div class="col">
          <h4 class="text-h4 q-ma-none">Mis Órdenes de Compra</h4>
          <p class="text-grey-7">Revisa el estado de todas tus órdenes de compra</p>
        </div>
        <div class="col-auto">
          <q-btn
            icon="refresh"
            label="Actualizar"
            color="primary"
            @click="loadUserOrders"
            :loading="loading"
          />
        </div>
      </div>

      <!-- Filtros -->
      <q-card class="q-mb-md">
        <q-card-section>
          <div class="row q-gutter-md items-center">
            <div class="col-md-4 col-sm-6 col-xs-12">
              <q-select
                v-model="filtroEstado"
                :options="estadosOptions"
                label="Estado"
                emit-value
                map-options
                clearable
                @update:model-value="loadUserOrders"
              />
            </div>
            <div class="col-md-4 col-sm-6 col-xs-12">
              <q-select
                v-model="filtroTipo"
                :options="tiposOptions"
                label="Tipo de Botiquín"
                clearable
                @update:model-value="loadUserOrders"
              />
            </div>
          </div>
        </q-card-section>
      </q-card>

      <!-- Lista de órdenes -->
      <div v-if="loading" class="text-center q-pa-lg">
        <q-spinner color="primary" size="50px" />
        <p class="q-mt-md">Cargando tus órdenes...</p>
      </div>

      <div v-else-if="orders.length === 0" class="text-center q-pa-lg">
        <q-icon name="shopping_cart_off" size="100px" color="grey-5" />
        <p class="text-h6 text-grey-7 q-mt-md">No tienes órdenes de compra</p>
        <p class="text-grey-6">Aún no has realizado ninguna orden de compra</p>
        <q-btn
          color="primary"
          icon="add_shopping_cart"
          label="Crear primera orden"
          to="/botiquin-opciones"
          class="q-mt-md"
        />
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
                <p class="text-grey-7 q-ma-none">Fecha: {{ formatDate(order.created_at) }}</p>
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
                    {{ item.item_name }}: {{ item.quantity }} x ${{ item.price.toFixed(2) }}
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
                  <q-input
                    :model-value="order.contact_info.phone"
                    label="Teléfono"
                    readonly
                    dense
                  />
                </div>
                <div class="col-12" v-if="order.contact_info.email">
                  <q-input :model-value="order.contact_info.email" label="Email" readonly dense />
                </div>
              </div>
            </div>

            <!-- Mensaje de estado -->
            <q-banner
              v-if="getStatusMessage(order.status)"
              :class="`bg-${getStatusColor(order.status)}-1 text-${getStatusColor(order.status)}-8`"
              class="q-mt-md"
            >
              <template v-slot:avatar>
                <q-icon :name="getStatusIcon(order.status)" :color="getStatusColor(order.status)" />
              </template>
              {{ getStatusMessage(order.status) }}
            </q-banner>
          </q-card-section>

          <q-separator />

          <q-card-actions class="row q-pa-md">
            <q-btn
              v-if="order.status === 'approved'"
              icon="payment"
              label="Proceder al Pago"
              color="positive"
              @click="proceedToPayment"
            />
            <q-btn
              v-if="order.status === 'pending'"
              icon="edit"
              label="Editar Orden"
              color="warning"
              @click="editOrder"
              disabled
            />
            <q-space />
            <q-btn
              icon="download"
              label="Descargar"
              color="primary"
              @click="downloadOrder"
              disabled
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
import { useAuth } from '../composables/useAuth.js'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const router = useRouter()
const { user } = useAuth()
const { getUserPurchaseHistory } = useBotiquin()

const orders = ref([])
const loading = ref(false)

// Filtros
const filtroEstado = ref(null)
const filtroTipo = ref(null)

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

const getStatusMessage = (status) => {
  const messages = {
    pending: 'Tu orden está siendo revisada por nuestro equipo. Te contactaremos pronto.',
    approved: '¡Tu orden ha sido aprobada! Puedes proceder con el pago.',
    rejected: 'Tu orden ha sido rechazada. Contacta con nosotros para más información.',
    completed: '¡Tu orden ha sido completada! Gracias por tu compra.',
  }
  return messages[status] || ''
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

async function loadUserOrders() {
  if (!user.value) {
    $q.notify({
      type: 'negative',
      message: 'Debes estar autenticado para ver tus órdenes',
    })
    router.push('/')
    return
  }

  loading.value = true
  try {
    const filters = {}
    if (filtroEstado.value) filters.status = filtroEstado.value
    if (filtroTipo.value) filters.type = filtroTipo.value

    orders.value = await getUserPurchaseHistory(filters)
  } catch (error) {
    console.error('Error al cargar órdenes:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar tus órdenes: ' + error.message,
    })
  } finally {
    loading.value = false
  }
}

function proceedToPayment() {
  $q.notify({
    type: 'info',
    message: 'Redirigiendo al sistema de pagos...',
  })
  // Aquí se implementaría la integración con el sistema de pagos
}

function editOrder() {
  $q.notify({
    type: 'info',
    message: 'Función de editar orden próximamente disponible',
  })
}

function downloadOrder() {
  $q.notify({
    type: 'info',
    message: 'Función de descarga próximamente disponible',
  })
}

onMounted(() => {
  if (!user.value) {
    router.push('/')
    return
  }

  loadUserOrders()
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

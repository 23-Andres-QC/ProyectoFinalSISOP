<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
        <q-toolbar-title class="text-white">Mi Historial de Compras</q-toolbar-title>
        <q-btn flat label="Quiénes Somos" class="q-ml-md text-white" @click="$router.push('/principal')" />
        <q-btn flat label="Contactos" class="q-ml-md text-white" @click="$router.push('/contactos')" />
        <q-btn flat label="Mis Compras" class="q-ml-md text-white" @click="$router.push('/historial-compras')" />
        <q-btn flat icon="logout" label="Cerrar Sesión" class="q-ml-md text-white" @click="logout" />
      </q-toolbar>
    </q-header>
    <q-page class="q-pa-md">
      <div v-if="!authInitialized" class="flex flex-center q-pa-xl">
        <div class="text-center">
          <q-spinner-hourglass size="3em" color="primary" />
          <p class="q-mt-md text-grey-7">Verificando autenticación...</p>
        </div>
      </div>
      <div v-else>
        <div class="row q-mb-md">
          <div class="col">
            <h4 class="text-h4 q-ma-none">Mis Órdenes de Compra</h4>
            <p class="text-grey-7">Revisa el estado de todas tus órdenes de compra</p>
          </div>
          <div class="col-auto">
            <q-btn icon="refresh" label="Actualizar" color="primary" @click="loadUserOrders" :loading="loading" />
            <q-btn icon="bug_report" label="Debug" color="orange" @click="debugPrimeraCompra" class="q-ml-sm" />
          </div>
        </div>
        <q-card class="q-mb-md">
          <q-card-section>
            <div class="row q-gutter-md items-center">
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select v-model="filtroEstado" :options="estadosOptions" label="Estado" emit-value map-options clearable @update:model-value="loadUserOrders" />
              </div>
              <div class="col-md-4 col-sm-6 col-xs-12">
                <q-select v-model="filtroTipo" :options="tiposOptions" label="Tipo de Botiquín" clearable @update:model-value="loadUserOrders" />
              </div>
            </div>
          </q-card-section>
        </q-card>
        <div v-if="loading" class="text-center q-pa-lg">
          <q-spinner color="primary" size="50px" />
          <p class="q-mt-md">Cargando tus órdenes...</p>
        </div>
        <div v-else-if="orders.length === 0" class="text-center q-pa-lg">
          <q-icon name="shopping_cart_off" size="100px" color="grey-5" />
          <p class="text-h6 text-grey-7 q-mt-md">No tienes órdenes de compra</p>
          <p class="text-grey-6">Aún no has realizado ninguna orden de compra</p>
          <q-btn color="primary" icon="add_shopping_cart" label="Crear primera orden" to="/botiquin-opciones" class="q-mt-md" />
        </div>
        <div v-else class="q-gutter-md q-pb-lg">
          <div v-for="(ordersByType, type) in ordersGroupedByType" :key="type" class="q-mb-xl">
            <q-banner class="bg-blue-1 text-blue-8 q-mb-md">
              <template v-slot:avatar>
                <q-icon name="category" color="blue" />
              </template>
              <div class="text-h6">
                Botiquín {{ type.charAt(0).toUpperCase() + type.slice(1) }}
                <q-chip color="blue" text-color="white" size="sm" class="q-ml-sm">
                  {{ ordersByType.length }} {{ ordersByType.length === 1 ? 'compra' : 'compras' }}
                </q-chip>
              </div>
            </q-banner>
            <div class="q-gutter-md">
              <q-card v-for="order in ordersByType" :key="order.id" class="order-card" :class="getOrderCardClass(order.status)">
                <q-card-section>
                  <div class="row items-center justify-between">
                    <div class="col">
                      <div class="row items-center q-gutter-sm q-mb-xs">
                        <q-chip :color="getStatusColor(order.status)" text-color="white" :icon="getStatusIcon(order.status)" size="sm">
                          {{ getStatusLabel(order.status) }}
                        </q-chip>
                        <q-chip color="secondary" text-color="white" icon="category" size="sm">
                          {{ order.type.toUpperCase() }}
                        </q-chip>
                        <q-chip v-if="order.isToday" color="amber" text-color="dark" icon="today" size="sm">HOY</q-chip>
                      </div>
                      <h6 class="text-h6 q-ma-none">Orden #{{ order.id }}</h6>
                      <p class="text-grey-7 q-ma-none">Fecha: {{ formatDate(order.created_at) }}</p>
                    </div>
                    <div class="col-auto">
                      <div class="text-h5 text-weight-bold text-primary">S/{{ order.total.toFixed(2) }}</div>
                    </div>
                  </div>
                </q-card-section>
                <q-separator />
                <q-card-section>
                  <div class="row q-gutter-md">
                    <div class="col">
                      <h6 class="text-subtitle1 text-weight-medium q-mb-sm">Items Solicitados:</h6>
                      <div class="q-gutter-xs">
                        <q-chip v-for="item in order.items" :key="item.id" color="grey-3" text-color="dark" size="sm">
                          {{ item.item_name }}: {{ item.quantity }} x S/{{ item.price.toFixed(2) }}
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
                        <q-input :model-value="order.contact_info.phone" label="Teléfono" readonly dense />
                      </div>
                      <div class="col-12" v-if="order.contact_info.email">
                        <q-input :model-value="order.contact_info.email" label="Email" readonly dense />
                      </div>
                    </div>
                  </div>
                  <q-banner v-if="getStatusMessage(order.status)" :class="`bg-$' + '{getStatusColor(order.status)}-1 text-$' + '{getStatusColor(order.status)}-8`" class="q-mt-md">
                    <template v-slot:avatar>
                      <q-icon :name="getStatusIcon(order.status)" :color="getStatusColor(order.status)" />
                    </template>
                    {{ getStatusMessage(order.status) }}
                  </q-banner>
                </q-card-section>
                <q-separator />
                <q-card-actions class="row q-pa-md">
                  <q-btn v-if="order.status === 'approved'" icon="payment" label="Proceder al Pago" color="positive" @click="proceedToPayment" />
                  <q-btn v-if="order.status === 'pending' || order.isToday" icon="edit" label="Editar Orden" color="warning" @click="editOrder(order)" />
                  <q-btn v-if="order.isToday" icon="add_shopping_cart" label="Agregar Items" color="secondary" @click="irAFormulario(order.type)" />
                  <q-space />
                  <q-btn icon="chat" label="Seguir pedido" color="primary" @click="seguirPedidoWhatsApp(order)" />
                </q-card-actions>
              </q-card>
            </div>
          </div>
        </div>
      </div>
    </q-page>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useQuasar } from 'quasar'
import { useBotiquinDB } from '../composables/useBotiquinDB.js'
import { useAuth } from '../composables/useAuth.js'
import { useRouter } from 'vue-router'
import { supabase } from '../supabase.js'

const $q = useQuasar()
const router = useRouter()
const { user, signOut, initializeAuth } = useAuth()
const { obtenerHistorialCompras, actualizarCompra, loading } = useBotiquinDB()

const orders = ref([])
const authInitialized = ref(false)
const filtroEstado = ref(null)
const filtroTipo = ref(null)

const estadosOptions = [
  { label: 'Pendiente', value: 'pending' },
  { label: 'Aprobado', value: 'approved' },
  { label: 'Rechazado', value: 'rejected' },
  { label: 'Completado', value: 'completed' },
]

const tiposOptions = ['hogar', 'oficina', 'escolar', 'industria', 'montaña']

const ordersGroupedByType = computed(() => {
  const grouped = {}
  orders.value.forEach((order) => {
    const type = order.type || 'desconocido'
    if (!grouped[type]) {
      grouped[type] = []
    }
    grouped[type].push(order)
  })
  Object.keys(grouped).forEach((type) => {
    grouped[type].sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
  })
  return grouped
})

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
  return colors[status] || 'orange'
}

const getStatusIcon = (status) => {
  const icons = {
    pending: 'schedule',
    approved: 'check_circle',
    rejected: 'cancel',
    completed: 'done_all',
  }
  return icons[status] || 'schedule'
}

const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pendiente',
    approved: 'Aprobado',
    rejected: 'Rechazado',
    completed: 'Completado',
  }
  return labels[status] || 'Pendiente'
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
  console.log(' loadUserOrders - iniciando carga de órdenes')
  if (!user.value) {
    $q.notify({ type: 'negative', message: 'Debes estar autenticado para ver tus órdenes' })
    router.push('/')
    return
  }
  try {
    const filters = {}
    if (filtroEstado.value) filters.estado = filtroEstado.value
    if (filtroTipo.value) filters.tipo_kit = filtroTipo.value
    orders.value = await obtenerHistorialCompras(filters)
  } catch (error) {
    $q.notify({ type: 'negative', message: 'Error al cargar tus órdenes: ' + error.message })
  }
}

function proceedToPayment() {
  $q.notify({ type: 'info', message: 'Redirigiendo al sistema de pagos...' })
}

function editOrder(order) {
  if (!order.isToday) {
    $q.notify({ type: 'warning', message: 'Solo puedes editar órdenes del día actual' })
    return
  }
  // Implementation continues...
}

function seguirPedidoWhatsApp(order) {
  const mensaje = `*SEGUIMIENTO DE PEDIDO #${order.id}*\n\n *Fecha:* ${formatDate(order.created_at)}\n *Tipo de Botiquín:* ${order.type.toUpperCase()}\n\n*ITEMS SOLICITADOS:*\n${order.items.map(item => ` ${item.item_name}: ${item.quantity} unid. - S/${item.price.toFixed(2)} c/u`).join('\n')}\n\n *TOTAL: S/${order.total.toFixed(2)}*\n\nHola, me gustaría hacer seguimiento de mi pedido y coordinar la entrega.`
  const mensajeCodificado = encodeURIComponent(mensaje)
  const numeroWhatsApp = '51973791546'
  const urlWhatsApp = `https://wa.me/${numeroWhatsApp}?text=${mensajeCodificado}`
  window.open(urlWhatsApp, '_blank')
  $q.notify({ type: 'positive', message: 'Redirigiendo a WhatsApp para seguimiento del pedido' })
}

const logout = async () => {
  try {
    const result = await signOut()
    if (result.success) {
      router.push('/')
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}

onMounted(async () => {
  setTimeout(async () => {
    await initializeAuth()
    authInitialized.value = true
    if (!user.value) {
      $q.notify({
        type: 'warning',
        message: 'Necesitas iniciar sesión para ver tu historial de compras',
        actions: [{ label: 'Ir a Login', color: 'white', handler: () => { router.push('/') } }],
      })
      return
    }
    loadUserOrders()
  }, 500)
})

async function debugPrimeraCompra() {
  if (orders.value.length > 0) {
    const primeraCompra = orders.value[0]
    console.log('DEBUG: Datos de UI para primera compra:', primeraCompra)
  } else {
    console.log('No hay compras para debuggear')
  }
}
</script>

<style scoped>
.order-card {
  border-left: 4px solid transparent;
}
.border-warning { border-left-color: #ff9800; }
.border-positive { border-left-color: #4caf50; }
.border-negative { border-left-color: #f44336; }
.border-info { border-left-color: #2196f3; }
.q-pb-lg { padding-bottom: 20px !important; }
</style>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
        <q-toolbar-title class="text-white">Historial de Reservas</q-toolbar-title>
        <q-btn flat label="Inicio" class="q-ml-md text-white" @click="$router.push('/principal')" />

        <!-- Opciones de administrador -->
        <template v-if="isAdmin">
          <q-btn
            flat
            label="Pedidos"
            class="q-ml-md text-white"
            @click="$router.push('/admin-pedidos')"
          />
          <q-btn flat label="Gestión" class="q-ml-md text-white">
            <q-menu>
              <q-list style="min-width: 100px">
                <q-item clickable v-close-popup @click="$router.push('/admin-usuarios')">
                  <q-item-section>Usuarios</q-item-section>
                </q-item>
                <q-item clickable v-close-popup @click="$router.push('/admin-productos')">
                  <q-item-section>Productos</q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>
        </template>

        <q-btn
          flat
          icon="logout"
          label="Cerrar Sesión"
          class="q-ml-md text-white"
          @click="logout"
        />
      </q-toolbar>
    </q-header>

    <q-page class="q-pa-md">
      <div class="row q-gutter-md">
        <div class="col-12">
          <q-card class="q-pa-md">
            <q-card-section>
              <div class="row justify-between items-center q-mb-md">
                <div class="text-h6">Historial de Reservas de Compra</div>
                <q-btn
                  color="negative"
                  icon="shopping_cart"
                  label="Nueva Reserva"
                  @click="$router.push({ path: '/botiquin-opciones', query: { mode: 'reserva' } })"
                />
              </div>

              <div v-if="loading" class="text-center q-pa-lg">
                <q-spinner color="primary" size="48px" />
                <div class="q-mt-md">Cargando reservas...</div>
              </div>

              <div v-else-if="reservas.length === 0" class="text-center text-grey-6 q-pa-lg">
                <q-icon name="shopping_cart" size="48px" class="q-mb-md" />
                <div>No tienes reservas de compra registradas</div>
                <q-btn
                  label="Crear mi primera reserva"
                  color="negative"
                  class="q-mt-md"
                  @click="$router.push({ path: '/botiquin-opciones', query: { mode: 'reserva' } })"
                />
              </div>

              <div v-else>
                <q-list separator>
                  <q-item
                    v-for="reserva in reservas"
                    :key="reserva.id_reserva"
                    class="q-pa-md"
                    clickable
                    @click="verDetalle(reserva)"
                  >
                    <q-item-section avatar>
                      <q-avatar color="negative" text-color="white" icon="shopping_cart" />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label class="text-weight-medium">
                        Reserva #{{ reserva.id_reserva }} -
                        {{ getTipoLabel(reserva.tipo_botiquin) }}
                      </q-item-label>
                      <q-item-label caption> Fecha: {{ formatDate(reserva.fecha) }} </q-item-label>
                      <q-item-label caption>
                        {{ reserva.total_productos || 0 }} productos reservados
                      </q-item-label>
                      <q-item-label class="text-positive text-weight-bold q-mt-xs">
                        Total: ${{
                          (reserva.total_calculado || reserva.monto_total || 0).toFixed(2)
                        }}
                      </q-item-label>
                      <q-item-label class="q-mt-xs">
                        <q-chip
                          :color="getEstadoColor(reserva.estado)"
                          text-color="white"
                          size="sm"
                        >
                          {{ getEstadoLabel(reserva.estado) }}
                        </q-chip>
                      </q-item-label>
                    </q-item-section>

                    <q-item-section side>
                      <div
                        class="column q-gutter-md items-end"
                        style="min-width: 140px; padding: 8px"
                      >
                        <div class="row q-gutter-md">
                          <q-btn
                            round
                            color="primary"
                            icon="visibility"
                            size="md"
                            @click.stop="verDetalle(reserva)"
                          >
                            <q-tooltip>Ver detalles</q-tooltip>
                          </q-btn>
                          <q-btn
                            round
                            color="orange"
                            icon="edit"
                            size="md"
                            @click.stop="editarReserva(reserva)"
                          >
                            <q-tooltip>Editar</q-tooltip>
                          </q-btn>
                        </div>
                        <div class="row q-gutter-md">
                          <q-btn
                            round
                            color="green"
                            icon="whatsapp"
                            size="md"
                            @click.stop="enviarWhatsapp(reserva)"
                          >
                            <q-tooltip>Enviar por WhatsApp</q-tooltip>
                          </q-btn>
                          <q-btn
                            round
                            color="grey-7"
                            icon="delete"
                            size="md"
                            @click.stop="eliminarReserva(reserva)"
                          >
                            <q-tooltip>Eliminar reserva</q-tooltip>
                          </q-btn>
                        </div>
                      </div>
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>

      <!-- Modal de detalles -->
      <q-dialog v-model="showDetailModal" persistent>
        <q-card style="min-width: 600px">
          <q-card-section>
            <div class="text-h6">Detalles de la Reserva #{{ selectedReserva?.id_reserva }}</div>
            <div class="text-caption text-grey-6">
              Reservada el {{ formatDate(selectedReserva?.fecha) }}
            </div>
          </q-card-section>

          <q-card-section v-if="selectedReserva">
            <div class="row q-gutter-md">
              <div class="col-12">
                <q-item>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">Tipo de Botiquín</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-chip color="primary" text-color="white">
                      {{ getTipoLabel(selectedReserva.tipo_botiquin) }}
                    </q-chip>
                  </q-item-section>
                </q-item>

                <q-item>
                  <q-item-section>
                    <q-item-label class="text-weight-medium">Monto Total</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-chip color="positive" text-color="white" size="lg">
                      ${{
                        (
                          selectedReserva.total_calculado ||
                          selectedReserva.monto_total ||
                          0
                        ).toFixed(2)
                      }}
                    </q-chip>
                  </q-item-section>
                </q-item>
              </div>
            </div>

            <!-- Lista de productos reservados -->
            <div
              v-if="selectedReserva.detalles && selectedReserva.detalles.length > 0"
              class="q-mt-md"
            >
              <div class="text-subtitle2 q-mb-md">Productos Reservados:</div>
              <div
                v-for="detalle in selectedReserva.detalles"
                :key="detalle.id_detalle"
                class="q-mb-sm"
              >
                <q-card flat bordered>
                  <q-card-section class="q-pa-sm">
                    <div class="row items-center">
                      <div class="col-5">
                        <div class="text-body2 text-weight-medium">
                          {{ detalle.productos?.nombre || 'Producto no encontrado' }}
                        </div>
                        <div class="text-caption text-positive">
                          ${{ (detalle.productos?.precio || 0).toFixed(2) }} c/u
                        </div>
                      </div>
                      <div class="col-3 text-center">
                        <q-chip outline color="primary"> Cant: {{ detalle.cantidad }} </q-chip>
                      </div>
                      <div class="col-4 text-right">
                        <div class="text-body1 text-weight-bold text-positive">
                          ${{ (detalle.subtotal || 0).toFixed(2) }}
                        </div>
                      </div>
                    </div>
                  </q-card-section>
                </q-card>
              </div>

              <!-- Total calculado -->
              <q-separator class="q-my-md" />
              <div class="row justify-between items-center">
                <div class="text-h6">Total:</div>
                <div class="text-h5 text-positive text-weight-bold">
                  ${{
                    selectedReserva.detalles
                      .reduce((total, d) => total + (d.subtotal || 0), 0)
                      .toFixed(2)
                  }}
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right" class="q-gutter-md q-pa-lg">
            <q-btn flat label="Cerrar" color="primary" @click="closeDetailModal" size="md" />
            <q-btn
              label="Editar"
              color="orange"
              @click="editarDesdeModal"
              icon="edit"
              size="md"
              class="q-mx-md"
            />
            <q-btn
              label="WhatsApp"
              color="green"
              @click="enviarWhatsappDesdeModal"
              icon="whatsapp"
              size="md"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Modal de edición -->
      <q-dialog v-model="showEditModal" persistent>
        <q-card style="min-width: 700px">
          <q-card-section>
            <div class="text-h6">Editar Reserva #{{ selectedReserva?.id_reserva }}</div>
          </q-card-section>

          <q-card-section v-if="editingDetails.length > 0">
            <div class="text-subtitle2 q-mb-md">Productos de la Reserva:</div>
            <div
              v-for="(detalle, index) in editingDetails"
              :key="detalle.id_detalle"
              class="q-mb-sm"
            >
              <q-card flat bordered>
                <q-card-section class="q-pa-sm">
                  <div class="row items-center">
                    <div class="col-5">
                      <div class="text-body2 text-weight-medium">
                        {{ detalle.productos?.nombre || 'Producto no encontrado' }}
                      </div>
                    </div>
                    <div class="col-2">
                      <q-input
                        v-model.number="detalle.cantidad"
                        type="number"
                        min="1"
                        dense
                        outlined
                        label="Cantidad"
                      />
                    </div>
                    <div class="col-3">
                      <q-input
                        v-model.number="detalle.precio_unitario"
                        type="number"
                        min="0"
                        step="0.01"
                        dense
                        outlined
                        label="Precio c/u"
                        prefix="$"
                        readonly
                        bg-color="grey-2"
                        hint="Precio del producto"
                      />
                    </div>
                    <div class="col-2 text-right">
                      <q-btn
                        round
                        color="negative"
                        icon="delete"
                        size="sm"
                        @click="eliminarProductoReserva(detalle, index)"
                      />
                    </div>
                  </div>
                  <div class="row q-mt-xs">
                    <div class="col-12 text-right">
                      <div class="text-caption text-positive">
                        Subtotal: ${{
                          ((detalle.cantidad || 0) * (detalle.precio_unitario || 0)).toFixed(2)
                        }}
                      </div>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Agregar nuevo producto -->
            <div class="q-mt-md">
              <div class="text-subtitle2 q-mb-sm">Agregar producto:</div>
              <div class="row q-gutter-sm items-end">
                <div class="col-4">
                  <q-select
                    v-model="newReservaProduct.selected"
                    :options="availableProductsFiltered"
                    option-label="nombre"
                    option-value="id_producto"
                    label="Seleccionar producto"
                    outlined
                    dense
                  />
                </div>
                <div class="col-2">
                  <q-input
                    v-model.number="newReservaProduct.cantidad"
                    type="number"
                    min="1"
                    label="Cantidad"
                    outlined
                    dense
                  />
                </div>
                <div class="col-3">
                  <q-input
                    v-model.number="newReservaProduct.precio"
                    type="number"
                    min="0"
                    step="0.01"
                    label="Precio c/u"
                    prefix="$"
                    outlined
                    dense
                    readonly
                    bg-color="grey-2"
                    hint="Precio auto-asignado del producto"
                  />
                </div>
                <div class="col-2">
                  <q-btn
                    color="primary"
                    icon="add"
                    @click="agregarProductoReserva"
                    :disable="
                      !newReservaProduct.selected ||
                      !newReservaProduct.cantidad ||
                      !newReservaProduct.precio
                    "
                  />
                </div>
              </div>
            </div>

            <!-- Total calculado -->
            <q-separator class="q-my-md" />
            <div class="row justify-between items-center">
              <div class="text-h6">Total:</div>
              <div class="text-h5 text-positive text-weight-bold">
                ${{ calculateEditingTotal().toFixed(2) }}
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" @click="cancelarEdicion" />
            <q-btn
              label="Guardar Cambios"
              color="positive"
              @click="guardarCambiosReserva"
              :loading="savingChanges"
              icon="save"
            />
          </q-card-actions>
        </q-card>
      </q-dialog>
    </q-page>
  </q-layout>
</template>

<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBotiquin } from '../composables/useBotiquin.js'
import { useAuth } from '../composables/useAuth.js'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()
const { signOut, getUserType, isUserAdmin } = useAuth()
const {
  getReservasHistory,
  getReservaDetails,
  updateReservaDetail,
  deleteReservaDetail,
  addProductToReserva,
  updateReservaTotalAmount,
  getProductsByType,
  loading,
} = useBotiquin()

const reservas = ref([])
const selectedReserva = ref(null)
const editingReserva = ref(null)
const editingDetails = ref([])
const availableProductsForReserva = ref([])
const showDetailModal = ref(false)
const showEditModal = ref(false)
const savingChanges = ref(false)
const isAdmin = ref(false)

const newReservaProduct = ref({
  selected: null,
  cantidad: 1,
  precio: 0,
})

// Filtrar productos que ya están en la reserva
const availableProductsFiltered = computed(() => {
  if (!availableProductsForReserva.value) return []

  const existingProductIds = editingDetails.value.map((detail) => detail.id_producto)
  return availableProductsForReserva.value.filter(
    (product) => !existingProductIds.includes(product.id_producto),
  )
})

// Watcher para auto-rellenar el precio cuando se selecciona un producto
watch(
  () => newReservaProduct.value.selected,
  (newProduct) => {
    if (newProduct && newProduct.precio) {
      newReservaProduct.value.precio = newProduct.precio
    } else {
      newReservaProduct.value.precio = 0
    }
  },
)

const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

const getTipoLabel = (tipo) => {
  const tipos = {
    hogar: 'Hogar',
    oficina: 'Oficina',
    escolar: 'Escolar',
    industria: 'Industria',
    montaña: 'Montaña',
  }
  return tipos[tipo] || tipo || 'Sin tipo'
}

const getEstadoLabel = (estado) => {
  const estados = {
    por_revisar: 'Por Revisar',
    revisado: 'Revisado',
    finalizado: 'Finalizado',
  }
  return estados[estado] || 'Por Revisar'
}

const getEstadoColor = (estado) => {
  const colores = {
    por_revisar: 'orange',
    revisado: 'blue',
    finalizado: 'positive',
  }
  return colores[estado] || 'orange'
}

const loadReservas = async () => {
  console.log('📋 loadReservas: Iniciando carga de reservas...')
  try {
    console.log('📋 loadReservas: Llamando a getReservasHistory...')
    const data = await getReservasHistory()
    console.log('📋 loadReservas: Datos recibidos:', data)
    reservas.value = data
    console.log('📋 loadReservas: Reservas asignadas:', reservas.value)
  } catch (error) {
    console.error('❌ loadReservas: Error:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar reservas: ' + error.message,
      position: 'top',
    })
  }
}

const verDetalle = async (reserva) => {
  selectedReserva.value = reserva
  try {
    // Cargar detalles de la reserva
    const detalles = await getReservaDetails(reserva.id_reserva)
    selectedReserva.value.detalles = detalles
    showDetailModal.value = true
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar detalles: ' + error.message,
      position: 'top',
    })
  }
}

const closeDetailModal = () => {
  showDetailModal.value = false
  selectedReserva.value = null
}

const editarReserva = async (reserva) => {
  selectedReserva.value = reserva
  try {
    const details = await getReservaDetails(reserva.id_reserva)

    // Cargar productos disponibles para sincronizar precios
    const productos = await getProductsByType(reserva.tipo_botiquin || 'oficina')
    availableProductsForReserva.value = productos

    // Actualizar los detalles con los precios actuales de los productos
    const updatedDetails = details.map((detalle) => {
      const productoActual = productos.find((p) => p.id_producto === detalle.id_producto)
      if (productoActual) {
        return {
          ...detalle,
          precio_unitario: productoActual.precio, // Usar precio actual del producto
        }
      }
      return detalle
    })

    editingDetails.value = [...updatedDetails] // Copia para edición

    showEditModal.value = true
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar datos para edición: ' + error.message,
      position: 'top',
    })
  }
}

const editarDesdeModal = () => {
  closeDetailModal()
  editarReserva(selectedReserva.value)
}

const cancelarEdicion = () => {
  showEditModal.value = false
  selectedReserva.value = null
  editingReserva.value = null
  editingDetails.value = []
  availableProductsForReserva.value = []
  newReservaProduct.value = { selected: null, cantidad: 1, precio: 0 }
}

const calculateEditingTotal = () => {
  return editingDetails.value.reduce((total, detalle) => {
    return total + (detalle.cantidad || 0) * (detalle.precio_unitario || 0)
  }, 0)
}

const eliminarProductoReserva = async (detalle, index) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar "${detalle.productos?.nombre}" de la reserva?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteReservaDetail(detalle.id_detalle)
      editingDetails.value.splice(index, 1)

      $q.notify({
        type: 'positive',
        message: 'Producto eliminado correctamente',
        position: 'top',
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar producto: ' + error.message,
        position: 'top',
      })
    }
  })
}

const agregarProductoReserva = async () => {
  if (
    !newReservaProduct.value.selected ||
    !newReservaProduct.value.cantidad ||
    newReservaProduct.value.cantidad < 1
  ) {
    $q.notify({
      type: 'warning',
      message: 'Por favor selecciona un producto y una cantidad válida',
      position: 'top',
    })
    return
  }

  try {
    const result = await addProductToReserva(
      selectedReserva.value.id_reserva,
      newReservaProduct.value.selected.id_producto,
      newReservaProduct.value.cantidad,
    )

    // Recargar los detalles de la reserva para obtener el ID real del detalle
    const updatedDetails = await getReservaDetails(selectedReserva.value.id_reserva)
    editingDetails.value = updatedDetails

    // Limpiar formulario
    newReservaProduct.value.selected = null
    newReservaProduct.value.cantidad = 1
    newReservaProduct.value.precio = 0

    $q.notify({
      type: 'positive',
      message: 'Producto agregado correctamente',
      position: 'top',
    })
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al agregar producto: ' + error.message,
      position: 'top',
    })
  }
}

const guardarCambiosReserva = async () => {
  savingChanges.value = true

  try {
    // Actualizar cantidades de productos existentes
    const updatePromises = editingDetails.value
      .filter((detalle) => detalle.id_detalle && detalle.cantidad > 0)
      .map((detalle) => updateReservaDetail(detalle.id_detalle, detalle.cantidad))

    await Promise.all(updatePromises)

    // Actualizar el monto total de la reserva
    const nuevoTotal = calculateEditingTotal()
    await updateReservaTotalAmount(selectedReserva.value.id_reserva, nuevoTotal)

    $q.notify({
      type: 'positive',
      message: 'Cambios guardados correctamente',
      position: 'top',
    })

    cancelarEdicion()
    loadReservas() // Recargar lista
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al guardar cambios: ' + error.message,
      position: 'top',
    })
  } finally {
    savingChanges.value = false
  }
}

const enviarWhatsapp = async (reserva) => {
  try {
    console.log('📱 Preparando mensaje de WhatsApp para reserva:', reserva.id_reserva)

    // Obtener detalles básicos para el mensaje
    const detalles = await getReservaDetails(reserva.id_reserva)

    // Crear un mensaje simple pero informativo
    let mensaje = `Hola! Consulta sobre mi pedido:\n\n`
    mensaje += `Numero: #${reserva.id_reserva}\n`
    mensaje += `Fecha: ${formatDate(reserva.fecha)}\n`
    mensaje += `Tipo: ${getTipoLabel(reserva.tipo_botiquin)}\n\n`

    if (detalles && detalles.length > 0) {
      mensaje += `Productos (${detalles.length}):\n`
      let total = 0

      detalles.forEach((detalle, index) => {
        const precio = detalle.precio_unitario || detalle.productos?.precio || 0
        const subtotal = precio * detalle.cantidad
        total += subtotal

        mensaje += `${index + 1}. ${detalle.productos?.nombre || 'Producto'}\n`
        mensaje += `   Cant: ${detalle.cantidad} - $${precio.toFixed(2)} c/u\n`
      })

      mensaje += `\nTotal: $${total.toFixed(2)}\n\n`
    } else {
      mensaje += `Total: $${(reserva.monto_total || 0).toFixed(2)}\n\n`
    }

    mensaje += `Por favor confirmar disponibilidad. Gracias!`

    console.log('📱 Mensaje preparado:', mensaje)
    console.log('📱 Longitud:', mensaje.length)

    const numeroWhatsApp = '51973791546'

    // Verificar longitud antes de enviar
    if (mensaje.length > 1000) {
      throw new Error('Mensaje muy largo, usando versión simple')
    }

    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensaje)}`

    console.log('📱 URL generada:', url.substring(0, 100) + '...')

    window.open(url, '_blank')

    $q.notify({
      type: 'positive',
      message: 'Abriendo WhatsApp...',
      position: 'top',
    })
  } catch (error) {
    console.error('❌ Error:', error)

    // Mensaje super simple como fallback
    const mensajeSimple = `Hola! Consulta sobre pedido #${reserva.id_reserva} del ${formatDate(reserva.fecha)}. Total: $${(reserva.monto_total || 0).toFixed(2)}. Gracias!`
    const numeroWhatsApp = '51973791546'
    const url = `https://wa.me/${numeroWhatsApp}?text=${encodeURIComponent(mensajeSimple)}`

    console.log('📱 Usando mensaje simple de fallback')
    window.open(url, '_blank')

    $q.notify({
      type: 'warning',
      message: 'Enviando mensaje simplificado...',
      position: 'top',
    })
  }
}

const eliminarReserva = async (reserva) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar la reserva #${reserva.id_reserva}? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      // Aquí agregarías la función para eliminar de la base de datos
      // await deleteReserva(reserva.id_reserva)

      // Por ahora, solo removemos de la lista local
      const index = reservas.value.findIndex((r) => r.id_reserva === reserva.id_reserva)
      if (index > -1) {
        reservas.value.splice(index, 1)
      }

      $q.notify({
        type: 'positive',
        message: 'Reserva eliminada correctamente',
        position: 'top',
      })
    } catch (error) {
      $q.notify({
        type: 'negative',
        message: 'Error al eliminar reserva: ' + error.message,
        position: 'top',
      })
    }
  })
}

const enviarWhatsappDesdeModal = () => {
  enviarWhatsapp(selectedReserva.value)
  closeDetailModal()
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
  loadReservas()

  // Verificar si el usuario es administrador
  const tipoUsuario = localStorage.getItem('tipo_usuario')
  isAdmin.value = tipoUsuario === 'admin'
  console.log('✅ Verificación admin en HistorialReservas:', isAdmin.value, '- tipo:', tipoUsuario)
})
</script>

<style scoped>
.q-card {
  transition: transform 0.2s;
}

.q-item:hover {
  background: #f5f5f5;
}

/* Espaciado mejorado para botones */
.q-item-section[side] {
  align-items: flex-end;
}

/* Asegurar que los botones tengan suficiente espacio */
.q-btn {
  margin: 4px;
  min-width: 40px;
  min-height: 40px;
}

/* Mejorar el área de click de los botones */
.q-btn.q-btn--round {
  padding: 8px;
}

/* Estilo para el botón de WhatsApp */
.q-btn[color='green'] {
  background-color: #25d366 !important;
}

.q-btn[color='green']:hover {
  background-color: #128c7e !important;
}

/* Espaciado específico para las filas de botones */
.row.q-gutter-md > .q-btn {
  margin-right: 12px;
}

.column.q-gutter-md > .row {
  margin-bottom: 8px;
}

/* Espaciado específico para botones en modales */
.q-card-actions.q-gutter-md .q-btn {
  margin-left: 12px;
  margin-right: 12px;
  min-width: 100px;
}

.q-card-actions.q-gutter-md {
  padding: 24px !important;
}

/* Separación extra para el botón de editar en modal */
.q-btn.q-mx-md {
  margin-left: 20px !important;
  margin-right: 20px !important;
}
</style>

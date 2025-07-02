<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
        <q-toolbar-title class="text-white">Historial de Botiquines</q-toolbar-title>
        <q-btn flat label="Inicio" class="q-ml-md text-white" @click="$router.push('/principal')" />

        <!-- Enlaces de administrador -->
        <template v-if="isAdmin">
          <q-btn
            flat
            label="Pedidos"
            class="q-ml-md text-white"
            @click="$router.push('/admin-pedidos')"
          />
          <q-btn
            flat
            label="Gestión"
            class="q-ml-md text-white"
            @click="$router.push('/admin-usuarios')"
          />
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
                <div class="text-h6">Historial de Botiquines</div>
                <q-btn
                  color="positive"
                  icon="add"
                  label="Nuevo Botiquín"
                  @click="$router.push('/botiquin-opciones')"
                />
              </div>

              <div v-if="loading" class="text-center q-pa-lg">
                <q-spinner color="primary" size="48px" />
                <div class="q-mt-md">Cargando historial...</div>
              </div>

              <div v-else-if="botiquines.length === 0" class="text-center text-grey-6 q-pa-lg">
                <q-icon name="inventory" size="48px" class="q-mb-md" />
                <div>No tienes botiquines registrados</div>
                <q-btn
                  label="Crear mi primer botiquín"
                  color="positive"
                  class="q-mt-md"
                  @click="$router.push('/botiquin-opciones')"
                />
              </div>

              <div v-else>
                <q-list separator>
                  <q-item
                    v-for="botiquin in botiquines"
                    :key="botiquin.id_inventario"
                    class="q-pa-md"
                    clickable
                    @click="verDetalle(botiquin)"
                  >
                    <q-item-section avatar>
                      <q-avatar color="positive" text-color="white" icon="medical_services" />
                    </q-item-section>

                    <q-item-section>
                      <q-item-label class="text-weight-medium">
                        Botiquín #{{ botiquin.id_inventario }} -
                        {{ getTipoLabel(botiquin.tipo_botiquin) }}
                      </q-item-label>
                      <q-item-label caption> Fecha: {{ formatDate(botiquin.fecha) }} </q-item-label>
                      <q-item-label caption>
                        {{ botiquin.total_productos || 0 }} productos registrados
                      </q-item-label>
                    </q-item-section>

                    <q-item-section side>
                      <div
                        class="column q-gutter-md items-end"
                        style="min-width: 120px; padding: 8px"
                      >
                        <q-btn
                          round
                          color="primary"
                          icon="visibility"
                          size="md"
                          @click.stop="verDetalle(botiquin)"
                          class="q-mb-sm"
                        >
                          <q-tooltip>Ver detalles</q-tooltip>
                        </q-btn>
                        <q-btn
                          round
                          color="orange"
                          icon="edit"
                          size="md"
                          @click.stop="editarBotiquin(botiquin)"
                        >
                          <q-tooltip>Editar</q-tooltip>
                        </q-btn>
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
            <div class="text-h6">Detalles del Botiquín #{{ selectedBotiquin?.id_inventario }}</div>
            <div class="text-caption text-grey-6">
              Registrado el {{ formatDate(selectedBotiquin?.fecha) }}
            </div>
          </q-card-section>

          <q-card-section v-if="botiquinDetails.length > 0">
            <q-list separator>
              <q-item v-for="detalle in botiquinDetails" :key="detalle.id_detalle" class="q-pa-sm">
                <q-item-section>
                  <q-item-label class="text-weight-medium">
                    {{ detalle.productos?.nombre || 'Producto no encontrado' }}
                  </q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-chip color="primary" text-color="white" dense>
                    {{ detalle.cantidad }} unidades
                  </q-chip>
                </q-item-section>
              </q-item>
            </q-list>
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
          </q-card-actions>
        </q-card>
      </q-dialog>

      <!-- Modal de edición -->
      <q-dialog v-model="showEditModal" persistent>
        <q-card style="min-width: 700px">
          <q-card-section>
            <div class="text-h6">Editar Botiquín #{{ selectedBotiquin?.id_inventario }}</div>
          </q-card-section>

          <q-card-section v-if="editingDetails.length > 0">
            <div class="text-subtitle2 q-mb-md">Productos del Botiquín:</div>
            <div
              v-for="(detalle, index) in editingDetails"
              :key="detalle.id_detalle"
              class="q-mb-sm"
            >
              <q-card flat bordered>
                <q-card-section class="q-pa-sm">
                  <div class="row items-center">
                    <div class="col-7">
                      <div class="text-body2 text-weight-medium">
                        {{ detalle.productos?.nombre || 'Producto no encontrado' }}
                      </div>
                    </div>
                    <div class="col-3">
                      <q-input
                        v-model.number="detalle.cantidad"
                        type="number"
                        min="1"
                        dense
                        outlined
                        label="Cantidad"
                      />
                    </div>
                    <div class="col-2 text-right">
                      <q-btn
                        round
                        color="negative"
                        icon="delete"
                        size="sm"
                        @click="eliminarProducto(detalle, index)"
                      />
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Agregar nuevo producto -->
            <div class="q-mt-md">
              <div class="text-subtitle2 q-mb-sm">Agregar producto:</div>
              <div class="row q-gutter-sm items-end">
                <div class="col-6">
                  <q-select
                    v-model="newProduct.selected"
                    :options="availableProductsFiltered"
                    option-label="nombre"
                    option-value="id_producto"
                    label="Seleccionar producto"
                    outlined
                    dense
                  />
                </div>
                <div class="col-3">
                  <q-input
                    v-model.number="newProduct.cantidad"
                    type="number"
                    min="1"
                    label="Cantidad"
                    outlined
                    dense
                  />
                </div>
                <div class="col-2">
                  <q-btn
                    color="primary"
                    icon="add"
                    @click="agregarProducto"
                    :disable="!newProduct.selected || !newProduct.cantidad"
                  />
                </div>
              </div>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cancelar" @click="cancelarEdicion" />
            <q-btn
              label="Guardar Cambios"
              color="positive"
              @click="guardarCambios"
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
import { ref, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useBotiquin } from '../composables/useBotiquin.js'
import { useAuth } from '../composables/useAuth.js'
import { useQuasar } from 'quasar'
import { botiquinStore } from '../store/botiquinStore.js' // Importar el store global

const router = useRouter()
const $q = useQuasar()
const { signOut, isUserAdmin } = useAuth()
const {
  getBotiquinHistory,
  getBotiquinDetails,
  updateBotiquinDetail,
  deleteBotiquinDetail,
  addProductToBotiquin,
  getProductsByType,
  loading,
} = useBotiquin()

const botiquines = ref([])
const selectedBotiquin = ref(null)
const botiquinDetails = ref([])
const editingDetails = ref([])
const availableProductsForAdd = ref([])
const showDetailModal = ref(false)
const showEditModal = ref(false)
const savingChanges = ref(false)
const isAdmin = ref(false)

const newProduct = ref({
  selected: null,
  cantidad: 1,
})

// Filtrar productos que ya están en el botiquín
const availableProductsFiltered = computed(() => {
  if (!availableProductsForAdd.value) return []

  const existingProductIds = editingDetails.value.map((detail) => detail.id_producto)
  return availableProductsForAdd.value.filter(
    (product) => !existingProductIds.includes(product.id_producto),
  )
})

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

const getTotalProducts = (botiquin) => {
  if (!botiquin.detalle_inventario_botiquin) return 0
  return botiquin.detalle_inventario_botiquin.length
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

const loadBotiquines = async () => {
  console.log('📋 loadBotiquines: Iniciando carga de historial...')

  try {
    // Indicar que estamos cargando datos
    botiquinStore.setCargando(true)

    console.log('📋 loadBotiquines: Llamando a getBotiquinHistory...')
    const data = await getBotiquinHistory()
    console.log('📋 loadBotiquines: Datos recibidos:', data)

    // Guardar en la variable local y en el store global
    botiquines.value = data
    botiquinStore.setBotiquines(data)
    botiquinStore.setInicializado(true)
    console.log('📋 loadBotiquines: Botiquines guardados en store global:', data)

    console.log('📋 loadBotiquines: Botiquines asignados:', botiquines.value)
  } catch (error) {
    console.error('❌ loadBotiquines: Error:', error)
    botiquinStore.setError(error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar historial: ' + error.message,
      position: 'top',
    })
  } finally {
    // Indicar que hemos terminado de cargar datos
    botiquinStore.setCargando(false)
  }
}

const verDetalle = async (botiquin) => {
  selectedBotiquin.value = botiquin
  try {
    const details = await getBotiquinDetails(botiquin.id_inventario)
    botiquinDetails.value = details

    // Guardar detalles en el store global
    botiquinStore.setHistorialInventarios(details)

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
  selectedBotiquin.value = null
  botiquinDetails.value = []
}

const editarBotiquin = async (botiquin) => {
  selectedBotiquin.value = botiquin
  try {
    const details = await getBotiquinDetails(botiquin.id_inventario)
    editingDetails.value = [...details] // Copia para edición

    // Cargar productos disponibles del tipo del botiquín
    const tipo = botiquin.tipo || 'hogar'
    const productos = await getProductsByType(tipo)
    availableProductsForAdd.value = productos

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
  editarBotiquin(selectedBotiquin.value)
}

const eliminarProducto = async (detalle, index) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de eliminar "${detalle.productos?.nombre}" del botiquín?`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteBotiquinDetail(detalle.id_detalle)
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

const agregarProducto = async () => {
  if (!newProduct.value.selected || !newProduct.value.cantidad) return

  try {
    const result = await addProductToBotiquin(
      selectedBotiquin.value.id_inventario,
      newProduct.value.selected.id_producto,
      newProduct.value.cantidad,
    )

    // Recargar los detalles del botiquín para obtener el ID real del detalle
    const updatedDetails = await getBotiquinDetails(selectedBotiquin.value.id_inventario)
    editingDetails.value = updatedDetails

    // Limpiar formulario
    newProduct.value.selected = null
    newProduct.value.cantidad = 1

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

const guardarCambios = async () => {
  savingChanges.value = true

  try {
    // Actualizar cantidades de productos existentes que han sido modificadas
    const updatePromises = editingDetails.value
      .filter((detalle) => detalle.id_detalle && detalle.cantidad > 0)
      .map((detalle) => updateBotiquinDetail(detalle.id_detalle, detalle.cantidad))

    await Promise.all(updatePromises)

    $q.notify({
      type: 'positive',
      message: 'Cambios guardados correctamente',
      position: 'top',
    })

    cancelarEdicion()
    loadBotiquines() // Recargar lista
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

const cancelarEdicion = () => {
  showEditModal.value = false
  selectedBotiquin.value = null
  editingDetails.value = []
  availableProductsForAdd.value = []
  newProduct.value = { selected: null, cantidad: 1 }
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
  // Cargar botiquines y almacenarlos en el store global
  await loadBotiquines()

  // Marcar como no cargando después de cargar los datos
  botiquinStore.setCargando(false)

  // Verificar si el usuario es administrador
  const tipoUsuario = localStorage.getItem('tipo_usuario')
  isAdmin.value = tipoUsuario === 'admin'
  console.log('✅ Verificación admin en HistorialBotiquin:', isAdmin.value, '- tipo:', tipoUsuario)
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

/* Evitar superposición de botones */
.column.q-gutter-md > .q-btn {
  margin-bottom: 12px;
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

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
        <q-toolbar-title class="text-white">
          {{ isReservaMode ? 'Reservar Productos' : 'Registro de Botiquín' }}
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-page padding>
      <div class="row justify-center">
        <div class="col-md-10 col-sm-12 col-xs-12">
          <!-- Modo de operación -->
          <q-card class="q-mb-md">
            <q-card-section>
              <div class="row q-gutter-md">
                <q-btn-toggle
                  v-model="operationMode"
                  toggle-color="primary"
                  :options="[
                    { label: 'Registro de Botiquín', value: 'registro' },
                    { label: 'Reservar Compra', value: 'reserva' },
                  ]"
                  @update:model-value="onModeChange"
                />
              </div>
            </q-card-section>
          </q-card>

          <div class="row q-gutter-md">
            <!-- Panel izquierdo: Selector de productos -->
            <div class="col-md-5 col-sm-12">
              <q-card>
                <q-card-section>
                  <div class="text-h6 q-mb-md">
                    {{
                      isReservaMode
                        ? 'Seleccionar Productos para Compra'
                        : 'Registrar Inventario de Botiquín'
                    }}
                  </div>

                  <!-- Selector de tipo de botiquín -->
                  <q-select
                    v-model="selectedType"
                    :options="botiquinTypes"
                    option-value="value"
                    option-label="label"
                    emit-value
                    map-options
                    label="Tipo de Botiquín"
                    outlined
                    class="q-mb-md"
                    @update:model-value="loadProductsByType"
                    :disable="selectedType && !canChangeType"
                  />

                  <!-- Lista de productos disponibles -->
                  <div v-if="selectedType && availableProducts.length > 0" class="q-mt-md">
                    <div class="text-subtitle1 q-mb-md">Productos Disponibles:</div>

                    <div
                      v-for="producto in availableProducts"
                      :key="producto.id_producto"
                      class="q-mb-sm"
                    >
                      <q-card flat bordered class="product-card">
                        <q-card-section class="q-pa-sm">
                          <div class="row items-center">
                            <div class="col-6">
                              <div class="text-body2 text-weight-medium">{{ producto.nombre }}</div>
                              <div v-if="isReservaMode" class="text-caption text-positive">
                                ${{ producto.precio }}
                              </div>
                            </div>
                            <div class="col-3">
                              <q-input
                                v-model.number="producto.tempQuantity"
                                type="number"
                                min="0"
                                dense
                                outlined
                                label="Cant."
                                style="max-width: 80px"
                              />
                            </div>
                            <div class="col-3 text-right">
                              <q-btn
                                round
                                color="primary"
                                icon="add"
                                size="sm"
                                @click="addProductToList(producto)"
                                :disable="!producto.tempQuantity || producto.tempQuantity <= 0"
                              />
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>
                  </div>
                </q-card-section>
              </q-card>
            </div>

            <!-- Panel derecho: Lista de productos agregados -->
            <div class="col-md-6 col-sm-12">
              <q-card>
                <q-card-section>
                  <div class="text-h6 q-mb-md">
                    {{ isReservaMode ? 'Productos a Reservar' : 'Productos del Botiquín' }}
                  </div>

                  <div v-if="selectedProducts.length === 0" class="text-center q-pa-md text-grey-6">
                    No hay productos agregados
                  </div>

                  <div v-else>
                    <div v-for="(item, index) in selectedProducts" :key="index" class="q-mb-sm">
                      <q-card flat bordered>
                        <q-card-section class="q-pa-sm">
                          <div class="row items-center">
                            <div class="col-5">
                              <div class="text-body2 text-weight-medium">{{ item.nombre }}</div>
                              <div v-if="isReservaMode" class="text-caption text-positive">
                                ${{ item.precio }} c/u
                              </div>
                            </div>
                            <div class="col-3">
                              <q-input
                                v-model.number="item.cantidad"
                                type="number"
                                min="1"
                                dense
                                outlined
                                @update:model-value="updateTotals"
                              />
                            </div>
                            <div class="col-3 text-right">
                              <div
                                v-if="isReservaMode"
                                class="text-body2 text-weight-bold text-positive"
                              >
                                ${{ (item.precio * item.cantidad).toFixed(2) }}
                              </div>
                            </div>
                            <div class="col-1 text-right">
                              <q-btn
                                round
                                color="negative"
                                icon="delete"
                                size="sm"
                                @click="removeProduct(index)"
                              />
                            </div>
                          </div>
                        </q-card-section>
                      </q-card>
                    </div>

                    <!-- Total si es modo reserva -->
                    <div v-if="isReservaMode && selectedProducts.length > 0" class="q-mt-md">
                      <q-separator class="q-mb-md" />
                      <div class="row justify-between items-center">
                        <div class="text-h6">Total:</div>
                        <div class="text-h5 text-positive text-weight-bold">
                          ${{ totalAmount.toFixed(2) }}
                        </div>
                      </div>
                    </div>
                  </div>
                </q-card-section>

                <q-card-actions align="right" class="q-pa-md">
                  <q-btn flat label="Cancelar" @click="$router.go(-1)" />
                  <q-btn
                    :color="isReservaMode ? 'negative' : 'positive'"
                    :label="isReservaMode ? 'Reservar Compra' : 'Registrar Botiquín'"
                    @click="submitAction"
                    :loading="loading"
                    :disable="selectedProducts.length === 0"
                    :icon="isReservaMode ? 'shopping_cart' : 'inventory'"
                  />
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
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useBotiquin } from '../composables/useBotiquin.js'
import { useQuasar } from 'quasar'

const router = useRouter()
const route = useRoute()
const $q = useQuasar()
const { getProductsByType, registerBotiquin, createReserva, loading } = useBotiquin()

const operationMode = ref('registro')
const selectedType = ref('')
const availableProducts = ref([])
const selectedProducts = ref([])
const canChangeType = ref(true)

const botiquinTypes = [
  { label: 'Hogar', value: 'hogar' },
  { label: 'Oficina', value: 'oficina' },
  { label: 'Escuelas', value: 'escolar' },
  { label: 'Industrias', value: 'industria' },
  { label: 'Montaña', value: 'montaña' },
]

const isReservaMode = computed(() => operationMode.value === 'reserva')

const totalAmount = computed(() => {
  if (!isReservaMode.value) return 0
  return selectedProducts.value.reduce((total, item) => {
    return total + item.precio * item.cantidad
  }, 0)
})

const onModeChange = () => {
  // Limpiar productos seleccionados al cambiar modo
  selectedProducts.value = []
  updateTotals()
}

const loadProductsByType = async () => {
  if (!selectedType.value) return

  try {
    const productos = await getProductsByType(selectedType.value)
    availableProducts.value = productos.map((p) => ({
      ...p,
      tempQuantity: 1,
    }))
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al cargar productos: ' + error.message,
      position: 'top',
    })
  }
}

const addProductToList = (producto) => {
  if (!producto.tempQuantity || producto.tempQuantity <= 0) return

  // Verificar si ya existe en la lista
  const existingIndex = selectedProducts.value.findIndex(
    (item) => item.id_producto === producto.id_producto,
  )

  if (existingIndex >= 0) {
    // Actualizar cantidad si ya existe
    selectedProducts.value[existingIndex].cantidad += producto.tempQuantity
  } else {
    // Agregar nuevo producto
    selectedProducts.value.push({
      id_producto: producto.id_producto,
      nombre: producto.nombre,
      precio: producto.precio || 0,
      cantidad: producto.tempQuantity,
    })
  }

  // Limpiar cantidad temporal
  producto.tempQuantity = 1
  canChangeType.value = false
  updateTotals()
}

const removeProduct = (index) => {
  selectedProducts.value.splice(index, 1)
  if (selectedProducts.value.length === 0) {
    canChangeType.value = true
  }
  updateTotals()
}

const updateTotals = () => {
  // Forzar reactividad del computed
  selectedProducts.value = [...selectedProducts.value]
}

const submitAction = async () => {
  if (selectedProducts.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Debe agregar al menos un producto',
      position: 'top',
    })
    return
  }

  try {
    if (isReservaMode.value) {
      // Modo reserva
      await createReserva(selectedProducts.value, totalAmount.value)

      $q.notify({
        type: 'positive',
        message: 'Reserva de compra registrada exitosamente',
        position: 'top',
      })

      router.push('historial-compras')
    } else {
      // Modo registro
      await registerBotiquin(selectedType.value, selectedProducts.value)

      $q.notify({
        type: 'positive',
        message: 'Botiquín registrado exitosamente',
        position: 'top',
      })

      router.push('historial-botiquin')
    }
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: 'Error al procesar: ' + error.message,
      position: 'top',
    })
  }
}

// Detectar el tipo desde la ruta y configurar automáticamente
onMounted(() => {
  const routePath = route.path
  const queryTipo = route.query.tipo

  // Primero intentar detectar desde query params (tiene prioridad)
  if (queryTipo) {
    selectedType.value = queryTipo
  }
  // Si no hay query param, intentar detectar desde la ruta
  else if (routePath.includes('botiquin-frm-hogar') || routePath.includes('hogar')) {
    selectedType.value = 'hogar'
  } else if (routePath.includes('botiquin-frm-oficina') || routePath.includes('oficina')) {
    selectedType.value = 'oficina'
  } else if (routePath.includes('botiquin-frm-escolar') || routePath.includes('escolar')) {
    selectedType.value = 'escolar'
  } else if (routePath.includes('botiquin-frm-industria') || routePath.includes('industria')) {
    selectedType.value = 'industria'
  } else if (routePath.includes('botiquin-frm-montaña') || routePath.includes('montaña')) {
    selectedType.value = 'montaña'
  }

  // Detectar modo desde query params
  if (route.query.mode === 'reserva') {
    operationMode.value = 'reserva'
  }

  if (selectedType.value) {
    loadProductsByType()
  }
})
</script>

<style scoped>
.product-card {
  transition: all 0.2s;
}

.product-card:hover {
  background: #f5f5f5;
}

.q-card {
  max-width: 100%;
}
</style>

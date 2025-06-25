<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="text-white">Botiquín Escolar</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="q-pa-md">
      <div class="row q-gutter-md">
        <!-- Panel izquierdo: Formulario -->
        <div class="col-md-5 col-12">
          <q-card class="q-pa-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Agregar Items al Botiquín</div>

              <!-- Selector de item -->
              <q-select
                v-model="itemSeleccionado"
                :options="itemsDisponibles.escolar"
                option-label="nombre"
                option-value="id_item"
                label="Seleccionar item"
                filled
                clearable
                class="q-mb-md"
              />

              <!-- Input de cantidad -->
              <q-input
                v-model.number="cantidad"
                label="Cantidad"
                type="number"
                min="1"
                :rules="[(val) => val > 0 || 'Debe ser mayor a 0']"
                filled
                class="q-mb-md"
                :disabled="!itemSeleccionado"
              />

              <!-- Botón agregar -->
              <q-btn
                label="Agregar"
                color="primary"
                icon="add"
                @click="agregarItem"
                :disabled="!itemSeleccionado || !cantidad || cantidad <= 0"
                class="q-mb-md full-width"
              />

              <q-separator class="q-my-md" />

              <!-- Botones de acción -->
              <div class="row q-gutter-sm">
                <q-btn
                  label="Registrar"
                  color="positive"
                  icon="save"
                  @click="registrarBotiquin"
                  :loading="loading"
                  :disabled="itemsAgregados.length === 0"
                  class="col"
                />
                <q-btn
                  label="Comprar"
                  color="orange"
                  icon="shopping_cart"
                  @click="irACompras"
                  :disabled="itemsAgregados.length === 0"
                  class="col"
                />
              </div>

              <q-btn
                label="Ver Historial"
                color="secondary"
                icon="history"
                @click="$router.push('/historial-botiquin')"
                class="q-mt-sm full-width"
              />
            </q-card-section>
          </q-card>
        </div>

        <!-- Panel derecho: Vista previa -->
        <div class="col-md-6 col-12">
          <q-card class="q-pa-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Items Agregados</div>

              <div v-if="itemsAgregados.length === 0" class="text-center text-grey-6 q-pa-lg">
                <q-icon name="inventory" size="48px" class="q-mb-md" />
                <div>No hay items agregados</div>
              </div>

              <q-list v-else separator>
                <q-item v-for="(item, index) in itemsAgregados" :key="index" class="q-pa-md">
                  <q-item-section>
                    <q-item-label class="text-weight-medium">{{ item.nombre }}</q-item-label>
                    <q-item-label caption>Cantidad: {{ item.cantidad }}</q-item-label>
                  </q-item-section>
                  <q-item-section side>
                    <q-btn
                      icon="delete"
                      color="negative"
                      flat
                      round
                      @click="eliminarItem(index)"
                      size="sm"
                    />
                  </q-item-section>
                </q-item>
              </q-list>

              <div v-if="itemsAgregados.length > 0" class="q-mt-md">
                <div class="text-subtitle1 text-weight-medium">
                  Total de items: {{ itemsAgregados.length }}
                </div>
              </div>
            </q-card-section>
          </q-card>
        </div>
      </div>
    </q-page>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import { useBotiquinDB } from '../composables/useBotiquinDB.js'
import { useAuth } from '../composables/useAuth.js'

const $q = useQuasar()
const router = useRouter()
const { user } = useAuth()
const {
  loading,
  itemsDisponibles,
  cargarItemsDisponibles,
  registrarInventario,
  crearOrdenCompra,
  verificarAutenticacion,
} = useBotiquinDB()

// Variables para el formulario
const itemSeleccionado = ref(null)
const cantidad = ref(1)
const itemsAgregados = ref([])

// Cargar items disponibles al montar el componente
onMounted(async () => {
  console.log('🔍 Iniciando carga de página BotiquinFrmEscolar...')

  // Verificar autenticación primero
  try {
    console.log('🔐 Verificando autenticación...')
    const currentUser = await verificarAutenticacion()
    if (currentUser) {
      console.log('✅ Usuario autenticado:', currentUser.email)
    } else {
      console.log('⚠️ Usuario no autenticado - redirigiendo al login')
      $q.notify({
        type: 'warning',
        message: 'Debes iniciar sesión para acceder a esta página',
      })
      router.push('/')
      return
    }
  } catch (authError) {
    console.error('❌ Error verificando autenticación:', authError)
    $q.notify({
      type: 'negative',
      message: 'Error verificando autenticación',
    })
    router.push('/')
    return
  }

  // Cargar items disponibles
  try {
    console.log('📋 Cargando items escolares...')
    await cargarItemsDisponibles('escolar')
    console.log('✅ Items escolares cargados:', itemsDisponibles.escolar)
  } catch (error) {
    console.error('❌ Error cargando items:', error)
    $q.notify({
      type: 'negative',
      message: 'Error cargando items disponibles',
    })
  }
})

// Agregar item a la lista
const agregarItem = () => {
  if (!itemSeleccionado.value || !cantidad.value || cantidad.value <= 0) {
    $q.notify({
      type: 'warning',
      message: 'Selecciona un item y especifica una cantidad válida',
    })
    return
  }

  // Verificar si el item ya existe
  const itemExistente = itemsAgregados.value.find(
    (item) => item.id_item === itemSeleccionado.value.id_item,
  )

  if (itemExistente) {
    itemExistente.cantidad += cantidad.value
    console.log('Item actualizado:', itemExistente)
  } else {
    const nuevoItem = {
      id_item: itemSeleccionado.value.id_item,
      nombre: itemSeleccionado.value.nombre,
      cantidad: cantidad.value,
    }
    console.log('Nuevo item agregado:', nuevoItem)
    console.log('Item seleccionado completo:', itemSeleccionado.value)
    itemsAgregados.value.push(nuevoItem)
  }

  $q.notify({
    type: 'positive',
    message: `${itemSeleccionado.value.nombre} agregado`,
  })

  // Limpiar formulario
  itemSeleccionado.value = null
  cantidad.value = 1
}

// Remover item de la lista
const eliminarItem = (index) => {
  const item = itemsAgregados.value[index]
  itemsAgregados.value.splice(index, 1)
  $q.notify({
    type: 'warning',
    message: `${item.nombre} eliminado`,
  })
}

// Registrar botiquín
const registrarBotiquin = async () => {
  if (itemsAgregados.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Agrega al menos un item antes de registrar',
    })
    return
  }

  if (!user.value) {
    $q.notify({
      type: 'warning',
      message: 'Debes estar autenticado para registrar un botiquín',
    })
    return
  }

  // Confirmación antes de registrar
  const confirmacion = confirm(
    `¿Confirmas el registro del botiquín escolar con ${itemsAgregados.value.length} items?`,
  )

  if (!confirmacion) {
    $q.notify({
      type: 'info',
      message: 'Registro cancelado',
    })
    return
  }

  try {
    console.log('Iniciando registro desde formulario ESCOLAR:', {
      tipo: 'escolar',
      items: itemsAgregados.value,
      usuario: user.value.email,
    })

    // Verificar que los items tengan la estructura correcta
    itemsAgregados.value.forEach((item, index) => {
      console.log(`Item ${index + 1}:`, {
        id_item: item.id_item,
        nombre: item.nombre,
        cantidad: item.cantidad,
      })
    })

    await registrarInventario('escolar', itemsAgregados.value)

    $q.notify({
      type: 'positive',
      message: 'Botiquín escolar registrado exitosamente',
    })

    // Limpiar formulario
    itemsAgregados.value = []

    // Redirigir al historial
    router.push('/historial-botiquin')
  } catch (err) {
    console.error('Error en el formulario ESCOLAR:', err)
    $q.notify({
      type: 'negative',
      message: `Error al registrar el botiquín: ${err.message}`,
    })
  }
}

// Ir a compras
const irACompras = async () => {
  if (itemsAgregados.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Agrega items antes de generar orden de compra',
    })
    return
  }

  try {
    await crearOrdenCompra(itemsAgregados.value, 'escolar')
    $q.notify({
      type: 'positive',
      message: 'Orden de compra creada exitosamente',
    })
  } catch (err) {
    console.error('Error al crear orden:', err)
    $q.notify({
      type: 'negative',
      message: 'Error al crear la orden de compra',
    })
  }
}
</script>

<style scoped>
.q-card {
  border-radius: 12px;
}

.q-page {
  min-height: calc(100vh - 50px);
}
</style>

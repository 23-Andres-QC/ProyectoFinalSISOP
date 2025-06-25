<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          round
          dense
          icon="arrow_back"
          @click="$router.push('/botiquin-opciones')"
          class="q-mr-sm"
        >
          <q-tooltip>Regresar</q-tooltip>
        </q-btn>
        <q-toolbar-title class="text-white">Botiquín de Oficina</q-toolbar-title>

        <!-- Enlaces del header -->
        <q-btn flat label="Inicio" class="q-ml-md text-white" @click="$router.push('/principal')" />
        <q-btn
          flat
          label="Crear Botiquín"
          class="q-ml-md text-white"
          @click="$router.push('/botiquin-opciones')"
        />
        <q-btn
          flat
          label="Mis Compras"
          class="q-ml-md text-white"
          @click="$router.push('/historial-compras')"
        />
        <q-btn
          flat
          icon="logout"
          label="Cerrar Sesión"
          class="q-ml-md text-white"
          @click="logout"
        />
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
        <!-- Panel izquierdo: Formulario -->
        <div class="col-md-5 col-12">
          <q-card class="q-pa-md">
            <q-card-section>
              <!-- Banner de información de edición -->
              <div v-if="modoEdicion && inventarioEditando" class="q-mb-md">
                <q-banner class="bg-orange-1 text-orange-8 rounded-borders">
                  <template v-slot:avatar>
                    <q-icon name="edit" color="orange" size="md" />
                  </template>
                  <div class="text-weight-medium">Editando Botiquín de Oficina</div>
                  <div class="text-caption q-mt-xs">
                    Inventario ID: {{ inventarioEditando.id_registro }}
                  </div>
                  <div class="q-mt-sm">
                    <div class="text-body2 text-weight-medium q-mb-xs">Productos actuales:</div>
                    <q-chip
                      v-for="item in itemsAgregados"
                      :key="item.id_item"
                      :label="`${item.nombre} (${item.cantidad})`"
                      color="orange-3"
                      text-color="orange-8"
                      size="sm"
                      class="q-mr-xs q-mb-xs"
                    />
                  </div>
                </q-banner>
              </div>

              <div class="text-h6 q-mb-md">
                {{ modoEdicion ? 'Actualizar Items del Botiquín' : 'Agregar Items al Botiquín' }}
              </div>

              <!-- Selector de item -->
              <q-select
                v-model="itemSeleccionado"
                :options="itemsDisponibles.oficina"
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
                  :label="modoEdicion ? 'Actualizar' : 'Registrar'"
                  color="positive"
                  :icon="modoEdicion ? 'update' : 'save'"
                  @click="registrarBotiquin"
                  :loading="loading"
                  :disabled="itemsAgregados.length === 0"
                  class="col"
                />
                <q-btn
                  v-if="modoEdicion"
                  label="Cancelar"
                  color="grey"
                  icon="cancel"
                  @click="cancelarEdicion"
                  class="col"
                />
                <q-btn
                  v-else
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

              <!-- Historial de inventarios -->
              <div v-if="historialInventarios.length > 0" class="q-mt-md">
                <q-separator class="q-my-md" />
                <div class="text-h6 q-mb-md">Inventarios Anteriores</div>
                <q-list separator>
                  <q-item
                    v-for="inventario in historialInventarios"
                    :key="inventario.id_registro"
                    clickable
                    @click="cargarInventarioParaEditar(inventario)"
                    class="q-pa-sm"
                  >
                    <q-item-section>
                      <q-item-label class="text-weight-medium">
                        {{ formatearFecha(inventario.fecha_creacion) }}
                      </q-item-label>
                      <q-item-label caption>
                        {{ inventario.items?.length || 0 }} items
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <q-icon name="edit" color="primary" />
                    </q-item-section>
                  </q-item>
                </q-list>
              </div>
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
                      size="sm"
                      flat
                      round
                      @click="removerItem(index)"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
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
const { signOut } = useAuth()
const {
  loading,
  itemsDisponibles,
  cargarItemsDisponibles,
  registrarInventario,
  actualizarInventario,
  crearOrdenCompra,
  verificarAutenticacion,
  cargarHistorialInventarios,
  obtenerInventarioPorId,
} = useBotiquinDB()

// Variables para el formulario
const itemSeleccionado = ref(null)
const cantidad = ref(1)
const itemsAgregados = ref([])

// Variables para historial y edición
const historialInventarios = ref([])
const modoEdicion = ref(false)
const inventarioEditando = ref(null)

// Función para formatear fechas
const formatearFecha = (fecha) => {
  return new Date(fecha).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

// Cargar items disponibles al montar el componente
onMounted(async () => {
  console.log('🔍 Iniciando carga de página BotiquinFrmOficina...')

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
    console.log('📋 Cargando items de oficina...')
    await cargarItemsDisponibles('oficina')
    console.log('✅ Items de oficina cargados:', itemsDisponibles.oficina)
  } catch (error) {
    console.error('❌ Error cargando items:', error)
    $q.notify({
      type: 'negative',
      message: 'Error cargando items disponibles',
    })
  }

  // Cargar historial de inventarios
  try {
    console.log('📋 Cargando historial de inventarios de oficina...')
    const historial = await cargarHistorialInventarios('oficina')
    historialInventarios.value = historial || []
    console.log('✅ Historial cargado:', historialInventarios.value.length, 'inventarios')
  } catch (error) {
    console.error('❌ Error cargando historial:', error)
    $q.notify({
      type: 'negative',
      message: 'Error cargando historial de inventarios',
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

  // Verificar si el item ya existe en la lista
  const itemExistente = itemsAgregados.value.find(
    (item) => item.id_item === itemSeleccionado.value.id_item,
  )

  if (itemExistente) {
    $q.notify({
      type: 'warning',
      message: `${itemSeleccionado.value.nombre} ya está en la lista. Puedes modificar la cantidad directamente.`,
    })
    return
  }

  // Agregar nuevo item
  const nuevoItem = {
    id_item: itemSeleccionado.value.id_item,
    nombre: itemSeleccionado.value.nombre,
    cantidad: cantidad.value,
    tipo_kit: 'oficina', // Agregar tipo para actualización
  }

  console.log('Nuevo item agregado:', nuevoItem)
  console.log('Item seleccionado completo:', itemSeleccionado.value)
  itemsAgregados.value.push(nuevoItem)

  $q.notify({
    type: 'positive',
    message: `${itemSeleccionado.value.nombre} agregado`,
  })

  // Limpiar formulario
  itemSeleccionado.value = null
  cantidad.value = 1
}

// Remover item de la lista
const removerItem = (index) => {
  itemsAgregados.value.splice(index, 1)
  $q.notify({
    type: 'info',
    message: 'Item removido',
  })
}

// Registrar botiquín en la base de datos
const registrarBotiquin = async () => {
  if (itemsAgregados.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Agrega al menos un item antes de registrar',
    })
    return
  }

  const accion = modoEdicion.value ? 'actualización' : 'registro'

  try {
    await $q.dialog({
      title: 'Confirmar Registro',
      message: `¿Confirmas la ${accion} del botiquín de oficina con ${itemsAgregados.value.length} items?`,
      cancel: true,
      persistent: true,
      ok: {
        label: 'Sí, continuar',
        color: 'primary',
      },
    })

    // Si llegamos aquí, el usuario confirmó
    if (modoEdicion.value) {
      // Verificar que tenemos el ID del inventario
      if (!inventarioEditando.value?.id_registro) {
        console.error('❌ No se encontró ID del inventario para actualizar')
        $q.notify({
          type: 'negative',
          message: 'Error: No se puede actualizar, falta el ID del inventario',
          position: 'center',
          timeout: 3000,
        })
        return
      }

      console.log('Iniciando actualización desde formulario OFICINA:', {
        inventarioId: inventarioEditando.value.id_registro,
        tipo: 'oficina',
        items: itemsAgregados.value,
      })

      await actualizarInventario(inventarioEditando.value.id_registro, itemsAgregados.value)

      $q.notify({
        type: 'positive',
        message: 'Botiquín de oficina actualizado exitosamente',
        position: 'center',
        timeout: 3000,
      })

      // Salir del modo edición
      cancelarEdicion()

      // Recargar historial
      const historial = await cargarHistorialInventarios('oficina')
      historialInventarios.value = historial || []
    } else {
      console.log('Iniciando registro desde formulario OFICINA:', {
        tipo: 'oficina',
        items: itemsAgregados.value,
      })

      // Verificar que los items tengan la estructura correcta
      itemsAgregados.value.forEach((item, index) => {
        console.log(`Item ${index + 1}:`, {
          id_item: item.id_item,
          nombre: item.nombre,
          cantidad: item.cantidad,
        })
      })

      await registrarInventario('oficina', itemsAgregados.value)

      $q.notify({
        type: 'positive',
        message: 'Botiquín de oficina registrado exitosamente',
        position: 'center',
        timeout: 3000,
      })

      // Limpiar formulario
      itemsAgregados.value = []

      // Recargar historial
      const historial = await cargarHistorialInventarios('oficina')
      historialInventarios.value = historial || []

      // Redirigir al historial
      router.push('/historial-botiquin')
    }
  } catch (err) {
    if (err === false || err === undefined) {
      // Usuario canceló el diálogo
      $q.notify({
        type: 'info',
        message: `${accion.charAt(0).toUpperCase() + accion.slice(1)} cancelado`,
        position: 'center',
        timeout: 2000,
      })
      return
    }

    console.error(`Error en el formulario OFICINA (${accion}):`, err)
    $q.notify({
      type: 'negative',
      message: `Error al ${modoEdicion.value ? 'actualizar' : 'registrar'} el botiquín: ${err.message}`,
      position: 'center',
      timeout: 3000,
    })
  }
}

// Funciones para modo edición
const cargarInventarioParaEditar = async (inventario) => {
  console.log('📝 Cargando inventario para edición:', inventario)
  console.log('📋 ID del inventario:', inventario.id_registro)

  try {
    modoEdicion.value = true
    inventarioEditando.value = inventario

    // Limpiar items actuales
    itemsAgregados.value = []

    let itemsParaCargar = []

    // Primero intentar usar los datos que vienen en el parámetro
    if (inventario.detalle_inventario && inventario.detalle_inventario.length > 0) {
      console.log('📦 Usando detalles del inventario directo')
      itemsParaCargar = inventario.detalle_inventario.map((detalle) => ({
        id_item: detalle.id_item,
        nombre: detalle.nombre_item || detalle.nombre,
        cantidad: detalle.cantidad,
        tipo_kit: 'oficina', // Agregar tipo para actualización
      }))
    }
    // Si no hay detalles o faltan nombres, obtener del servidor
    else if (inventario.id_registro) {
      console.log('🔄 Obteniendo inventario completo del servidor')
      const inventarioCompleto = await obtenerInventarioPorId(inventario.id_registro)

      if (inventarioCompleto && inventarioCompleto.detalle_inventario) {
        itemsParaCargar = inventarioCompleto.detalle_inventario.map((detalle) => ({
          id_item: detalle.id_item,
          nombre: detalle.nombre_item || detalle.items?.nombre || 'Item sin nombre',
          cantidad: detalle.cantidad,
          tipo_kit: 'oficina', // Agregar tipo para actualización
        }))
      }
    }

    // Cargar los items
    if (itemsParaCargar.length > 0) {
      itemsAgregados.value = itemsParaCargar
      console.log('✅ Items cargados para edición:', itemsAgregados.value)

      $q.notify({
        type: 'positive',
        message: `Inventario cargado para edición. ${itemsAgregados.value.length} items cargados.`,
      })
    } else {
      console.warn('⚠️ No se encontraron items para cargar')
      $q.notify({
        type: 'warning',
        message: 'No se encontraron items en el inventario seleccionado',
      })
    }
  } catch (error) {
    console.error('❌ Error al cargar inventario para edición:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar el inventario para edición',
    })
  }
}

const cancelarEdicion = () => {
  modoEdicion.value = false
  inventarioEditando.value = null
  itemsAgregados.value = []
  itemSeleccionado.value = null
  cantidad.value = 1

  $q.notify({
    type: 'info',
    message: 'Edición cancelada',
    position: 'center',
    timeout: 2000,
  })

  console.log('🔄 Modo edición cancelado')
}

// Ir a compras
const irACompras = async () => {
  if (itemsAgregados.value.length === 0) {
    $q.notify({
      type: 'warning',
      message: 'Agrega items antes de generar orden de compra',
      position: 'center',
      timeout: 3000,
    })
    return
  }

  try {
    // Confirmación antes de crear la orden
    await $q.dialog({
      title: 'Confirmar Orden de Compra',
      message: `¿Confirmas la creación de la orden de compra con ${itemsAgregados.value.length} items?`,
      cancel: true,
      persistent: true,
      ok: {
        label: 'Sí, crear orden',
        color: 'primary',
      },
    })

    console.log('🛒 Creando orden de compra con items:', itemsAgregados.value)
    await crearOrdenCompra(itemsAgregados.value, 'oficina')

    $q.notify({
      type: 'positive',
      message: 'Orden de compra creada exitosamente',
      position: 'center',
      timeout: 3000,
    })

    // Limpiar formulario
    itemsAgregados.value = []

    console.log('🔄 Redirigiendo a historial de compras...')
    // Redirigir a la página de compras/historial de órdenes
    router.push('/historial-compras')
  } catch (err) {
    if (err === false || err === undefined) {
      // Usuario canceló el diálogo
      $q.notify({
        type: 'info',
        message: 'Orden de compra cancelada',
        position: 'center',
        timeout: 2000,
      })
      return
    }

    console.error('Error al crear orden:', err)
    $q.notify({
      type: 'negative',
      message: `Error al crear la orden de compra: ${err.message}`,
      position: 'center',
      timeout: 3000,
    })
  }
}

// Función para cerrar sesión
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
</script>

<style scoped>
.full-width {
  width: 100%;
}
</style>

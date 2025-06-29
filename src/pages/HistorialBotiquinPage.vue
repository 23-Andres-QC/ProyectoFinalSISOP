<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
        <q-toolbar-title class="text-white">Historial de Botiquines</q-toolbar-title>
        <q-btn flat label="Inicio" class="q-ml-md text-white" @click="$router.push('/principal')" />
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
              <div class="text-h6 q-mb-md">Historial de Botiquines</div>

              <div v-if="loading" class="text-center q-pa-lg">
                <q-spinner color="primary" size="48px" />
                <div class="q-mt-md">Cargando historial...</div>
              </div>

              <div v-else-if="botiquines.length === 0" class="text-center text-grey-6 q-pa-lg">
                <q-icon name="inventory" size="48px" class="q-mb-md" />
                <div>No tienes botiquines registrados</div>
                <q-btn
                  label="Crear mi primer botiquín"
                  color="primary"
                  class="q-mt-md"
                  @click="$router.push('/botiquin-opciones')"
                />
              </div>

              <div v-else>
                <q-list separator>
                  <q-item
                    v-for="item in botiquines"
                    :key="item.id"
                    class="q-pa-md"
                    clickable
                    @click="verDetalle(item)"
                  >
                    <q-item-section avatar>
                      <q-avatar color="primary" text-color="white" icon="medical_services" />
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-weight-medium">
                        Botiquín
                        {{
                          item.productos && item.productos.length > 0
                            ? getTipoNombre(item.productos[0].tipo)
                            : ''
                        }}
                      </q-item-label>
                      <q-item-label caption>
                        {{ (item.productos?.length || 0) + ' productos' }}
                      </q-item-label>
                      <q-item-label caption class="q-mt-xs"> ID: {{ item.id }} </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="row q-gutter-xs">
                        <q-btn
                          icon="edit"
                          color="primary"
                          size="sm"
                          flat
                          round
                          @click.stop="editarInventario(item)"
                        >
                          <q-tooltip>Editar</q-tooltip>
                        </q-btn>
                        <q-btn
                          icon="delete"
                          color="negative"
                          size="sm"
                          flat
                          round
                          @click.stop="confirmarEliminar(item)"
                        >
                          <q-tooltip>Eliminar</q-tooltip>
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

      <!-- Modal de detalle -->
      <q-dialog v-model="mostrarDetalle">
        <q-card style="min-width: 400px">
          <q-card-section>
            <div class="text-h6">Detalle del Botiquín</div>
          </q-card-section>

          <q-card-section v-if="registroSeleccionado">
            <div class="text-subtitle2 q-mb-md">ID: {{ registroSeleccionado.id }}</div>
            <div class="text-subtitle2 q-mb-md">
              Tipo: {{ getTipoNombre(registroSeleccionado.tipo_kit) }}
            </div>
            <div>
              <div class="text-subtitle2 q-mb-md">
                Total de productos: {{ registroSeleccionado.productos?.length || 0 }}
              </div>
              <q-list dense>
                <q-item v-for="(prod, idx) in registroSeleccionado.productos" :key="idx">
                  <q-item-section>
                    <q-item-label><b>Producto:</b> {{ prod.nombre }}</q-item-label>
                    <q-item-label><b>Cantidad:</b> {{ prod.cantidad }}</q-item-label>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>

          <q-card-actions align="right">
            <q-btn flat label="Cerrar" color="primary" v-close-popup />
          </q-card-actions>
        </q-card>
      </q-dialog>
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
  error,
  obtenerHistorialBotiquinesYReservas,
  eliminarInventario,
  obtenerInventarioPorId,
} = useBotiquinDB()

const mostrarDetalle = ref(false)
const registroSeleccionado = ref(null)
const historial = ref([])
const botiquines = ref([])

const getTipoNombre = (tipo) => {
  const nombres = {
    hogar: 'Hogar',
    oficina: 'Oficina',
    escolar: 'Escolar',
    industria: 'Industria',
    montania: 'Montaña',
    montaña: 'Montaña',
  }
  return nombres[tipo] || tipo || ''
}

onMounted(async () => {
  historial.value = await obtenerHistorialBotiquinesYReservas()
  botiquines.value = historial.value.filter((item) => item.tipo === 'botiquin')
})

const verDetalle = (registro) => {
  // Obtener el inventario real desde la base de datos por ID
  obtenerInventarioPorId(registro.id).then((inventario) => {
    if (
      !inventario ||
      !inventario.detalle_inventario ||
      inventario.detalle_inventario.length === 0
    ) {
      $q.notify({
        type: 'negative',
        message: 'No se pudo obtener el detalle del botiquín.',
      })
      return
    }
    // Tomar tipo solo del primer producto
    const tipo = inventario.detalle_inventario[0]?.tipo || registro.tipo_kit
    // Mapear productos con nombre, cantidad y tipo
    const productos = inventario.detalle_inventario.map((item) => ({
      nombre: item.nombre_item,
      cantidad: item.cantidad,
      tipo: item.tipo, // este campo debe venir de la consulta join con productos
    }))
    registroSeleccionado.value = {
      id: registro.id,
      tipo_kit: tipo,
      productos,
    }
    mostrarDetalle.value = true
  })
}

const editarInventario = async (registro) => {
  // Log para depuración
  console.log('📝 Editar inventario, registro:', registro)
  // Obtener el inventario real desde la base de datos por ID
  const inventario = await obtenerInventarioPorId(registro.id)
  console.log('📦 Inventario obtenido:', inventario)
  let tipo =
    inventario?.detalle_inventario?.[0]?.tipo_kit || inventario?.tipo_kit || registro.tipo_kit
  let productos = []
  if (inventario && inventario.detalle_inventario && inventario.detalle_inventario.length > 0) {
    tipo = inventario.detalle_inventario[0].tipo_kit || tipo
    productos = inventario.detalle_inventario.map((item) => ({
      id_producto: item.id_item,
      nombre: item.nombre_item,
      cantidad: item.cantidad,
      tipo: item.tipo_kit,
    }))
  } else {
    // Si no hay inventario, notificar y no navegar
    $q.notify({
      type: 'negative',
      message: 'No se pudo obtener el inventario para editar. Intenta más tarde.',
    })
    return
  }
  router.push({
    path: '/botiquin-frm-escolar',
    query: {
      edit: registro.id,
      tipo: tipo,
      productos: JSON.stringify(productos),
    },
  })
}

const confirmarEliminar = (registro) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message: `¿Estás seguro de que quieres eliminar este botiquín? Esta acción no se puede deshacer.`,
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await eliminarInventario(registro.id)
      $q.notify({
        type: 'positive',
        message: 'Botiquín eliminado exitosamente',
      })
      historial.value = await obtenerHistorialBotiquinesYReservas()
      botiquines.value = historial.value.filter((item) => item.tipo === 'botiquin')
    } catch (err) {
      $q.notify({
        type: 'negative',
        message: error.value || err.message || 'Error al eliminar el botiquín',
      })
    }
  })
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
</script>

<style scoped>
.q-item {
  border-radius: 8px;
  margin-bottom: 8px;
}

.q-item:hover {
  background-color: #f5f5f5;
}
</style>

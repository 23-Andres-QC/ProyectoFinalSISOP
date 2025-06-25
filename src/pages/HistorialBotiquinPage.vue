<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
        <q-toolbar-title class="text-white">Historial de Botiquines</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="q-pa-md">
      <div class="row q-gutter-md">
        <!-- Lista de inventarios -->
        <div class="col-12">
          <q-card class="q-pa-md">
            <q-card-section>
              <div class="text-h6 q-mb-md">Tus Botiquines Registrados</div>

              <div v-if="loading" class="text-center q-pa-lg">
                <q-spinner color="primary" size="48px" />
                <div class="q-mt-md">Cargando historial...</div>
              </div>

              <div
                v-else-if="historialInventarios.length === 0"
                class="text-center text-grey-6 q-pa-lg"
              >
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
                    v-for="inventario in historialInventarios"
                    :key="inventario.id_registro"
                    class="q-pa-md"
                    clickable
                    @click="verDetalle(inventario)"
                  >
                    <q-item-section>
                      <q-item-label class="text-weight-medium">
                        Botiquín registrado el {{ formatDate(inventario.fecha_registro) }}
                      </q-item-label>
                      <q-item-label caption>
                        {{ inventario.detalle_inventario.length }} items registrados
                      </q-item-label>
                      <q-item-label caption class="q-mt-xs">
                        Tipos: {{ getTiposUnicos(inventario.detalle_inventario).join(', ') }}
                      </q-item-label>
                    </q-item-section>
                    <q-item-section side>
                      <div class="row q-gutter-xs">
                        <q-btn
                          icon="edit"
                          color="primary"
                          size="sm"
                          flat
                          round
                          @click.stop="editarInventario(inventario)"
                        >
                          <q-tooltip>Editar</q-tooltip>
                        </q-btn>
                        <q-btn
                          icon="delete"
                          color="negative"
                          size="sm"
                          flat
                          round
                          @click.stop="confirmarEliminar(inventario.id_registro)"
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

          <q-card-section v-if="inventarioSeleccionado">
            <div class="text-subtitle2 q-mb-md">
              Registrado el: {{ formatDate(inventarioSeleccionado.fecha_registro) }}
            </div>

            <q-list dense>
              <q-item
                v-for="item in inventarioSeleccionado.detalle_inventario"
                :key="item.id_detalle"
              >
                <q-item-section>
                  <q-item-label>{{ item.nombre_item }}</q-item-label>
                  <q-item-label caption>Tipo: {{ item.tipo_kit }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <q-badge color="primary">{{ item.cantidad }}</q-badge>
                </q-item-section>
              </q-item>
            </q-list>
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

const $q = useQuasar()
const router = useRouter()
const { loading, error, historialInventarios, cargarHistorialInventarios, eliminarInventario } =
  useBotiquinDB()

const mostrarDetalle = ref(false)
const inventarioSeleccionado = ref(null)

// Cargar historial al montar el componente
onMounted(async () => {
  await cargarHistorialInventarios()
})

// Formatear fecha
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

// Obtener tipos únicos de un inventario
const getTiposUnicos = (detalles) => {
  const tipos = [...new Set(detalles.map((d) => d.tipo_kit))]
  return tipos.map((tipo) => {
    const nombres = {
      hogar: 'Hogar',
      oficina: 'Oficina',
      escolar: 'Escolar',
      industria: 'Industria',
      montania: 'Montaña',
    }
    return nombres[tipo] || tipo
  })
}

// Ver detalle del inventario
const verDetalle = (inventario) => {
  inventarioSeleccionado.value = inventario
  mostrarDetalle.value = true
}

// Editar inventario
const editarInventario = (inventario) => {
  const tipoKit = inventario.detalle_inventario[0]?.tipo_kit
  if (tipoKit) {
    // Redirigir al formulario correspondiente según el tipo
    const rutas = {
      hogar: '/botiquin-frm-hogar',
      oficina: '/botiquin-frm-oficina',
      escolar: '/botiquin-frm-escolar',
      industria: '/botiquin-frm-industria',
      montania: '/botiquin-frm-montaña',
    }

    const ruta = rutas[tipoKit]
    if (ruta) {
      router.push(ruta)
    } else {
      $q.notify({
        type: 'warning',
        message: 'Tipo de botiquín no reconocido',
      })
    }
  }
}

// Confirmar eliminación
const confirmarEliminar = (idRegistro) => {
  $q.dialog({
    title: 'Confirmar eliminación',
    message:
      '¿Estás seguro de que quieres eliminar este botiquín? Esta acción no se puede deshacer.',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await eliminarInventario(idRegistro)
      $q.notify({
        type: 'positive',
        message: 'Botiquín eliminado exitosamente',
      })
      await cargarHistorialInventarios()
    } catch {
      $q.notify({
        type: 'negative',
        message: error.value || 'Error al eliminar el botiquín',
      })
    }
  })
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

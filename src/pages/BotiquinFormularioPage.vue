<template>
  <q-page class="q-pa-md">
    <div class="row">
      <!-- Lista de productos seleccionados (izquierda) -->
      <div class="col-12 col-md-4 q-pr-md">
        <q-card>
          <q-card-section>
            <div class="text-h6">Productos seleccionados</div>
            <q-list v-if="seleccionados.length > 0">
              <q-item v-for="item in seleccionados" :key="item.id_producto">
                <q-item-section>{{ item.nombre }}</q-item-section>
                <q-item-section side>
                  <q-input
                    v-model.number="item.cantidad"
                    type="number"
                    min="1"
                    dense
                    outlined
                    style="width: 60px"
                    @update:model-value="validarCantidad(item)"
                    class="q-mr-sm"
                  />
                  <q-btn icon="edit" flat dense size="sm" @click="editarProducto(item)" />
                  <q-btn
                    icon="delete"
                    flat
                    dense
                    size="sm"
                    color="negative"
                    @click="eliminarProducto(item)"
                  />
                </q-item-section>
              </q-item>
            </q-list>
            <div v-else class="text-grey-6">No hay productos seleccionados</div>
            <div v-if="seleccionados.length > 0" class="q-mt-md text-right text-h6">
              Monto total: S/ {{ montoTotal.toFixed(2) }}
            </div>
          </q-card-section>
        </q-card>
      </div>
      <!-- Botón para abrir modal de selección (derecha) -->
      <div class="col-12 col-md-8">
        <div class="q-mb-md">
          <q-select
            v-model="tipoSeleccionado"
            :options="tipos"
            label="Tipo de botiquín"
            outlined
            :disable="esEdicion"
          />
        </div>
        <q-btn
          label="Agregar productos"
          color="primary"
          @click="abrirModal = true"
          :disable="!tipoSeleccionado"
          class="q-mb-md"
        />
        <q-dialog v-model="abrirModal">
          <q-card style="min-width: 500px">
            <q-card-section>
              <div class="text-h6">Selecciona productos</div>
              <q-table
                :rows="productosFiltrados"
                :columns="columns"
                row-key="id_producto"
                flat
                bordered
                :pagination="{ rowsPerPage: 10 }"
              >
                <template #body-cell-cantidad="props">
                  <q-td :props="props">
                    <q-input
                      v-model.number="cantidadesModal[props.row.id_producto]"
                      type="number"
                      min="0"
                      dense
                      outlined
                      style="width: 70px"
                    />
                  </q-td>
                </template>
              </q-table>
            </q-card-section>
            <q-card-actions align="right">
              <q-btn flat label="Cancelar" color="negative" v-close-popup />
              <q-btn label="Aceptar" color="primary" @click="agregarSeleccionados" v-close-popup />
            </q-card-actions>
          </q-card>
        </q-dialog>
        <div class="q-mt-lg flex flex-center">
          <q-btn
            :label="botonLabel"
            color="primary"
            @click="confirmarPedido"
            :disable="seleccionados.length === 0"
          />
        </div>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted, watch, nextTick } from 'vue'
import { useQuasar } from 'quasar'
import { useBotiquinDB } from '../composables/useBotiquinDB.js'
import { useRoute, useRouter } from 'vue-router'
import { supabase } from '../supabase.js'

const tipos = ['hogar', 'oficina', 'industria', 'escolar', 'montaña']
const tipoSeleccionado = ref(null)
const productos = ref([])
const cantidadesModal = ref({})
const seleccionados = ref([])
const abrirModal = ref(false)
const $q = useQuasar()
const {
  obtenerProductos,
  crearOrdenCompra,
  registrarInventario,
  reservarBotiquinDB,
  obtenerInventarioPorId,
  actualizarInventario,
} = useBotiquinDB()
const route = useRoute()
const router = useRouter()

const columns = [
  { name: 'nombre', label: 'Producto', field: 'nombre', align: 'left' },
  { name: 'precio', label: 'Precio (S/)', field: 'precio', align: 'right' },
  { name: 'cantidad', label: 'Cantidad', field: 'cantidad', align: 'center' },
]

const editId = computed(() => route.query.edit)
const esEdicion = computed(() => !!editId.value)
const esReserva = computed(() => route.query.esReserva === '1')

let inicializandoDesdeQuery = false

onMounted(async () => {
  // Si viene por query productos y tipo, usar esos (edición desde historial)
  const productosQuery = route.query.productos
  const tipoQuery = route.query.tipo
  if (editId.value && productosQuery) {
    try {
      inicializandoDesdeQuery = true
      // Decodificar y parsear productos
      const productosParsed = JSON.parse(decodeURIComponent(productosQuery))
      let tipoDetectado = tipoQuery
      if (!tipoDetectado && productosParsed.length > 0) {
        tipoDetectado = productosParsed[0].tipo || null
      }
      if (!tipoDetectado) {
        // Si no se detecta, buscar en la BD por editId
        const inventario = await obtenerInventarioPorId(editId.value)
        tipoDetectado = inventario?.detalle_inventario[0]?.tipo_kit || 'hogar'
      }
      tipoSeleccionado.value = tipoDetectado
      await nextTick()
      productos.value = await obtenerProductos(tipoSeleccionado.value)
      // Mapear productos seleccionados asegurando id_producto y cantidad
      seleccionados.value = productosParsed.map((item) => {
        // Buscar en la lista de productos para obtener info extra si falta
        let prod = productos.value.find(
          (p) => p.id_producto === item.id_producto || p.nombre === item.nombre,
        )
        return {
          id_producto: item.id_producto || prod?.id_producto,
          nombre: item.nombre || prod?.nombre,
          cantidad: item.cantidad || 1,
          tipo: tipoSeleccionado.value,
        }
      })
      await nextTick()
      inicializandoDesdeQuery = false
    } catch (e) {
      console.error('Error al parsear productos de query:', e)
      seleccionados.value = []
      inicializandoDesdeQuery = false
    }
  } else if (esEdicion.value) {
    // Modo edición tradicional (desde la app, no desde historial)
    const inventario = await obtenerInventarioPorId(editId.value)
    if (inventario) {
      tipoSeleccionado.value = inventario.detalle_inventario[0]?.tipo_kit || null
      productos.value = await obtenerProductos(tipoSeleccionado.value)
      seleccionados.value = inventario.detalle_inventario.map((item) => ({
        id_producto: item.id_item,
        nombre: item.nombre_item,
        cantidad: item.cantidad,
        tipo: tipoSeleccionado.value,
      }))
    }
  } else if (tipoSeleccionado.value) {
    productos.value = await obtenerProductos(tipoSeleccionado.value)
  }
})

watch(tipoSeleccionado, async (nuevoTipo, anteriorTipo) => {
  if (inicializandoDesdeQuery) return // No limpiar seleccionados si es inicialización desde query
  if (nuevoTipo) {
    productos.value = await obtenerProductos(nuevoTipo)
    cantidadesModal.value = {}
    seleccionados.value = [] // Limpiar seleccionados solo si no es inicialización desde query
  } else {
    productos.value = []
    cantidadesModal.value = {}
    seleccionados.value = []
  }
})

const productosFiltrados = computed(() =>
  productos.value.filter(
    (p) =>
      p.tipo === tipoSeleccionado.value &&
      !seleccionados.value.some((s) => s.id_producto === p.id_producto),
  ),
)

function agregarSeleccionados() {
  // Agrega los productos seleccionados en el modal a la lista principal
  const nuevos = productosFiltrados.value
    .filter((p) => cantidadesModal.value[p.id_producto] > 0)
    .map((p) => ({
      id_producto: p.id_producto,
      nombre: p.nombre,
      cantidad: cantidadesModal.value[p.id_producto],
      tipo: tipoSeleccionado.value,
    }))
  // Evita duplicados (si ya existe, actualiza cantidad)
  nuevos.forEach((nuevo) => {
    const idx = seleccionados.value.findIndex((s) => s.id_producto === nuevo.id_producto)
    if (idx >= 0) {
      seleccionados.value[idx].cantidad = nuevo.cantidad
    } else {
      seleccionados.value.push(nuevo)
    }
  })
  // Limpiar cantidades del modal después de agregar
  nuevos.forEach((nuevo) => {
    cantidadesModal.value[nuevo.id_producto] = 0
  })
}

function editarProducto(item) {
  // Abre el modal y precarga a cantidad para editar
  abrirModal.value = true
  cantidadesModal.value[item.id_producto] = item.cantidad
}

function eliminarProducto(item) {
  seleccionados.value = seleccionados.value.filter((s) => s.id_producto !== item.id_producto)
}

const modo = computed(() => route.query.modo || 'personalizar')
const botonLabel = computed(() => {
  if (esEdicion.value && esReserva.value) return 'Actualizar Reserva'
  if (esEdicion.value) return 'Actualizar Botiquín'
  if (modo.value === 'comprar') return 'Reservar Botiquín'
  return 'Registrar Botiquín'
})

const montoTotal = computed(() => {
  return seleccionados.value.reduce((acc, item) => {
    const prod = productos.value.find((p) => p.id_producto === item.id_producto)
    return acc + (prod ? (prod.precio || 0) * (item.cantidad || 1) : 0)
  }, 0)
})

async function confirmarPedido() {
  // Mostrar confirmación antes de registrar
  $q.dialog({
    title:
      esEdicion.value && esReserva.value
        ? 'Confirmar actualización de reserva'
        : esEdicion.value
          ? 'Confirmar actualización'
          : 'Confirmar registro',
    message: `¿Deseas ${esEdicion.value && esReserva.value ? 'actualizar la reserva' : esEdicion.value ? 'actualizar' : 'registrar'} el botiquín tipo "${tipoSeleccionado.value}"?`,
    cancel: true,
    persistent: true,
    ok: {
      label: botonLabel.value,
      color: 'primary',
    },
  }).onOk(async () => {
    try {
      if (modo.value === 'comprar') {
        await reservarBotiquin(
          seleccionados.value.map((p) => ({ id_producto: p.id_producto, cantidad: p.cantidad })),
          tipoSeleccionado.value,
        )
        $q.notify({ type: 'positive', message: 'Reserva realizada correctamente.' })
      } else if (esEdicion.value && esReserva.value) {
        // Actualizar reserva existente (borrar e insertar todo en detalle_reserva_botiquin)
        const detalles = seleccionados.value.map((p) => ({
          id_producto: p.id_producto,
          cantidad: p.cantidad,
        }))
        await supabase.from('detalle_reserva_botiquin').delete().eq('id_reserva', editId.value)
        await supabase
          .from('detalle_reserva_botiquin')
          .insert(detalles.map((d) => ({ ...d, id_reserva: editId.value })))
        $q.notify({ type: 'positive', message: 'Reserva actualizada correctamente.' })
        router.push('/historial-reservas')
      } else if (esEdicion.value) {
        // Validar que todos los productos tengan id_producto válido
        const sinId = seleccionados.value.filter((p) => !p.id_producto)
        if (sinId.length > 0) {
          $q.notify({
            type: 'negative',
            message: 'Hay productos sin ID válido. Corrige antes de actualizar.',
          })
          return
        }
        // Actualizar inventario existente (borrar e insertar todo)
        const itemsFormateados = seleccionados.value.map((p) => ({
          id_item: p.id_producto,
          cantidad: p.cantidad,
          tipo_kit: tipoSeleccionado.value,
        }))
        await actualizarInventario(editId.value, itemsFormateados)
        $q.notify({ type: 'positive', message: 'Botiquín actualizado correctamente.' })
        router.push('/historial-botiquin')
      } else {
        await registrarBotiquin(
          seleccionados.value.map((p) => ({ id_producto: p.id_producto, cantidad: p.cantidad })),
          tipoSeleccionado.value,
        )
        $q.notify({ type: 'positive', message: 'Botiquín registrado correctamente.' })
      }
      seleccionados.value = []
    } catch (e) {
      $q.notify({ type: 'negative', message: 'Error al guardar.' })
    }
  })
}

// Función para registrar un botiquín personalizado
async function registrarBotiquin(items, tipo) {
  // Mapear items al formato esperado por registrarInventario
  const itemsFormateados = items.map((p) => ({
    id_item: p.id_producto,
    cantidad: p.cantidad,
  }))
  await registrarInventario(tipo, itemsFormateados)
}

// Función para reservar un botiquín (ahora implementada)
async function reservarBotiquin(items, tipo) {
  await reservarBotiquinDB(items, tipo)
}

function validarCantidad(item) {
  if (!item.cantidad || item.cantidad < 1) {
    item.cantidad = 1
    $q.notify({ type: 'warning', message: 'La cantidad debe ser mayor a 0.' })
  }
}
</script>

<style scoped>
.q-page {
  max-width: 1100px;
  margin: auto;
}
</style>

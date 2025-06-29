<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Historial de Reservas de Botiquín</div>
    <q-table
      :rows="reservas"
      :columns="columns"
      row-key="id_reserva"
      flat
      bordered
      :pagination="{ rowsPerPage: 10 }"
    >
      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <div class="row items-center justify-end q-gutter-sm">
            <q-btn
              icon="edit"
              color="primary"
              flat
              @click.stop="editarReserva(props.row)"
              size="sm"
            />
            <q-btn
              icon="delete"
              color="negative"
              flat
              @click.stop="eliminarReserva(props.row)"
              size="sm"
            />
            <q-btn
              icon="whatsapp"
              color="green"
              flat
              @click.stop="enviarWhatsapp(props.row)"
              size="sm"
            />
          </div>
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useBotiquinDB } from '../composables/useBotiquinDB.js'
import { supabase } from '../supabase.js'
import { useAuth } from '../composables/useAuth.js'
import { useRouter } from 'vue-router'

const $q = useQuasar()
const { obtenerHistorialBotiquinesYReservas, obtenerProductos, obtenerInventarioPorId } =
  useBotiquinDB()
const { user } = useAuth()
const router = useRouter()
const reservas = ref([])
const productosDisponibles = ref([])

const columns = [
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' },
  { name: 'monto_total', label: 'Monto Total', field: 'monto_total', align: 'right' },
  { name: 'tipo', label: 'Tipo', field: (row) => row.productos[0]?.tipo || '', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

onMounted(async () => {
  await cargarReservas()
})

async function cargarReservas() {
  // Trae todas las reservas, sin filtrar por tipo
  const historial = await obtenerHistorialBotiquinesYReservas()
  reservas.value = historial.filter((r) => r.id && r.productos)
}

function getTipoNombre(tipo) {
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

async function editarReserva(row) {
  // Validar que haya productos para editar
  if (!row.productos || row.productos.length === 0) {
    $q.notify({ type: 'warning', message: 'Esta reserva no tiene productos para editar.' })
    return
  }
  // Obtener los datos reales de la reserva desde la base de datos
  const inventario = await obtenerInventarioPorId(row.id)
  let tipo = inventario?.detalle_inventario?.[0]?.tipo_kit || row.productos[0]?.tipo || ''
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
    $q.notify({
      type: 'negative',
      message: 'No se pudo obtener la reserva para editar. Intenta más tarde.',
    })
    return
  }
  // Redirigir al formulario central de botiquín con los datos en la query string
  router.push({
    path: '/botiquin-frm-escolar',
    query: {
      edit: row.id,
      tipo,
      productos: encodeURIComponent(JSON.stringify(productos)),
    },
  })
}

async function cargarProductosDisponibles(tipo) {
  productosDisponibles.value = await obtenerProductos(tipo)
}

function enviarWhatsapp(reserva) {
  // Solo seguimiento: redirige a admin si es admin, si no, solo abre WhatsApp
  if (user.value?.role === 'admin') {
    window.location.href = '/admin-reservas'
    return
  }
  const numero = user.value?.user_metadata?.whatsapp || ''
  if (!numero) {
    $q.notify({ type: 'warning', message: 'Debes registrar tu número de WhatsApp en tu perfil.' })
    return
  }
  const mensaje = encodeURIComponent(
    `Hola, tu reserva está en estado: ${reserva.estado || 'pendiente'}`,
  )
  window.open(`https://wa.me/${numero}?text=${mensaje}`, '_blank')
}

async function eliminarReserva(reserva) {
  if (reserva.tipo !== 'reserva') {
    $q.notify({ type: 'warning', message: 'Solo puedes eliminar reservas.' })
    return
  }
  const ok = await $q.dialog({
    title: 'Eliminar Reserva',
    message: '¿Estás seguro de eliminar esta reserva?',
    cancel: true,
    persistent: true,
  })
  if (ok) {
    await supabase.from('reserva_botiquin').delete().eq('id_reserva', reserva.id)
    await cargarReservas()
    $q.notify({ type: 'positive', message: 'Reserva eliminada.' })
  }
}
</script>

<style scoped>
.q-page {
  max-width: 900px;
  margin: auto;
}
</style>

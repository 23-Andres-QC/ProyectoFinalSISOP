<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Panel de Administración de Reservas</div>
    <q-table
      :rows="reservas"
      :columns="columns"
      row-key="id_reserva"
      flat
      bordered
      :pagination="{ rowsPerPage: 10 }"
    >
      <template v-slot:body-cell-estado="props">
        <q-td :props="props">
          <q-select
            v-model="props.row.estado"
            :options="estados"
            dense
            @update:model-value="cambiarEstado(props.row)"
          />
        </q-td>
      </template>
      <template v-slot:body-cell-acciones="props">
        <q-td :props="props">
          <q-btn icon="whatsapp" color="green" flat @click="enviarWhatsapp(props.row)" size="sm" />
        </q-td>
      </template>
    </q-table>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { supabase } from '../supabase.js'

const $q = useQuasar()
const reservas = ref([])
const estados = [
  { label: 'Pendiente', value: 'pendiente' },
  { label: 'Revisado', value: 'revisado' },
  { label: 'Por Corregir', value: 'por corregir' },
  { label: 'Cancelado', value: 'cancelado' },
]

const columns = [
  { name: 'fecha', label: 'Fecha', field: 'fecha', align: 'left' },
  { name: 'monto_total', label: 'Monto Total', field: 'monto_total', align: 'right' },
  { name: 'estado', label: 'Estado', field: 'estado', align: 'center' },
  { name: 'acciones', label: 'Acciones', field: 'acciones', align: 'center' },
]

onMounted(async () => {
  await cargarReservas()
})

async function cargarReservas() {
  const { data, error } = await supabase
    .from('reserva_botiquin')
    .select('*')
    .order('fecha', { ascending: false })
  if (!error) reservas.value = data
}

async function cambiarEstado(reserva) {
  await supabase
    .from('reserva_botiquin')
    .update({ estado: reserva.estado })
    .eq('id_reserva', reserva.id_reserva)
  $q.notify({ type: 'positive', message: 'Estado actualizado.' })
}

async function enviarWhatsapp(reserva) {
  // Obtener el usuario asociado a la reserva
  const { data: usuario } = await supabase
    .from('usuarios')
    .select('correo, whatsapp')
    .eq('id_usuario', reserva.id_usuario)
    .single()
  if (!usuario || !usuario.whatsapp) {
    $q.notify({ type: 'warning', message: 'El usuario no tiene número de WhatsApp registrado.' })
    return
  }
  let mensaje = ''
  if (reserva.estado === 'revisado') {
    mensaje = '¡Tu reserva de botiquín ha sido revisada y está en proceso!'
  } else if (reserva.estado === 'por corregir') {
    mensaje = 'Tu reserva de botiquín requiere correcciones. Por favor revisa tu pedido.'
  } else if (reserva.estado === 'cancelado') {
    mensaje = 'Lamentamos informarte que tu reserva de botiquín ha sido cancelada.'
  } else {
    mensaje = `El estado de tu reserva de botiquín es: ${reserva.estado}`
  }
  const url = `https://wa.me/${usuario.whatsapp}?text=${encodeURIComponent(mensaje)}`
  window.open(url, '_blank')
  $q.notify({ type: 'info', message: 'Mensaje de WhatsApp preparado.' })
}
</script>

<style scoped>
.q-page {
  max-width: 900px;
  margin: auto;
}
</style>

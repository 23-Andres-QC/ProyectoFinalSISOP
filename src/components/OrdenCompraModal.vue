<template>
  <q-dialog v-model="isOpen" persistent>
    <q-card style="min-width: 500px; max-width: 90vw">
      <q-card-section class="row items-center q-pb-none">
        <div class="text-h6">📋 Orden de Compra</div>
        <q-space />
        <q-btn icon="close" flat round dense @click="cerrar" />
      </q-card-section>

      <q-card-section>
        <div class="text-subtitle1 q-mb-md">
          <q-icon name="shopping_cart" color="primary" />
          Resumen de productos seleccionados:
        </div>

        <!-- Lista de productos -->
        <q-list bordered separator class="rounded-borders q-mb-md">
          <q-item v-for="(item, idx) in items" :key="idx">
            <q-item-section>
              <q-item-label>{{ item.item_name }}</q-item-label>
              <q-item-label caption>Cantidad: {{ item.quantity }}</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-chip color="primary" text-color="white">
                ${{ (item.unit_price || 10.0).toFixed(2) }}
              </q-chip>
            </q-item-section>
          </q-item>

          <!-- Total -->
          <q-separator />
          <q-item class="bg-grey-1">
            <q-item-section>
              <q-item-label class="text-weight-bold">Total Estimado:</q-item-label>
            </q-item-section>
            <q-item-section side>
              <q-chip color="positive" text-color="white" size="lg">
                ${{ totalEstimado.toFixed(2) }}
              </q-chip>
            </q-item-section>
          </q-item>
        </q-list>

        <!-- Formulario de datos adicionales -->
        <q-form @submit.prevent="confirmarCompra" class="q-gutter-md">
          <q-input
            v-model="telefono"
            label="Teléfono de contacto *"
            type="tel"
            outlined
            prefix="+51"
            mask="### ### ###"
            :rules="[(val) => !!val || 'El teléfono es requerido']"
            hint="Formato: 999 123 456"
          >
            <template #prepend>
              <q-icon name="phone" />
            </template>
          </q-input>

          <q-input
            v-model="direccion"
            label="Dirección de entrega *"
            outlined
            type="textarea"
            rows="3"
            :rules="[(val) => !!val || 'La dirección es requerida']"
            hint="Incluye distrito, referencia y código postal si es posible"
          >
            <template #prepend>
              <q-icon name="location_on" />
            </template>
          </q-input>

          <q-input
            v-model="notas"
            label="Notas adicionales (opcional)"
            outlined
            type="textarea"
            rows="2"
            hint="Horarios preferenciales, instrucciones especiales, etc."
          >
            <template #prepend>
              <q-icon name="notes" />
            </template>
          </q-input>

          <!-- Información importante -->
          <q-banner class="bg-info text-white rounded-borders">
            <template #avatar>
              <q-icon name="info" />
            </template>
            <div class="text-subtitle2">Información importante:</div>
            <ul class="q-ma-none q-pl-md">
              <li>Los precios son estimados y pueden variar</li>
              <li>El tiempo de entrega es de 2-5 días hábiles</li>
              <li>Te contactaremos por WhatsApp para confirmar el pedido</li>
            </ul>
          </q-banner>

          <!-- Botones -->
          <div class="row q-gutter-sm q-mt-md">
            <q-btn label="Cancelar" flat color="grey" @click="cerrar" class="col" />
            <q-btn
              label="Confirmar Pedido"
              type="submit"
              color="primary"
              icon="shopping_cart"
              :loading="loading"
              :disable="loading"
              class="col"
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useAuth } from '../composables/useAuth.js'

const props = defineProps({
  modelValue: Boolean,
  items: {
    type: Array,
    default: () => [],
  },
  total: {
    type: Number,
    default: 0,
  },
})

const emit = defineEmits(['update:modelValue', 'confirmar'])

// Estados
const telefono = ref('')
const direccion = ref('')
const notas = ref('')

// Composables
const { user } = useAuth()

// Computed
const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value),
})

const totalEstimado = computed(() => {
  return (
    props.total ||
    props.items.reduce((total, item) => {
      return total + (item.unit_price || 10.0) * item.quantity
    }, 0)
  )
})

const confirmarCompra = async () => {
  const contactInfo = {
    name: user.value?.email?.split('@')[0] || 'Usuario',
    phone: `+51${telefono.value.replace(/\s/g, '')}`,
    email: user.value?.email || '',
    address: direccion.value,
    notes: notas.value,
  }

  try {
    emit('confirmar', contactInfo)

    // Limpiar formulario
    telefono.value = ''
    direccion.value = ''
    notas.value = ''
  } catch (error) {
    console.error('Error al confirmar compra:', error)
  }
}

const cerrar = () => {
  isOpen.value = false
}
</script>

<style scoped>
.q-dialog .q-card {
  max-height: 90vh;
  overflow-y: auto;
}
</style>

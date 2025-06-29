<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Editar Perfil</div>
    <q-form @submit.prevent="guardarPerfil">
      <q-input v-model="whatsapp" label="Número de WhatsApp" outlined class="q-mb-md" required />
      <div class="q-mt-md flex flex-center">
        <q-btn label="Guardar" color="primary" type="submit" :loading="loading" />
      </div>
    </q-form>
    <q-banner
      v-if="mensaje"
      :class="mensajeTipo === 'positive' ? 'bg-green-2 text-green-9' : 'bg-red-2 text-red-9'"
      class="q-mt-md"
    >
      {{ mensaje }}
    </q-banner>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { supabase } from '../supabase.js'
import { useAuth } from '../composables/useAuth.js'

const $q = useQuasar()
const { user } = useAuth()
const whatsapp = ref('')
const loading = ref(false)
const mensaje = ref('')
const mensajeTipo = ref('positive')

onMounted(() => {
  whatsapp.value = user.value?.user_metadata?.whatsapp || ''
})

async function guardarPerfil() {
  loading.value = true
  mensaje.value = ''
  try {
    // Actualizar en tabla usuarios
    const { error: updateError } = await supabase
      .from('usuarios')
      .update({ whatsapp: whatsapp.value })
      .eq('correo', user.value?.email)
    if (updateError) throw updateError
    mensaje.value = 'Perfil actualizado correctamente.'
    mensajeTipo.value = 'positive'
  } catch (e) {
    mensaje.value = e.message || 'Error al actualizar perfil.'
    mensajeTipo.value = 'negative'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.q-page {
  max-width: 400px;
  margin: auto;
}
</style>

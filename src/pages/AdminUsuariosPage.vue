<template>
  <q-page class="q-pa-md">
    <div class="q-mb-md text-h5">Registrar Usuario Administrador</div>
    <q-form @submit.prevent="registrarAdmin">
      <q-input v-model="nombre" label="Nombre" outlined class="q-mb-md" required />
      <q-input v-model="correo" label="Correo" type="email" outlined class="q-mb-md" required />
      <q-input
        v-model="contrasena"
        label="Contraseña"
        type="password"
        outlined
        class="q-mb-md"
        required
      />
      <div class="q-mt-md flex flex-center">
        <q-btn label="Registrar Administrador" color="primary" type="submit" :loading="loading" />
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
import { ref } from 'vue'
import { useQuasar } from 'quasar'
import { supabase } from '../supabase.js'

const nombre = ref('')
const correo = ref('')
const contrasena = ref('')
const loading = ref(false)
const mensaje = ref('')
const mensajeTipo = ref('positive')
const $q = useQuasar()

async function registrarAdmin() {
  loading.value = true
  mensaje.value = ''
  try {
    // Registrar en Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email: correo.value,
      password: contrasena.value,
      options: {
        data: { nombre: nombre.value, tipo_usuario: 'admin' },
      },
    })
    if (signUpError) throw signUpError

    // Registrar en la tabla usuarios
    const { error: insertError } = await supabase.from('usuarios').insert([
      {
        nombre: nombre.value,
        correo: correo.value,
        contrasena: 'hash_handled_by_supabase',
        tipo_usuario: 'admin',
      },
    ])
    if (insertError) throw insertError

    mensaje.value = 'Administrador registrado correctamente.'
    mensajeTipo.value = 'positive'
    nombre.value = ''
    correo.value = ''
    contrasena.value = ''
  } catch (e) {
    mensaje.value = e.message || 'Error al registrar administrador.'
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

<template>
  <q-page class="q-pa-md">
    <div class="text-h5 q-mb-md">Recuperar Contraseña</div>
    <q-form @submit.prevent="enviarCodigo">
      <q-input v-model="correo" label="Correo" type="email" outlined class="q-mb-md" required />
      <div class="q-mt-md flex flex-center">
        <q-btn label="Enviar código" color="primary" type="submit" :loading="loading" />
      </div>
    </q-form>
    <q-form v-if="codigoEnviado" @submit.prevent="cambiarContrasena" class="q-mt-lg">
      <q-input v-model="codigo" label="Código recibido" outlined class="q-mb-md" required />
      <q-input
        v-model="nuevaContrasena"
        label="Nueva contraseña"
        type="password"
        outlined
        class="q-mb-md"
        required
      />
      <div class="q-mt-md flex flex-center">
        <q-btn label="Cambiar contraseña" color="primary" type="submit" :loading="loading" />
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

const $q = useQuasar()
const correo = ref('')
const codigo = ref('')
const nuevaContrasena = ref('')
const loading = ref(false)
const mensaje = ref('')
const mensajeTipo = ref('positive')
const codigoEnviado = ref(false)
let codigoGenerado = ''

function generarCodigo() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

async function enviarCodigo() {
  loading.value = true
  mensaje.value = ''
  try {
    codigoGenerado = generarCodigo()
    // Buscar usuario
    const { data: usuario, error } = await supabase
      .from('usuarios')
      .select('id_usuario')
      .eq('correo', correo.value)
      .single()
    if (error || !usuario) throw new Error('Correo no registrado')
    // Guardar código en la tabla
    await supabase
      .from('recuperacion_contrasena')
      .insert({ id_usuario: usuario.id_usuario, codigo_recuperacion: codigoGenerado })
    // Simulación de envío de correo (en producción usar un backend o Supabase Functions)
    $q.notify({ type: 'info', message: `Código enviado: ${codigoGenerado}` })
    codigoEnviado.value = true
    mensaje.value = 'Código enviado a tu correo.'
    mensajeTipo.value = 'positive'
  } catch (e) {
    mensaje.value = e.message || 'Error al enviar código.'
    mensajeTipo.value = 'negative'
  } finally {
    loading.value = false
  }
}

async function cambiarContrasena() {
  loading.value = true
  mensaje.value = ''
  try {
    // Validar código
    const { data: rec, error } = await supabase
      .from('recuperacion_contrasena')
      .select('*')
      .eq('codigo_recuperacion', codigo.value)
      .single()
    if (error || !rec) throw new Error('Código incorrecto')
    // Cambiar contraseña
    await supabase
      .from('usuarios')
      .update({ contrasena: nuevaContrasena.value })
      .eq('id_usuario', rec.id_usuario)
    mensaje.value = 'Contraseña actualizada correctamente.'
    mensajeTipo.value = 'positive'
    codigoEnviado.value = false
    correo.value = ''
    codigo.value = ''
    nuevaContrasena.value = ''
  } catch (e) {
    mensaje.value = e.message || 'Error al cambiar contraseña.'
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

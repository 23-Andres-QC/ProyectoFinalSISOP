<template>
  <q-page class="flex flex-center bg-blue-1" style="height: 100vh">
    <q-card style="min-width: 350px; max-width: 90vw" class="q-pa-lg shadow-2 bg-white">
      <q-card-section class="text-center">
        <div class="text-h5 text-blue-10 q-mb-md">Minutos de Vida</div>
        <div class="text-subtitle2 text-grey-7 q-mb-md">Iniciar sesión</div>
      </q-card-section>
      <q-card-section>
        <q-input v-model="username" label="Usuario" color="blue" outlined dense class="q-mb-md" />
        <q-input
          v-model="password"
          label="Contraseña"
          color="blue"
          outlined
          dense
          type="password"
          class="q-mb-md"
        />
        <div v-if="error" class="text-negative text-center q-mb-md">{{ error }}</div>
        <q-btn
          color="blue-7"
          text-color="white"
          label="Ingresar"
          @click="login"
          class="full-width"
        />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const username = ref('')
const password = ref('')
const error = ref('')
const router = useRouter()

function login() {
  if (username.value === 'ejemplo123' && password.value === 'ejemplo123') {
    error.value = ''
    router.push('/principal')
  } else {
    error.value = 'Usuario o contraseña incorrectos'
  }
}
</script>

<style scoped>
.bg-blue-1 {
  background: linear-gradient(135deg, #2196f3 0%, #e3f2fd 100%);
}
.q-card {
  border-radius: 16px;
  border: 2px solid #1976d2;
}
.q-btn {
  font-weight: bold;
  border-radius: 8px;
}
.text-blue-10 {
  color: #0d47a1;
}
.text-negative {
  color: #d32f2f;
}
</style>

<template>
  <q-page class="flex flex-center column q-pa-xl">
    <div class="text-h3 text-primary text-center q-mb-md">Minutos de Vida</div>
    <div class="text-subtitle1 text-center q-mb-lg" style="max-width: 600px">
      Minutos de Vida es una plataforma dedicada a la gestión de botiquines, recomendaciones de
      seguridad y administración de recursos para situaciones de emergencia en hogares, oficinas y
      escuelas. Nuestra misión es ayudarte a estar preparado y actuar rápido cuando más lo
      necesitas.
    </div>
    <q-btn color="primary" label="Inicio" size="lg" @click="irAInicio" />
  </q-page>
</template>

<script setup>
import { useRouter, useRoute } from 'vue-router'
import { onMounted } from 'vue'

const router = useRouter()
const route = useRoute()

function irAInicio() {
  const tipoUsuario = localStorage.getItem('tipo_usuario')
  if (tipoUsuario === 'Administrador' || tipoUsuario === 'admin') {
    router.push('/admin/ordenes')
  } else if (tipoUsuario === 'normal') {
    router.push('/principal')
  } else {
    router.push('/auth')
  }
}

// Si el usuario ya está autenticado y entra a /, redirigir automáticamente
onMounted(() => {
  const tipoUsuario = localStorage.getItem('tipo_usuario')
  if (route.path === '/' && tipoUsuario) {
    if (tipoUsuario === 'Administrador' || tipoUsuario === 'admin') {
      router.replace('/admin/ordenes')
    } else if (tipoUsuario === 'normal') {
      router.replace('/principal')
    }
  }
})
</script>

<style scoped>
.q-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #e0eafc 0%, #cfdef3 100%);
}
</style>

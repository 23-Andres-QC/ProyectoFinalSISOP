<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuth } from './composables/useAuth.js'

// Inicializar autenticación al cargar la aplicación
const { getCurrentSession } = useAuth()

onMounted(async () => {
  console.log('🚀 Inicializando aplicación y verificando autenticación...')
  try {
    await getCurrentSession()
    console.log('✅ Estado de autenticación inicializado')
  } catch (error) {
    console.error('❌ Error inicializando autenticación:', error)
  }
})
</script>

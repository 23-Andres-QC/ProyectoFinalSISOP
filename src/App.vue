<template>
  <router-view />
</template>

<script setup>
import { onMounted } from 'vue'
import { useAuth } from './composables/useAuth.js'

// Inicializar autenticación al cargar la aplicación
const { getCurrentSession, initAuthListener, user } = useAuth()

onMounted(async () => {
  console.log('🚀 Inicializando aplicación y verificando autenticación...')

  try {
    // Inicializar el listener de cambios de autenticación
    initAuthListener()
    console.log('👂 Listener de autenticación inicializado')

    // Obtener sesión actual
    const session = await getCurrentSession()
    console.log('📊 Sesión inicial obtenida:', {
      hasSession: !!session,
      hasUser: !!session?.user,
      userEmail: session?.user?.email,
    })

    // Verificar estado del usuario después de la inicialización
    setTimeout(() => {
      console.log('⏰ Estado del usuario después de 1 segundo:', {
        hasUser: !!user.value,
        userEmail: user.value?.email,
        userId: user.value?.id,
      })
    }, 1000)

    console.log('✅ Estado de autenticación inicializado correctamente')
  } catch (error) {
    console.error('❌ Error inicializando autenticación:', error)
  }
})
</script>

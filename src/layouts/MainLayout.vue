<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="text-white"> Minutos de Vida </q-toolbar-title>

        <!-- Enlaces específicos para usuarios autenticados -->

        <q-btn
          v-if="user"
          flat
          label="Mis Compras"
          class="q-ml-md text-white"
          @click="goTo('historial-compras')"
        />

        <!-- Enlaces específicos para administradores -->
        <q-btn
          v-if="user?.is_admin"
          flat
          label="Admin Órdenes"
          class="q-ml-md text-white"
          @click="goTo('admin/ordenes')"
        />

        <!-- Botón de cerrar sesión -->
        <q-btn
          flat
          icon="logout"
          label="Cerrar Sesión"
          class="q-ml-md text-white"
          @click="logout"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <footer class="footer fixed-footer">
      <p>© 2025 Minutos de Vida. Todos los derechos reservados.</p>
    </footer>
  </q-layout>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { signOut, user, initAuthListener, getCurrentSession } = useAuth()

// Inicializar autenticación al montar el componente
onMounted(async () => {
  // Inicializar el listener de autenticación
  initAuthListener()

  // Obtener la sesión actual
  await getCurrentSession()

  console.log('MainLayout iniciado, usuario:', user.value)
})

function goTo(route) {
  // Rutas específicas para usuarios autenticados
  if (route === 'historial-compras') router.push('/historial-compras')
  else if (route === 'admin/ordenes') router.push('/admin/ordenes')
  else if (route === 'hospital-fast') router.push('/hospital-fast')
}

const logout = async () => {
  try {
    const result = await signOut()
    if (result.success) {
      router.push('/')
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}
</script>

<style scoped>
.footer {
  width: 100%;
  background-color: #002366;
  color: white;
  text-align: center;
  padding: 10px;
  position: fixed;
  bottom: 0;
  z-index: 1000;
}

.fixed-footer {
  position: fixed;
  bottom: 0;
}
</style>

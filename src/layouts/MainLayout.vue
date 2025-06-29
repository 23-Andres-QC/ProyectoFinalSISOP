<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated class="bg-primary text-white">
      <q-toolbar>
        <q-toolbar-title class="row items-center">
          <q-avatar size="40px" class="q-mr-sm" color="white">
            <q-icon name="medical_services" color="primary" size="28px" />
          </q-avatar>
          Minutos de Vida
        </q-toolbar-title>
        <q-btn flat label="Inicio" class="q-ml-md text-white" @click="goTo('/')" />
        <q-btn
          flat
          label="Historial Botiquines"
          class="q-ml-md text-white"
          v-if="isLoggedIn"
          @click="goTo('/historial-botiquin')"
        />
        <q-btn
          flat
          label="Historial Compras"
          class="q-ml-md text-white"
          v-if="isLoggedIn"
          @click="goTo('/historial-compras')"
        />
        <q-btn
          flat
          label="Panel Admin"
          class="q-ml-md text-white"
          v-if="isAdmin"
          @click="goTo('/admin/ordenes')"
        />
        <q-btn
          flat
          label="Panel Usuario"
          class="q-ml-md text-white"
          v-if="isNormal"
          @click="goTo('/principal')"
        />
        <q-space />
        <div v-if="isLoggedIn" class="row items-center q-gutter-sm">
          <q-avatar size="32px" color="white" text-color="primary">
            <q-icon name="person" />
          </q-avatar>
          <span class="text-weight-medium">{{ userName }}</span>
          <q-btn flat label="Cerrar sesión" class="text-white" @click="logout" />
        </div>
        <q-btn
          flat
          label="Login"
          class="q-ml-md text-white"
          v-if="!isLoggedIn"
          @click="goTo('/auth')"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <footer class="footer fixed-footer" v-if="!isWelcomePage">
      <p>© 2025 Minutos de Vida. Todos los derechos reservados.</p>
    </footer>
  </q-layout>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const route = useRoute()
const { signOut, user, initAuthListener, getCurrentSession } = useAuth()

const isLoggedIn = computed(() => !!user.value)
const tipoUsuario = ref('')
const isAdmin = computed(
  () => tipoUsuario.value === 'Administrador' || tipoUsuario.value === 'admin',
)
const isNormal = computed(() => tipoUsuario.value === 'normal')
const isWelcomePage = computed(() => route.path === '/')
const userName = computed(() => user.value?.user_metadata?.nombre || user.value?.email || 'Usuario')

// Inicializar autenticación al montar el componente
onMounted(async () => {
  // Inicializar el listener de autenticación
  initAuthListener()

  // Obtener la sesión actual
  await getCurrentSession()
  tipoUsuario.value = localStorage.getItem('tipo_usuario') || ''
  // Escuchar cambios en localStorage (por si cambia en otra pestaña)
  window.addEventListener('storage', () => {
    tipoUsuario.value = localStorage.getItem('tipo_usuario') || ''
  })
})

function goTo(path) {
  router.push(path)
}

const logout = async () => {
  try {
    const result = await signOut()
    if (result.success) {
      localStorage.removeItem('tipo_usuario')
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

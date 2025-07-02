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
        <q-btn flat label="Inicio" class="q-ml-md text-white" @click="goTo('/principal')" />
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
          @click="goTo('/admin-simple')"
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
const isAdmin = computed(() => tipoUsuario.value === 'admin')
const isNormal = computed(() => tipoUsuario.value === 'cliente' || tipoUsuario.value === 'normal')
const isWelcomePage = computed(() => route.path === '/')
const userName = computed(() => user.value?.user_metadata?.nombre || user.value?.email || 'Usuario')

// Función para actualizar tipo de usuario
const updateTipoUsuario = () => {
  const tipo = localStorage.getItem('tipo_usuario') || ''
  tipoUsuario.value = tipo
  console.log('🔍 MainLayout - Tipo usuario actualizado:', tipo)
  console.log('🔍 MainLayout - Es admin:', tipo === 'admin')
}

// Inicializar autenticación al montar el componente
onMounted(async () => {
  initAuthListener()
  await getCurrentSession()
  updateTipoUsuario()

  // Escuchar cambios en el localStorage para tipo_usuario
  window.addEventListener('storage', (e) => {
    if (e.key === 'tipo_usuario') {
      updateTipoUsuario()
    }
  })

  // También escuchar un evento personalizado para cambios de tipo de usuario
  window.addEventListener('tipoUsuarioChanged', updateTipoUsuario)
})

function goTo(path) {
  router.push(path)
}

const logout = async () => {
  try {
    const result = await signOut()
    if (result.success) {
      localStorage.removeItem('tipo_usuario')
      tipoUsuario.value = '' // Limpiar inmediatamente
      router.push('/')
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}
</script>

<style scoped></style>

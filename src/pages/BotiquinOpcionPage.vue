<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="text-white">Botiquín - Opciones</q-toolbar-title>

        <!-- Enlaces del header -->
        <q-btn flat label="Inicio" class="q-ml-md text-white" @click="$router.push('/principal')" />
        <q-btn
          flat
          label="Mis Compras"
          class="q-ml-md text-white"
          @click="$router.push('/historial-compras')"
        />
        <q-btn
          flat
          icon="logout"
          label="Cerrar Sesión"
          class="q-ml-md text-white"
          @click="logout"
        />
      </q-toolbar>
    </q-header>
    <q-page class="flex flex-center">
      <div class="button-container centered row">
        <div v-for="(item, idx) in items" :key="idx" class="button-image">
          <button class="btn-image" @click="goToFormulario(item.nombre)">
            <img :src="item.img" :alt="item.nombre" class="img-button" />
          </button>
          <div class="name">{{ item.nombre }}</div>
        </div>
      </div>
    </q-page>
  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'

const router = useRouter()
const { signOut } = useAuth()

const items = [
  {
    nombre: 'Hogar',
    img: new URL('../pages/ImagenesTipos/Home.png', import.meta.url).href,
  },
  {
    nombre: 'Oficina',
    img: new URL('../pages/ImagenesTipos/Office.png', import.meta.url).href,
  },
  {
    nombre: 'Escuelas',
    img: new URL('../pages/ImagenesTipos/School.png', import.meta.url).href,
  },
  {
    nombre: 'Industrias',
    img: new URL('../pages/ImagenesTipos/industrie.png', import.meta.url).href,
  },
  {
    nombre: 'Montaña',
    img: new URL('../pages/ImagenesTipos/Montain.png', import.meta.url).href,
  },
]

function goToFormulario(tipo) {
  if (tipo === 'Oficina') {
    router.push({ path: '/botiquin-frm-oficina' })
  } else if (tipo === 'Escuelas') {
    router.push({ path: '/botiquin-frm-escolar' })
  } else if (tipo === 'Hogar') {
    router.push({ path: '/botiquin-frm-hogar' })
  } else if (tipo === 'Industrias') {
    router.push({ path: '/botiquin-frm-industria' })
  } else if (tipo === 'Montaña') {
    router.push({ path: '/botiquin-frm-montaña' })
  } else {
    router.push({ path: `/botiquin-frm-${tipo.toLowerCase()}` })
  }
}

// Función para cerrar sesión
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
.button-container {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: center;
  margin-top: 40px;
  align-items: center;
}
.button-image {
  position: relative;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  margin: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.button-image:hover {
  transform: scale(1.2);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
}
.btn-image {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  outline: none;
}
.img-button {
  width: 120px;
  height: 140px;
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.3s ease;
  border: 3px solid #90caf9;
}
.img-button:active {
  transform: scale(0.95);
}
.name {
  font-size: 1.1rem;
  font-weight: 500;
  text-align: center;
  margin-top: 0.5rem;
  color: #333;
}
</style>

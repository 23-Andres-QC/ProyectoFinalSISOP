<template>
  <div class="page-container centered">
    <!-- Header -->
    <q-header elevated>
      <q-toolbar>
        <q-btn flat round dense icon="arrow_back" @click="$router.go(-1)" />
        <q-toolbar-title class="text-white"> Minutos de Vida </q-toolbar-title>

        <q-btn
          flat
          label="Quiénes Somos"
          class="q-ml-md text-white"
          @click="$router.push('/principal')"
        />
        <q-btn
          flat
          label="Contactos"
          class="q-ml-md text-white"
          @click="$router.push('/contactos')"
        />
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

    <!-- Main Content -->
    <main class="main-content centered">
      <div class="background-image expanded">
        <div v-if="activeComponent" class="overlay">
          <component
            :is="activeComponent"
            @close="closeComponent"
            @selectAccident="openRecomendacionPanel"
          />
        </div>
        <div v-else-if="showRecomendacionPanel" class="overlay">
          <RecomendacionPanel :accident="selectedAccident" @close="closeRecomendacionPanel" />
        </div>
        <div class="button-container centered" v-else>
          <div class="row" v-for="rowItems in chunkedItems" :key="rowItems">
            <div v-for="(item, idx) in rowItems" :key="idx" class="button-image centered">
              <button class="btn-image" @click="openComponent(item.nombre, item.title)">
                <img :src="item.img" :alt="item.nombre" class="img-button" />
              </button>
              <div class="name">{{ item.nombre }}</div>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer class="footer fixed-footer">
      <p>© 2025 Minutos de Vida. Todos los derechos reservados.</p>
    </footer>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import Hogar from 'src/components/RecomendacionTipo01/Hogar.vue'
import Industria from 'src/components/RecomendacionTipo04/Industria.vue'
import Montaña from 'src/components/RecomendacionTipo05/Montaña.vue'
import Oficina from 'src/components/RecomendacionTipo02/Oficina.vue'
import Escolar from 'src/components/RecomendacionTipo03/Escolar.vue'
import RecomendacionPanel from 'src/components/Recomendaciones/Recomendacion.vue'

const router = useRouter()
const { signOut } = useAuth()
const activeComponent = ref(null)
const showRecomendacionPanel = ref(false)
const selectedAccident = ref('')

const items = [
  {
    nombre: 'Hogar',
    img: new URL('./ImagenesTipos/Home.png', import.meta.url).href,
    title: 'Accidente en el Hogar',
  },
  {
    nombre: 'Industria',
    img: new URL('./ImagenesTipos/industrie.png', import.meta.url).href,
    title: 'Accidente en la Industria',
  },
  {
    nombre: 'Montaña',
    img: new URL('./ImagenesTipos/Montain.png', import.meta.url).href,
    title: 'Accidente en la Montaña',
  },
  {
    nombre: 'Oficina',
    img: new URL('./ImagenesTipos/Office.png', import.meta.url).href,
    title: 'Accidente en la Oficina',
  },
  {
    nombre: 'Escolar',
    img: new URL('./ImagenesTipos/School.png', import.meta.url).href,
    title: 'Accidente Escolar',
  },
]

const chunkedItems = []
for (let i = 0; i < items.length; i += 3) {
  chunkedItems.push(items.slice(i, i + 3))
}

function openComponent(name, title) {
  switch (name) {
    case 'Hogar':
      activeComponent.value = Hogar
      break
    case 'Industria':
      activeComponent.value = Industria
      break
    case 'Montaña':
      activeComponent.value = Montaña
      break
    case 'Oficina':
      activeComponent.value = Oficina
      break
    case 'Escolar':
      activeComponent.value = Escolar
      break
    default:
      activeComponent.value = null
  }

  if (activeComponent.value && title) {
    activeComponent.value.props = { title }
  }
}

function openRecomendacionPanel(accidentTitle) {
  selectedAccident.value = accidentTitle
  showRecomendacionPanel.value = true
  activeComponent.value = null // Clear activeComponent to ensure overlay remains visible
}

function closeRecomendacionPanel() {
  showRecomendacionPanel.value = false
  selectedAccident.value = ''
}

function closeComponent() {
  activeComponent.value = null
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
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('./ImagenesTipos/background.avif') no-repeat center center;
  background-size: cover;
}

.background-image.expanded {
  width: 100%;
  height: 100%;
}

.button-container {
  display: flex;
  flex-wrap: wrap;
  gap: 30px; /* Adjust spacing for larger buttons */
  justify-content: center; /* Center buttons horizontally */
  align-items: center; /* Center buttons vertically */
}

.row {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
}

.button-image {
  margin: 20px;
  border: 2px solid #007bff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.button-image:hover {
  transform: scale(1.05);
  box-shadow: 0 6px 10px rgba(0, 0, 0, 0.15);
}

.btn-image {
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
}

.img-button {
  width: 250px;
  height: 250px;
  object-fit: cover;
  border-radius: 10px;
  transition: transform 0.3s ease;
  border: 3px solid #90caf9;
}

.img-button:active {
  transform: scale(0.95);
}

.name {
  font-size: 1.2em;
  font-weight: bold;
  color: #333;
  text-align: center;
  margin-top: 10px;
}

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

.centered {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: 100%;
}

.components-section {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.9); /* Slight overlay */
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
}

.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

/* Center the Recomendacion component more precisely */
.recomendacion-panel {
  width: 40%;
  height: 40%;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 30px;
}
</style>

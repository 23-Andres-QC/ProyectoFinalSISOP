<template>
  <div class="page-container">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="text-white"> Minutos de Vida </q-toolbar-title>

        <q-btn
          flat
          label="Quiénes Somos"
          class="q-ml-md text-white"
          @click="goTo('quienes-somos')"
        />
        <q-btn flat label="Ayuda" class="q-ml-md text-white" @click="goTo('ayuda')" />
        <q-btn flat label="Contactos" class="q-ml-md text-white" @click="goTo('contactos')" />
        <q-btn flat label="Más" class="q-ml-md text-white" @click="goTo('mas')" />
      </q-toolbar>
    </q-header>
    <!-- Main Content -->
    <main class="main-content centered">
      <div class="background-image expanded">
        <div class="button-container centered row">
          <div v-for="(item, idx) in items" :key="idx" class="button-image">
            <button class="btn-image" @click="goTo(item.route)">
              <img :src="item.img" :alt="item.nombre" class="img-button" />
            </button>
            <div class="name">{{ item.nombre }}</div>
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
import { useRouter } from 'vue-router'
const router = useRouter()

const items = [
  {
    nombre: 'Botiquín',
    img: new URL('./imagenesAccidentes/botiquin-icon.png', import.meta.url).href,
    route: '/botiquin-opciones',
  },
  {
    nombre: 'Accidentes',
    img: new URL('./imagenesAccidentes/accidentes-icon.png', import.meta.url).href,
    route: '/ac',
  },
]

function goTo(route) {
  router.push(route)
}

// Redirigir a esta página desde el login o donde corresponda
</script>

<style scoped>
.centered {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
}
.row {
  flex-direction: row;
}
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.main-content {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh; /* Ensure it spans the entire page */
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

.button-image {
  position: relative;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  margin: 20px;
}

.button-image:hover {
  transform: scale(1.2);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
}

.btn-image {
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
}

.img-button {
  width: 400px; /* Increased size */
  height: 450px; /* Increased size */
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.3s ease;
  border: 3px solid #90caf9;
}

.img-button:active {
  transform: scale(0.95);
}

.name {
  text-align: center;
  margin-top: 0.5rem;
  font-size: 1.5rem; /* Adjusted font size */
  color: #333;
  font-weight: 600;
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
</style>

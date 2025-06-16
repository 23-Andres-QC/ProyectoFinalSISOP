<template>
  <div class="page-container">
    <!-- Header -->
    <header class="header small-header">
      <div class="header-content">
        <img src="./imagenesAccidentes/logo.png" alt="Logo" class="header-logo" />
        <h1 class="header-title">Minutos de Vida</h1>
        <nav class="nav-links">
          <a href="#" class="nav-link">Inicio</a>
          <a href="#" class="nav-link">Conexión</a>
        </nav>
      </div>
    </header>

    <!-- Main Content -->
    <main class="main-content">
      <div class="background-image expanded">
        <div class="button-container centered">
          <div v-for="(item, idx) in items" :key="idx" class="button-image">
            <button class="btn-image">
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
const items = [
  {
    nombre: 'Botiquín',
    img: new URL('./imagenesAccidentes/botiquin-icon.png', import.meta.url).href,
  },
  {
    nombre: 'Accidentes',
    img: new URL('./imagenesAccidentes/accidentes-icon.png', import.meta.url).href,
  },
]
</script>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
}

.header {
  width: 100%;
  background-color: #002366;
  color: white;
  padding: 10px;
  text-align: center;
  position: fixed;
  top: 0;
  z-index: 1000;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
}

.header-logo {
  width: 80px;
  height: 80px;
}

.header-title {
  color: white;
  font-size: 1.5rem;
  font-weight: bold;
  margin: 0;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-link {
  color: white;
  text-decoration: none;
  font-size: 1.2rem;
  font-weight: bold;
}

.main-content {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  background: url('./imagenesAccidentes/background2.avif') no-repeat center center;
  background-size: cover;
}

.background-image.expanded {
  width: 100%;
  height: 100%;
}

.button-container {
  display: flex;
  flex-wrap: wrap;
  gap: 20px;
  justify-content: center;
  align-items: center;
  height: 100%;
}

.button-container.centered {
  justify-content: center;
  align-items: center;
}

.button-image {
  position: relative;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
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
  width: 550px;
  height: 550px;
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
  font-size: 1.5rem;
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

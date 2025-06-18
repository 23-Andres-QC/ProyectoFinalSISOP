<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="text-white">Botiquín</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="flex flex-center">
      <div class="button-container centered row">
        <div v-for="(item, idx) in items" :key="idx" class="button-image">
          <button class="btn-image">
            <img :src="item.img" :alt="item.nombre" class="img-button" />
          </button>
          <div class="name">{{ item.nombre }}</div>
        </div>
      </div>
    </q-page>
  </q-layout>
</template>

<script setup>
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
</script>

<style scoped>
.button-container {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  justify-content: center;
  margin-top: 40px;
}
.button-image {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.btn-image {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
}
.img-button {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  margin-bottom: 8px;
}
.name {
  font-size: 1.1rem;
  font-weight: 500;
  text-align: center;
}
</style>

<template>
  <div class="recomendacion-hogar-container">
    <h2 class="titulo">Emergencias en la Montaña</h2>
    <div class="botones-imagenes">
      <div v-for="(item, idx) in items" :key="idx" class="boton-imagen">
        <button class="btn-imagen" @click="selectAccident(item.nombre)">
          <img :src="item.img" :alt="item.nombre" class="img-boton" />
        </button>
        <div class="nombre">{{ item.nombre }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
// Define the emit function for the selectAccident event
const emit = defineEmits(['selectAccident'])

const items = [
  {
    nombre: 'Ahogamiento',
    img: new URL('./imagenesMontaña/Ahogamiento.png', import.meta.url).href,
  },
  { nombre: 'Alergias', img: new URL('./imagenesMontaña/Alergias.png', import.meta.url).href },
  { nombre: 'Ampollas', img: new URL('./imagenesMontaña/Ampollas.png', import.meta.url).href },
  {
    nombre: 'Aplastamiento',
    img: new URL('./imagenesMontaña/Aplastamiento.png', import.meta.url).href,
  },
  {
    nombre: 'Ataques',
    img: new URL('./imagenesMontaña/Ataques de animales.png', import.meta.url).href,
  },
  {
    nombre: 'Atragantamiento',
    img: new URL('./imagenesMontaña/Atragantamiento.png', import.meta.url).href,
  },
  { nombre: 'Caídas', img: new URL('./imagenesMontaña/Caídas.png', import.meta.url).href },
  {
    nombre: 'Contusiones',
    img: new URL('./imagenesMontaña/Contusiones.png', import.meta.url).href,
  },
  {
    nombre: 'Deshidratación',
    img: new URL('./imagenesMontaña/Deshidratación.png', import.meta.url).href,
  },
  {
    nombre: 'Desorientación',
    img: new URL('./imagenesMontaña/Desorientación.png', import.meta.url).href,
  },
  { nombre: 'Fracturas', img: new URL('./imagenesMontaña/Fracturas.png', import.meta.url).href },
  { nombre: 'Hipotermia', img: new URL('./imagenesMontaña/Hipotermia.png', import.meta.url).href },
  { nombre: 'Insolación', img: new URL('./imagenesMontaña/Insolación.png', import.meta.url).href },
  { nombre: 'Quemaduras', img: new URL('./imagenesMontaña/Quemaduras.png', import.meta.url).href },
  {
    nombre: 'Traumatismo',
    img: new URL('./imagenesMontaña/Traumatismo.png', import.meta.url).href,
  },
  { nombre: 'Cortes', img: new URL('./imagenesMontaña/cortes.png', import.meta.url).href },
]

function selectAccident(accidentTitle) {
  // Emit the selectAccident event with the accident title
  emit('selectAccident', accidentTitle)
}
</script>

<script>
export default {
  name: 'RecomendacionMontana',
}
</script>

<style scoped>
.recomendacion-hogar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  width: 100%;
  background-color: #f0fff0; /* Retain the container color */
  border-radius: 10px;
}

.titulo {
  font-size: 24px;
  font-weight: bold;
  color: #388e3c;
  margin-bottom: 20px;
  text-align: center;
  z-index: 1;
  position: relative;
}

.botones-imagenes {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  padding: 20px;
  width: 100%;
}

.boton-imagen {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.btn-imagen {
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
}

.img-boton {
  width: 100px;
  height: 100px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.img-boton:active {
  transform: scale(0.95);
}

.nombre {
  margin-top: 8px;
  font-size: 14px;
  text-align: center;
}
</style>

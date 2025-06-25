<template>
  <div class="recomendacion-hogar-container">
    <h2 class="titulo">Emergencias en la Industria</h2>
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
    nombre: 'Amputaciones',
    img: new URL('./ImagenesIndustria/Amputaciones.png', import.meta.url).href,
  },
  {
    nombre: 'Aplastamientos',
    img: new URL('./ImagenesIndustria/Aplastamientos.png', import.meta.url).href,
  },
  { nombre: 'Caídas', img: new URL('./ImagenesIndustria/Caídas.png', import.meta.url).href },
  {
    nombre: 'Contusiones',
    img: new URL('./ImagenesIndustria/Contusiones.png', import.meta.url).href,
  },
  { nombre: 'Cortes', img: new URL('./ImagenesIndustria/Cortes.png', import.meta.url).href },
  {
    nombre: 'Electrocuciones',
    img: new URL('./ImagenesIndustria/Electrocuciones.png', import.meta.url).href,
  },
  {
    nombre: 'Explosiones',
    img: new URL('./ImagenesIndustria/Explosiones.png', import.meta.url).href,
  },
  { nombre: 'Fracturas', img: new URL('./ImagenesIndustria/Fracturas.png', import.meta.url).href },
  {
    nombre: 'Hemorragias',
    img: new URL('./ImagenesIndustria/Hemorragias.png', import.meta.url).href,
  },
  {
    nombre: 'Intoxicaciones',
    img: new URL('./ImagenesIndustria/Intoxicaciones.png', import.meta.url).href,
  },
  {
    nombre: 'Quemaduras',
    img: new URL('./ImagenesIndustria/Quemaduras.png', import.meta.url).href,
  },
]

function selectAccident(accidentTitle) {
  // Emit the selectAccident event with the accident title
  emit('selectAccident', accidentTitle)
}
</script>

<script>
export default {
  name: 'RecomendacionIndustria',
}
</script>

<style scoped>
.recomendacion-hogar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  width: 100%;
  background-color: #f5f5dc; /* Retain the container color */
  border-radius: 10px;
}

.titulo {
  text-align: center;
  margin-bottom: 2rem;
  color: #e64a19;
  font-size: 2.5rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
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

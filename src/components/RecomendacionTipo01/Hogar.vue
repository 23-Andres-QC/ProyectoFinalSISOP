<template>
  <div class="recomendacion-hogar-container">
    <h2 class="titulo">Emergencias en el Hogar</h2>
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
  { nombre: 'Cortes y heridas', img: new URL('./ImagenesHogar/cortes.png', import.meta.url).href },
  { nombre: 'Hemorragias', img: new URL('./ImagenesHogar/hemorragias.png', import.meta.url).href },
  {
    nombre: 'Contusiones',
    img: new URL('./ImagenesHogar/contusiones.png', import.meta.url).href,
  },
  { nombre: 'Caídas', img: new URL('./ImagenesHogar/caidas.png', import.meta.url).href },
  { nombre: 'Quemaduras', img: new URL('./ImagenesHogar/quemaduras.png', import.meta.url).href },
  {
    nombre: 'Atragantamiento',
    img: new URL('./ImagenesHogar/atragantamiento.png', import.meta.url).href,
  },
  {
    nombre: 'Electrocuciones',
    img: new URL('./ImagenesHogar/electrocuciones.png', import.meta.url).href,
  },
  {
    nombre: 'Intoxicaciones',
    img: new URL('./ImagenesHogar/intoxicaciones.png', import.meta.url).href,
  },
  {
    nombre: 'Irritaciones',
    img: new URL('./ImagenesHogar/irritaciones.png', import.meta.url).href,
  },
  {
    nombre: 'Crisis alérgicas',
    img: new URL('./ImagenesHogar/alergias.png', import.meta.url).href,
  },
  {
    nombre: 'Convulsiones',
    img: new URL('./ImagenesHogar/convulsiones.png', import.meta.url).href,
  },
  { nombre: 'Fracturas', img: new URL('./ImagenesHogar/fracturas.png', import.meta.url).href },
  { nombre: 'Explosiones', img: new URL('./ImagenesHogar/explosiones.png', import.meta.url).href },
]

function selectAccident(accidentTitle) {
  // Emit the selectAccident event with the accident title
  emit('selectAccident', accidentTitle)
}
</script>

<script>
export default {
  name: 'RecomendacionHogar',
}
</script>

<style scoped>
.recomendacion-hogar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  width: 100%;
  background-color: #ffe4e1; /* Retain the container color */
  border-radius: 10px;
}

.titulo {
  font-size: 24px;
  font-weight: bold;
  color: #d32f2f;
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

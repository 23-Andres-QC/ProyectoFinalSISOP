<template>
  <div class="recomendacion-hogar-container">
    <h2 class="titulo">Emergencias en la Oficina</h2>
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
    nombre: 'Cortes y heridas',
    img: new URL('./ImagenesOficina/Cortes y heridas .png', import.meta.url).href,
  },
  {
    nombre: 'Hemorragias',
    img: new URL('./ImagenesOficina/Hemorragias .png', import.meta.url).href,
  },
  {
    nombre: 'Contusiones',
    img: new URL('./ImagenesOficina/Contusiones .png', import.meta.url).href,
  },
  { nombre: 'Caídas', img: new URL('./ImagenesOficina/Caídas .png', import.meta.url).href },
  { nombre: 'Quemaduras', img: new URL('./ImagenesOficina/Quemaduras .png', import.meta.url).href },
  {
    nombre: 'Atragantamiento',
    img: new URL('./ImagenesOficina/Atragantamiento .png', import.meta.url).href,
  },
  {
    nombre: 'Electrocuciones',
    img: new URL('./ImagenesOficina/Electrocuciones .png', import.meta.url).href,
  },
  {
    nombre: 'Esguinces',
    img: new URL('./ImagenesOficina/Esguinces o torceduras .png', import.meta.url).href,
  },
  {
    nombre: 'Desmayos',
    img: new URL('./ImagenesOficina/Pérdida de conciencia .png', import.meta.url).href,
  },
  { nombre: 'Raspones', img: new URL('./ImagenesOficina/Raspones .png', import.meta.url).href },
  {
    nombre: 'Alérgias',
    img: new URL('./ImagenesOficina/Reacciones alérgicas .png', import.meta.url).href,
  },
]

function selectAccident(accidentTitle) {
  // Emit the selectAccident event with the accident title
  emit('selectAccident', accidentTitle)
}
</script>

<script>
export default {
  name: 'RecomendacionOficina',
}
</script>

<style scoped>
.recomendacion-hogar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  width: 100%;
  background-color: #f0f8ff; /* Retain the container color */
  border-radius: 10px;
}

.titulo {
  text-align: center;
  margin-bottom: 2rem;
  color: #7b1fa2;
  font-size: 2.5rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
}
.botones-imagenes {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 30px;
  padding: 30px;
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
  width: 150px;
  height: 150px;
  object-fit: cover;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}
.img-boton:active {
  transform: scale(0.95);
}
.nombre {
  margin-top: 10px;
  font-size: 18px;
  text-align: center;
}
</style>

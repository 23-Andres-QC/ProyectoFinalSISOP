<template>
  <div class="recomendacion-hogar-container">
    <h2 class="titulo">Emergencias Escolares</h2>
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
    nombre: 'Atragantamiento',
    img: new URL('./ImagenesEscolar/Atragantamiento.png', import.meta.url).href,
  },
  { nombre: 'Caídas', img: new URL('./ImagenesEscolar/Caídas.png', import.meta.url).href },
  {
    nombre: 'Contusiones',
    img: new URL('./ImagenesEscolar/Contusiones.png', import.meta.url).href,
  },
  {
    nombre: 'Convulsiones',
    img: new URL('./ImagenesEscolar/Convulsiones.png', import.meta.url).href,
  },
  { nombre: 'Cortes', img: new URL('./ImagenesEscolar/Cortes.png', import.meta.url).href },
  {
    nombre: 'Electrocuciones',
    img: new URL('./ImagenesEscolar/Electrocuciones.png', import.meta.url).href,
  },
  { nombre: 'Esguinces', img: new URL('./ImagenesEscolar/Esguinces.png', import.meta.url).href },
  { nombre: 'Fracturas', img: new URL('./ImagenesEscolar/Fracturas.png', import.meta.url).href },
  {
    nombre: 'Quemaduras',
    img: new URL('./ImagenesEscolar/Quemaduras leves.png', import.meta.url).href,
  },
  { nombre: 'Raspones', img: new URL('./ImagenesEscolar/Raspones.png', import.meta.url).href },
  {
    nombre: 'Alérgias',
    img: new URL('./ImagenesEscolar/Reacciones alérgicas.png', import.meta.url).href,
  },
  { nombre: 'Sangrado', img: new URL('./ImagenesEscolar/Sangrado.png', import.meta.url).href },
]

function selectAccident(accidentTitle) {
  // Emit the selectAccident event with the accident title
  emit('selectAccident', accidentTitle)
}
</script>

<script>
export default {
  name: 'RecomendacionEscolar',
}
</script>

<style scoped>
.recomendacion-hogar-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 40px;
  width: 100%;
  background-color: #e6f7ff; /* Retain the container color */
  border-radius: 10px;
}

.titulo {
  text-align: center;
  margin-bottom: 2rem;
  color: #1976d2;
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

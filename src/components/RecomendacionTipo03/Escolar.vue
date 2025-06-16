<template>
  <div class="recomendacion-hogar-container">
    <h2 class="titulo">Emergencias Escolares</h2>
    <div class="botones-imagenes">
      <div v-for="(item, idx) in items" :key="idx" class="boton-imagen">
        <button class="btn-imagen">
          <img :src="item.img" :alt="item.nombre" class="img-boton" />
        </button>
        <div class="nombre">{{ item.nombre }}</div>
      </div>
    </div>
  </div>
</template>

<script setup>
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
</script>

<script>
export default {
  name: 'RecomendacionEscolar',
}
</script>

<style scoped>
.recomendacion-hogar-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem 1rem;
  background: linear-gradient(
    to bottom,
    #e3f2fd,
    #bbdefb
  ); /* Soft blue gradient for school emergencies */
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  font-family: 'Roboto', sans-serif;
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
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
}
.boton-imagen {
  position: relative;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}
.boton-imagen:hover {
  transform: scale(1.2);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
}
.btn-imagen {
  background: none;
  border: none;
  cursor: pointer;
  outline: none;
}
.img-boton {
  width: 120px;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.3s ease;
  border: 3px solid #90caf9;
}
.img-boton:active {
  transform: scale(0.95);
}
.nombre {
  text-align: center;
  margin-top: 0.5rem;
  font-size: 1.2rem;
  color: #333;
  font-weight: 600;
}
</style>

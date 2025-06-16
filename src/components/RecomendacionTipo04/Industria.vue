<template>
  <div class="recomendacion-hogar-container">
    <h2 class="titulo">Emergencias en la Industria</h2>
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
  {
    nombre: 'Traumatismos',
    img: new URL('./ImagenesIndustria/Traumatismos.png', import.meta.url).href,
  },
]
</script>

<script>
export default {
  name: 'RecomendacionIndustria',
}
</script>

<style scoped>
.recomendacion-hogar-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem 1rem;
  background: linear-gradient(
    to bottom,
    #fbe9e7,
    #ffccbc
  ); /* Soft orange gradient for industrial emergencies */
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  font-family: 'Roboto', sans-serif;
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
  border: 3px solid #ffab91;
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

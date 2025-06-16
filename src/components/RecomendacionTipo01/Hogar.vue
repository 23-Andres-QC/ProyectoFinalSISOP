<template>
  <div class="recomendacion-hogar-container">
    <h2 class="titulo">Emergencias en el Hogar</h2>
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
</script>

<script>
export default {
  name: 'RecomendacionHogar',
}
</script>

<style scoped>
.recomendacion-hogar-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem 1rem;
  background: linear-gradient(
    to bottom,
    #ffebee,
    #ffcdd2
  ); /* Soft red gradient for home emergencies */
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  font-family: 'Roboto', sans-serif;
}
.titulo {
  text-align: center;
  margin-bottom: 2rem;
  color: #d32f2f;
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
  border: 3px solid #ef9a9a;
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

<template>
  <div class="recomendacion-hogar-container">
    <h2 class="titulo">Emergencias en la Oficina</h2>
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
  {
    nombre: 'Traumatismos',
    img: new URL('./ImagenesOficina/Traumatismos craneales .png', import.meta.url).href,
  },
]
</script>

<script>
export default {
  name: 'RecomendacionOficina',
}
</script>

<style scoped>
.recomendacion-hogar-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem 1rem;
  background: linear-gradient(
    to bottom,
    #ede7f6,
    #d1c4e9
  ); /* Soft purple gradient for office emergencies */
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  font-family: 'Roboto', sans-serif;
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
  border: 3px solid #ce93d8;
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

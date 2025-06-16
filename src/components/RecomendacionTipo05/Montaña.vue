<template>
  <div class="recomendacion-hogar-container">
    <h2 class="titulo">Emergencias en la Montaña</h2>
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
</script>

<script>
export default {
  name: 'RecomendacionMontana',
}
</script>

<style scoped>
.recomendacion-hogar-container {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem 1rem;
  background: linear-gradient(
    to bottom,
    #e8f5e9,
    #c8e6c9
  ); /* Soft green gradient for mountain emergencies */
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  font-family: 'Roboto', sans-serif;
}
.titulo {
  text-align: center;
  margin-bottom: 2rem;
  color: #388e3c;
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
  border: 3px solid #a5d6a7;
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

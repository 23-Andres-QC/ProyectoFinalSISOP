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
  { nombre: 'Contusiones y golpes', img: new URL('./ImagenesHogar/contusiones.png', import.meta.url).href },
  { nombre: 'Caídas', img: new URL('./ImagenesHogar/caidas.png', import.meta.url).href },
  { nombre: 'Quemaduras', img: new URL('./ImagenesHogar/quemaduras.png', import.meta.url).href },
  { nombre: 'Atragantamiento', img: new URL('./ImagenesHogar/atragantamiento.png', import.meta.url).href },
  { nombre: 'Electrocuciones', img: new URL('./ImagenesHogar/electrocuciones.png', import.meta.url).href },
  { nombre: 'Intoxicaciones', img: new URL('./ImagenesHogar/intoxicaciones.png', import.meta.url).href },
  { nombre: 'Irritaciones oculares', img: new URL('./ImagenesHogar/irritaciones.png', import.meta.url).href },
  { nombre: 'Crisis alérgicas', img: new URL('./ImagenesHogar/alergias.png', import.meta.url).href },
  { nombre: 'Convulsiones', img: new URL('./ImagenesHogar/convulsiones.png', import.meta.url).href },
  { nombre: 'Fracturas', img: new URL('./ImagenesHogar/fracturas.png', import.meta.url).href },
  { nombre: 'Traumatismo craneoencefálico', img: new URL('./ImagenesHogar/traumatismo.png', import.meta.url).href },
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
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.titulo {
  text-align: center;
  margin-bottom: 2rem;
  color: #1976d2;
}
.botones-imagenes {
  display: flex;
  flex-wrap: wrap;
  gap: 1.5rem;
  justify-content: center;
}
.boton-imagen {
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 120px;
}
.btn-imagen {
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  outline: none;
}
.img-boton {
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 1px 6px rgba(0,0,0,0.10);
  transition: transform 0.2s;
}
.btn-imagen:hover .img-boton {
  transform: scale(1.08);
}
.nombre {
  margin-top: 0.5rem;
  text-align: center;
  font-size: 1rem;
  color: #333;
}
</style>

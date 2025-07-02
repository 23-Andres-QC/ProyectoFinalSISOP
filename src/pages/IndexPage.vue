<template>
  <q-page class="flex flex-center principal-bg">
    <div class="container">
      <div class="hero-section">
        <img
          src="https://cdn.pixabay.com/photo/2017/01/31/13/14/first-aid-2025391_1280.png"
          alt="Primeros Auxilios"
          class="hero-img"
        />
        <div class="hero-text">
          <h1>Minutos de Vida</h1>
          <p>
            Tu guía rápida y confiable en emergencias médicas y accidentes.<br />
            Aprende primeros auxilios, personaliza tu botiquín y actúa con seguridad.<br />
            <b class="text-negative">¡Cada minuto cuenta para salvar una vida!</b>
          </p>
          <div class="botones-principales">
            <q-btn label="Tengo un Accidente" color="negative" size="lg" @click="goToAccidente" />
          </div>
        </div>
      </div>
      <div class="info-section">
        <h2>¿Por qué aprender primeros auxilios?</h2>
        <ul>
          <li>Salva vidas en situaciones críticas.</li>
          <li>Reduce el riesgo de complicaciones.</li>
          <li>Brinda seguridad a tu familia y entorno.</li>
        </ul>
        <img
          src="https://cdn.pixabay.com/photo/2016/03/31/19/14/first-aid-1295276_1280.png"
          alt="Kit de Primeros Auxilios"
          class="info-img"
        />
        <h3>Recursos útiles</h3>
        <ul>
          <li>
            <a href="https://www.cruzroja.es/principal/web/guest/primeros-auxilios" target="_blank"
              >Cruz Roja: Primeros Auxilios</a
            >
          </li>
          <li>
            <a href="https://www.who.int/es/news-room/fact-sheets/detail/first-aid" target="_blank"
              >OMS: Primeros Auxilios</a
            >
          </li>
        </ul>
      </div>
    </div>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'
const router = useRouter()

function goToAccidente() {
  router.push('/ac')
}
</script>

<style scoped>
.principal-bg {
  background: linear-gradient(135deg, #2196f3 0%, #e3f2fd 100%);
  min-height: 100vh;
}
.container {
  width: 100%;
  max-width: 1100px;
  margin: auto;
  padding: 24px;
}
.hero-section {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 32px;
}
.hero-img {
  width: 220px;
  max-width: 100%;
  margin-right: 32px;
}
.hero-text {
  flex: 1;
  min-width: 250px;
}
.botones-principales {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-top: 24px;
}
.info-section {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(33, 150, 243, 0.08);
  padding: 24px;
  margin-top: 24px;
}
.info-img {
  width: 180px;
  float: right;
  margin-left: 24px;
  margin-bottom: 16px;
}
@media (max-width: 900px) {
  .hero-section {
    flex-direction: column;
    align-items: flex-start;
  }
  .hero-img {
    margin: 0 0 16px 0;
  }
  .info-img {
    float: none;
    display: block;
    margin: 16px auto;
  }
  .botones-principales {
    align-items: stretch;
  }
}
</style>

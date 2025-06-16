<template>
  <q-page class="flex flex-center principal-bg" style="height: 100vh">
    <q-card
      style="max-width: 900px; width: 95vw"
      class="q-pa-xl shadow-2 bg-white row items-center justify-between"
    >
      <div class="col-12 col-md-5 flex flex-center">
        <img
          src="../assets/img/hero-index.svg"
          alt="Salud y Emergencia"
          style="width: 180px; height: 180px"
        />
      </div>
      <div class="col-12 col-md-7 q-pa-md">
        <div class="text-h4 text-blue-10 q-mb-md text-center">Minutos de Vida</div>
        <div class="text-body1 text-grey-8 q-mb-lg text-justify">
          “Minutos de Vida” es una solución integral que te guía paso a paso ante emergencias
          médicas y accidentes, incluso sin conexión a internet.<br /><br />
          <span class="text-blue-7">Aprende qué hacer en situaciones críticas</span> como cortes,
          quemaduras, convulsiones, atragantamientos, fiebre alta o intoxicaciones, y usa tu kit de
          emergencia con seguridad.<br /><br />
          <span class="text-negative"
            ><b>Porque en los momentos más urgentes, cada minuto puede salvar una vida.</b></span
          >
        </div>
        <div class="row justify-center">
          <q-btn
            color="blue-7"
            text-color="white"
            label="Personaliza tu Botiquín"
            class="q-mt-md"
            size="lg"
            icon="medical_services"
            @click="goToAccidentes"
          />
        </div>
      </div>
    </q-card>
  </q-page>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
function goToAccidentes() {
  router.push('/botiquin')
}
</script>

<style scoped>
.principal-bg {
  background: linear-gradient(135deg, #2196f3 0%, #e3f2fd 100%);
  height: 100vh;
  overflow-y: hidden;
}
.q-card {
  border-radius: 20px;
  border: 2px solid #1976d2;
  box-shadow: 0 8px 32px 0 rgba(33, 150, 243, 0.15);
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  min-height: 350px;
}
.q-btn {
  font-weight: bold;
  border-radius: 8px;
  background: linear-gradient(90deg, #1976d2 0%, #64b5f6 100%);
  box-shadow: 0 4px 16px 0 rgba(33, 150, 243, 0.1);
}
.text-blue-10 {
  color: #0d47a1;
}
.text-negative {
  color: #d32f2f;
}
.text-justify {
  text-align: justify;
}
@media (max-width: 900px) {
  .q-card {
    flex-direction: column;
    min-height: unset;
    max-width: 95vw;
  }
  .col-12 {
    width: 100%;
    max-width: 100%;
  }
}
</style>

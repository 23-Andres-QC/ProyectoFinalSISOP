<template>
  <q-page class="flex flex-center principal-bg" style="height: 100vh">
    <q-card style="max-width: 600px; width: 90vw" class="q-pa-xl shadow-2 bg-white">
      <q-card-section class="text-center">
        <div class="text-h5 text-blue-10 q-mb-md">Personaliza tu Botiquín</div>
        <div class="text-body1 text-grey-8 q-mb-lg">
          Aquí podrás personalizar el contenido de tu botiquín de emergencia según tus necesidades y
          las de tu familia.
        </div>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
// ...existing code...
</script>

<style scoped>
.principal-bg {
  background: linear-gradient(135deg, #2196f3 0%, #e3f2fd 100%);
}
.q-card {
  border-radius: 16px;
  border: 2px solid #1976d2;
}
.q-btn {
  font-weight: bold;
  border-radius: 8px;
  background: linear-gradient(90deg, #1976d2 0%, #64b5f6 100%);
}
.text-blue-10 {
  color: #0d47a1;
}
</style>

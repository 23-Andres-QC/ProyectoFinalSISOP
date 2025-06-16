<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="text-white"> Minutos de Vida </q-toolbar-title>

        <q-btn
          flat
          label="Quiénes Somos"
          class="q-ml-md text-white"
          @click="goTo('quienes-somos')"
        />
        <q-btn flat label="Ayuda" class="q-ml-md text-white" @click="goTo('ayuda')" />
        <q-btn flat label="Contactos" class="q-ml-md text-white" @click="goTo('contactos')" />
        <q-btn flat label="Más" class="q-ml-md text-white" @click="goTo('mas')" />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>

    <footer class="footer fixed-footer">
      <p>© 2025 Minutos de Vida. Todos los derechos reservados.</p>
    </footer>
  </q-layout>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()
function goTo(route) {
  // Puedes personalizar las rutas según tu estructura
  if (route === 'quienes-somos') router.push('/quienes-somos')
  else if (route === 'ayuda') router.push('/ayuda')
  else if (route === 'contactos') router.push('/contactos')
  else if (route === 'mas') router.push('/mas')
}
</script>

<style scoped>
.footer {
  width: 100%;
  background-color: #002366;
  color: white;
  text-align: center;
  padding: 10px;
  position: fixed;
  bottom: 0;
  z-index: 1000;
}

.fixed-footer {
  position: fixed;
  bottom: 0;
}
</style>

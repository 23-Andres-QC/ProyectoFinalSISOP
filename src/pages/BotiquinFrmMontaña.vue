<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="text-white">Formulario Botiquín - Montaña</q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page class="flex flex-center page-scroll">
      <q-form @submit.prevent="onSubmit" class="q-gutter-md form-grid">
        <div>
          <div class="grid-container">
            <div v-for="(item, idx) in montaniaItems" :key="idx" class="grid-item">
              <q-input
                v-model.number="cantidades[item]"
                :label="item"
                type="number"
                min="0"
                :step="1"
                :rules="[(val) => val >= 0 || 'No puede ser negativo']"
                filled
                class="q-mb-sm"
              />
            </div>
          </div>
        </div>
        <q-btn label="Guardar" type="submit" color="primary" class="q-mt-md" />
        <q-btn
          label="Ver historial"
          color="secondary"
          class="q-mt-md"
          @click="mostrarHistorial = !mostrarHistorial"
        />
      </q-form>
      <div v-if="mostrarHistorial" class="q-mt-lg" style="max-width: 700px; width: 100%">
        <q-card class="bg-grey-1 shadow-3">
          <q-card-section>
            <div class="text-h6 text-primary flex items-center q-mb-md">
              <q-icon name="history" color="primary" class="q-mr-sm" />
              Historial de registros
            </div>
            <div v-if="historial.length === 0" class="text-grey-7 text-subtitle2 q-pa-md">
              No hay registros guardados.
            </div>
            <div v-else>
              <q-list bordered separator>
                <q-item
                  v-for="(registro, idx) in historial"
                  :key="idx"
                  class="q-pa-md bg-white q-mb-sm rounded-borders shadow-1"
                >
                  <q-item-section top class="q-gutter-y-xs">
                    <div class="row items-center q-mb-xs">
                      <q-icon name="event" color="secondary" size="20px" class="q-mr-xs" />
                      <span class="text-weight-medium text-secondary">Fecha:</span>
                      <span class="q-ml-xs">{{ new Date(registro.fecha).toLocaleString() }}</span>
                    </div>
                    <q-separator spaced color="grey-3" />
                    <div class="q-mt-xs">
                      <span class="text-weight-medium text-accent">Objetos registrados:</span>
                      <div class="q-mt-xs">
                        <q-chip
                          v-for="(valor, nombre) in registro.datos"
                          :key="nombre"
                          color="primary"
                          text-color="white"
                          class="q-mr-xs q-mb-xs"
                        >
                          <q-icon name="medical_services" size="16px" class="q-mr-xs" />
                          {{ nombre }}: <b>{{ valor }}</b>
                        </q-chip>
                      </div>
                    </div>
                  </q-item-section>
                </q-item>
              </q-list>
            </div>
          </q-card-section>
        </q-card>
      </div>
    </q-page>
  </q-layout>
</template>

<script setup>
import { reactive, ref } from 'vue'

const mostrarHistorial = ref(false)
const historial = ref([])

const montaniaItems = [
  'Gasas estériles (mínimo 10 unidades)',
  'Vendas elásticas (2 unidades)',
  'Venda triangular',
  'Cinta médica adhesiva (micropore o tela)',
  'Curitas de varios tamaños (al menos 10)',
  'Apósitos grandes estériles (2 unidades)',
  'Algodón en rollo o bolitas',
  'Toallitas antisépticas (mínimo 5)',
  'Alcohol en gel (frasco pequeño)',
  'Suero fisiológico (ampollas o botellitas)',
  'Gel para quemaduras (aloe vera o similar)',
  'Apósitos antiampollas (hidrocoloides, 2-3)',
  'Aguja estéril',
  'Termómetro digital',
  'Paracetamol 500 mg (6 tabletas)',
  'Ibuprofeno 400 mg (6 tabletas)',
  'Antidiarreico (loperamida, 4 tabletas)',
  'Antiemético (metoclopramida, 4 tabletas)',
  'Antialérgico oral (loratadina o cetirizina, 4 tabletas)',
  'Sales de rehidratación oral (4 sobres)',
  'Crema con hidrocortisona o calamina',
  'Repelente de insectos',
  'Pinzas metálicas',
  'Tijeras pequeñas de punta roma',
  'Guantes estériles (mínimo 2 pares)',
  'Compresas frías instantáneas (2 unidades)',
  'Manta térmica de emergencia',
  'Linterna o frontal con pilas',
  'Silbato',
  'Encendedor o pedernal',
  'Espejo pequeño',
  'Libreta impermeable y lápiz',
  'Bolsas ziplock (3 unidades)',
  'Tarjeta con datos personales y contacto de emergencia',
  'Medicación personal (si aplica)',
]

const cantidades = reactive({})
montaniaItems.forEach((item) => (cantidades[item] = 0))

function onSubmit() {
  let hist = []
  const savedHist = localStorage.getItem('historialBotiquinMontania')
  if (savedHist) {
    hist = JSON.parse(savedHist)
  }
  hist.push({
    fecha: new Date().toISOString(),
    datos: { ...cantidades },
  })
  localStorage.setItem('historialBotiquinMontania', JSON.stringify(hist))
  historial.value = hist
  alert(
    'Guardado para Montaña: ' +
      JSON.stringify(cantidades, null, 2) +
      '\n\n¡Registro añadido al historial local!',
  )
}

// Al cargar, puedes recuperar el último registro si lo deseas y el historial completo
const savedHist = localStorage.getItem('historialBotiquinMontania')
if (savedHist) {
  const hist = JSON.parse(savedHist)
  historial.value = hist
  const ultimo = hist[hist.length - 1]
  if (ultimo && ultimo.datos) {
    Object.keys(ultimo.datos).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(cantidades, key)) {
        cantidades[key] = ultimo.datos[key]
      }
    })
  }
}
</script>

<style scoped>
.form-grid {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
  padding: 32px 24px;
  max-width: 700px;
  width: 100%;
  overflow: visible;
  margin: 40px auto;
}
.grid-container {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px 32px;
}
.grid-item {
  width: 100%;
}
.page-scroll {
  min-height: 100vh;
  align-items: flex-start;
  overflow-y: auto;
  height: auto;
  max-height: none;
  width: 100vw;
  box-sizing: border-box;
}
.q-layout__section--center {
  overflow: visible !important;
}
.q-page {
  overflow-y: auto !important;
  height: auto !important;
  min-height: 100vh !important;
}
</style>

<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title class="text-white">Botiquín - Opciones</q-toolbar-title>

        <!-- Enlaces del header -->
        <q-btn flat label="Inicio" class="q-ml-md text-white" @click="$router.push('/principal')" />
        <q-btn
          flat
          label="Mis Compras"
          class="q-ml-md text-white"
          @click="$router.push('/historial-compras')"
        />
        <q-btn
          flat
          label="Mis Botiquines"
          class="q-ml-md text-white"
          @click="$router.push('/historial-botiquin')"
        />

        <!-- Enlaces de administrador -->
        <template v-if="isAdmin">
          <q-btn
            flat
            label="Pedidos"
            class="q-ml-md text-white"
            @click="$router.push('/admin-pedidos')"
          />
          <q-btn
            flat
            label="Gestión"
            class="q-ml-md text-white"
            @click="$router.push('/admin-usuarios')"
          />
        </template>

        <q-btn
          flat
          icon="logout"
          label="Cerrar Sesión"
          class="q-ml-md text-white"
          @click="logout"
        />
      </q-toolbar>
    </q-header>

    <q-page-container>
      <q-page class="q-pa-md">
        <div class="text-h4 text-center q-mb-lg">Selecciona el tipo de botiquín</div>

        <!-- Loading spinner -->
        <div v-if="loading" class="flex flex-center q-pa-xl">
          <q-spinner color="primary" size="3em" />
          <div class="text-subtitle1 q-ml-md">Cargando opciones...</div>
        </div>

        <!-- Botiquines options -->
        <div v-else class="button-container">
          <div
            v-for="item in items"
            :key="item.nombre"
            class="button-image"
            :class="{ disabled: item.disabled }"
          >
            <button
              @click="goToFormulario(item.nombre)"
              class="btn-image"
              :class="{ disabled: item.disabled }"
              :disabled="item.disabled"
            >
              <img :src="item.img" :alt="item.nombre" class="img-button" />
              <div v-if="item.disabled" class="disabled-overlay">
                <q-icon name="check_circle" size="40px" color="positive" />
                <div class="text-center q-mt-sm">Ya registrado</div>
              </div>
            </button>
            <div class="name" :class="{ 'text-grey': item.disabled }">{{ item.nombre }}</div>
          </div>
        </div>

        <!-- Información adicional -->
        <div class="info-panel q-mt-xl q-pa-md">
          <q-card flat bordered class="text-center q-pa-md">
            <q-card-section>
              <div class="text-h6">¿Cómo funciona?</div>
              <p class="q-mt-md">
                Selecciona el tipo de botiquín que deseas crear. Una vez creado, podrás gestionar
                los productos que incluye y utilizarlo para recibir recomendaciones personalizadas
                de primeros auxilios.
              </p>
              <q-separator class="q-my-md" />
              <p class="text-caption">
                Nota: Solo puedes tener un botiquín de cada tipo. Los tipos ya registrados
                aparecerán deshabilitados.
              </p>
            </q-card-section>
          </q-card>
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../composables/useAuth.js'
import { useBotiquinDB } from '../composables/useBotiquinDB.js'
import { useQuasar } from 'quasar'

const router = useRouter()
const $q = useQuasar()
const { signOut, isUserAdmin } = useAuth()
const { verificarTiposExistentes } = useBotiquinDB()

// Estados reactivos
const loading = ref(true)
const tiposExistentes = ref([])
const isAdmin = ref(false)

const items = ref([
  {
    nombre: 'Hogar',
    tipo: 'hogar',
    img: new URL('../pages/ImagenesTipos/Home.png', import.meta.url).href,
    disabled: false,
  },
  {
    nombre: 'Oficina',
    tipo: 'oficina',
    img: new URL('../pages/ImagenesTipos/Office.png', import.meta.url).href,
    disabled: false,
  },
  {
    nombre: 'Escuelas',
    tipo: 'escolar',
    img: new URL('../pages/ImagenesTipos/School.png', import.meta.url).href,
    disabled: false,
  },
  {
    nombre: 'Industrias',
    tipo: 'industria',
    img: new URL('../pages/ImagenesTipos/industrie.png', import.meta.url).href,
    disabled: false,
  },
  {
    nombre: 'Montaña',
    tipo: 'montaña',
    img: new URL('../pages/ImagenesTipos/Montain.png', import.meta.url).href,
    disabled: false,
  },
])

// Verificar tipos existentes al montar el componente
onMounted(async () => {
  try {
    loading.value = true
    console.log('🚀 Iniciando carga de BotiquinOpcionPage...')

    // Verificar si es administrador - usando localStorage directamente
    console.log('🔍 Verificando estado de admin en BotiquinOpciones...')
    const tipoUsuario = localStorage.getItem('tipo_usuario')
    isAdmin.value = tipoUsuario === 'admin'
    console.log('✅ Verificación admin en BotiquinOpciones:', isAdmin.value, '- tipo:', tipoUsuario)

    // BYPASS COMPLETO PARA ADMINISTRADORES
    if (isAdmin.value) {
      console.log('🔧 Usuario admin detectado - bypass completo de validaciones')
      tiposExistentes.value = []

      // Administradores pueden registrar cualquier tipo sin restricciones
      items.value.forEach((item) => {
        item.disabled = false
      })

      console.log('✅ Configuración de admin completada - sin validaciones')
    } else {
      // Solo para usuarios normales - verificar tipos existentes
      console.log('👤 Usuario normal - aplicando validaciones de duplicados')

      try {
        console.log('🔍 Verificando tipos existentes para usuario normal...')
        const existentes = await Promise.race([
          verificarTiposExistentes(),
          new Promise((resolve) => {
            setTimeout(() => {
              console.log('⏱️ Timeout en verificación de tipos - continuando sin validación')
              resolve([])
            }, 2000) // Reducido a 2 segundos
          }),
        ])

        tiposExistentes.value = existentes || []

        // Marcar como deshabilitados los tipos ya registrados
        items.value.forEach((item) => {
          item.disabled = existentes.some((tipo) => tipo.toLowerCase() === item.tipo.toLowerCase())
        })

        console.log('✅ Tipos verificados para usuario normal:', {
          existentes,
          itemsActualizados: items.value,
        })
      } catch (tiposError) {
        console.error('❌ Error verificando tipos (no crítico):', tiposError)
        // Continuar sin bloquear la UI
        tiposExistentes.value = []

        $q.notify({
          type: 'warning',
          message: 'No se pudieron verificar los botiquines existentes',
          caption: 'Podrás registrar normalmente, pero no se validarán duplicados',
          timeout: 3000,
        })
      }
    }
  } catch (error) {
    console.error('❌ Error general en onMounted:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar la página',
      caption: error.message,
    })
  } finally {
    loading.value = false
    console.log('🏁 Carga de BotiquinOpcionPage completada')
  }
})

function goToFormulario(nombre) {
  // Encontrar el item correspondiente
  const item = items.value.find((i) => i.nombre === nombre)

  if (item?.disabled) {
    $q.notify({
      type: 'warning',
      message: `Ya tienes registrado un botiquín de tipo "${nombre}"`,
      caption: 'Solo puedes tener un botiquín de cada tipo',
    })
    return
  }

  router.push({
    path: '/botiquin-formulario',
    query: { tipo: item.tipo },
  })
}

// Función para cerrar sesión
const logout = async () => {
  try {
    const result = await signOut()
    if (result.success) {
      router.push('/')
    }
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
  }
}
</script>

<style scoped>
.button-container {
  display: flex;
  flex-wrap: wrap;
  gap: 30px;
  justify-content: center;
  margin-top: 40px;
  align-items: center;
}
.button-image {
  position: relative;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  margin: 10px;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.button-image:hover:not(.disabled) {
  transform: scale(1.2);
  box-shadow: 0 6px 25px rgba(0, 0, 0, 0.3);
}
.btn-image {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  outline: none;
  position: relative;
}

.btn-image.disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.img-button {
  width: 120px;
  height: 140px;
  object-fit: cover;
  border-radius: 12px;
  transition: transform 0.3s ease;
  border: 3px solid #90caf9;
}

.btn-image.disabled .img-button {
  border-color: #ccc;
  filter: grayscale(0.5);
}

.img-button:active:not(.disabled) {
  transform: scale(0.95);
}

.disabled-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border-radius: 12px;
  color: #4caf50;
  font-weight: bold;
}

.name {
  font-size: 1.1rem;
  font-weight: 500;
  text-align: center;
  margin-top: 0.5rem;
  color: #333;
}

.name.text-grey {
  color: #999;
}

.info-panel {
  max-width: 400px;
  margin: 0 auto;
}
</style>

<!-- Archivo eliminado: Página antigua de opciones de Botiquín. El flujo ahora es único y está en BotiquinFrmEscolar.vue. -->

<template>
  <!--
    Panel de Recomendaciones con ChatBot contextual

    Funcionalidades implementadas:
    - Generación de recomendaciones basadas en tipo de accidente y botiquín disponible
    - Almacenamiento interno de recomendaciones (no en archivos)
    - Limpieza automática de recomendaciones al cerrar sesión o cambiar de página
    - Integración con ChatBot contextual que usa las recomendaciones como base
    - Selección de botiquín desde el historial del usuario
    - Formato visual mejorado para las recomendaciones
    - Persistencia temporal en localStorage
    - Métodos para obtener, guardar y limpiar recomendaciones
  -->
  <div class="recommendation-container">
    <!-- Close button -->
    <button class="close-button" @click="$emit('close')">&times;</button>

    <!-- Content of the panel -->
    <div class="panel-content">
      <h2>Recomendaciones</h2>
      <p>Accidente seleccionado: {{ accident }}</p>
    </div>

    <!-- Additional container -->
    <div
      class="additional-container"
      :class="{ chatbotOpen: isChatbotOpen, chatbotClosed: !isChatbotOpen }"
    >
      <!-- Input fields for accident and botiquin -->
      <div class="input-section">
        <label for="accident">Tipo de accidente:</label>
        <div class="accident-display">{{ accident || 'No especificado' }}</div>

        <label for="botiquin-selector">Seleccionar botiquín del historial:</label>
        <select
          id="botiquin-selector"
          v-model="botiquinSeleccionado"
          @change="actualizarBotiquinSeleccionado"
          class="botiquin-selector"
        >
          <option value="">Seleccionar botiquín...</option>
          <option
            v-for="botiquin in botiquinesDisponibles"
            :key="botiquin.id_registro"
            :value="botiquin"
          >
            Botiquín {{ botiquin.tipos.join(', ') }} - {{ botiquin.fecha }} ({{
              botiquin.totalItems
            }}
            items)
          </option>
        </select>

        <label for="botiquin">Items en el botiquín seleccionado:</label>
        <textarea
          id="botiquin"
          v-model="botiquinItems"
          placeholder="Selecciona un botiquín del historial o describe manualmente los elementos"
          readonly
        ></textarea>

        <button @click="getRecommendations" :disabled="isLoading">
          {{ isLoading ? 'Cargando...' : 'Obtener Recomendaciones' }}
        </button>
      </div>

      <!-- Container for API response steps -->
      <div class="response-section">
        <h3>Pasos a seguir:</h3>
        <p v-if="steps.length === 0 && !isLoading">Las recomendaciones aparecerán aquí.</p>
        <div v-else v-html="steps.join('')"></div>
      </div>
    </div>

    <!-- Chatbot icon -->
    <img
      v-if="!isChatbotOpen"
      src="./chat.png"
      alt="Chatbot Icon"
      class="chatbot-icon"
      @click="toggleChatbot"
    />

    <!-- Chatbot component -->
    <ChatBot
      v-if="isChatbotOpen"
      ref="chatbot"
      @chatbotClosed="handleChatbotClosed"
      :recomendacionesContext="recomendacionesGuardadas"
    />
  </div>
</template>

<script>
import ChatBot from './ChatBot.vue'
import { useBotiquinDB } from '../../composables/useBotiquinDB.js'
import { useAuth } from '../../composables/useAuth.js'

export default {
  name: 'RecomendacionPanel',
  props: {
    accident: {
      type: String,
      default: '',
    },
  },
  components: {
    ChatBot,
  },
  setup() {
    const { historialInventarios, cargarHistorialInventarios } = useBotiquinDB()
    const { user } = useAuth()
    return { historialInventarios, cargarHistorialInventarios, user }
  },
  data() {
    return {
      isChatbotOpen: false, // Chatbot is hidden by default
      isLoading: false, // Estado para el indicador de carga
      accidentDescription: this.accident,
      botiquinItems: '',
      steps: [],
      botiquinSeleccionado: null, // Para el dropdown de selección de botiquín
      botiquinesDisponibles: [], // Lista de botiquines del historial
      userWatcher: null, // Watcher para detectar cambios en la sesión
      recomendacionesGuardadas: null, // Almacenar las recomendaciones aquí
    }
  },
  async mounted() {
    // Cargar historial de botiquines al montar el componente
    await this.cargarBotiquines()

    // Cargar recomendaciones guardadas si existen
    this.cargarRecomendacionesGuardadas()

    // Configurar watcher para detectar cierre de sesión
    this.configurarWatcherSesion()

    // Configurar listener para cambios de página
    this.configurarListenerCambioPagina()
  },
  beforeUnmount() {
    // Limpiar watcher al desmontar componente
    if (this.userWatcher) {
      this.userWatcher()
    }

    // Borrar recomendaciones al cambiar de página
    this.vaciarRecomendaciones()
    console.log('Componente desmontado - recomendaciones borradas')
  },
  methods: {
    async cargarBotiquines() {
      try {
        await this.cargarHistorialInventarios()

        // Procesar historial para el dropdown
        this.botiquinesDisponibles = this.historialInventarios.map((inventario) => {
          const tipos = this.getTiposUnicos(inventario.detalle_inventario)
          const fecha = this.formatearFecha(inventario.fecha_registro)
          const totalItems = inventario.detalle_inventario.length

          return {
            id_registro: inventario.id_registro,
            tipos,
            fecha,
            totalItems,
            inventario,
            items: inventario.detalle_inventario,
          }
        })

        console.log('Botiquines disponibles:', this.botiquinesDisponibles)
      } catch (error) {
        console.error('Error cargando botiquines:', error)
      }
    },

    getTiposUnicos(detalles) {
      const tipos = [...new Set(detalles.map((d) => d.tipo_kit))]
      return tipos.map((tipo) => {
        const nombres = {
          hogar: 'Hogar',
          oficina: 'Oficina',
          escolar: 'Escolar',
          industria: 'Industria',
          montania: 'Montaña',
          montaña: 'Montaña',
        }
        return nombres[tipo] || tipo
      })
    },

    formatearFecha(fecha) {
      return new Date(fecha).toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    },

    actualizarBotiquinSeleccionado() {
      if (this.botiquinSeleccionado) {
        // Convertir items del botiquín a texto
        const itemsTexto = this.botiquinSeleccionado.items
          .map((item) => `${item.nombre_item} (cantidad: ${item.cantidad})`)
          .join(', ')

        this.botiquinItems = itemsTexto
        console.log('Botiquín seleccionado:', itemsTexto)
      } else {
        this.botiquinItems = ''
      }
    },

    guardarRecomendaciones(respuesta) {
      // Crear objeto con toda la información de las recomendaciones
      const recomendacionesData = {
        accidente: this.accident,
        botiquinItems: this.botiquinItems,
        fecha: new Date().toLocaleString('es-ES'),
        respuestaHTML: respuesta,
        respuestaTexto: respuesta.replace(/<[^>]*>/g, ''),
        timestamp: Date.now(),
      }

      // Guardar en la variable del componente
      this.recomendacionesGuardadas = recomendacionesData

      // También guardarlo en localStorage para persistencia
      localStorage.setItem('recomendacionesActuales', JSON.stringify(recomendacionesData))

      console.log('Recomendaciones guardadas:', recomendacionesData)
    },

    // Método para vaciar las recomendaciones cuando se cierre sesión
    vaciarRecomendaciones() {
      try {
        // Limpiar variable del componente
        this.recomendacionesGuardadas = null

        // Limpiar localStorage
        localStorage.removeItem('recomendacionesActuales')

        // Limpiar contexto del ChatBot si está abierto
        if (this.$refs.chatbot) {
          this.$refs.chatbot.clearContext()
        }

        console.log('Recomendaciones vaciadas al cerrar sesión')
      } catch (error) {
        console.error('Error vaciando recomendaciones:', error)
      }
    },

    // Método para obtener las recomendaciones guardadas
    obtenerRecomendaciones() {
      return this.recomendacionesGuardadas
    },

    // Método para cargar recomendaciones desde localStorage al iniciar
    cargarRecomendacionesGuardadas() {
      try {
        const data = localStorage.getItem('recomendacionesActuales')
        if (data) {
          this.recomendacionesGuardadas = JSON.parse(data)
          console.log('Recomendaciones cargadas desde localStorage:', this.recomendacionesGuardadas)
        }
      } catch (error) {
        console.error('Error cargando recomendaciones:', error)
      }
    },

    // Configurar watcher para detectar cambios en la sesión del usuario
    configurarWatcherSesion() {
      // Usando Vue's watch para observar cambios en el usuario
      this.userWatcher = this.$watch(
        'user',
        (newUser, oldUser) => {
          // Si el usuario se desloguea (pasa de tener usuario a no tenerlo)
          if (oldUser && !newUser) {
            console.log('Sesión cerrada, vaciando recomendaciones')
            this.vaciarRecomendaciones()
          }
        },
        { immediate: false },
      )

      // Escuchar eventos personalizados de logout
      window.addEventListener('userLoggedOut', () => {
        console.log('Evento de logout detectado, vaciando recomendaciones')
        this.vaciarRecomendaciones()
      })
    },

    // Configurar listener para detectar cambios de página
    configurarListenerCambioPagina() {
      // Detectar cuando se navega a otra página
      window.addEventListener('beforeunload', () => {
        console.log('Cambiando de página, vaciando recomendaciones')
        this.vaciarRecomendaciones()
      })

      // También escuchar cambios de ruta si está usando Vue Router
      if (this.$router) {
        this.$router.beforeEach((to, from, next) => {
          if (from.path !== to.path) {
            console.log('Cambio de ruta detectado, vaciando recomendaciones')
            this.vaciarRecomendaciones()
          }
          next()
        })
      }

      // Detectar cuando el usuario cierra la pestaña/ventana
      window.addEventListener('pagehide', () => {
        console.log('Página oculta, vaciando recomendaciones')
        this.vaciarRecomendaciones()
      })

      // Detectar navegación usando el historial del navegador
      window.addEventListener('popstate', () => {
        console.log('Navegación con historial detectada, vaciando recomendaciones')
        this.vaciarRecomendaciones()
      })
    },
    toggleChatbot() {
      this.isChatbotOpen = !this.isChatbotOpen
    },
    handleChatbotClosed() {
      this.isChatbotOpen = false
    },
    async getRecommendations() {
      this.isLoading = true // Activar indicador de carga
      const apiUrl =
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDtA-kE3js3rimDTGsTRlXgcNPAK651Aq8'
      const payload = {
        contents: [
          {
            parts: [
              {
                text: `Accidente: ${this.accident}. Botiquín disponible: ${this.botiquinItems}. Proporciona recomendaciones de primeros auxilios paso a paso.`,
              },
            ],
          },
        ],
      }

      console.log('Botón presionado, payload:', payload) // Log para verificar el payload

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        if (!response.ok) {
          throw new Error(`Error HTTP! estado: ${response.status}`)
        }

        const data = await response.json()
        console.log('Respuesta de la API:', data) // Log para verificar la respuesta

        if (data.candidates && data.candidates.length > 0) {
          this.steps = data.candidates[0].content.parts.map((part) => {
            // Formatear cada paso según el estilo proporcionado
            let formattedStep = part.text

            // Formatear texto en negrita
            if (formattedStep.includes('**')) {
              formattedStep = formattedStep.replace(
                /\*\*(.*?)\*\*/g,
                '<strong class="highlight">$1</strong>',
              )
            }

            // Formatear texto en cursiva
            if (formattedStep.includes('_')) {
              formattedStep = formattedStep.replace(/_(.*?)_/g, '<em class="italic-text">$1</em>')
            }

            // Detectar y formatear números seguidos de punto (pasos numerados)
            formattedStep = formattedStep.replace(
              /(\d+)\.\s/g,
              '<div class="step-break"></div><div class="step-number">$1.</div> ',
            )

            // Formatear títulos principales (palabras en mayúsculas seguidas de dos puntos)
            formattedStep = formattedStep.replace(
              /([A-ZÁÉÍÓÚÑ][A-ZÁÉÍÓÚÑ\s]+):/g,
              '<h4 class="section-title">$1:</h4>',
            )

            // Formatear subtítulos con asterisco
            formattedStep = formattedStep.replace(
              /\* ([^:]+):/g,
              '<div class="subsection-title">• $1:</div>',
            )

            // Agregar saltos de línea antes de palabras clave importantes
            formattedStep = formattedStep.replace(
              /(Prioridad:|Pasos:|Consideraciones importantes:|En resumen:)/g,
              '<div class="section-break"></div><h3 class="main-title">$1</h3>',
            )

            // Formatear puntos con asterisco simple
            formattedStep = formattedStep.replace(
              /\* ([^*]+)/g,
              '<div class="bullet-point">• $1</div>',
            )

            // Agregar espaciado después de puntos finales
            formattedStep = formattedStep.replace(/\. ([A-Z])/g, '. <br><br>$1')

            return `<div class="formatted-step">${formattedStep}</div>`
          })
          console.log('Pasos formateados:', this.steps) // Log para verificar los pasos formateados

          // Guardar las recomendaciones
          const respuestaCompleta = this.steps.join('')
          this.guardarRecomendaciones(respuestaCompleta)
        } else {
          console.warn('No se encontraron candidatos en la respuesta:', data)
          this.steps = ['<p>No se encontraron recomendaciones.</p>']
        }
      } catch (error) {
        console.error('Error al obtener recomendaciones:', error)
        this.steps = [`<p>Hubo un error al obtener las recomendaciones: ${error.message}</p>`]
      } finally {
        this.isLoading = false // Desactivar indicador de carga
      }
    },
  },
}
</script>

<style scoped>
.recommendation-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  height: 80%;
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 10px;
  z-index: 1001;
  overflow: hidden; /* Prevent overflow issues */
}

.close-button {
  position: absolute;
  top: 10px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.panel-content {
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 20px;
}

.ChatBot {
  position: absolute; /* Ensure it stays within the container */
  bottom: 0; /* Position it fully below the chat icon */
  right: 20px;
  width: 520px;
  height: calc(100% - 80px); /* Adjust height to avoid overlap */
  z-index: 1000; /* Lower than the chat icon */
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.chatbot-icon {
  position: absolute; /* Ensure it stays within the container */
  bottom: 20px;
  right: 20px;
  width: 50px;
  height: 50px;
  cursor: pointer;
  z-index: 1002; /* Higher than the ChatBot component */
}

.input-section {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 5px;
  margin-top: 15px;
  font-weight: bold;
  color: #333;
  font-size: 1rem;
}

label:first-child {
  margin-top: 0;
}

.accident-display {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 2px solid #4caf50;
  border-radius: 4px;
  background-color: #e8f5e8;
  color: #2e7d32;
  font-weight: bold;
  font-size: 1.1rem;
  text-align: center;
}

.botiquin-selector {
  width: 100%;
  padding: 10px;
  margin-bottom: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #f9f9f9;
  color: #333;
}

.botiquin-selector:focus {
  outline: none;
  border-color: #00bfff;
  box-shadow: 0 0 5px rgba(0, 191, 255, 0.3);
}

textarea {
  width: 100%;
  height: 100px;
  margin-bottom: 10px;
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
  font-size: 1rem;
  background-color: #f0f8ff;
  color: #333;
  resize: vertical;
}

textarea[readonly] {
  background-color: #f5f5f5;
  color: #666;
  cursor: not-allowed;
}

textarea::placeholder {
  color: #888;
}

button {
  padding: 10px 20px;
  background-color: #00bfff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1.1rem;
  font-weight: bold;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #008fcc;
}

.response-section {
  margin-top: 20px;
  max-height: 300px;
  overflow-y: auto;
  padding: 15px;
  border: 3px solid #ff4500;
  background-color: #fff5e6;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.response-section h3 {
  color: #ff4500;
  font-size: 1.5rem;
  margin-bottom: 10px;
  text-align: center;
}

/* Estilos para formateo mejorado de recomendaciones */
.formatted-step {
  line-height: 1.6;
  font-size: 1rem;
}

.main-title {
  color: #d32f2f;
  font-size: 1.3rem;
  font-weight: bold;
  margin: 15px 0 10px 0;
  padding: 8px 12px;
  background: linear-gradient(135deg, #ffebee 0%, #ffcdd2 100%);
  border-left: 4px solid #d32f2f;
  border-radius: 6px;
}

.section-title {
  color: #1976d2;
  font-size: 1.1rem;
  font-weight: bold;
  margin: 12px 0 6px 0;
  padding: 6px 10px;
  background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 100%);
  border-left: 3px solid #1976d2;
  border-radius: 4px;
}

.subsection-title {
  color: #388e3c;
  font-weight: bold;
  margin: 8px 0 4px 15px;
  padding: 4px 8px;
  background-color: #e8f5e9;
  border-radius: 4px;
  border-left: 2px solid #388e3c;
}

.step-number {
  display: inline-block;
  background: linear-gradient(135deg, #ff6f00 0%, #ff8f00 100%);
  color: white;
  font-weight: bold;
  font-size: 1.1rem;
  padding: 6px 12px;
  border-radius: 20px;
  margin: 8px 5px 8px 0;
  box-shadow: 0 2px 4px rgba(255, 111, 0, 0.3);
}

.step-break {
  margin: 15px 0 5px 0;
}

.section-break {
  margin: 20px 0 10px 0;
}

.bullet-point {
  margin: 6px 0 6px 20px;
  padding: 4px 8px;
  background-color: #f3e5f5;
  border-left: 2px solid #9c27b0;
  border-radius: 3px;
}

.highlight {
  background: linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%);
  color: #e65100;
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: bold;
  border: 1px solid #ffcc02;
}

.italic-text {
  color: #5d4037;
  font-style: italic;
  background-color: #efebe9;
  padding: 1px 4px;
  border-radius: 3px;
}

.response-section ul {
  list-style-type: none;
  padding: 0;
}

.response-section li {
  margin-bottom: 15px;
  font-size: 1.2rem;
  line-height: 1.8;
  color: #333;
  background-color: #fefefe;
  padding: 10px;
  border-radius: 8px;
  border-left: 5px solid #00bfff;
}

.response-section li .step-number {
  color: #ff4500;
  font-weight: bold;
  font-size: 1.3rem;
}

.response-section li .bold-text {
  color: #d9534f;
  font-weight: bold;
}

.additional-container {
  position: absolute; /* Anchor the container within the parent */
  left: 0; /* Ensure it stays anchored to the left */
  width: 100%; /* Default width */
  height: 100%;
  border: 2px solid red;
  padding: 10px;
  background-color: #fff;
  overflow-y: auto;
  transition: width 0.3s ease; /* Smooth transition for width changes */
}

.additional-container.chatbotOpen {
  width: calc(100% - 520px); /* Reduce width when chatbot is open */
}

.additional-container.chatbotClosed {
  width: 100%; /* Reset width when chatbot is closed */
}
</style>

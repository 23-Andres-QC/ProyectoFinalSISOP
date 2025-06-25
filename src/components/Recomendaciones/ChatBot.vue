<template>
  <!--
    ChatBot contextual para recomendaciones de primeros auxilios

    Características implementadas:
    - Recibe contexto de recomendaciones anteriores como prop (recomendacionesContext)
    - Fallback a localStorage si no se proporciona el prop
    - Siempre usa las recomendaciones anteriores como contexto para nuevas consultas
    - Indicador visual cuando tiene contexto disponible
    - Mensajes de bienvenida contextuales
    - Respuesta directa a consultas sobre el contexto disponible
    - Limpieza automática del contexto cuando se borran las recomendaciones
    - Watch reactivo para detectar cambios en las recomendaciones
  -->
  <div v-if="!isClosed" class="chatbot-wrapper" :class="{ minimized: isMinimized }">
    <div class="chatbot-header">
      <div class="header-content">
        <h2 class="chatbot-title">CONSULTAR</h2>
        <div v-if="hasRecommendationContext" class="context-indicator">
          📋 Con contexto de recomendaciones
        </div>
      </div>
      <div class="chatbot-controls">
        <button @click="newChat" class="control-button">+</button>
        <button @click="minimizeChat" class="control-button">-</button>
        <button @click="closeChat" class="control-button">×</button>
      </div>
    </div>
    <div v-if="!isMinimized" class="chatbot-messages" ref="messagesContainer">
      <div v-for="(message, index) in messages" :key="index" :class="message.type">
        <div v-if="message.type === 'loading'" class="loading-message">
          <div class="loading-spinner"></div>
          <p>Cargando respuesta...</p>
        </div>
        <p v-else>{{ message.text }}</p>
      </div>
    </div>
    <div v-if="!isMinimized" class="chatbot-input">
      <input v-model="userInput" type="text" placeholder="Enter your message..." />
      <button @click="sendMessage" class="send-button">▶</button>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    recomendacionesContext: {
      type: Object,
      default: null,
    },
  },
  computed: {
    hasRecommendationContext() {
      return this.recomendacionesContext || localStorage.getItem('recomendacionesActuales')
    },
  },
  data() {
    return {
      messages: [],
      userInput: '',
      isMinimized: false,
      isClosed: false,
      isLoading: false,
    }
  },
  mounted() {
    // Verificar si hay contexto de recomendaciones al inicializar
    const hasContext =
      this.recomendacionesContext || localStorage.getItem('recomendacionesActuales')

    if (hasContext) {
      this.messages = [
        {
          text: '¡Hola! Tengo tus recomendaciones anteriores. ¿En qué puedo ayudarte?',
          type: 'bot',
        },
      ]
    } else {
      this.messages = [
        {
          text: '¡Hola! ¿En qué puedo ayudarte?',
          type: 'bot',
        },
      ]
    }
  },
  methods: {
    newChat() {
      // Verificar si hay contexto de recomendaciones al reiniciar
      const hasContext =
        this.recomendacionesContext || localStorage.getItem('recomendacionesActuales')

      if (hasContext) {
        this.messages = [
          {
            text: 'Chat reiniciado. Tengo tus recomendaciones. ¿Qué necesitas?',
            type: 'bot',
          },
        ]
      } else {
        this.messages = [
          {
            text: '¡Hola! ¿En qué puedo ayudarte?',
            type: 'bot',
          },
        ]
      }
    },
    minimizeChat() {
      this.isMinimized = !this.isMinimized
    },
    closeChat() {
      this.isClosed = true
      this.$emit('chatbotClosed') // Emit signal to parent component
    },
    async sendMessage() {
      if (this.userInput.trim() === '') return

      // Verificar si el usuario pregunta por el contexto disponible
      const contextQueries = [
        'contexto',
        'información disponible',
        'recomendaciones anteriores',
        'qué sabes',
        'info anterior',
      ]
      const isContextQuery = contextQueries.some((query) =>
        this.userInput.toLowerCase().includes(query),
      )

      this.messages.push({ text: this.userInput, type: 'user' })
      const userQuery = this.userInput
      this.userInput = ''

      this.scrollToBottom()

      // Si es una consulta sobre el contexto, responder directamente
      if (isContextQuery && this.hasRecommendationContext) {
        let recomendaciones = this.recomendacionesContext
        if (!recomendaciones) {
          const storedRecommendations = localStorage.getItem('recomendacionesActuales')
          if (storedRecommendations) {
            recomendaciones = JSON.parse(storedRecommendations)
          }
        }

        if (recomendaciones) {
          const contextInfo = `📋 Accidente: ${recomendaciones.accidente}
🏥 Botiquín: ${recomendaciones.botiquinItems}
⏰ Generado: ${recomendaciones.fecha}

Pregúntame sobre los pasos, alternativas o detalles específicos.`

          this.messages.push({ text: contextInfo, type: 'bot' })
          this.scrollToBottom()
          return
        }
      }

      this.isLoading = true
      this.messages.push({ text: 'Cargando respuesta...', type: 'loading' })

      try {
        // Construir el contexto con las recomendaciones anteriores
        let contextualQuery = userQuery

        // Obtener recomendaciones del localStorage si no se pasaron como prop
        let recomendaciones = this.recomendacionesContext
        if (!recomendaciones) {
          const storedRecommendations = localStorage.getItem('recomendacionesActuales')
          if (storedRecommendations) {
            recomendaciones = JSON.parse(storedRecommendations)
          }
        }

        // Si hay recomendaciones previas, usarlas como contexto
        if (recomendaciones) {
          contextualQuery = `CONTEXTO:
- Accidente: ${recomendaciones.accidente}
- Botiquín: ${recomendaciones.botiquinItems}
- Recomendaciones previas: ${recomendaciones.respuestaTexto}

PREGUNTA: ${userQuery}

INSTRUCCIONES: Responde de forma BREVE y CONCISA (máximo 3-4 líneas). Usa el contexto previo. Sé directo y práctico.`
        }

        const response = await fetch(
          'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyCAs6NqVsQZbabPN121hQOzlc5sbmjk5Nc',
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  parts: [
                    {
                      text: contextualQuery,
                    },
                  ],
                },
              ],
            }),
          },
        )

        if (!response.ok) {
          throw new Error(`Error en la API: ${response.status} ${response.statusText}`)
        }

        const data = await response.json()

        this.messages = this.messages.filter((msg) => msg.type !== 'loading')
        const botResponse =
          data.candidates?.[0]?.content?.parts?.[0]?.text ||
          'Lo siento, no pude procesar tu solicitud.'
        this.messages.push({ text: botResponse, type: 'bot' })

        this.scrollToBottom()
      } catch (error) {
        this.messages = this.messages.filter((msg) => msg.type !== 'loading')
        this.messages.push({ text: `Hubo un error: ${error.message}`, type: 'bot' })

        this.scrollToBottom()
      } finally {
        this.isLoading = false
      }
    },
    scrollToBottom() {
      this.$nextTick(() => {
        const container = this.$refs.messagesContainer
        container.scrollTop = container.scrollHeight
      })
    },
    // Método para limpiar el contexto cuando se borren las recomendaciones
    clearContext() {
      this.messages = [
        {
          text: '¡Hola! ¿En qué puedo ayudarte?',
          type: 'bot',
        },
      ]
    },
  },
  watch: {
    recomendacionesContext: {
      handler(newValue) {
        // Cuando se reciben nuevas recomendaciones, actualizar el mensaje de bienvenida
        if (
          newValue &&
          this.messages.length === 1 &&
          this.messages[0].text.includes('We are online!')
        ) {
          this.messages = [
            {
              text: 'Perfecto! Ahora tengo tus recomendaciones. ¿Qué necesitas saber?',
              type: 'bot',
            },
          ]
        }
      },
      immediate: true,
    },
  },
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');

.chatbot-wrapper {
  position: fixed;
  bottom: 20px;
  right: 20px;
  width: 500px;
  height: 600px;
  background-color: #fff;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
}

.chatbot-wrapper.minimized {
  height: auto;
}

.chatbot-header {
  background-color: #6a1b9a;
  color: #fff;
  padding: 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top-left-radius: 10px;
  border-top-right-radius: 10px;
  font-family: 'Roboto', sans-serif;
}

.header-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.chatbot-title {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.context-indicator {
  font-size: 12px;
  background-color: rgba(255, 255, 255, 0.2);
  padding: 3px 8px;
  border-radius: 12px;
  margin-top: 4px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.chatbot-controls {
  display: flex;
  gap: 10px;
}

.control-button {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  background-color: #4a148c;
  color: #fff;
  font-size: 24px;
  border: none;
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
}

.control-button:hover {
  background-color: #6a1b9a;
}

.chatbot-messages {
  padding: 10px;
  overflow-y: auto;
  flex-grow: 1;
}

.chatbot-messages .user {
  text-align: right;
  background-color: #e0f7fa;
  padding: 10px;
  border-radius: 10px;
  margin: 5px 0;
  max-width: 100%;
  align-self: flex-end;
}

.chatbot-messages .bot {
  text-align: left;
  background-color: #6a1b9a;
  color: #fff;
  padding: 10px;
  border-radius: 10px;
  margin: 5px 0;
  max-width: 70%;
  align-self: flex-start;
}

.chatbot-input {
  display: flex;
  padding: 10px;
  border-top: 1px solid #ddd;
}

.chatbot-input input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-family: 'Roboto', sans-serif;
}

.chatbot-input .send-button {
  background-color: #6a1b9a;
  color: #fff;
  border: none;
  padding: 10px;
  border-radius: 5px;
  margin-left: 10px;
  cursor: pointer;
  font-family: 'Roboto', sans-serif;
}

.chatbot-input .send-button:hover {
  background-color: #4a148c;
}

.loading-message {
  display: flex;
  align-items: center;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #003a9b;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  animation: spin 1s linear infinite;
  margin-right: 10px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}
</style>

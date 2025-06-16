<template>
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
        <label for="accident">¿Qué accidente tienes?</label>
        <textarea
          id="accident"
          v-model="accidentDescription"
          placeholder="Describe el accidente"
        ></textarea>

        <label for="botiquin">¿Qué tienes en tu botiquín?</label>
        <textarea
          id="botiquin"
          v-model="botiquinItems"
          placeholder="Lista los elementos de tu botiquín"
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
    <ChatBot v-if="isChatbotOpen" @chatbotClosed="handleChatbotClosed" />
  </div>
</template>

<script>
import ChatBot from './ChatBot.vue'

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
  data() {
    return {
      isChatbotOpen: false, // Chatbot is hidden by default
      isLoading: false, // Estado para el indicador de carga
      accidentDescription: this.accident,
      botiquinItems: '',
      steps: [],
    }
  },
  methods: {
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
                text: `Accidente: ${this.accidentDescription}. Botiquín: ${this.botiquinItems}`,
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
            if (formattedStep.includes('**')) {
              formattedStep = formattedStep.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            }
            if (formattedStep.includes('_')) {
              formattedStep = formattedStep.replace(/_(.*?)_/g, '<em>$1</em>')
            }
            return `<p>${formattedStep}</p>` // Separar cada paso con punto y aparte
          })
          console.log('Pasos formateados:', this.steps) // Log para verificar los pasos formateados
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

<template>
  <div class="recommendation-container">
    <!-- Content of the panel -->
    <div class="panel-content">
      <p>Aquí puedes agregar contenido relacionado con las recomendaciones.</p>
    </div>
    <!-- Chatbot icon -->
    <img src="./chat.png" alt="Chatbot Icon" class="chatbot-icon" @click="toggleChatbot" />
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

        <button @click="getRecommendations">Obtener Recomendaciones</button>
      </div>

      <!-- Container for API response steps -->
      <div class="response-section">
        <h3>Pasos a seguir:</h3>
        <p v-if="steps.length === 0">Las recomendaciones aparecerán aquí.</p>
        <ul v-else>
          <li v-for="(step, index) in steps" :key="index" v-html="formatStep(step)"></li>
        </ul>
      </div>
    </div>
    <!-- Chatbot component -->
    <ChatBot v-if="isChatbotOpen" @chatbotClosed="handleChatbotClosed" />
  </div>
</template>

<script>
import ChatBot from './ChatBot.vue'

export default {
  name: 'RecommendationPanel',
  components: {
    ChatBot,
  },
  data() {
    return {
      isChatbotOpen: false,
      accidentDescription: '',
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
      const apiUrl =
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyDtA-kE3js3rimDTGsTRlXgcNPAK651Aq8'
      const payload = {
        contents: [
          {
            parts: [
              { text: `Accidente: ${this.accidentDescription}. Botiquín: ${this.botiquinItems}` },
            ],
          },
        ],
      }

      try {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(payload),
        })

        const data = await response.json()
        this.steps = data.candidates[0].content.parts.map((part) => part.text)
      } catch (error) {
        console.error('Error fetching recommendations:', error)
      }
    },
    formatStep(step) {
      // Add formatting for better visibility
      return step
        .replace(/\d+\./g, '<br><span class="step-number">$&</span>') // Highlight numbered steps
        .replace(/\*\*(.*?)\*\*/g, '<span class="bold-text">$1</span>') // Bold for text wrapped in **
    },
  },
}
</script>

<style scoped>
.recommendation-container {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 1800px;
  height: 700px;
  max-width: 100%;
  max-height: 80%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  border: 4px solid #00bfff;
  border-radius: 8px;
  padding: 20px;
}

.panel-content {
  font-size: 1.2rem;
  text-align: center;
  margin-bottom: 20px;
}

.chatbot-icon {
  position: absolute;
  bottom: 20px; /* Position near the bottom */
  right: 20px; /* Position near the right corner */
  width: 50px; /* Adjust size */
  height: 50px; /* Adjust size */
  cursor: pointer; /* Indicate interactivity */
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
  position: absolute;
  top: 0;
  left: 0;
  height: 100%; /* Matches the height of the parent container */
  width: calc(100% - 120px); /* Default width leaving more space for the chatbot icon */
  border: 2px solid red; /* Red border */
  padding: 10px;
  background-color: #fff;
  overflow-y: auto;
  transition: width 0.3s ease; /* Smooth transition for width changes */
}

.additional-container.chatbotOpen {
  width: calc(100% - 510px); /* Adjust width when chatbot is open */
}

.additional-container.chatbotClosed {
  width: calc(100% - 150px); /* Reset width when chatbot is closed */
}
</style>

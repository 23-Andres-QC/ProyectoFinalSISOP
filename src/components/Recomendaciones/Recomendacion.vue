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
      <p>Este es el contenido adicional que aparece cuando el chatbot está cerrado o abierto.</p>
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
    }
  },
  methods: {
    toggleChatbot() {
      this.isChatbotOpen = !this.isChatbotOpen
    },
    handleChatbotClosed() {
      this.isChatbotOpen = false
    },
  },
}
</script>

<style scoped>
.recommendation-container {
  position: absolute; /* Changed to absolute for centering */
  top: 50%; /* Center vertically */
  left: 50%; /* Center horizontally */
  transform: translate(-50%, -50%); /* Adjust for centering */
  width: 1800px; /* Fixed width */
  height: 700px; /* Fixed height */
  max-width: 100%; /* Ensures responsiveness */
  max-height: 80%; /* Ensures responsiveness */
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f9f9f9;
  border: 4px solid #00bfff; /* Visible light blue border */
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

.additional-container {
  position: absolute;
  top: 0;
  left: 0;
  height: 100%; /* Matches the height of the parent container */
  width: calc(100% - 120px); /* Default width leaving more space for the chatbot icon */
  border: 2px solid red; /* Red border */
  padding: 10px;
  background-color: #fff;
  transition: width 0.3s ease; /* Smooth transition for width changes */
}

.additional-container.chatbotOpen {
  width: calc(100% - 510px); /* Adjust width when chatbot is open */
}

.additional-container.chatbotClosed {
  width: calc(100% - 150px); /* Reset width when chatbot is closed */
}
</style>

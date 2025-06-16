<template>
  <div v-if="!isClosed" class="chatbot-wrapper" :class="{ minimized: isMinimized }">
    <div class="chatbot-header">
      <h2 class="chatbot-title">CONSULTAR</h2>
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
  data() {
    return {
      messages: [{ text: 'We are online!', type: 'bot' }],
      userInput: '',
      isMinimized: false,
      isClosed: false,
      isLoading: false,
    }
  },
  methods: {
    newChat() {
      this.messages = [{ text: 'We are online!', type: 'bot' }]
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

      this.messages.push({ text: this.userInput, type: 'user' })
      const userQuery = this.userInput
      this.userInput = ''

      this.scrollToBottom()

      this.isLoading = true
      this.messages.push({ text: 'Cargando respuesta...', type: 'loading' })

      try {
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
                      text: userQuery,
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

.chatbot-title {
  margin: 0;
  font-size: 20px;
  text-align: center;
  flex-grow: 1;
  font-weight: 700;
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

// Store global para botiquines
import { reactive } from 'vue'

// Estado reactivo para almacenar los botiquines y su estado
export const botiquinStore = reactive({
  botiquines: [], // Lista de botiquines disponibles procesados
  historialInventarios: [], // Datos crudos de los inventarios
  cargando: false, // Indicador de carga
  error: null, // Posibles errores durante la carga
  inicializado: false, // Indica si los datos ya fueron cargados

  // Método para actualizar la lista de botiquines
  setBotiquines(botiquines) {
    this.botiquines = botiquines
  },

  // Método para actualizar el historial de inventarios
  setHistorialInventarios(inventarios) {
    this.historialInventarios = inventarios
  },

  // Método para marcar como inicializado
  setInicializado(valor) {
    this.inicializado = valor
  },

  // Método para establecer el estado de carga
  setCargando(estado) {
    this.cargando = estado
  },

  // Método para establecer errores
  setError(error) {
    this.error = error
  },

  // Método para limpiar los datos (útil al cerrar sesión)
  limpiar() {
    this.botiquines = []
    this.historialInventarios = []
    this.cargando = false
    this.error = null
    this.inicializado = false
  },
})

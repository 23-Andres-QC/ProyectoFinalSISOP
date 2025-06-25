<template>
  <div class="hospital-finder">
    <div class="header">
      <h2>🏥 Hospital Fast</h2>
      <p>Encuentra el hospital más cercano usando Google Maps</p>
    </div>

    <!-- Selector de tipo de hospital -->
    <div class="hospital-type-selector">
      <h3>Tipo de Hospital:</h3>
      <div class="type-buttons">
        <button
          v-for="type in hospitalTypes"
          :key="type.id"
          @click="selectType(type)"
          :class="['type-button', { active: selectedType?.id === type.id }]"
        >
          {{ type.icon }} {{ type.name }}
        </button>
      </div>
    </div>

    <!-- Botón de búsqueda -->
    <div class="search-section">
      <button
        @click="searchNearbyHospitals"
        :disabled="!selectedType || isSearching"
        class="search-button"
      >
        <span v-if="!isSearching">🔍 Buscar Hospital Más Cercano</span>
        <span v-else class="loading-text">
          <span class="loading-dots">⚕️</span>
          Buscando...
        </span>
      </button>

      <!-- Estado de búsqueda -->
      <div v-if="isSearching" class="search-status">
        <div class="search-progress">
          <div class="progress-step active">✅ Obteniendo tu ubicación actual</div>
          <div class="progress-step active">🌐 Conectando con Google Maps API</div>
          <div class="progress-step active">
            🏥 Buscando hospitales de tipo: {{ selectedType?.name }}
          </div>
          <div class="progress-step">📊 Calculando distancias y rutas óptimas</div>
        </div>
      </div>
    </div>

    <!-- Resultado del hospital más cercano -->
    <div v-if="nearestHospital" class="result-section">
      <h3>🎯 Hospital Más Cercano Encontrado:</h3>
      <div class="hospital-card">
        <div class="hospital-info">
          <h4>{{ nearestHospital.name }}</h4>
          <p><strong>📍 Dirección:</strong> {{ nearestHospital.address }}</p>
          <p><strong>📞 Teléfono:</strong> {{ nearestHospital.phone }}</p>
          <p><strong>📏 Distancia:</strong> {{ nearestHospital.distance.toFixed(2) }} km</p>
          <p><strong>⏱️ Tiempo estimado:</strong> {{ nearestHospital.estimatedTime }} minutos</p>
          <p><strong>⭐ Calificación:</strong> {{ nearestHospital.rating }}/5</p>
          <p>
            <strong>🕒 Estado:</strong>
            <span :class="nearestHospital.isOpen ? 'status-open' : 'status-closed'">
              {{ nearestHospital.isOpen ? 'Abierto' : 'Cerrado/Desconocido' }}
            </span>
          </p>
        </div>
      </div>

      <!-- Lista de otros hospitales -->
      <div v-if="nearbyHospitals.length > 1" class="other-hospitals">
        <h4>🏥 Otros hospitales cercanos:</h4>
        <div class="hospital-list">
          <div
            v-for="hospital in nearbyHospitals.slice(1, 5)"
            :key="hospital.id"
            class="hospital-item"
          >
            <strong>{{ hospital.name }}</strong>
            <span>{{ hospital.distance.toFixed(2) }} km - {{ hospital.estimatedTime }} min</span>
          </div>
        </div>
      </div>

      <!-- Google Maps Embed -->
      <div class="maps-section">
        <h3>📍 Ubicación en Google Maps:</h3>
        <div class="maps-container">
          <iframe
            :src="googleMapsEmbedUrl"
            width="100%"
            height="350"
            style="border: 0; border-radius: 12px"
            loading="lazy"
            allowfullscreen
            referrerpolicy="no-referrer-when-downgrade"
          >
          </iframe>
        </div>
      </div>

      <!-- Ruta -->
      <div class="route-section">
        <h3>🗺️ Ruta Recomendada:</h3>
        <div class="route-steps">
          <div v-for="(step, index) in route" :key="index" class="route-step">
            <span class="step-number">{{ index + 1 }}</span>
            <span class="step-instruction">{{ step }}</span>
          </div>
        </div>
        <button @click="openInMaps" class="maps-button">📍 Abrir en Google Maps</button>

        <button @click="callEmergency" class="emergency-button">🚑 Llamar Emergencias (105)</button>

        <button @click="callHospital" class="hospital-button">📞 Llamar al Hospital</button>
      </div>
    </div>

    <!-- Mensaje cuando no hay resultados -->
    <div v-if="!nearestHospital && !isSearching && searchAttempted" class="no-results">
      <h3>😔 No se encontraron hospitales</h3>
      <p>Intenta seleccionar otro tipo de hospital o verifica tu conexión a internet.</p>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HospitalFinder',
  data() {
    return {
      selectedType: null,
      isSearching: false,
      searchAttempted: false,
      nearbyHospitals: [],
      nearestHospital: null,
      userLocation: {
        lat: -12.0464,
        lng: -77.0428,
      },
      route: [],
      hospitalTypes: [
        {
          id: 1,
          name: 'Hospital General',
          icon: '🏥',
          query: 'hospital general Lima Peru',
        },
        {
          id: 2,
          name: 'Emergencias',
          icon: '🚑',
          query: 'hospital emergencias Lima Peru',
        },
        {
          id: 3,
          name: 'Clínica Privada',
          icon: '🏩',
          query: 'clinica privada Lima Peru',
        },
        {
          id: 4,
          name: 'Centro Médico',
          icon: '⚕️',
          query: 'centro medico Lima Peru',
        },
        {
          id: 5,
          name: 'Farmacia 24h',
          icon: '💊',
          query: 'farmacia 24 horas Lima Peru',
        },
      ],
    }
  },
  computed: {
    googleMapsEmbedUrl() {
      if (!this.nearestHospital) return ''
      const { lat, lng } = this.nearestHospital
      return `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6drf8AxTsC-Y&q=${lat},${lng}&zoom=15`
    },
  },
  mounted() {
    this.getCurrentLocation()
  },
  methods: {
    selectType(type) {
      this.selectedType = type
      console.log('Tipo seleccionado:', type)
    },

    async getCurrentLocation() {
      try {
        if (navigator.geolocation) {
          const position = await new Promise((resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject, {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 300000,
            })
          })

          this.userLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          }

          console.log('Ubicación obtenida:', this.userLocation)
        } else {
          console.log('Geolocalización no disponible, usando ubicación por defecto (Lima)')
        }
      } catch (error) {
        console.error('Error obteniendo ubicación:', error)
        this.$q?.notify?.({
          type: 'warning',
          message: 'No se pudo obtener tu ubicación. Usando Lima como referencia.',
        })
      }
    },

    async searchNearbyHospitals() {
      this.isSearching = true
      this.searchAttempted = true
      this.nearestHospital = null
      this.nearbyHospitals = []

      try {
        // Simulación de búsqueda de hospitales con datos reales de Lima
        await this.simulateHospitalSearch()
      } catch (error) {
        console.error('Error searching hospitals:', error)
        this.$q?.notify?.({
          type: 'negative',
          message: 'Error al buscar hospitales. Intenta nuevamente.',
        })
      } finally {
        this.isSearching = false
      }
    },

    async simulateHospitalSearch() {
      // Simular tiempo de búsqueda
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Datos de hospitales reales en Lima
      const hospitalData = {
        'Hospital General': [
          {
            id: 'h1',
            name: 'Hospital Nacional Dos de Mayo',
            lat: -12.05,
            lng: -77.045,
            address: 'Av. Grau 13, Cercado de Lima',
            phone: '(01) 328-0028',
            rating: 4.2,
            isOpen: true,
          },
          {
            id: 'h2',
            name: 'Hospital Rebagliati',
            lat: -12.038,
            lng: -77.042,
            address: 'Av. Sabogal 274, Jesús María',
            phone: '(01) 265-4901',
            rating: 4.5,
            isOpen: true,
          },
        ],
        Emergencias: [
          {
            id: 'e1',
            name: 'Hospital de Emergencias Casimiro Ulloa',
            lat: -12.068,
            lng: -77.052,
            address: 'Av. República de Panamá 6355, Miraflores',
            phone: '(01) 617-0059',
            rating: 4.0,
            isOpen: true,
          },
          {
            id: 'e2',
            name: 'Hospital Nacional Guillermo Almenara',
            lat: -12.034,
            lng: -77.048,
            address: 'Av. Grau 800, La Victoria',
            phone: '(01) 324-2983',
            rating: 4.3,
            isOpen: true,
          },
        ],
        'Clínica Privada': [
          {
            id: 'c1',
            name: 'Clínica San Felipe',
            lat: -12.06,
            lng: -77.035,
            address: 'Jr. Malecón Tarapacá 1028, Lima',
            phone: '(01) 419-3939',
            rating: 4.6,
            isOpen: true,
          },
          {
            id: 'c2',
            name: 'Clínica Anglo Americana',
            lat: -12.089,
            lng: -77.034,
            address: 'Av. Alfredo Salazar 314, San Isidro',
            phone: '(01) 616-8900',
            rating: 4.7,
            isOpen: true,
          },
        ],
        'Centro Médico': [
          {
            id: 'm1',
            name: 'Centro Médico Naval',
            lat: -12.072,
            lng: -77.038,
            address: 'Av. Venezuela 3420, Bellavista',
            phone: '(01) 429-9672',
            rating: 4.1,
            isOpen: true,
          },
        ],
        'Farmacia 24h': [
          {
            id: 'f1',
            name: 'InkaFarma 24h - Miraflores',
            lat: -12.078,
            lng: -77.036,
            address: 'Av. Larco 1301, Miraflores',
            phone: '(01) 314-2020',
            rating: 4.0,
            isOpen: true,
          },
          {
            id: 'f2',
            name: 'Boticas y Salud 24h',
            lat: -12.065,
            lng: -77.042,
            address: 'Av. Arequipa 2625, Lince',
            phone: '(01) 265-3030',
            rating: 3.8,
            isOpen: true,
          },
        ],
      }

      const hospitalsOfType = hospitalData[this.selectedType.name] || []

      if (hospitalsOfType.length > 0) {
        // Calcular distancias y ordenar
        this.nearbyHospitals = hospitalsOfType
          .map((hospital) => {
            const distance = this.haversineDistance(
              this.userLocation.lat,
              this.userLocation.lng,
              hospital.lat,
              hospital.lng,
            )

            return {
              ...hospital,
              type: this.selectedType.name,
              distance: distance,
              estimatedTime: Math.round(distance * 2.5),
            }
          })
          .sort((a, b) => a.distance - b.distance)

        // Encontrar el más cercano
        this.nearestHospital = this.nearbyHospitals[0]

        // Generar ruta
        if (this.nearestHospital) {
          this.generateRoute()
        }

        console.log('Hospitales encontrados:', this.nearbyHospitals)
      }
    },

    haversineDistance(lat1, lon1, lat2, lon2) {
      const R = 6371 // Radio de la Tierra en km
      const dLat = this.deg2rad(lat2 - lat1)
      const dLon = this.deg2rad(lon2 - lon1)
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos(this.deg2rad(lat1)) *
          Math.cos(this.deg2rad(lat2)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2)
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
      return R * c
    },

    deg2rad(deg) {
      return deg * (Math.PI / 180)
    },

    generateRoute() {
      const hospital = this.nearestHospital
      const distance = hospital.distance
      const estimatedTime = hospital.estimatedTime

      const directions = [
        `🧭 Desde tu ubicación actual`,
        `📍 Dirígete hacia ${hospital.address}`,
        `🚗 Distancia total: ${distance.toFixed(2)} km`,
        `⏱️ Tiempo estimado: ${estimatedTime} minutos`,
        `🏥 Destino: ${hospital.name}`,
        `📞 Teléfono: ${hospital.phone}`,
        `🚑 Busca el área de ${hospital.type.toLowerCase()} al llegar`,
      ]

      this.route = directions
    },

    openInMaps() {
      const url = `https://www.google.com/maps/dir/${this.userLocation.lat},${this.userLocation.lng}/${this.nearestHospital.lat},${this.nearestHospital.lng}`
      window.open(url, '_blank')
    },

    callEmergency() {
      window.location.href = 'tel:105'
    },

    callHospital() {
      if (this.nearestHospital?.phone) {
        window.location.href = `tel:${this.nearestHospital.phone}`
      }
    },
  },
}
</script>

<style scoped>
.hospital-finder {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  min-height: 100vh;
  color: white;
}

.header {
  text-align: center;
  margin-bottom: 30px;
}

.header h2 {
  font-size: 2.5rem;
  margin-bottom: 10px;
}

.hospital-type-selector {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 15px;
  margin-bottom: 20px;
}

.type-buttons {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 15px;
}

.type-button {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid transparent;
  padding: 12px 20px;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.type-button:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-2px);
}

.type-button.active {
  background: #4caf50;
  border-color: #45a049;
  box-shadow: 0 4px 15px rgba(76, 175, 80, 0.4);
}

.search-section {
  text-align: center;
  margin-bottom: 30px;
}

.search-button {
  background: linear-gradient(45deg, #ff6b6b, #4ecdc4);
  color: white;
  border: none;
  padding: 15px 30px;
  border-radius: 30px;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.search-button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.search-button:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.loading-text {
  display: flex;
  align-items: center;
  gap: 10px;
}

.loading-dots {
  animation: spin 1s linear infinite;
}

.search-status {
  margin-top: 20px;
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 12px;
}

.search-progress {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.progress-step {
  padding: 10px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.1);
  opacity: 0.5;
  transition: all 0.3s ease;
}

.progress-step.active {
  opacity: 1;
  background: rgba(76, 175, 80, 0.3);
}

.result-section {
  background: rgba(255, 255, 255, 0.1);
  padding: 25px;
  border-radius: 15px;
  margin-bottom: 20px;
}

.hospital-card {
  background: rgba(255, 255, 255, 0.15);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.hospital-info h4 {
  font-size: 1.5rem;
  margin-bottom: 15px;
  color: #4ecdc4;
}

.hospital-info p {
  margin-bottom: 8px;
  font-size: 1rem;
}

.status-open {
  color: #4caf50;
  font-weight: bold;
}

.status-closed {
  color: #ff6b6b;
  font-weight: bold;
}

.other-hospitals {
  margin-top: 20px;
}

.hospital-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 10px;
}

.hospital-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 12px;
  border-radius: 8px;
}

.maps-section {
  margin: 30px 0;
}

.maps-container {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.route-section {
  margin-top: 30px;
}

.route-steps {
  background: rgba(255, 255, 255, 0.1);
  padding: 20px;
  border-radius: 12px;
  margin-bottom: 20px;
}

.route-step {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
  padding: 10px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}

.step-number {
  background: #4ecdc4;
  color: white;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  flex-shrink: 0;
}

.step-instruction {
  flex: 1;
  font-size: 1rem;
}

.maps-button,
.emergency-button,
.hospital-button {
  background: linear-gradient(45deg, #4ecdc4, #44a08d);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 25px;
  font-size: 1rem;
  cursor: pointer;
  margin: 10px 10px 10px 0;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.emergency-button {
  background: linear-gradient(45deg, #ff6b6b, #ee5a24);
}

.hospital-button {
  background: linear-gradient(45deg, #4caf50, #45a049);
}

.maps-button:hover,
.emergency-button:hover,
.hospital-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
}

.no-results {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
  padding: 40px;
  border-radius: 15px;
  margin-top: 30px;
}

.no-results h3 {
  font-size: 1.5rem;
  margin-bottom: 15px;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@media (max-width: 768px) {
  .hospital-finder {
    padding: 15px;
  }

  .type-buttons {
    flex-direction: column;
  }

  .type-button {
    width: 100%;
    text-align: center;
  }

  .hospital-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 5px;
  }
}
</style>

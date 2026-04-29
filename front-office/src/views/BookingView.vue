<template>
  <div class="booking-container">
    <main class="page-shell" style="padding: 0; padding-top: 120px !important;">
      <!-- Hero Section -->
      <div class="booking-hero">
        <h1 class="hero-heading">Configure A Sua Viagem</h1>
        <p class="hero-subtitle">Personalize a sua trajetória orbital</p>
      </div>

      <!-- Main Content Grid -->
      <div class="booking-grid">
        <!-- Left Column -->
        <div class="booking-main">
          <!-- Section 1: Destination Selection -->
          <div class="booking-section">
            <h2 class="section-title">01. seleção do destino</h2>
            
            <!-- Loading State -->
            <div v-if="bookingStore.loading" class="loading-state">
              <span>A carregar destinos...</span>
            </div>
            
            <!-- Destination Grid -->
            <div v-else-if="bookingStore.destinos.length > 0" class="destination-grid">
              <div 
                v-for="destino in bookingStore.destinos" 
                :key="destino.id"
                class="destination-card"
                :class="{ 'destination-card--selected': isSelected(destino) }"
                @click="selectDestino(destino)"
              >
                <div class="card-icon">
                  <img v-if="getIcon(destino)" :src="getIcon(destino)" alt="icon" />
                </div>
                <div class="card-duration" :class="{ 'card-duration--active': isSelected(destino) }">
                  {{ getDuracao(destino) }}
                </div>
                <h3 class="card-title">{{ getNomeDestino(destino) }}</h3>
                <div class="card-gradient" v-if="isSelected(destino)"></div>
              </div>
            </div>
            
            <!-- Empty State -->
            <div v-else class="empty-state">
              <span>Nenhum destino disponível</span>
            </div>
          </div>

          <!-- Section 2: Mission Parameters -->
          <div class="parameters-section">
            <h2 class="section-title">
              <ol class="parameters-list">
                <li>02. parametros da missão</li>
              </ol>
            </h2>

            <div class="parameters-grid">
              <!-- Data de Lançamento -->
              <div class="parameter-field">
                <label class="parameter-label">data de lançamento</label>
                <div class="parameter-input">
                  <span class="input-date">{{ formattedDate }}</span>
                  <div class="input-icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                      <line x1="16" y1="2" x2="16" y2="6"></line>
                      <line x1="8" y1="2" x2="8" y2="6"></line>
                      <line x1="3" y1="10" x2="21" y2="10"></line>
                    </svg>
                  </div>
                </div>
              </div>

              <!-- Número de Passageiros -->
              <div class="parameter-field">
                <label class="parameter-label">número de passageiros</label>
                <div class="passenger-controls">
                  <button 
                    class="passenger-btn" 
                    @click="bookingStore.decrementarPassageiros()"
                    :disabled="bookingStore.numeroPassageiros <= 1"
                  >
                    −
                  </button>
                  <div class="passenger-count">
                    {{ String(bookingStore.numeroPassageiros).padStart(2, '0') }}
                  </div>
                  <button 
                    class="passenger-btn" 
                    @click="bookingStore.incrementarPassageiros()"
                    :disabled="bookingStore.numeroPassageiros >= 20"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Right Column: Pricing -->
        <div class="booking-sidebar">
          <!-- Pricing Summary Card -->
          <div class="pricing-card">
            <div class="pricing-header">
              <h3 class="pricing-title">SUMÁRIO DO PREÇO</h3>
            </div>
            <div class="pricing-body">
              <!-- Trajetória -->
              <div class="pricing-row">
                <span class="pricing-label">Trajetoria ({{ bookingStore.nomeDestino }})</span>
                <span class="pricing-value">{{ bookingStore.formatPrice(bookingStore.custoTrajetoria) }}</span>
              </div>
              
              <!-- Combustível -->
              <div class="pricing-row">
                <span class="pricing-label">Combustível</span>
                <span class="pricing-value">{{ bookingStore.formatPrice(bookingStore.custoCombustivel) }}</span>
              </div>
              
              <!-- Life Support -->
              <div class="pricing-row">
                <span class="pricing-label">Life Support ({{ bookingStore.diasDestino }} Days)</span>
                <span class="pricing-value">{{ bookingStore.formatPrice(bookingStore.custoLifeSupport * bookingStore.numeroPassageiros) }}</span>
              </div>
              
              <!-- Seguro -->
              <div class="pricing-row">
                <span class="pricing-label">Seguro</span>
                <span class="pricing-value">{{ bookingStore.formatPrice(bookingStore.custoSeguro * bookingStore.numeroPassageiros) }}</span>
              </div>

              <!-- Total -->
              <div class="pricing-total">
                <div class="total-label">Custo total</div>
                <div class="total-value">
                  {{ bookingStore.formatPrice(bookingStore.custoTotal).replace('€', '').trim() }}
                  <span class="total-currency">€</span>
                </div>
              </div>
            </div>
          </div>

          <!-- CTA Button -->
          <router-link to="/kit" class="cta-button">
            ESCOLHER KIT
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="5" y1="12" x2="19" y2="12"></line>
              <polyline points="12 5 19 12 12 19"></polyline>
            </svg>
          </router-link>

          <!-- Technical Readout -->
          <div class="technical-readout">
            <div class="readout-lines">
              <div class="readout-line"></div>
              <div class="readout-line"></div>
              <div class="readout-line"></div>
            </div>
            <div class="readout-spacer"></div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useBookingStore } from '../stores/BookingStore'
import { onMounted, computed, watch } from 'vue'

const bookingStore = useBookingStore()

// Debug: watcher para verificar mudanças
watch(() => bookingStore.destinos, (newVal) => {
  console.log('Destinos changed:', newVal)
}, { immediate: true })

// Ícones para cada destino
const iconMap = {
  'Orbita da Terra': 'https://www.figma.com/api/mcp/asset/e76392f3-960c-4222-bdab-e5f8933623a0',
  'Base Lunar': 'https://www.figma.com/api/mcp/asset/dbf42d3c-49f3-4348-832f-3f01931c1bd4',
  'Colonia de Marte': 'https://www.figma.com/api/mcp/asset/b910c677-ef0d-4992-a9d8-e734514eb3f3',
  'Aneis de Saturno': 'https://www.figma.com/api/mcp/asset/cf6939ee-faa9-467c-8e88-075255ec5644'
}

// Data formatada
const formattedDate = computed(() => {
  const date = new Date()
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear() + 2
  return `${day}/${month}/${year}`
})

// Verificar se destino está selecionado
function isSelected(destino) {
  return bookingStore.destinoSelecionado?.id === destino.id
}

// Selecionar destino
const selectDestino = (destino) => {
  bookingStore.destinoSelecionado = destino
}

// Obter nome do destino
const getNomeDestino = (destino) => {
  if (!destino) return ''
  // Tenta primeiro o formato direto do Strapi, depois o fallback com attributes
  return destino.Tipo || (destino.attributes && destino.attributes.Tipo) || ''
}

// Obter duração formatada
function getDuracao(destino) {
  if (!destino) return '0 DAYS'
  const dias = destino.Dias || (destino.attributes && destino.attributes.Dias) || 0
  if (dias >= 365) {
    const anos = Math.floor(dias / 365)
    return `${anos} YEAR${anos > 1 ? 'S' : ''}`
  }
  return `${dias} DAY${dias > 1 ? 'S' : ''}`
}

// Obter ícone do destino
function getIcon(destino) {
  const nome = getNomeDestino(destino)
  return iconMap[nome] || iconMap['Orbita da Terra']
}

// Carregar destinos ao montar
onMounted(() => {
  console.log('BookingView mounted, fetching destinos...')
  console.log('Initial destinos:', bookingStore.destinos)
  bookingStore.fetchDestinos().then(() => {
    console.log('Destinos loaded:', bookingStore.destinos)
    console.log('Destinos length:', bookingStore.destinos.length)
  }).catch(err => {
    console.error('Error fetching destinos:', err)
  })
})
</script>

<style scoped>
.booking-container {
  min-height: 100vh;
}

/* Hero Section */
.booking-hero {
  padding: 48px 24px 32px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.hero-heading {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 32px;
  font-weight: 700;
  color: #e1fdff;
  letter-spacing: -1px;
  margin: 0;
  line-height: 1.2;
}

.hero-subtitle {
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
  color: #b9cacb;
  max-width: 100%;
  margin: 0;
  line-height: 1.5;
}

/* Main Grid */
.booking-grid {
  display: grid;
  grid-template-columns: 1fr 320px;
  gap: 24px;
  padding: 0 24px 48px;
  align-items: start;
}

.booking-main {
  display: flex;
  flex-direction: column;
  gap: 32px;
}

/* Section Titles */
.section-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px;
  font-weight: 500;
  color: #00f2ff;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin: 0 0 20px 0;
}

.parameters-list {
  list-style: decimal;
  padding-left: 24px;
  margin: 0;
}

/* Destination Grid */
.destination-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.destination-card {
  position: relative;
  height: 120px;
  background: rgba(24, 28, 34, 0.6);
  border: 1px solid rgba(58, 73, 75, 0.1);
  border-radius: 8px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.destination-card:hover {
  border-color: rgba(0, 242, 255, 0.3);
}

.destination-card--selected {
  border: 2px solid #00f2ff;
  box-shadow: 0 0 20px rgba(0, 242, 255, 0.15);
}

.card-icon {
  position: absolute;
  top: 16px;
  left: 16px;
  width: 16px;
  height: 16px;
}

.card-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-duration {
  position: absolute;
  top: 16px;
  right: 16px;
  background: rgba(0, 242, 255, 0.1);
  padding: 2px 6px;
  border-radius: 2px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 10px;
  color: #00f2ff;
}

.card-duration--active {
  background: rgba(0, 242, 255, 0.2);
}

.card-title {
  position: absolute;
  bottom: 48px;
  left: 16px;
  right: 16px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 400;
  color: #e0e2eb;
  margin: 0;
}

.card-gradient {
  position: absolute;
  inset: 0;
  background: linear-gradient(154deg, rgba(0, 242, 255, 0.05) 0%, rgba(0, 242, 255, 0) 100%);
  pointer-events: none;
}

/* Parameters Section */
.parameters-section {
  background: #181c22;
  border-left: 4px solid #00f2ff;
  border-radius: 8px;
  padding: 24px;
}

.parameters-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-top: 20px;
}

.parameter-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.parameter-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 10px;
  font-weight: 400;
  color: #849495;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.parameter-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #31353c;
  border-radius: 4px;
  padding: 10px 12px;
}

.input-date {
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
  color: #e0e2eb;
}

.input-icon {
  width: 16px;
  height: 16px;
  color: #849495;
}

/* Passenger Controls */
.passenger-controls {
  display: flex;
  align-items: center;
  gap: 12px;
}

.passenger-btn {
  width: 32px;
  height: 32px;
  background: #31353c;
  border: none;
  border-radius: 4px;
  font-family: 'Manrope', sans-serif;
  font-size: 16px;
  color: #e0e2eb;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.passenger-btn:hover:not(:disabled) {
  background: #3d4249;
}

.passenger-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.passenger-count {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 16px;
  color: #e0e2eb;
  min-width: 24px;
  text-align: center;
}

/* Sidebar */
.booking-sidebar {
  display: flex;
  flex-direction: column;
  gap: 20px;
  position: sticky;
  top: 24px;
}

/* Pricing Card */
.pricing-card {
  background: rgba(24, 28, 34, 0.6);
  border: 1px solid rgba(132, 148, 149, 0.15);
  border-left: 1px solid;
  border-top: 1px solid;
  border-radius: 8px;
  overflow: hidden;
  backdrop-filter: blur(10px);
}

.pricing-header {
  background: #262a31;
  padding: 16px;
}

.pricing-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #e0e2eb;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  margin: 0;
}

.pricing-body {
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.pricing-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pricing-label {
  font-family: 'Manrope', sans-serif;
  font-size: 12px;
  color: #b9cacb;
}

.pricing-value {
  font-family: 'Manrope', sans-serif;
  font-size: 12px;
  color: #e0e2eb;
}

.pricing-total {
  border-top: 1px solid rgba(58, 73, 75, 0.2);
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.total-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 8px;
  font-weight: 400;
  color: #849495;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.total-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 24px;
  font-weight: 700;
  color: #00f2ff;
  text-shadow: 0 0 10px rgba(0, 242, 255, 0.5);
}

.total-currency {
  font-size: 14px;
  margin-left: 2px;
}

/* CTA Button */
.cta-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background: #00f2ff;
  padding: 16px;
  border-radius: 8px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #002022;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-decoration: none;
  transition: all 0.2s ease;
}

.cta-button:hover {
  background: #53e4ff;
}

.cta-button svg {
  width: 14px;
  height: 14px;
}

/* Technical Readout */
.technical-readout {
  border: 1px solid rgba(58, 73, 75, 0.1);
  border-radius: 8px;
  padding: 16px;
}

.readout-lines {
  display: flex;
  gap: 6px;
}

.readout-line {
  flex: 1;
  height: 3px;
  background: rgba(0, 242, 255, 0.2);
  position: relative;
}

.readout-line::after {
  content: '';
  position: absolute;
  inset: 0;
  background: #00f2ff;
}

.readout-spacer {
  height: 48px;
}

/* Loading & Empty States */
.loading-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 120px;
  background: rgba(24, 28, 34, 0.6);
  border: 1px solid rgba(58, 73, 75, 0.1);
  border-radius: 8px;
  color: #849495;
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
}

/* Responsive */
@media (max-width: 1200px) {
  .booking-grid {
    grid-template-columns: 1fr;
  }
  
  .booking-sidebar {
    max-width: 100%;
  }
}

@media (max-width: 768px) {
  .hero-heading {
    font-size: 36px;
  }
  
  .destination-grid {
    grid-template-columns: 1fr;
  }
  
  .parameters-grid {
    grid-template-columns: 1fr;
  }
}
</style>
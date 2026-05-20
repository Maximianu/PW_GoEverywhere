<template>
  <div class="booking-container">
    <main class="page-shell" style="padding: 0; padding-top: 7.5rem !important;">
      <!-- Hero Section -->
      <div class="booking-hero">
        <h1 class="hero-heading">Configure A Sua Viagem</h1>
        <p class="hero-subtitle">Personalize a sua trajetória orbital</p>
      </div>

      <!-- Main Content Grid -->
      <div class="booking-grid">
        <!-- Left Column -->
        <div class="booking-main">
          <!-- Section 1: Mission Selection -->
          <div class="booking-section">
            <h2 class="section-title">01. seleção de missão</h2>

            <!-- Loading State -->
            <div v-if="bookingStore.loading" class="loading-state">
              <span>A carregar missões...</span>
            </div>

            <!-- Mission Grid -->
            <div v-else-if="bookingStore.missoes.length > 0" class="destination-grid">
              <div 
                v-for="missao in bookingStore.missoes" 
                :key="missao.id"
                class="destination-card"
                :class="{ 'destination-card--selected': isSelected(missao) }"
                @click="selectMissao(missao)"
              >
                <div class="card-duration" :class="{ 'card-duration--active': isSelected(missao) }">
                  {{ getMissaoData(missao) }}
                </div>
                <h3 class="card-title">{{ getNomeMissao(missao) }}</h3>
                <p class="card-subtitle">{{ getMissaoDestino(missao) }}</p>
                <div class="card-gradient" v-if="isSelected(missao)"></div>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="empty-state">
              <span>Nenhuma missão disponível</span>
            </div>
          </div>

          <div class="parameters-section">
            <h2 class="section-title">02. detalhes da missão</h2>
            <p class="parameters-note">
              A missão selecionada já contém data e lotação fixas definidas pelos administradores.
            </p>
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
              <!-- Missão -->
              <div class="pricing-row">
                <span class="pricing-label">Missão ({{ bookingStore.nomeMissao }})</span>
                <span class="pricing-value">{{ bookingStore.formatPrice(bookingStore.custoMissao) }}</span>
              </div>

              <!-- Kit Atual -->
              <div class="pricing-row">
                <span class="pricing-label">Kit selecionado</span>
                <span class="pricing-value">{{ bookingStore.formatPrice(bookingStore.kitPrice) }}</span>
              </div>

              <!-- Tripulação -->
              <div class="pricing-row">
                <span class="pricing-label">Tripulação</span>
                <span class="pricing-value">{{ bookingStore.numeroPassageiros }} pax</span>
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
import { onMounted } from 'vue'

const bookingStore = useBookingStore()

// Verificar se missão está selecionada
function isSelected(missao) {
  return bookingStore.missaoSelecionada?.id === missao.id
}

// Selecionar missão
const selectMissao = (missao) => {
  bookingStore.selecionarMissao(missao)
}

// Obter nome da missão
const getNomeMissao = (missao) => {
  if (!missao) return ''
  return missao.Nome || missao.attributes?.Nome || ''
}

// Obter destino/planeta da missão
const getMissaoDestino = (missao) => {
  if (!missao) return ''
  const planeta = missao.Planeta || missao.attributes?.Planeta || ''
  return planeta ? `Destino: ${planeta}` : ''
}

// Obter data da missão
const getMissaoData = (missao) => {
  if (!missao) return ''
  const rawDate = missao.Data || missao.attributes?.Data || ''
  if (!rawDate) return ''
  const date = new Date(rawDate)
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

// Carregar missões ao montar
onMounted(() => {
  bookingStore.fetchMissoes().catch(err => {
    console.error('Error fetching missões:', err)
  })
})
</script>

<style scoped>
.booking-container {
  min-height: 100vh;
}

/* Hero Section */
.booking-hero {
  padding: 3rem 1.5rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.hero-heading {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2rem;
  font-weight: 700;
  color: #e1fdff;
  letter-spacing: -0.0625rem;
  margin: 0;
  line-height: 1.2;
}

.hero-subtitle {
  font-family: 'Manrope', sans-serif;
  font-size: 0.875rem;
  color: #b9cacb;
  max-width: 100%;
  margin: 0;
  line-height: 1.5;
}

/* Main Grid */
.booking-grid {
  display: grid;
  grid-template-columns: 1fr 20rem;
  gap: 1.5rem;
  padding: 0 1.5rem 3rem;
  align-items: start;
}

.booking-main {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

/* Section Titles */
.section-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1rem;
  font-weight: 500;
  color: #00f2ff;
  text-transform: uppercase;
  letter-spacing: 0.125rem;
  margin: 0 0 1.25rem 0;
}

.parameters-list {
  list-style: decimal;
  padding-left: 1.5rem;
  margin: 0;
}

/* Destination Grid */
.destination-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
}

.destination-card {
  position: relative;
  height: 7.5rem;
  background: rgba(24, 28, 34, 0.6);
  border: 0.0625rem solid rgba(58, 73, 75, 0.1);
  border-radius: 0.5rem;
  padding: 1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  overflow: hidden;
  backdrop-filter: blur(0.625rem);
}

.destination-card:hover {
  border-color: rgba(0, 242, 255, 0.3);
}

.destination-card--selected {
  border: 0.125rem solid #00f2ff;
  box-shadow: 0 0 1.25rem rgba(0, 242, 255, 0.15);
}

.card-icon {
  position: absolute;
  top: 1rem;
  left: 1rem;
  width: 1rem;
  height: 1rem;
}

.card-icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.card-duration {
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 242, 255, 0.1);
  padding: 0.125rem 0.375rem;
  border-radius: 0.125rem;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.625rem;
  color: #00f2ff;
}

.card-duration--active {
  background: rgba(0, 242, 255, 0.2);
}

.card-title {
  position: absolute;
  bottom: 3rem;
  left: 1rem;
  right: 1rem;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.875rem;
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
  border-left: 0.25rem solid #00f2ff;
  border-radius: 0.5rem;
  padding: 1.5rem;
}

.parameters-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.25rem;
  margin-top: 1.25rem;
}

.parameter-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.parameter-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.625rem;
  font-weight: 400;
  color: #849495;
  text-transform: uppercase;
  letter-spacing: 0.0625rem;
}

.parameter-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  background: #31353c;
  border-radius: 0.25rem;
  padding: 0.625rem 0.75rem;
}

.input-date {
  font-family: 'Manrope', sans-serif;
  font-size: 0.875rem;
  color: #e0e2eb;
}

.input-icon {
  width: 1rem;
  height: 1rem;
  color: #849495;
}

/* Passenger Controls */
.passenger-controls {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.passenger-btn {
  width: 2rem;
  height: 2rem;
  background: #31353c;
  border: none;
  border-radius: 0.25rem;
  font-family: 'Manrope', sans-serif;
  font-size: 1rem;
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
  font-size: 1rem;
  color: #e0e2eb;
  min-width: 1.5rem;
  text-align: center;
}

/* Sidebar */
.booking-sidebar {
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  position: sticky;
  top: 1.5rem;
}

/* Pricing Card */
.pricing-card {
  background: rgba(24, 28, 34, 0.6);
  border: 0.0625rem solid rgba(132, 148, 149, 0.15);
  border-left: 0.0625rem solid;
  border-top: 0.0625rem solid;
  border-radius: 0.5rem;
  overflow: hidden;
  backdrop-filter: blur(0.625rem);
}

.pricing-header {
  background: #262a31;
  padding: 1rem;
}

.pricing-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.75rem;
  font-weight: 400;
  color: #e0e2eb;
  text-transform: uppercase;
  letter-spacing: 0.0938rem;
  margin: 0;
}

.pricing-body {
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.pricing-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pricing-label {
  font-family: 'Manrope', sans-serif;
  font-size: 0.75rem;
  color: #b9cacb;
}

.pricing-value {
  font-family: 'Manrope', sans-serif;
  font-size: 0.75rem;
  color: #e0e2eb;
}

.pricing-total {
  border-top: 0.0625rem solid rgba(58, 73, 75, 0.2);
  padding-top: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
}

.total-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.5rem;
  font-weight: 400;
  color: #849495;
  text-transform: uppercase;
  letter-spacing: 0.0625rem;
}

.total-value {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  font-weight: 700;
  color: #00f2ff;
  text-shadow: 0 0 0.625rem rgba(0, 242, 255, 0.5);
}

.total-currency {
  font-size: 0.875rem;
  margin-left: 0.125rem;
}

/* CTA Button */
.cta-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  background: #00f2ff;
  padding: 1rem;
  border-radius: 0.5rem;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.875rem;
  font-weight: 700;
  color: #002022;
  text-transform: uppercase;
  letter-spacing: 0.125rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.cta-button:hover {
  background: #53e4ff;
}

.cta-button svg {
  width: 0.875rem;
  height: 0.875rem;
}

/* Technical Readout */
.technical-readout {
  border: 0.0625rem solid rgba(58, 73, 75, 0.1);
  border-radius: 0.5rem;
  padding: 1rem;
}

.readout-lines {
  display: flex;
  gap: 0.375rem;
}

.readout-line {
  flex: 1;
  height: 0.1875rem;
  background: rgba(0, 242, 255, 0.2);
  position: relative;
}

.readout-line:first-child::after {
  content: '';
  position: absolute;
  inset: 0;
  background: #00f2ff;
}

.readout-spacer {
  height: 3rem;
}



/* Loading & Empty States */
.loading-state,
.empty-state {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 7.5rem;
  background: rgba(24, 28, 34, 0.6);
  border: 0.0625rem solid rgba(58, 73, 75, 0.1);
  border-radius: 0.5rem;
  color: #849495;
  font-family: 'Manrope', sans-serif;
  font-size: 0.875rem;
}

/* Responsive */
@media (max-width: 75rem) {
  .booking-grid {
    grid-template-columns: 1fr;
  }
  
  .booking-sidebar {
    max-width: 100%;
  }
}

@media (max-width: 48rem) {
  .hero-heading {
    font-size: 2.25rem;
  }
  
  .destination-grid {
    grid-template-columns: 1fr;
  }
  
  .parameters-grid {
    grid-template-columns: 1fr;
  }
}
</style>
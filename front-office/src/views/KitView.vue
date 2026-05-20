<template>
  <main class="page-shell">
    <section class="content-container">
      <div class="page-hero">
        <router-link to="/book" class="btn-back">← VOLTAR</router-link>
        <h1 class="headline-xl">ESCOLHA O SEU KIT</h1>
      </div>

      <div class="kits-grid">
        
        <div class="kit-card" :class="{ 'active-card': selectedKit === 'basico' }">
          <div class="kit-number">01</div>
          <div class="kit-image-container">
            <img src="../assets/KitBase.png" alt="Basic Kit" class="kit-img" />
          </div>
          <h3 class="kit-title">BÁSICO</h3>
          <p class="kit-description">Boa Sorte.</p>
          <ul class="kit-features">
            <li><img src="https://www.figma.com/api/mcp/asset/29190b52-290d-4bba-aa58-01d05d045555" class="icon" /> OX-GEN STANDARD V2</li>
            <li><img src="https://www.figma.com/api/mcp/asset/29190b52-290d-4bba-aa58-01d05d045555" class="icon" /> NYLON-REINFORCED HULL</li>
          </ul>
          <button 
            type="button"
            :class="selectedKit === 'basico' ? 'btn-kit-primary' : 'btn-kit-secondary'"
            @click="selectKit('basico')"
          >
            1750€
          </button>
        </div>

        <div class="kit-card highlighted" :class="{ 'active-card': selectedKit === 'normal' }">
          <div class="recommended-badge">Recommended</div>
          <div class="kit-image-container border-cyan">
            <img src="../assets/KitNormal.png" alt="Normal Kit" class="kit-img" />
          </div>
          <h3 class="kit-title cyan-text">NORMAL</h3>
          <p class="kit-description high-contrast">Performance estável e segura</p>
          <ul class="kit-features">
            <li><img src="https://www.figma.com/api/mcp/asset/3612f4e4-3bca-4b51-81a2-c345e1732047" class="icon" /> AI-AUGMENTED HUD</li>
            <li><img src="https://www.figma.com/api/mcp/asset/3612f4e4-3bca-4b51-81a2-c345e1732047" class="icon" /> KEVLAR-MYLAR HYBRID</li>
            <li><img src="https://www.figma.com/api/mcp/asset/3612f4e4-3bca-4b51-81a2-c345e1732047" class="icon" /> 24H LIFE SUPPORT</li>
          </ul>
          <button 
            type="button"
            :class="selectedKit === 'normal' ? 'btn-kit-primary' : 'btn-kit-secondary'"
            @click="selectKit('normal')"
          >
            2150€
          </button>
        </div>

        <div class="kit-card" :class="{ 'active-card': selectedKit === 'vip' }">
          <div class="kit-number">03</div>
          <div class="kit-image-container">
            <img src="../assets/KitVIP.png" alt="VIP Kit" class="kit-img" />
          </div>
          <h3 class="kit-title">VIP</h3>
          <p class="kit-description">Onde o conforto, segurança e estilo se encontram sem comprometer nenhum</p>
          <ul class="kit-features">
            <li><img src="https://www.figma.com/api/mcp/asset/bb38d766-ea61-49e1-86f2-6f7ac607306c" class="icon" /> TITANIUM EXOSKELETON</li>
            <li><img src="https://www.figma.com/api/mcp/asset/bb38d766-ea61-49e1-86f2-6f7ac607306c" class="icon" /> NEURAL LINK INTERFACE</li>
          </ul>
          <button 
            type="button"
            :class="selectedKit === 'vip' ? 'btn-kit-primary' : 'btn-kit-secondary'"
            @click="selectKit('vip')"
          >
            3250€
          </button>
        </div>
      </div>

      <section class="footer-cta">
        <div class="cta-content">
          <h2 class="cta-title">JÁ TEM EQUIPAMENTO?</h2>
          <p class="cta-text">Traga o seu equipamento para uma inspeção e verifique se é adequado à viagem.</p>
        </div>
        <button
          class="btn-outline-cyan"
          :class="{ 'active-registered': selectedKit === null }"
          @click="registerEquipment"
        >
          REGISTAR EQUIPAMENTO
        </button>
      </section>

      <div class="payment-section">
        <router-link to="/payment" class="btn-payment">
          PAGAMENTO
          <img src="https://www.figma.com/api/mcp/asset/665d8f28-4c45-4b77-b79e-7d6f8f1e8f4b" class="payment-icon" />
        </router-link>
        <div class="technical-lines">
          <span class="line filled"></span>
          <span class="line filled"></span>
          <span class="line"></span>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { useBookingStore } from '../stores/BookingStore'
import { computed, onMounted } from 'vue'

const bookingStore = useBookingStore()

const selectedKit = computed(() => bookingStore.selectedKit)

const selectKit = (kitId) => {
  bookingStore.setSelectedKit(kitId)
}

const registerEquipment = () => {
  bookingStore.setSelectedKit(null)
}

onMounted(() => {
  bookingStore.fetchKits().catch(err => {
    console.error('Erro ao carregar kits:', err)
  })
})
</script>

<style scoped>
/* Layout Principal */
.page-shell {
  /* Espaçamento superior para não ficar atrás da navbar superior */
  padding: 7.5rem 1.25rem 3.75rem 1.25rem;
  background-color: #0b0e14;
  min-height: 100vh;
  display: flex;
  justify-content: center;
}

.content-container {
  width: 100%;
  max-width: 72rem;
  display: flex;
  flex-direction: column;
}

/* Tipografia */
.headline-xl {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 4rem;
  line-height: 1;
  letter-spacing: -0.1875rem;
  color: #e1fdff;
  text-transform: uppercase;
  margin-bottom: 4rem;
  text-align: left;
}

.btn-back {
  display: inline-block;
  font-family: 'Space Grotesk', sans-serif;
  color: #00f2ff;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.0625rem;
  margin-bottom: 1.5rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-back:hover {
  color: #e1fdff;
  transform: translateX(-0.25rem);
}

/* Grid de Kits */
.kits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(20rem, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.kit-card {
  background: #181c22;
  border: 0.0625rem solid rgba(255, 255, 255, 0.05);
  padding: 2rem;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

/* Destaque visual para o card selecionado */
.active-card {
  border: 0.0625rem solid #00f2ff !important;
  background: #1c2026;
  box-shadow: 0 0.625rem 1.875rem rgba(0, 0, 0, 0.5);
}

.kit-number {
  position: absolute;
  top: 0.625rem;
  right: 1.25rem;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 4.5rem;
  color: #e1fdff;
  opacity: 0.05;
}

.kit-image-container {
  aspect-ratio: 1 / 1;
  background: #0b0e14;
  margin-bottom: 2rem;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0.0625rem solid rgba(255, 255, 255, 0.05);
}

.border-cyan {
  border-color: rgba(0, 242, 255, 0.2);
}

.kit-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.kit-title {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 1.5rem;
  letter-spacing: 0.0625rem;
  color: #e1fdff;
  margin-bottom: 0.5rem;
}

.cyan-text { color: #00f2ff; }

.kit-description {
  font-size: 0.875rem;
  color: rgba(224, 226, 235, 0.5);
  min-height: 3.75rem;
  margin-bottom: 1.5rem;
}

.kit-features {
  list-style: none;
  padding: 0;
  margin-bottom: 2rem;
  flex-grow: 1;
}

.kit-features li {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.75rem;
  letter-spacing: 0.0625rem;
  color: rgba(224, 226, 235, 0.8);
  margin-bottom: 0.75rem;
  text-transform: uppercase;
}

.icon { width: 0.75rem; height: 0.75rem; opacity: 0.7; }

/* Botões Dinâmicos */
.btn-kit-secondary, .btn-kit-primary {
  padding: 1.125rem;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 0.8125rem;
  letter-spacing: 0.0938rem;
  text-transform: uppercase;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
}

.btn-kit-secondary {
  background: #31353c;
  color: #00f2ff;
}

.btn-kit-secondary:hover {
  background: #3d424b;
}

.btn-kit-primary {
  background: #00f2ff;
  color: #00363a;
}

.recommended-badge {
  position: absolute;
  top: 0;
  right: 0;
  background: #00f2ff;
  color: #00363a;
  padding: 0.25rem 0.75rem;
  font-size: 0.625rem;
  font-weight: 800;
  text-transform: uppercase;
  z-index: 10;
}

/* Footer Section */
.footer-cta {
  background: rgba(24, 28, 34, 0.5);
  border: 0.0625rem solid rgba(0, 242, 255, 0.1);
  padding: 2.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 2.5rem;
  margin-bottom: 5rem;
}

.cta-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.75rem;
  color: #e1fdff;
  margin-bottom: 0.5rem;
}

.cta-text {
  font-size: 1rem;
  color: rgba(224, 226, 235, 0.6);
  max-width: 31.25rem;
}

.btn-outline-cyan {
  background: transparent;
  border: 0.0625rem solid #00f2ff;
  color: #00f2ff;
  padding: 1rem 2rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-outline-cyan:hover {
  background: rgba(0, 242, 255, 0.1);
}

/* Pagamento */
.payment-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 2.5rem;
}

.btn-payment {
  background: #00f2ff;
  color: #002022;
  width: 100%;
  max-width: 25rem;
  height: 4.375rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 0.25rem;
  font-size: 1.125rem;
  font-weight: 700;
  letter-spacing: 0.25rem;
  text-decoration: none;
  position: relative;
  transition: transform 0.2s ease;
}

.btn-payment:hover {
  transform: translateY(-0.125rem);
  background: #53e4ff;
}

.payment-icon {
  position: absolute;
  right: 1.875rem;
  width: 1.125rem;
}

.technical-lines {
  display: flex;
  gap: 0.5rem;
  width: 20rem;
  margin-top: 1.25rem;
}

.line {
  flex: 1;
  height: 0.1875rem;
  background: rgba(0, 242, 255, 0.1);
}

.line.filled {
  background: #00f2ff;
}

.payment-icon {
  position: absolute;
  right: 1.875rem;
  height: 1.25rem;
  width: 1.25rem; /* O tamanho atual é definido aqui */
}

/* Responsividade */
@media (max-width: 48rem) {
  .footer-cta {
    flex-direction: column;
    text-align: center;
    gap: 1.5rem;
  }
  .headline-xl {
    font-size: 2.625rem;
  }
  .kits-grid {
    grid-template-columns: 1fr;
  }
}
</style>
<template>
  <main class="page-shell">
    <section class="content-container">
      <div class="page-hero">
        <h1 class="headline-xl">ESCOLHA O SEU KIT</h1>
      </div>

      <div class="kits-grid">
        
        <div class="kit-card" :class="{ 'active-card': selectedKit === 'basico' }">
          <div class="kit-number">01</div>
          <div class="kit-image-container">
            <img src="https://www.figma.com/api/mcp/asset/f9286e7b-e4a9-4b15-a9e4-3cecfc77f6aa" alt="Basic Kit" class="kit-img" />
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
            {{ selectedKit === 'basico' ? 'SELECIONADO' : 'SELECIONAR' }}
          </button>
        </div>

        <div class="kit-card highlighted" :class="{ 'active-card': selectedKit === 'normal' }">
          <div class="recommended-badge">Recommended</div>
          <div class="kit-image-container border-cyan">
            <img src="https://www.figma.com/api/mcp/asset/e5ebfa7b-49ed-4966-aa65-b60d26401ab4" alt="Normal Kit" class="kit-img" />
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
            {{ selectedKit === 'normal' ? 'SELECIONADO' : 'SELECIONAR' }}
          </button>
        </div>

        <div class="kit-card" :class="{ 'active-card': selectedKit === 'vip' }">
          <div class="kit-number">03</div>
          <div class="kit-image-container">
            <img src="https://www.figma.com/api/mcp/asset/273006e8-864b-453e-9bdd-b77598a68e98" alt="VIP Kit" class="kit-img" />
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
            {{ selectedKit === 'vip' ? 'SELECIONADO' : 'SELECIONAR' }}
          </button>
        </div>
      </div>

      <section class="footer-cta">
        <div class="cta-content">
          <h2 class="cta-title">JÁ TEM EQUIPAMENTO?</h2>
          <p class="cta-text">Traga o seu equipamento para uma inspeção e verifique se é adequado à viagem.</p>
        </div>
        <button class="btn-outline-cyan">REGISTAR EQUIPAMENTO</button>
      </section>

      <div class="payment-section">
        <router-link to="/payment" class="btn-payment">
          PAGAMENTO
          <img src="https://www.figma.com/api/mcp/asset/665d8f28-4c45-4b77-b79e-7d6f8f1e8f4b" class="payment-icon" />
        </router-link>
        <div class="technical-lines">
          <span class="line filled"></span>
          <span class="line"></span>
          <span class="line filled"></span>
          <span class="line"></span>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref } from 'vue'

// Estado reativo para controlar qual kit está selecionado
// Por padrão, deixamos o 'normal' selecionado
const selectedKit = ref('normal')

// Função para mudar o kit selecionado
const selectKit = (kitId) => {
  selectedKit.value = kitId
}
</script>

<style scoped>
/* Layout Principal */
.page-shell {
  /* Espaçamento superior para não ficar atrás da navbar superior */
  padding: 120px 20px 60px 20px;
  background-color: #0b0e14;
  min-height: 100vh;
  display: flex;
  justify-content: center;
}

.content-container {
  width: 100%;
  max-width: 1152px;
  display: flex;
  flex-direction: column;
}

/* Tipografia */
.headline-xl {
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 64px;
  line-height: 1;
  letter-spacing: -3px;
  color: #e1fdff;
  text-transform: uppercase;
  margin-bottom: 64px;
  text-align: left;
}

/* Grid de Kits */
.kits-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 32px;
  margin-bottom: 64px;
}

.kit-card {
  background: #181c22;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 32px;
  position: relative;
  display: flex;
  flex-direction: column;
  transition: all 0.3s ease;
}

/* Destaque visual para o card selecionado */
.active-card {
  border: 1px solid #00f2ff !important;
  background: #1c2026;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
}

.kit-number {
  position: absolute;
  top: 10px;
  right: 20px;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 72px;
  color: #e1fdff;
  opacity: 0.05;
}

.kit-image-container {
  aspect-ratio: 1 / 1;
  background: #0b0e14;
  margin-bottom: 32px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
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
  font-size: 24px;
  letter-spacing: 1px;
  color: #e1fdff;
  margin-bottom: 8px;
}

.cyan-text { color: #00f2ff; }

.kit-description {
  font-size: 14px;
  color: rgba(224, 226, 235, 0.5);
  min-height: 60px;
  margin-bottom: 24px;
}

.kit-features {
  list-style: none;
  padding: 0;
  margin-bottom: 32px;
  flex-grow: 1;
}

.kit-features li {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 12px;
  letter-spacing: 1px;
  color: rgba(224, 226, 235, 0.8);
  margin-bottom: 12px;
  text-transform: uppercase;
}

.icon { width: 12px; height: 12px; opacity: 0.7; }

/* Botões Dinâmicos */
.btn-kit-secondary, .btn-kit-primary {
  padding: 18px;
  font-family: 'Space Grotesk', sans-serif;
  font-weight: 700;
  font-size: 13px;
  letter-spacing: 1.5px;
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
  padding: 4px 12px;
  font-size: 10px;
  font-weight: 800;
  text-transform: uppercase;
  z-index: 10;
}

/* Footer Section */
.footer-cta {
  background: rgba(24, 28, 34, 0.5);
  border: 1px solid rgba(0, 242, 255, 0.1);
  padding: 40px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 40px;
  margin-bottom: 80px;
}

.cta-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px;
  color: #e1fdff;
  margin-bottom: 8px;
}

.cta-text {
  font-size: 16px;
  color: rgba(224, 226, 235, 0.6);
  max-width: 500px;
}

.btn-outline-cyan {
  background: transparent;
  border: 1px solid #00f2ff;
  color: #00f2ff;
  padding: 16px 32px;
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
  padding-bottom: 40px;
}

.btn-payment {
  background: #00f2ff;
  color: #002022;
  width: 100%;
  max-width: 400px;
  height: 70px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  font-size: 18px;
  font-weight: 700;
  letter-spacing: 4px;
  text-decoration: none;
  position: relative;
  transition: transform 0.2s ease;
}

.btn-payment:hover {
  transform: translateY(-2px);
  background: #53e4ff;
}

.payment-icon {
  position: absolute;
  right: 30px;
  width: 18px;
}

.technical-lines {
  display: flex;
  gap: 8px;
  width: 320px;
  margin-top: 20px;
}

.line {
  flex: 1;
  height: 3px;
  background: rgba(0, 242, 255, 0.1);
}

.line.filled {
  background: #00f2ff;
}

/* Responsividade */
@media (max-width: 768px) {
  .footer-cta {
    flex-direction: column;
    text-align: center;
    gap: 24px;
  }
  .headline-xl {
    font-size: 42px;
  }
  .kits-grid {
    grid-template-columns: 1fr;
  }
}
</style>
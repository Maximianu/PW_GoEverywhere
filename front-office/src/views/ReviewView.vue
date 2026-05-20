<template>
  <main class="page-shell">
    <section class="content-container">
      
      <div class="section-header">
        <span class="small-note">Feedback de Voo</span>
        <h1 class="headline">Avalie a Missão</h1>
        <p class="subtitle">Your feedback ensures the safety and efficiency of future deep-space operations.</p>
      </div>

      <div class="review-grid">
        
        <div class="panel review-panel">
          <h3 class="card-title">Equipamento</h3>
          <p class="card-text">Avalie a integridade dos seus sistemas e ferramentas de bordo.</p>
          
          <div class="rating-section">
            <label class="field-label">Technical Rating</label>
            <div class="stars-container">
              <span class="star active">★</span>
              <span class="star active">★</span>
              <span class="star active">★</span>
              <span class="star active">★</span>
              <span class="star">★</span>
            </div>
            
            <textarea 
              rows="5" 
              placeholder="Detalhe anomalias, pressões, térmica ou conforto..." 
              class="review-textarea"
            ></textarea>
          </div>
        </div>

        <div class="panel review-panel">
          <h3 class="card-title">Viagem</h3>
          <p class="card-text">Reflicta sobre a dinâmica de voo, navegação e suporte logístico.</p>
          
          <div class="rating-section">
            <label class="field-label">Logistics Performance</label>
            <div class="stars-container">
              <span class="star active">★</span>
              <span class="star active">★</span>
              <span class="star active">★</span>
              <span class="star active">★</span>
              <span class="star active">★</span>
            </div>
            
            <textarea 
              rows="5" 
              placeholder="Avalie a suavidade dos controlos, g-força, e comunicação..." 
              class="review-textarea"
            ></textarea>
          </div>
        </div>

      </div>

      <div class="actions-wrapper">
        <button class="btn-primary">Submeter Avaliação →</button>
      </div>

    </section>
  </main>
</template>

<script setup>
// Lógica de submissão do formulário pode ser injetada aqui
</script>

<style scoped>
/* Estrutura de Alinhamento Base */
.page-shell {
  padding: 140px 20px 60px 20px; /* Alinhamento correto com a Navbar fixa */
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

/* Cabeçalho */
.section-header {
  margin-bottom: 32px;
}

.small-note {
  color: #00f2ff;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
  display: block;
  margin-bottom: 12px;
}

.headline {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 44px;
  color: #e1fdff;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.subtitle {
  color: rgba(185, 202, 203, 0.6);
  font-size: 16px;
  margin: 0;
  max-width: 600px;
  line-height: 1.5;
}

/* Grelha de Avaliação Responsiva */
.review-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  margin-top: 12px;
}

/* Painéis de Feedback */
.panel {
  background: #181c22;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 32px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 20px;
  color: #e1fdff;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.card-text {
  color: rgba(185, 202, 203, 0.5);
  font-size: 14px;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

/* Sistema de Classificação por Estrelas */
.rating-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 11px;
  color: rgba(225, 253, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stars-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.star {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(159, 203, 220, 0.3);
  text-align: center;
  padding: 12px 0;
  font-size: 18px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.star.active {
  background: rgba(0, 242, 255, 0.08);
  border-color: rgba(0, 242, 255, 0.3);
  color: #00f2ff;
  text-shadow: 0 0 8px rgba(0, 242, 255, 0.5);
}

.star:hover {
  border-color: #00f2ff;
  color: #00f2ff;
}

/* Áreas de Texto */
.review-textarea {
  width: 100%;
  background: #0b0e14;
  border: 1px solid rgba(58, 73, 75, 0.5);
  padding: 16px;
  color: #e1fdff;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.review-textarea:focus {
  border-color: #00f2ff;
  outline: none;
}

/* Botão e Alinhamento Inferior */
.actions-wrapper {
  margin-top: 32px;
  display: flex;
  justify-content: flex-start;
}

.btn-primary {
  background: #00f2ff;
  color: #00363a;
  padding: 16px 32px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
}

.btn-primary:hover {
  background: #e1fdff;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 242, 255, 0.2);
}

/* Responsividade Mobile */
@media (max-width: 768px) {
  .review-grid {
    grid-template-columns: 1fr; /* Empilha os blocos verticalmente em mobile */
    gap: 24px;
  }
  
  .headline {
    font-size: 32px;
  }
}
</style>
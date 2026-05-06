<template>
  <main class="missions-page">
    <section class="panel">
      <div class="section-header">
        <div>
          <p class="small-note">Entregas</p>
          <h1 class="headline">Veja as suas Entregas e Viagens</h1>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary">Ativas</button>
          <button class="btn btn-secondary">Concluídas</button>
        </div>
      </div>

      <div class="list-card">
        <div class="list-row">
          <div class="mission-info">
            <strong>Órbita Terrestre</strong>
            <small>Oct 24, 2024</small>
          </div>
          <div class="mission-status">
            <span class="label-pill status-active">Equipamento: em progresso</span>
          </div>
          <div class="mission-passengers">3</div>
          <router-link to="/missions/terrestrial" class="btn btn-primary">→</router-link>
        </div>
        
        </div>
    </section>
  </main>
</template>

<style scoped>
/* 1. O contentor principal agora ocupa a largura total */
.missions-page {
  width: 100%;
  min-height: 100vh;
  /* O padding-top garante que o título não fique por baixo da Navbar */
  padding-top: 8.75rem !important; 
  display: flex;
  justify-content: center;
}

/* 2. O painel que centraliza o conteúdo */
.panel {
  width: 100%;
  max-width: 68.75rem; /* Largura ideal para leitura */
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
}

.headline {
  font-size: 2.8rem;
  margin: 0.5rem 0 0 0;
  color: #e1fdff;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

/* 3. A lista de missões */
.list-card {
  background: rgba(24, 28, 34, 0.4);
  border: 0.0625rem solid rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  backdrop-filter: blur(0.625rem);
}

.list-row {
  display: grid;
  /* Define colunas fixas para que tudo fique alinhado verticalmente */
  grid-template-columns: 2fr 2fr 1fr 3.75rem;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 0.0625rem solid rgba(255, 255, 255, 0.05);
}

.list-row:last-child {
  border-bottom: none;
}

.mission-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.mission-info strong {
  font-size: 1.1rem;
  color: #e0e2eb;
}

.label-pill {
  padding: 0.375rem 0.75rem;
  border-radius: 1.25rem;
  font-size: 0.85rem;
  background: rgba(0, 242, 255, 0.1);
  color: #00f2ff;
}
</style>
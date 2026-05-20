<template>
  <main class="page-shell">
    <section class="content-container">
      
      <div class="section-header">
        <span class="telemetry-badge">Live Telemetry</span>
        <h1 class="headline">Projeto Base Lunar</h1>
        <p class="subtitle">Levamo-lo à Lua! Veja o seu progresso.</p>
      </div>

      <div class="mission-grid">
        
        <div class="panel main-panel">
          <h3 class="card-title">Timeline</h3>
          
          <div class="list-card">
            <div class="list-row three-cols">
              <div>
                <span class="label">Equipamento</span>
                <p class="status-text">Agendada • 12.05.2044</p>
              </div>
              <div>
                <span class="label">Em Progresso</span>
                <p class="status-text">15.05.2044</p>
              </div>
              <div>
                <span class="label">Entregue</span>
                <p class="status-text">18.05.2044</p>
              </div>
            </div>
          </div>

          <div class="list-card active-card">
            <div class="list-row split-cols">
              <div>
                <span class="label">Viagem</span>
                <p class="status-text">Agendada • 22.08.2044</p>
              </div>
              <div>
                <span class="label">Em Progresso: 65%</span>
                <div class="progress-bar">
                  <div class="progress-fill" style="width: 65%;"></div>
                </div>
                <p class="sub-label">Active Burn Phase</p>
              </div>
            </div>
          </div>
        </div>

        <aside class="panel side-panel">
          <h3 class="card-title">Equipa</h3>
          
          <div class="team-list">
            <div class="team-member">
              <span class="label">Estafeta</span>
              <strong class="member-name">José D. Limões</strong>
            </div>
            <div class="team-member">
              <span class="label">Piloto</span>
              <strong class="member-name">Jesus</strong>
            </div>
          </div>

          <router-link to="/review" class="btn-primary">
            Avaliar Missão →
          </router-link>
        </aside>

      </div>
    </section>
  </main>
</template>

<script setup>
// Lógica reativa pode ser adicionada aqui conforme necessário
</script>

<style scoped>
/* Estrutura de Alinhamento Base */
.page-shell {
  padding: 140px 20px 60px 20px; /* Compensa a altura da Navbar */
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
  margin-bottom: 40px;
}

.telemetry-badge {
  background: rgba(0, 242, 255, 0.1);
  color: #00f2ff;
  padding: 4px 12px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 16px;
}

.headline {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 44px;
  color: #e1fdff;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.subtitle {
  color: rgba(185, 202, 203, 0.6);
  font-size: 16px;
  margin: 0;
}

/* Layout da Grelha Corrigido (Evita as sobreposições) */
.mission-grid {
  display: grid;
  grid-template-columns: 1fr 340px; /* Timeline larga, Barra lateral fixa */
  gap: 32px;
  align-items: start;
}

/* Painéis */
.panel {
  background: #181c22;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 32px;
  border-radius: 6px;
}

.card-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 20px;
  color: #e1fdff;
  margin: 0 0 24px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Cartões de Listagem Interna */
.list-card {
  background: #0b0e14;
  padding: 24px;
  border-radius: 4px;
  margin-bottom: 20px;
  border-left: 3px solid rgba(255, 255, 255, 0.1);
}

.list-card.active-card {
  border-left-color: #00f2ff;
  box-shadow: 0 4px 20px rgba(0, 242, 255, 0.05);
}

/* Configuração das Colunas da Timeline */
.list-row {
  display: grid;
  gap: 20px;
}

.list-row.three-cols {
  grid-template-columns: repeat(3, 1fr);
}

.list-row.split-cols {
  grid-template-columns: 1fr 1.2fr;
}

.label {
  display: block;
  font-size: 11px;
  color: rgba(225, 253, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 6px;
}

.status-text {
  color: #e1fdff;
  font-size: 14px;
  margin: 0;
}

.sub-label {
  font-size: 12px;
  color: rgba(185, 202, 203, 0.4);
  margin: 6px 0 0 0;
}

/* Barra de Progresso */
.progress-bar {
  background: rgba(255, 255, 255, 0.05);
  height: 6px;
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
}

.progress-fill {
  background: #00f2ff;
  height: 100%;
  box-shadow: 0 0 10px rgba(0, 242, 255, 0.5);
}

/* Secção da Equipa */
.team-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.team-member {
  background: #0b0e14;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.member-name {
  color: #e1fdff;
  font-size: 16px;
  display: block;
  margin-top: 2px;
}

/* Botão de Ação */
.btn-primary {
  background: #00f2ff;
  color: #00363a;
  padding: 16px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 4px;
  text-decoration: none;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: all 0.3s ease;
  font-size: 13px;
}

.btn-primary:hover {
  background: #e1fdff;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 242, 255, 0.2);
}

/* Responsividade Mobile */
@media (max-width: 992px) {
  .mission-grid {
    grid-template-columns: 1fr; /* Força os blocos a empilhar verticalmente em ecrãs pequenos */
  }
  
  .list-row.three-cols, .list-row.split-cols {
    grid-template-columns: 1fr; /* Transforma as colunas internas em linhas no telemóvel */
    gap: 16px;
  }
}
</style>
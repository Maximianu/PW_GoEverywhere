<template>
  <main class="page-shell">
    <section class="panel" style="padding: 40px;">
      <div class="section-header">
        <div>
          <p class="small-note">GoEverywhere Space Edition</p>
          <h1 class="headline">Beyond the Horizon</h1>
        </div>
      </div>

      <div class="grid" style="gap: 26px; margin-top: 24px;">
        <div>
          <p class="subtitle">
            Pioneirismo no futuro das experiências espaciais e logística orbital avançada.
          </p>
          <div style="display: flex; flex-wrap: wrap; gap: 14px; margin-top: 24px;">
            <router-link to="/book" class="btn btn-primary">Reserve Sua Jornada</router-link>
            <router-link to="/missions" class="btn btn-secondary">Ver Missões Ativas</router-link>
          </div>
        </div>
        <div class="card large" style="background: linear-gradient(180deg, rgba(255,255,255,0.04), rgba(0,0,0,0.45));">
          <div class="card-body" style="display: grid; gap: 18px;">
            <div class="badge">Reserve a sua missão orbital</div>
            <div style="margin-top: 24px;">
              <h2 class="card-title">Inovação sem Fronteiras</h2>
              <p class="card-text">
                A GoEverywhere evoluiu de uma líder em logística terrestre para a vanguarda da exploração espacial.
              </p>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 18px;">
              <div class="panel ghost">
                <h3 class="card-title" style="font-size: 1rem;">Segurança de Próxima Geração</h3>
                <p class="card-text">Protocolos redundantes e tecnologia aeroespacial de ponta.</p>
              </div>
              <div class="panel ghost">
                <h3 class="card-title" style="font-size: 1rem;">Inovação Constante</h3>
                <p class="card-text">Propulsão sustentável e naves reutilizáveis.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="section-header">
        <div>
          <p class="small-note">Escolha Seu Destino</p>
          <h2 class="mission-title">Explore rotas espaciais de alto impacto</h2>
        </div>
      </div>

      <div class="grid grid-3">
        <div class="card">
          <div class="card-body">
            <div class="card-header">
              <div>
                <h3 class="card-title">Órbita Terrestre</h3>
                <p class="card-text">Sinta a gravidade zero e contemple a curvatura da Terra.</p>
              </div>
              <span class="badge">48 horas</span>
            </div>
            <div style="margin-top: 16px;">
              <p class="card-text">Estadia de 48 horas • Vista de 360 graus</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="card-header">
              <div>
                <h3 class="card-title">Base Lunar</h3>
                <p class="card-text">Pise na superfície prateada e explore as colônias subterrâneas.</p>
              </div>
              <span class="badge">12 dias</span>
            </div>
            <div style="margin-top: 16px;">
              <p class="card-text">Expedição Geológica • Domo Biosférico</p>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="card-body">
            <div class="card-header">
              <div>
                <h3 class="card-title">Espaço Profundo</h3>
                <p class="card-text">Missões tripuladas para Marte e Saturno.</p>
              </div>
              <span class="badge">3 anos</span>
            </div>
            <div style="margin-top: 16px;">
              <p class="card-text">Viagem Crionica • Exploração de Titã</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="stats-row">
        <div class="panel stat-card">
          <p class="stat-value">500+</p>
          <p class="stat-label">Missões Completas</p>
        </div>
        <div class="panel stat-card">
          <p class="stat-value">12</p>
          <p class="stat-label">Naves Ativas</p>
        </div>
        <div class="panel stat-card">
          <p class="stat-value">98%</p>
          <p class="stat-label">Sucesso em Lançamentos</p>
        </div>
        <div class="panel stat-card">
          <p class="stat-value">4.9/5</p>
          <p class="stat-label">Satisfação do Cliente</p>
        </div>
      </div>
    </section>
  </main>
</template>

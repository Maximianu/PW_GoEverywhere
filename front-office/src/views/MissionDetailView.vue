<template>
  <div class="side-layout">
    <main class="page-shell" style="padding: 0;">
      <section class="panel">
        <div class="section-header">
          <div>
            <span class="badge">Live Telemetry</span>
            <h1 class="headline" style="font-size: 2.8rem; margin-top: 18px;">Projeto Base Lunar</h1>
            <p class="subtitle">Levamo-lo à Lua! Veja o seu progresso.</p>
          </div>
        </div>

        <div class="grid grid-2" style="margin-top: 30px;">
          <div class="panel ghost">
            <div class="section-header">
              <div>
                <h3 class="card-title">Timeline</h3>
              </div>
            </div>
            <div class="list-card" style="margin-top: 10px;">
              <div class="list-row" style="grid-template-columns: 1fr 1fr 1fr; align-items:start;">
                <div>
                  <span class="label">Equipamento</span>
                  <p style="margin: 10px 0 0;">Agendada • 12.05.2044</p>
                </div>
                <div>
                  <span class="label">Em Progresso</span>
                  <p style="margin: 10px 0 0;">15.05.2044</p>
                </div>
                <div>
                  <span class="label">Entregue</span>
                  <p style="margin: 10px 0 0;">18.05.2044</p>
                </div>
              </div>
            </div>

            <div class="list-card" style="margin-top: 20px;">
              <div class="list-row" style="grid-template-columns: 1fr 1.2fr; align-items:start;">
                <div>
                  <span class="label">Viagem</span>
                  <p style="margin: 10px 0 0;">Agendada • 22.08.2044</p>
                </div>
                <div>
                  <span class="label">Em Progresso: 65%</span>
                  <div class="progress-bar"><div class="progress-fill" style="width: 65%;"></div></div>
                  <p style="margin: 10px 0 0; color: var(--muted);">Active Burn Phase</p>
                </div>
              </div>
            </div>
          </div>

          <aside class="panel ghost" style="padding: 26px;">
            <div>
              <p class="label">Equipe</p>
              <div style="margin-top: 18px; display: grid; gap: 18px;">
                <div class="panel ghost" style="padding: 16px; border-radius: 20px;">
                  <p class="label">Estafeta</p>
                  <strong>José D. Limões</strong>
                </div>
                <div class="panel ghost" style="padding: 16px; border-radius: 20px;">
                  <p class="label">Piloto</p>
                  <strong>Jesus</strong>
                </div>
              </div>
            </div>

            <router-link to="/review" class="btn btn-primary" style="width:100%; margin-top: 28px; justify-content: center;">Avaliar Missão →</router-link>
          </aside>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
</script>

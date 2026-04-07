<template>
  <div class="side-layout">
    <SidePanel />
    <main class="page-shell" style="padding: 0;">
      <section class="panel">
        <div class="section-header">
          <div>
            <p class="small-note">Configure a sua viagem</p>
            <h1 class="headline" style="font-size: 2.8rem;">Escolha o seu destino</h1>
          </div>
        </div>

        <p class="subtitle">Personalize a sua trajetória orbital antes de partir.</p>

        <div class="section" style="margin-top: 32px;">
          <p class="label">01. Seleção do Destino</p>
          <div class="card-grid" style="grid-template-columns: repeat(2, minmax(0, 1fr)); margin-top: 18px;">
            <div class="card">
              <div class="card-body">
                <div class="card-header">
                  <div>
                    <h3 class="card-title">Órbita da Terra</h3>
                    <p class="card-text">Sinta a gravidade zero em nossa estação panorâmica.</p>
                  </div>
                  <span class="badge">3 days</span>
                </div>
              </div>
            </div>
            <div class="card" style="border-color: rgba(0, 242, 255, 0.22);">
              <div class="card-body">
                <div class="card-header">
                  <div>
                    <h3 class="card-title">Base Lunar</h3>
                    <p class="card-text">Pise na superfície prateada e explore a colônia lunar.</p>
                  </div>
                  <span class="badge">12 days</span>
                </div>
              </div>
            </div>
            <div class="card">
              <div class="card-body">
                <div class="card-header">
                  <div>
                    <h3 class="card-title">Colônia de Marte</h3>
                    <p class="card-text">Missão prolongada ao planeta vermelho.</p>
                  </div>
                  <span class="badge">210 days</span>
                </div>
              </div>
            </div>
            <div class="card">
              <div class="card-body">
                <div class="card-header">
                  <div>
                    <h3 class="card-title">Anéis de Saturno</h3>
                    <p class="card-text">Trajetória extensa até a gigante gasosa.</p>
                  </div>
                  <span class="badge">3 years</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="section">
          <p class="label">02. Parâmetros da missão</p>
          <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 22px; margin-top: 16px;">
            <div class="panel ghost">
              <p class="label">Data de lançamento</p>
              <input type="date" value="2028-11-15" style="width:100%; margin-top: 12px;" />
            </div>
            <div class="panel ghost">
              <p class="label">Número de passageiros</p>
              <div style="display:flex; gap: 12px; align-items:center; margin-top: 12px;">
                <button class="btn btn-secondary">-</button>
                <strong style="font-size:1.25rem;">04</strong>
                <button class="btn btn-secondary">+</button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <aside class="panel" style="min-height: 320px;">
        <div class="section-header">
          <div>
            <p class="small-note">Sumário do preço</p>
            <h2 class="card-title">Custo estimado</h2>
          </div>
        </div>

        <div class="list-card">
          <div class="list-row">
            <div>Treiatoria (Lunar)</div>
            <strong>1,250,000 €</strong>
          </div>
          <div class="list-row">
            <div>Combustível</div>
            <strong>420,000 €</strong>
          </div>
          <div class="list-row">
            <div>Life Support (12 Days)</div>
            <strong>85,000 €</strong>
          </div>
          <div class="list-row">
            <div>Seguro</div>
            <strong>12,500 €</strong>
          </div>
        </div>

        <div style="margin-top: 24px;">
          <p class="label">Custo total</p>
          <h2 style="margin: 12px 0 0;">1,767,500 <span style="font-size: 0.9rem; color: var(--muted);">€</span></h2>
        </div>

        <router-link to="/kit" class="btn btn-primary" style="width:100%; margin-top: 28px; justify-content: center;">Escolher Kit →</router-link>
      </aside>
    </main>
  </div>
</template>

<script setup>
import SidePanel from '../components/SidePanel.vue'
</script>

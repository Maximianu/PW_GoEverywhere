<template>
  <div class="side-layout">
    <SidePanel />
    <main class="page-shell" style="padding: 0;">
      <section class="panel grid-2">
        <div>
          <div class="section-header">
            <div>
              <p class="small-note">Pagamento Seguro</p>
              <h1 class="headline" style="font-size: 2.8rem;">Autorizе o pagamento por transferência bancária.</h1>
            </div>
          </div>
          <p class="subtitle">Autorize o pagamento por transferência bancária.</p>

          <div class="panel ghost" style="margin-top: 24px;">
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 18px;">
              <div class="input-group">
                <label>
                  IBAN
                  <input type="text" value="PT50 0000 0000 0000 0000 0000 0" readonly />
                </label>
              </div>
              <div class="input-group">
                <label>
                  SWIFT / BIC
                  <input type="text" value="ORBITPTPLXXX" readonly />
                </label>
              </div>
            </div>
            <div class="grid" style="grid-template-columns: 1fr 1fr; gap: 18px; margin-top: 20px;">
              <div class="input-group">
                <label>
                  Entidade
                  <input type="text" value="12345" readonly />
                </label>
              </div>
              <div class="input-group">
                <label>
                  Referência
                  <input type="text" value="987 654 321" readonly />
                </label>
              </div>
            </div>
            <p class="card-text" style="margin-top: 20px; font-size: 0.92rem;">* A aprovação do pagamento pode levar até 24 horas úteis após a transferência.</p>
          </div>
        </div>

        <aside class="panel" style="background: rgba(10, 25, 42, 0.95);">
          <p class="small-note">Mission Summary</p>
          <h2 class="mission-title" style="font-size: 1.8rem; margin-top: 12px;">Final Allocation</h2>

          <div class="list-card" style="margin-top: 22px;">
            <div class="list-row"><div>Tipo de missão</div><strong>12,400 €</strong></div>
            <div class="list-row"><div>Tamanho da tripulação</div><strong>4,200 €</strong></div>
            <div class="list-row"><div>Kit escolhido</div><strong>2,150 €</strong></div>
          </div>

          <div style="margin-top: 22px;">
            <p class="label">Final Allocation</p>
            <h2 style="margin: 12px 0 0;">18,750 €</h2>
          </div>

          <router-link to="/missions" class="btn btn-primary" style="width:100%; margin-top: 28px; justify-content: center;">Confirmar e Lançar</router-link>
        </aside>
      </section>
    </main>
  </div>
</template>

<script setup>
import SidePanel from '../components/SidePanel.vue'
</script>

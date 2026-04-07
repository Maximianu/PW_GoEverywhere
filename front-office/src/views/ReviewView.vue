<template>
  <div class="side-layout">
    <SidePanel />
    <main class="page-shell" style="padding: 0;">
      <section class="panel">
        <div class="section-header">
          <div>
            <p class="small-note">Avalie da missão</p>
            <h1 class="headline" style="font-size: 2.8rem;">Avalie a missão</h1>
          </div>
        </div>

        <p class="subtitle">Your feedback ensures the safety and efficiency of future deep-space operations.</p>

        <div class="grid grid-2" style="gap: 28px; margin-top: 28px;">
          <div class="panel ghost">
            <div class="section-header">
              <div>
                <h3 class="card-title">Equipamento</h3>
              </div>
            </div>
            <p class="card-text">Avalie a integridade dos seus sistemas e ferramentas de bordo.</p>
            <div style="margin-top: 18px;">
              <p class="label">Technical Rating</p>
              <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 10px;">
                <span class="badge" style="padding: 10px 0;">★</span>
                <span class="badge" style="padding: 10px 0;">★</span>
                <span class="badge" style="padding: 10px 0;">★</span>
                <span class="badge" style="padding: 10px 0;">★</span>
                <span class="badge" style="padding: 10px 0; background: rgba(255,255,255,0.04); color: #9fcbdc;">★</span>
              </div>
              <textarea rows="5" placeholder="Detalhe anomalias, pressões, térmica ou conforto..." style="width:100%; margin-top:18px; border-radius:18px; border:1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); color: #eef7ff; padding: 18px;"></textarea>
            </div>
          </div>

          <div class="panel ghost">
            <div class="section-header">
              <div>
                <h3 class="card-title">Viagem</h3>
              </div>
            </div>
            <p class="card-text">Refletia sobre a dinâmica de voo, navegação e suporte logístico.</p>
            <div style="margin-top: 18px;">
              <p class="label">Logistics Performance</p>
              <div style="display:grid; grid-template-columns: repeat(5, 1fr); gap: 8px; margin-top: 10px;">
                <span class="badge" style="padding: 10px 0;">★</span>
                <span class="badge" style="padding: 10px 0;">★</span>
                <span class="badge" style="padding: 10px 0;">★</span>
                <span class="badge" style="padding: 10px 0;">★</span>
                <span class="badge" style="padding: 10px 0;">★</span>
              </div>
              <textarea rows="5" placeholder="Avalie a suavidade dos controles, g-força, e comunicação..." style="width:100%; margin-top:18px; border-radius:18px; border:1px solid rgba(255,255,255,0.08); background: rgba(255,255,255,0.04); color: #eef7ff; padding: 18px;"></textarea>
            </div>
          </div>
        </div>

        <button class="btn btn-primary" style="margin-top: 28px;">Submeter Avaliação →</button>
      </section>
    </main>
  </div>
</template>

<script setup>
import SidePanel from '../components/SidePanel.vue'
</script>

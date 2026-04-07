<template>
  <div class="side-layout">
    <SidePanel />
    <main class="page-shell" style="padding: 0;">
      <section class="panel">
        <div class="section-header">
          <div>
            <p class="small-note">Entregas</p>
            <h1 class="headline" style="font-size: 2.8rem;">Veja as suas Entregas e Viagens</h1>
          </div>
          <div style="display: flex; gap: 12px;">
            <button class="btn btn-secondary">Ativas</button>
            <button class="btn btn-secondary">Concluídas</button>
          </div>
        </div>

        <div class="list-card" style="margin-top: 16px;">
          <div class="list-row">
            <div>
              <strong>Órbita Terrestre</strong>
              <small>Oct 24, 2024</small>
            </div>
            <div><span class="label-pill status-active">Equipamento: em progresso</span></div>
            <div>3</div>
            <router-link to="/missions/terrestrial" class="btn btn-primary">→</router-link>
          </div>
          <div class="list-row">
            <div>
              <strong>Base Lunar</strong>
              <small>Dec 12, 2024</small>
            </div>
            <div><span class="label-pill status-wait">Viagem: Agendada</span></div>
            <div>4</div>
            <router-link to="/missions/lunar" class="btn btn-primary">→</router-link>
          </div>
          <div class="list-row">
            <div>
              <strong>Colônia de Marte</strong>
              <small>Jan 02, 2025</small>
            </div>
            <div><span class="label-pill status-pause">Equipamento: Em Espera</span></div>
            <div>1</div>
            <router-link to="/missions/mars" class="btn btn-primary">→</router-link>
          </div>
          <div class="list-row">
            <div>
              <strong>Anéis de Saturno</strong>
              <small>Jan 15, 2025</small>
            </div>
            <div><span class="label-pill status-wait">Viagem: Agendada</span></div>
            <div>2</div>
            <router-link to="/missions/saturn" class="btn btn-primary">→</router-link>
          </div>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import SidePanel from '../components/SidePanel.vue'
</script>

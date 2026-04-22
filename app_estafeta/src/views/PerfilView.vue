<template>
  <div class="app-shell">
    <div class="screen profile-screen">
      <header class="deliveries-header">
        <h1>Perfil</h1>
      </header>

      <div class="profile-avatar"></div>

      <div class="profile-name">
        <h2>José Tomás Silva</h2>
        <p>Nº12</p>
      </div>

      <section class="profile-stats">
        <div class="stat-card"><span class="stat-label">Horas Trabalhadas</span><strong>460</strong></div>
        <div class="stat-card"><span class="stat-label">Entregas Hoje</span><strong>3</strong></div>
        <div class="stat-card"><span class="stat-label">Entregas Concluídas</span><strong>99</strong></div>
        <div class="stat-card"><span class="stat-label">Taxa de sucesso</span><strong>89.9%</strong></div>
      </section>

      <div class="small-box centered-box">
        <p>Avaliação média: 4,3 (12 avaliações)</p>
      </div>

      <button class="primary-btn logout-main-btn" @click="logout">Terminar Sessão</button>

      <nav class="bottom-nav">
        <button class="nav-item" @click="go('/entregas')">ENTREGAS</button>
        <button class="nav-item" @click="go('/historico')">HISTÓRICO</button>
        <button class="nav-item active" @click="go('/perfil')">PERFIL</button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function go(path) {
  router.push(path)
}

function logout() {
  router.push('/')
}
</script>
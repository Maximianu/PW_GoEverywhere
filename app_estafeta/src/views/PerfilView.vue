<template>
  <div class="app-shell">
    <div class="screen profile-screen">
      <header class="deliveries-header">
        <h1>Perfil</h1>
      </header>

      <div class="profile-avatar-wrapper">
        <div class="profile-avatar">
          <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="rgba(173, 214, 255, 0.65)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
        </div>
      </div>

      <div class="profile-name">
        <h2>{{ estafeta.nome }}</h2>
        <p>{{ estafeta.email }}</p>
        <p v-if="estafeta.telemovel">📞 {{ estafeta.telemovel }}</p>
      </div>

      <section class="stats-grid profile-stats">
        <div class="stat-card"><span class="stat-label">Horas Trabalhadas</span><strong>460</strong></div>
        <div class="stat-card"><span class="stat-label">Entregas Hoje</span><strong>3</strong></div>
        <div class="stat-card"><span class="stat-label">Entregas Concluídas</span><strong>99</strong></div>
        <div class="stat-card"><span class="stat-label">Taxa de sucesso</span><strong>89.9%</strong></div>
      </section>

      <div class="small-box centered-box">
        <p>Avaliação média: 4,3 (12 avaliações)</p>
      </div>

      <button class="primary-btn btn-glow logout-main-btn" @click="logout">Terminar Sessão</button>

      <nav class="bottom-nav">
        <button class="nav-item" @click="go('/entregas')">ENTREGAS</button>
        <button class="nav-item" @click="go('/historico')">HISTÓRICO</button>
        <button class="nav-item active" @click="go('/perfil')">PERFIL</button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const estafeta = ref({
  nome: 'Estafeta',
  email: 'Email não definido',
  telemovel: '',
})

onMounted(() => {
  const dados = localStorage.getItem('estafeta')

  if (dados) {
    estafeta.value = {
      ...estafeta.value,
      ...JSON.parse(dados),
    }
  }
})

function go(path) {
  router.push(path)
}

function logout() {
  localStorage.removeItem('estafeta')
  router.push('/')
}
</script>
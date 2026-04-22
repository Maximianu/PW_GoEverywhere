<template>
  <div class="app-shell">
    <div class="screen history-screen">
      <header class="deliveries-header">
        <h1>Histórico</h1>
        <p>Data: _ / _</p>
      </header>

      <section class="stats-grid history-stats">
        <div class="stat-card">
          <span class="stat-label">Total</span>
          <strong>99</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">Entregues</span>
          <strong>89</strong>
        </div>
        <div class="stat-card active-stat">
          <span class="stat-label">Não Entregues</span>
          <strong>10</strong>
        </div>
      </section>

      <section class="search-wrapper">
        <input
          v-model="search"
          type="text"
          class="search-input"
          placeholder="Pesquisar encomenda"
        />
      </section>

      <section class="deliveries-list">
        <article v-for="item in filteredHistory" :key="item.id" class="delivery-card">
          <div class="delivery-top-row">
            <div>
              <h2>{{ item.name }}</h2>
              <span class="delivery-id">#{{ item.id }}</span>
            </div>
            <span class="status-pill" :class="item.status === 'Entregue' ? 'pill-done' : 'pill-pending'">
              {{ item.status }}
            </span>
          </div>

          <p class="delivery-line">📍 {{ item.address }}</p>
          <p class="delivery-line">⏰ {{ item.time }}</p>
          <p class="delivery-line">🗓 {{ item.date }}</p>
        </article>
      </section>

      <nav class="bottom-nav">
        <button class="nav-item" @click="go('/entregas')">ENTREGAS</button>
        <button class="nav-item active" @click="go('/historico')">HISTÓRICO</button>
        <button class="nav-item" @click="go('/perfil')">PERFIL</button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const search = ref('')

const history = ref([
  { id: 100, name: 'João Santos', address: 'Avenida D. João IV 19, Guimarães', time: '17:12', date: '19/03/2026', status: 'Entregue' },
  { id: 99, name: 'Rita Leite', address: 'Rua de Francos 9B, Guimarães', time: '14:52', date: '19/03/2026', status: 'Entregue' },
  { id: 98, name: 'Luísa Lopes', address: 'Rua Gil Vicente 23, Guimarães', time: '9:18', date: '19/03/2026', status: 'Não Entregue' },
  { id: 97, name: 'Sérgio Peixoto', address: 'Largo da Oliveira 83, Guimarães', time: '16:43', date: '18/03/2026', status: 'Não Entregue' },
])

const filteredHistory = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return history.value

  return history.value.filter((item) =>
    item.name.toLowerCase().includes(term) ||
    String(item.id).includes(term) ||
    item.address.toLowerCase().includes(term) ||
    item.status.toLowerCase().includes(term)
  )
})

function go(path) {
  router.push(path)
}
</script>
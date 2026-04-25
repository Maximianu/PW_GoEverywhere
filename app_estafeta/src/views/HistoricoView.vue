<template>
  <div class="app-shell">
    <div class="screen history-screen">
      <header class="deliveries-header">
        <h1>Histórico</h1>
        <p>Data: _ / _</p>
      </header>

      <section class="stats-grid stats-grid-3 history-stats">
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
        <div class="search-box">
          <i class="search-icon">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </i>
          <input
            v-model="search"
            type="text"
            class="search-input"
            placeholder="Pesquisar encomenda"
          />
        </div>
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

          <p class="delivery-line">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px; opacity:0.8"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
            {{ item.address }}
          </p>
          <div class="delivery-line-flex">
            <span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px; opacity:0.8"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              {{ item.time }}
            </span>
            <span>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right:4px; opacity:0.8"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
              {{ item.date }}
            </span>
          </div>
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
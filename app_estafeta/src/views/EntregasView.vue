<template>
  <div class="app-shell">
    <div class="screen deliveries-screen">
      <header class="deliveries-header">
        <h1>Entregas</h1>
        <p>Hoje</p>
      </header>

      <section class="stats-grid stats-grid-3">
        <div class="stat-card active-stat">
          <span class="stat-label">Pendentes</span>
          <strong>{{ pendingCount }}</strong>
        </div>

        <div class="stat-card active-stat">
          <span class="stat-label">Em Rota</span>
          <strong>{{ inRouteCount }}</strong>
        </div>

        <div class="stat-card outline-only">
          <span class="stat-label">Total</span>
          <strong>{{ deliveries.length }}</strong>
        </div>
      </section>

      <section class="search-wrapper">
        <div class="search-box">
          <span class="search-icon">⌕</span>
          <input
            v-model="search"
            type="text"
            class="search-input"
            placeholder="Pesquisar encomenda"
          />
        </div>
      </section>

      <section class="deliveries-list">
        <article
          v-for="delivery in filteredDeliveries"
          :key="delivery.id"
          class="delivery-card"
          :class="{ featured: delivery.status === 'Em rota' }"
        >
          <div class="delivery-top-row">
            <div>
              <h2>{{ delivery.name }}</h2>
              <span class="delivery-id">#{{ delivery.id }}</span>
            </div>

            <span class="status-pill" :class="pillClass(delivery.status)">
              {{ delivery.status }}
            </span>
          </div>

          <p class="delivery-line">📍 {{ delivery.address }}</p>
          <p class="delivery-line">⏰ {{ delivery.time }}</p>

          <button class="details-btn" @click="verDetalhes(delivery.id)">
            Ver Detalhes
          </button>
        </article>
      </section>

      <nav class="bottom-nav">
        <button class="nav-item active" @click="go('/entregas')">ENTREGAS</button>
        <button class="nav-item" @click="go('/historico')">HISTÓRICO</button>
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

const deliveries = ref([
  {
    id: 102,
    name: 'Maria Silva',
    address: 'Rua da Serpa Pinto 12, Guimarães',
    time: '11:00-13:00',
    status: 'Pendente',
  },
  {
    id: 103,
    name: 'Ana Costa',
    address: 'Avenida D Afonso Henriques 45, Guimarães',
    time: '13:00-15:00',
    status: 'Pendente',
  },
  {
    id: 104,
    name: 'João Mendes',
    address: 'Rua de São Torcato 110, Guimarães',
    time: '15:00-17:00',
    status: 'Entregue',
  },
])

const filteredDeliveries = computed(() => {
  const term = search.value.trim().toLowerCase()
  if (!term) return deliveries.value

  return deliveries.value.filter((delivery) => {
    return (
      delivery.name.toLowerCase().includes(term) ||
      String(delivery.id).includes(term) ||
      delivery.address.toLowerCase().includes(term) ||
      delivery.status.toLowerCase().includes(term)
    )
  })
})

const pendingCount = computed(
  () => deliveries.value.filter((d) => d.status === 'Pendente').length,
)

const inRouteCount = computed(
  () => deliveries.value.filter((d) => d.status === 'Em rota').length,
)

function pillClass(status) {
  if (status === 'Em rota') return 'pill-route'
  return 'pill-pending'
}

function verDetalhes(id) {
  router.push(`/detalhe/${id}`)
}

function go(path) {
  router.push(path)
}
</script>
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const search = ref('')
const deliveries = ref([])

async function carregarEntregas() {
  const estafeta = JSON.parse(localStorage.getItem('estafeta'))

  const response = await fetch(
    `http://localhost:1338/api/pedido-missions?filters[estafeta][id][$eq]=${estafeta.id}&populate=*`
  )

  const result = await response.json()

  deliveries.value = result.data.map((item) => ({
    id: item.id,
    name: item.Cliente || 'Cliente não definido',
    address: item.LocalEntrega || item.Destino || 'Morada não definida',
    time: item.Horario || 'Horário não definido',
    status: item.Estado === 'Transito' ? 'Em rota' : item.Estado || 'Pendente',
  }))
}

onMounted(carregarEntregas)

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
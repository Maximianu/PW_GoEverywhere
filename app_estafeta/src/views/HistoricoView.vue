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
          <strong>{{ history.length }}</strong>
        </div>
        <div class="stat-card">
          <span class="stat-label">Entregues</span>
          <strong>{{ deliveredCount }}</strong>
        </div>
        <div class="stat-card active-stat">
          <span class="stat-label">Não Entregues</span>
          <strong>{{ notDeliveredCount }}</strong>
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
        <article v-for="item in filteredHistory" :key="item.id" class="delivery-card">
          <div class="delivery-top-row">
            <div>
              <h2>{{ item.name }}</h2>
              <span class="delivery-id">#{{ item.id }}</span>
            </div>

            <span
              class="status-pill"
              :class="item.status === 'Entregue' ? 'pill-done' : 'pill-pending'"
            >
              {{ item.status }}
            </span>
          </div>

          <p class="delivery-line">📍 {{ item.address }}</p>

          <div class="delivery-line-flex">
            <span>⏰ {{ item.time }}</span>
            <span>📅 {{ item.date }}</span>
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
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const search = ref('')
const history = ref([])

function mapStatus(status) {
  if (!status) return 'Pendente'

  if (status.toLowerCase().includes('concluido')) return 'Entregue'
  if (status.toLowerCase().includes('não')) return 'Não Entregue'

  return 'Pendente'
}

async function carregarHistorico() {
  const response = await fetch('http://localhost:1338/api/pedido-missions')
  const result = await response.json()

  history.value = result.data
    .map((item) => ({
      id: item.id,
      name: item.Cliente || 'Cliente não definido',
      address: item.LocalEntrega || item.Destino || 'Morada não definida',
      time: item.Horario || '—',
      date: item.createdAt?.slice(0, 10) || '—',
      status: mapStatus(item.Estado),
    }))
    .filter((item) => item.status === 'Entregue' || item.status === 'Não Entregue')
}

onMounted(carregarHistorico)

const filteredHistory = computed(() => {
  const term = search.value.toLowerCase()
  if (!term) return history.value

  return history.value.filter((item) =>
    item.name.toLowerCase().includes(term) ||
    String(item.id).includes(term) ||
    item.address.toLowerCase().includes(term)
  )
})

const deliveredCount = computed(
  () => history.value.filter((h) => h.status === 'Entregue').length,
)

const notDeliveredCount = computed(
  () => history.value.filter((h) => h.status === 'Não Entregue').length,
)

function go(path) {
  router.push(path)
}
</script>
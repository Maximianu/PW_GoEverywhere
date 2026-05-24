<template>
  <div class="app-shell">
    <div class="screen history-screen">
      <header class="deliveries-header">
        <h1>Histórico</h1>
        <input v-model="selectedDate" type="date" class="search-input" />
      </header>

      <section class="stats-grid stats-grid-3 history-stats">
        <div class="stat-card">
          <span class="stat-label">Total</span>
          <strong>{{ filteredHistory.length }}</strong>
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
            placeholder="Pesquisar por cliente ou encomenda"
          />
        </div>
      </section>

      <section class="deliveries-list">
        <article v-for="item in filteredHistory" :key="item.id" class="delivery-card">
          <div class="delivery-top-row">
            <div>
              <h2>{{ item.name }}</h2>
              <span class="delivery-id">#{{ item.numero }}</span>
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
            <span v-if="item.time && item.time !== '—'">⏰ {{ item.time }}</span>
            <span>📅 {{ item.date }}</span>
          </div>

          <p class="delivery-line">⚡ Prioridade: {{ item.priority }}</p>

          <p v-if="item.problema" class="delivery-line">
            ⚠️ {{ item.problema }}
          </p>
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
import { getPedidos, getEstafetaLogado } from '../services/api'

const router = useRouter()
const search = ref('')
const selectedDate = ref('')
const history = ref([])

function getClienteNome(item) {
  const cliente = item.cliente

  if (!cliente) return 'Cliente não definido'

  const primeiro = cliente.PrimeiroNome || cliente.primeiroNome || ''
  const ultimo = cliente.UltimoNome || cliente.ultimoNome || ''
  const nome = `${primeiro} ${ultimo}`.trim()

  return nome || cliente.Email || cliente.email || 'Cliente não definido'
}

function mapStatus(status) {
  if (!status) return 'Outro'

  const value = status.toLowerCase()

  if (value.includes('aprovado')) {
    return 'Pendente'
  }

  if (value.includes('concluido') || value.includes('concluído')) {
    return 'Entregue'
  }

  if (value.includes('não') || value.includes('nao') || value.includes('rejeitado') || value.includes('cancelado')) {
    return 'Não Entregue'
  }

  return 'Outro'
}

async function carregarHistorico() {
  const estafeta = getEstafetaLogado()

  if (!estafeta) {
    router.push('/')
    return
  }

  const result = await getPedidos(estafeta.id)

  history.value = result.data
    .map((item) => ({
      id: item.documentId,
      numero: item.id,
      name: getClienteNome(item),
      address: item.LocalEntrega || item.Destino || 'Morada não definida',
      time: item.Horario || '—',
      date: item.updatedAt?.slice(0, 10) || item.createdAt?.slice(0, 10) || '—',
      priority: item.Prioridade || item.Prioridade_Entrega || 'Normal',
      status: mapStatus(item.Estado),
      problema: item.Problema || '',
    }))
    .filter((item) => item.status === 'Entregue' || item.status === 'Não Entregue')
}

onMounted(carregarHistorico)

const filteredHistory = computed(() => {
  const term = search.value.trim().toLowerCase()

  return history.value.filter((item) => {
    const matchesSearch =
      !term ||
      item.name.toLowerCase().includes(term) ||
      String(item.numero).includes(term) ||
      item.address.toLowerCase().includes(term) ||
      item.status.toLowerCase().includes(term)

    const matchesDate = !selectedDate.value || item.date === selectedDate.value

    return matchesSearch && matchesDate
  })
})

const deliveredCount = computed(
  () => filteredHistory.value.filter((h) => h.status === 'Entregue').length,
)

const notDeliveredCount = computed(
  () => filteredHistory.value.filter((h) => h.status === 'Não Entregue').length,
)

function go(path) {
  router.push(path)
}
</script>
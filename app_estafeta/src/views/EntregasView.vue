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
            placeholder="Pesquisar por cliente ou encomenda"
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

              <span class="delivery-id">
                #{{ delivery.numero }}
              </span>
            </div>

            <span class="status-pill" :class="pillClass(delivery.status)">
              {{ delivery.status }}
            </span>
          </div>

          <p class="delivery-line">
            📍 {{ delivery.address }}
          </p>

          <p v-if="delivery.time && delivery.time !== 'Horário não definido'" class="delivery-line">
            ⏰ {{ delivery.time }}
          </p>

          <p class="delivery-line">
            ⚡ Prioridade: {{ delivery.priority }}
          </p>

          <button
            class="details-btn"
            @click="verDetalhes(delivery.id)"
          >
            Ver Detalhes
          </button>
        </article>
      </section>

      <nav class="bottom-nav">
        <button
          class="nav-item active"
          @click="go('/entregas')"
        >
          ENTREGAS
        </button>

        <button
          class="nav-item"
          @click="go('/historico')"
        >
          HISTÓRICO
        </button>

        <button
          class="nav-item"
          @click="go('/perfil')"
        >
          PERFIL
        </button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import {
  getPedidos,
  getEstafetaLogado,
} from '../services/api'

const router = useRouter()

const search = ref('')
const deliveries = ref([])

function getClienteNome(item) {
  const cliente = item.cliente

  if (!cliente) {
    return 'Cliente não definido'
  }

  const primeiro =
    cliente.PrimeiroNome ||
    cliente.primeiroNome ||
    ''

  const ultimo =
    cliente.UltimoNome ||
    cliente.ultimoNome ||
    ''

  const nome = `${primeiro} ${ultimo}`.trim()

  return (
    nome ||
    cliente.Email ||
    cliente.email ||
    'Cliente não definido'
  )
}

function mapStatus(status) {
  if (!status) return 'Outro'

  const value = status.toLowerCase()

  if (value.includes('aprovado')) {
    return 'Pendente'
  }

  if (
    value.includes('transito') ||
    value.includes('trânsito') ||
    value.includes('rota')
  ) {
    return 'Em rota'
  }

  if (
    value.includes('concluido') ||
    value.includes('concluído')
  ) {
    return 'Entregue'
  }

  if (
    value.includes('não') ||
    value.includes('nao') ||
    value.includes('rejeitado') ||
    value.includes('cancelado')
  ) {
    return 'Não Entregue'
  }

  return 'Outro'
}

async function carregarEntregas() {
  const estafeta = getEstafetaLogado()

  if (!estafeta) {
    router.push('/')
    return
  }

  const result = await getPedidos(estafeta.id)

  deliveries.value = result.data
    .map((item) => ({
      id: item.documentId,
      numero: item.id,

      name: getClienteNome(item),

      address:
        item.LocalEntrega ||
        item.Destino ||
        'Morada não definida',

      time:
        item.Horario ||
        'Horário não definido',

      priority: item.Prioridade || item.Prioridade_Entrega || 'Normal',

      status: mapStatus(item.Estado),
    }))
    .filter((item) => {
      return (
        item.status === 'Pendente' ||
        item.status === 'Em rota'
      )
    })
}

onMounted(carregarEntregas)

const filteredDeliveries = computed(() => {
  const term = search.value
    .trim()
    .toLowerCase()

  if (!term) {
    return deliveries.value
  }

  return deliveries.value.filter((delivery) => {
    return (
      delivery.name
        .toLowerCase()
        .includes(term) ||

      String(delivery.numero)
        .includes(term) ||

      delivery.address
        .toLowerCase()
        .includes(term)
    )
  })
})

const pendingCount = computed(() => {
  return deliveries.value.filter(
    (d) => d.status === 'Pendente'
  ).length
})

const inRouteCount = computed(() => {
  return deliveries.value.filter(
    (d) => d.status === 'Em rota'
  ).length
})

function pillClass(status) {
  if (status === 'Em rota') {
    return 'pill-route'
  }

  return 'pill-pending'
}

function verDetalhes(id) {
  router.push(`/detalhe/${id}`)
}

function go(path) {
  router.push(path)
}
</script>
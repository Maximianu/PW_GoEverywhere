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

      <section class="stats-grid stats-grid-2 profile-stats">
        <div class="stat-card">
          <span class="stat-label">Entregas Totais</span>
          <strong>{{ totalEntregas }}</strong>
        </div>

        <div class="stat-card">
          <span class="stat-label">Taxa de sucesso</span>
          <strong>{{ taxaSucesso }}</strong>
        </div>
      </section>

      <div class="small-box centered-box">
        <p>Avaliação média: {{ mediaReviews }} ({{ totalReviews }} avaliações)</p>
      </div>

      <button class="primary-btn btn-glow logout-main-btn" @click="logout">
        Terminar Sessão
      </button>

      <nav class="bottom-nav">
        <button class="nav-item" @click="go('/entregas')">ENTREGAS</button>
        <button class="nav-item" @click="go('/historico')">HISTÓRICO</button>
        <button class="nav-item active" @click="go('/perfil')">PERFIL</button>
      </nav>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import { getPedidos, getEstafetaLogado, getReviews } from '../services/api'

const router = useRouter()

const estafeta = ref({
  nome: 'Estafeta',
  email: 'Email não definido',
  telemovel: '',
})

const pedidos = ref([])
const reviews = ref([])

function mapStatus(status) {
  if (!status) return 'Pendente'

  const value = status.toLowerCase()

  if (value.includes('concluido') || value.includes('concluído')) {
    return 'Entregue'
  }

  if (value.includes('não') || value.includes('nao') || value.includes('rejeitado')) {
    return 'Não Entregue'
  }

  if (value.includes('transito') || value.includes('trânsito') || value.includes('rota')) {
    return 'Em rota'
  }

  return 'Pendente'
}

async function carregarPerfil() {
  const dados = getEstafetaLogado()

  if (!dados) {
    router.push('/')
    return
  }

  estafeta.value = {
    ...estafeta.value,
    ...dados,
  }

  const pedidosResult = await getPedidos(dados.id)
  pedidos.value = pedidosResult.data.map((item) => ({
    id: item.documentId,
    numero: item.id,
    status: mapStatus(item.Estado),
  }))

  const reviewsResult = await getReviews()
  reviews.value = reviewsResult.data || []
}

onMounted(carregarPerfil)

const totalEntregas = computed(() => pedidos.value.length)

const entregasConcluidas = computed(
  () => pedidos.value.filter((p) => p.status === 'Entregue').length,
)

const entregasNaoEntregues = computed(
  () => pedidos.value.filter((p) => p.status === 'Não Entregue').length,
)

const taxaSucesso = computed(() => {
  const totalFinalizadas = entregasConcluidas.value + entregasNaoEntregues.value

  if (totalFinalizadas === 0) return '0%'

  const taxa = (entregasConcluidas.value / totalFinalizadas) * 100
  return `${taxa.toFixed(1)}%`
})

const totalReviews = computed(() => reviews.value.length)

const mediaReviews = computed(() => {
  if (reviews.value.length === 0) return '0.0'

  const soma = reviews.value.reduce((total, review) => {
    return total + Number(review.Estrela_estafeta || 0)
  }, 0)

  return (soma / reviews.value.length).toFixed(1)
})

function go(path) {
  router.push(path)
}

function logout() {
  localStorage.removeItem('estafeta')
  router.push('/')
}
</script>
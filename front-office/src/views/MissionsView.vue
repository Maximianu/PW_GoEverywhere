<template>
  <main class="missions-page">
    <section class="panel">
      <div class="section-header">
        <div>
          <p class="small-note">Entregas</p>
          <h1 class="headline">Veja as suas Entregas e Viagens</h1>
        </div>
        <div class="header-actions">
          <button 
            :class="['btn', 'btn-secondary', { 'btn-active': filtroAtivo === 'ativas' }]" 
            @click="alternarFiltro('ativas')"
          >
            Ativas
          </button>
          <button 
            :class="['btn', 'btn-secondary', { 'btn-active': filtroAtivo === 'concluidas' }]" 
            @click="alternarFiltro('concluidas')"
          >
            Concluídas
          </button>
        </div>
      </div>

      <div class="list-card">
        <template v-if="loading">
          <div class="list-row">
            <p>Carregando as suas viagens...</p>
          </div>
        </template>

        <template v-else-if="viagens.length === 0">
          <div class="list-row">
            <p>Não foram encontradas viagens compradas por si.</p>
          </div>
        </template>

        <template v-else>
          <div
            class="list-row"
            v-for="bilhete in viagensFiltradas"
            :key="bilhete.id"
          >
            <div class="mission-info">
              <strong>{{ getMissaoTitulo(bilhete) }}</strong>
              <small>{{ getMissaoDataTexto(bilhete) }}</small>
              <div class="travel-line">
                <span class="label-pill">Equipamento: {{ getPedidoEstado(bilhete) }}</span>
                <span class="label-pill">Viagem: {{ getMissaoEstado(bilhete) }}</span>
              </div>
            </div>

            <router-link :to="`/missions/${bilhete.documentId}`" class="btn btn-primary" style="text-decoration: none;">→</router-link>

            <div class="mission-passengers">
              Lotação Max: {{ getMissaoLota(bilhete) }}
            </div>

          </div>
        </template>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue' // Adicionado o 'computed'
import { useBookingStore } from '../stores/BookingStore'
import { useUserStore } from '../stores/UserStore'
import { obterBilhetesPorClienteStrapi } from '../services/strapi'

const bookingStore = useBookingStore()
const userStore = useUserStore()
const viagens = ref([])
const loading = ref(false)
const error = ref(null)

// Estado do filtro ativo: null (mostra tudo), 'ativas' ou 'concluidas'
const filtroAtivo = ref(null)

// Lógica para alternar, desativar ao clicar de novo ou comutar para o oposto
const alternarFiltro = (tipo) => {
  if (filtroAtivo.value === tipo) {
    filtroAtivo.value = null
  } else {
    filtroAtivo.value = tipo
  }
}

// Propriedade Computada que filtra com base estritamente no estado da viagem
const viagensFiltradas = computed(() => {
  if (!filtroAtivo.value) return viagens.value

  return viagens.value.filter(bilhete => {
    const estadoViagem = getMissaoEstado(bilhete)
    
    if (filtroAtivo.value === 'ativas') {
      return estadoViagem === 'Agendada' || estadoViagem === 'Em Curso'
    }
    if (filtroAtivo.value === 'concluidas') {
      return estadoViagem === 'Concluída'
    }
    return true
  })
})

const getClienteId = () => {
  const id = userStore.clienteData?.id || bookingStore.clienteId || null
  return Number.isFinite(Number(id)) ? Number(id) : null
}

const fetchViagens = async () => {
  const clienteId = getClienteId()
  if (!clienteId) {
    viagens.value = []
    return
  }

  loading.value = true
  error.value = null

  try {
    viagens.value = await obterBilhetesPorClienteStrapi(clienteId)
    console.log("Viagens carregadas: ", viagens.value)
  } catch (err) {
    console.error('Erro ao carregar viagens:', err)
    error.value = err.message || 'Erro desconhecido ao carregar viagens.'
    viagens.value = []
  } finally {
    loading.value = false
  }
}

const getRelationAttributes = (relation) => {
  if (!relation) return null
  if (relation.data && relation.data.attributes) return relation.data.attributes
  return relation
}

const getField = (relation, field, fallback) => {
  const attrs = getRelationAttributes(relation)
  return attrs?.[field] ?? fallback
}

const getPedidoEstado = (bilhete) => {
  return bilhete?.Estado_Equipamento ?? 'desconhecido'
}

const getMissaoTitulo = (bilhete) => {
  // Access missao2 populated data from bilhete
  return getField(bilhete?.missao2, 'Nome', 'Missão desconhecida')
}

const getMissaoLota = (bilhete) => {
  // Access missao2 populated data from bilhete
  return getField(bilhete?.missao2, 'Lota', '—')
}

const getMissaoDataTexto = (bilhete) => {
  const missao = getRelationAttributes(bilhete?.missao2)
  if (!missao) return 'Data desconhecida'

  const data = missao.Data || ''
  const partida = missao.Hora_Partida || '00:00'
  const chegada = missao.Hora_Chegada || '23:59'
  if (!data) return 'Data desconhecida'

  return `${data} • ${partida} → ${chegada}`
}

const getMissaoInterval = (bilhete) => {
  const missao = getRelationAttributes(bilhete?.missao2)
  if (!missao || !missao.Data) return null

  const partida = missao.Hora_Partida || '00:00'
  const chegada = missao.Hora_Chegada || '23:59'
  const start = new Date(`${missao.Data}T${partida}`)
  let end = new Date(`${missao.Data}T${chegada}`)

  if (isNaN(start.valueOf()) || isNaN(end.valueOf())) return null

  if (end < start) {
    end = new Date(start)
    end.setHours(end.getHours() + 2)
  }

  return { start, end }
}

const getMissaoEstado = (bilhete) => {
  const interval = getMissaoInterval(bilhete)
  if (!interval) return 'desconhecida'

  const now = new Date()
  if (now < interval.start) return 'Agendada'
  if (now >= interval.start && now <= interval.end) return 'Em Curso'
  return 'Concluída'
}

const statusClass = (bilhete) => {
  const estado = getPedidoEstado(bilhete)?.toLowerCase()
  return {
    'status-active': estado === 'transito' || estado === 'pendente',
    'status-completed': estado === 'concluida',
    'status-rejected': estado === 'rejeitado'
  }
}

onMounted(fetchViagens)
</script>

<style scoped>
.missions-page {
  width: 100%;
  min-height: 100vh;
  padding-top: 8.75rem !important;
  display: flex;
  justify-content: center;
}

.panel {
  width: 100%;
  max-width: 68.75rem;
  margin: 0 auto;
  padding: 0 1.5rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  margin-bottom: 2rem;
}

.headline {
  font-size: 2.8rem;
  margin: 0.5rem 0 0 0;
  color: #e1fdff;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
}

.list-card {
  background: rgba(24, 28, 34, 0.4);
  border: 0.0625rem solid rgba(255, 255, 255, 0.05);
  border-radius: 0.75rem;
  backdrop-filter: blur(0.625rem);
}

.list-row {
  display: grid;
  grid-template-columns: 2fr 1fr 1fr 3.75rem;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 0.0625rem solid rgba(255, 255, 255, 0.05);
}

.list-row:last-child {
  border-bottom: none;
}

.mission-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mission-info strong {
  font-size: 1.1rem;
  color: #e0e2eb;
}

.travel-line {
  display: flex;
  gap: 0.75rem;
  flex-wrap: wrap;
  margin: 0;
}

.mission-status {
  display: flex;
  justify-content: flex-end;
}

.label-pill {
  padding: 0.375rem 0.75rem;
  border-radius: 1.25rem;
  font-size: 0.85rem;
  background: rgba(0, 242, 255, 0.1);
  color: #00f2ff;
  text-transform: capitalize;
}

.status-active {
  background: rgba(0, 242, 255, 0.15);
  color: #bcefff;
}

.status-completed {
  background: rgba(0, 255, 145, 0.12);
  color: #b4ffce;
}

.status-rejected {
  background: rgba(255, 67, 86, 0.13);
  color: #ff9fa4;
}

.mission-passengers {
  text-align: right;
  color: rgba(225, 253, 255, 0.75);
  font-size: 1rem;
}

.btn {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  background: #00f2ff;
  color: #00363a;
  padding: 0.95rem;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: 700;
  transition: transform 0.2s ease;
}

.btn:hover {
  background: #53e4ff;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.3);
}

/* Nova classe adicionada estritamente para destacar visualmente o botão do filtro ativo */
.btn-active {
  box-shadow: 0 0 20px #00f2ff;
  transform: scale(1.05);
}

@media (max-width: 56.25rem) {
  .list-row {
    grid-template-columns: 1fr;
    gap: 1rem;
  }
  .mission-status,
  .mission-passengers,
  .btn {
    justify-content: flex-start;
  }
}
</style>
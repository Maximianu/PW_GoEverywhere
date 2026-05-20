<template>
  <main class="missions-page">
    <section class="panel">
      <div class="section-header">
        <div>
          <p class="small-note">Entregas</p>
          <h1 class="headline">Veja as suas Entregas e Viagens</h1>
        </div>
        <div class="header-actions">
          <button class="btn btn-secondary">Ativas</button>
          <button class="btn btn-secondary">Concluídas</button>
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
            v-for="bilhete in viagens"
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

            <div class="mission-passengers">
              Lotação Max: {{ getMissaoLota(bilhete) }}
            </div>

            <div class="btn btn-primary">→</div>
          </div>
        </template>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useBookingStore } from '../stores/BookingStore'
import { useUserStore } from '../stores/UserStore'
import { obterBilhetesPorClienteStrapi } from '../services/strapi'

const bookingStore = useBookingStore()
const userStore = useUserStore()
const viagens = ref([])
const loading = ref(false)
const error = ref(null)

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
  return getField(bilhete?.pedido, 'Estado', 'desconhecido')
}

const getMissaoTitulo = (bilhete) => {
  return getField(bilhete?.missao, 'Nome', 'Missão desconhecida')
}

const getMissaoLota = (bilhete) => {
  return getField(bilhete?.missao, 'Lota', '—')
}

const getMissaoDataTexto = (bilhete) => {
  const missao = getRelationAttributes(bilhete?.missao)
  if (!missao) return 'Data desconhecida'

  const data = missao.Data || ''
  const partida = missao.Hora_Partida || '00:00'
  const chegada = missao.Hora_Chegada || '23:59'
  if (!data) return 'Data desconhecida'

  return `${data} • ${partida} → ${chegada}`
}

const getMissaoInterval = (bilhete) => {
  const missao = getRelationAttributes(bilhete?.missao)
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
  if (now < interval.start) return 'agendada'
  if (now >= interval.start && now <= interval.end) return 'em curso'
  return 'Concluida'
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
  transform: translateY(-0.125rem);
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
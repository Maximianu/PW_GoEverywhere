<template>
  <main class="page-shell">
    <section class="content-container">
      
      <template v-if="loading">
        <div style="text-align: center; padding: 60px 20px;">
          <p style="color: #00f2ff;">Carregando detalhes da viagem...</p>
        </div>
      </template>

      <template v-else-if="error">
        <div style="text-align: center; padding: 60px 20px;">
          <p style="color: #ff5555;">{{ error }}</p>
          <router-link to="/missions" style="color: #00f2ff; text-decoration: underline;">← Voltar às viagens</router-link>
        </div>
      </template>

      <template v-else-if="bilhete">
        <div class="section-header" style="text-align: center;">
          <router-link to="/missions" style="color: #00f2ff; text-decoration: none; margin-bottom: 16px; display: inline-block;">← Voltar</router-link>
          
          <h1 class="headline">{{ getMissaoNome }}</h1>
          <br />
          <p class="subtitle">{{ getMissaoDescricao }}</p>
        </div>
        

        <div class="mission-grid">
          
          <div class="panel main-panel">
            <h3 class="card-title">Timeline da Entrega</h3>
            
            <div class="list-card">
              <div class="list-row two-cols">
                <div>
                  <span class="label">Estado Equipamento</span>
                  <p class="status-text" :style="{ color: getEstadoEquipamentoCor() }">{{ getEstadoEquipamento }}</p>
                </div>
                <div>
                  <span class="label">Estafeta</span>
                  <p class="status-text">{{ getEstafeta }}</p>
                </div>
              </div>
            </div>

            <div class="list-card" :class="{ 'active-card': isMissaoAtiva }">
              <div class="list-row split-cols">
                <div>
                  <span class="label">Estado da Viagem</span>
                  <p class="status-text" :style="{ color: getEstadoViagem === 'concluida' ? '#00ff91' : '#00f2ff' }">{{ getEstadoViagem }}</p>
                </div>
                <div>
                  <span class="label">Informações Operacionais</span>
                  <p class="status-text">{{ getMissaoPlaneta }}</p>
                  <p class="sub-label" v-if="getMissaoProblemas">⚠️ {{ getMissaoProblemas }}</p>
                </div>
              </div>
            </div>
          </div>

          <aside class="panel side-panel">
            <h3 class="card-title">Detalhes</h3>
            
            <div class="team-list">
              <div class="team-member">
                <span class="label">Lotação Máxima</span>
                <strong class="member-name">{{ getMissaoLota }} lugares</strong>
              </div>
              <div class="team-member">
                <span class="label">Data de Partida</span>
                <strong class="member-name">{{ getMissaoData }}</strong>
              </div>
            </div>

            <button 
              v-if="getEstadoViagem === 'Concluída'"
              @click="irParaAvaliacao"
              class="btn-primary-action"
            >
              Avaliar Missão →
            </button>
            <button 
              v-else
              disabled
              class="btn-primary-action"
              style="opacity: 0.5; cursor: not-allowed;"
            >
              Avaliação Disponível em Breve
            </button>
          </aside>

        </div>
      </template>

      <template v-else>
        <div style="text-align: center; padding: 60px 20px;">
          <p style="color: #ff5555;">Bilhete não encontrado.</p>
          <router-link to="/missions" style="color: #00f2ff; text-decoration: underline;">← Voltar às viagens</router-link>
        </div>
      </template>
    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { obterBilheteStrapi, obterEstafetaPorBilheteStrapi } from '../services/strapi'

const route = useRoute()
const router = useRouter()

const bilhete = ref(null)
const loading = ref(true)
const error = ref(null)
const estafetaId = ref(null)
const estafetaNome = ref(null)

const bilheteId = computed(() => route.params.id)
console.log('ID do bilhete extraído da rota:', bilheteId.value)

const getRelationAttributes = (relation) => {
  if (!relation) return null
  if (relation.data && relation.data.attributes) return relation.data.attributes
  return relation.attributes || relation
}

const getMissao = computed(() => {
  if (!bilhete.value) return null
  const missao2 = bilhete.value.missao2
  return getRelationAttributes(missao2)
})

const getMissaoNome = computed(() => getMissao.value?.Nome ?? 'Missão Desconhecida')
const getMissaoDescricao = computed(() => getMissao.value?.Descricao_missao ?? 'Sem descrição')
const getMissaoPlaneta = computed(() => getMissao.value?.Planeta ?? 'N/A')
const getMissaoLota = computed(() => getMissao.value?.Lota ?? '—')
const getMissaoProblemas = computed(() => getMissao.value?.Problemas ?? null)

const getMissaoData = computed(() => {
  const data = getMissao.value?.Data
  if (!data) return 'Data não definida'
  const hora = getMissao.value?.Hora_Partida || '00:00'
  return `${data} • ${hora}`
})

const getEstadoEquipamento = computed(() => {
  return bilhete.value?.Estado_Equipamento ?? 'Desconhecido'
})

const getEstafeta = computed(() => {
  if (estafetaNome.value) return estafetaNome.value
  const estafeta = bilhete.value?.estafeta
  if (!estafeta) return 'Nenhum estafeta atribuído'
  const attrs = getRelationAttributes(estafeta)
  console.log('Relação estafeta do bilhete:', bilhete.value)

  return attrs?.Nome || attrs?.nome || 'Estafeta sem nome'
})

const getMissaoInterval = () => {
  const missao = getMissao.value
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

const getEstadoViagem = computed(() => {
  const interval = getMissaoInterval()
  if (!interval) return 'desconhecida'

  const now = new Date()
  if (now < interval.start) return 'Agendada'
  if (now >= interval.start && now <= interval.end) return 'em curso'
  return 'Concluída'
})

const isMissaoAtiva = computed(() => {
  return getEstadoViagem.value === 'em curso'
})

const getEstadoEquipamentoCor = () => {
  const estado = getEstadoEquipamento.value?.toLowerCase()
  if (estado === 'entregue') return '#00ff91'
  if (estado === 'em transito') return '#ffc107'
  return '#00f2ff'
}

const irParaAvaliacao = () => {
  const ticketId = bilhete.value.documentId
  if (!ticketId) {
    console.error('Bilhete não contém documentId para a avaliação.')
    return
  }

  const params = new URLSearchParams()
  params.append('ticketId', ticketId)
  if (estafetaId.value) params.append('courierId', estafetaId.value)

  router.push(`/review?${params.toString()}`)
}

const fetchEstafetaDoBilhete = async (bilheteDocumentId) => {
  try {
    const estafetaRelation = await obterEstafetaPorBilheteStrapi(bilheteDocumentId)
    if (!estafetaRelation) {
      estafetaId.value = null
      estafetaNome.value = null
      return
    }

    estafetaId.value = estafetaRelation.id || estafetaRelation?.data?.id || null
    const attrs = getRelationAttributes(estafetaRelation)
    estafetaNome.value = attrs?.Nome || attrs?.nome || null
  } catch (err) {
    console.error('Erro ao buscar estafeta do pedido:', err)
    estafetaId.value = null
    estafetaNome.value = null
  }
}

const fetchBilhete = async () => {
  loading.value = true
  error.value = null

  try {
    if (!bilheteId.value) {
      error.value = 'ID do bilhete não encontrado na rota.'
      return
    }

    const data = await obterBilheteStrapi(bilheteId.value)
    bilhete.value = data

    if (bilhete.value?.documentId) {
      await fetchEstafetaDoBilhete(bilhete.value.documentId)
    }
  } catch (err) {
    console.error('Erro ao carregar bilhete:', err)
    error.value = err.message || 'Erro ao carregar detalhes da viagem.'
  } finally {
    loading.value = false
  }
}

onMounted(fetchBilhete)
</script>


<style scoped>
/* Estrutura de Alinhamento Base */
.page-shell {
  padding: 140px 20px 60px 20px; /* Compensa a altura da Navbar */
  background-color: #0b0e14;
  min-height: 100vh;
  display: flex;
  justify-content: center;
}

.content-container {
  width: 100%;
  max-width: 1152px;
  display: flex;
  flex-direction: column;
}

/* Cabeçalho */
.section-header {
  margin-bottom: 40px;
}

.telemetry-badge {
  background: rgba(0, 242, 255, 0.1);
  color: #00f2ff;
  padding: 4px 12px;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
  border-radius: 4px;
  display: inline-block;
  margin-bottom: 16px;
}

.headline {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 44px;
  color: #e1fdff;
  margin: 0 0 8px 0;
  font-weight: 700;
}

.subtitle {
  color: rgba(185, 202, 203, 0.6);
  font-size: 16px;
  margin: 0;
}

/* Layout da Grelha Corrigido (Evita as sobreposições) */
.mission-grid {
  display: grid;
  grid-template-columns: 1fr 340px; /* Timeline larga, Barra lateral fixa */
  gap: 32px;
  align-items: start;
}

/* Painéis */
.panel {
  background: #181c22;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 32px;
  border-radius: 6px;
}

.card-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 20px;
  color: #e1fdff;
  margin: 0 0 24px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

/* Cartões de Listagem Interna */
.list-card {
  background: #0b0e14;
  padding: 24px;
  border-radius: 4px;
  margin-bottom: 20px;
  border-left: 3px solid rgba(255, 255, 255, 0.1);
}

.list-card.active-card {
  border-left-color: #00f2ff;
  box-shadow: 0 4px 20px rgba(0, 242, 255, 0.05);
}

/* Configuração das Colunas da Timeline */
.list-row {
  display: grid;
  gap: 20px;
}

.list-row.two-cols {
  grid-template-columns: repeat(2, 1fr);
}

.list-row.three-cols {
  grid-template-columns: repeat(3, 1fr);
}

.list-row.split-cols {
  grid-template-columns: 1fr 1.2fr;
}

.label {
  display: block;
  font-size: 11px;
  color: rgba(225, 253, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 1px;
  margin-bottom: 6px;
}

.status-text {
  color: #e1fdff;
  font-size: 14px;
  margin: 0;
}

.sub-label {
  font-size: 12px;
  color: rgba(185, 202, 203, 0.4);
  margin: 6px 0 0 0;
}

/* Barra de Progresso */
.progress-bar {
  background: rgba(255, 255, 255, 0.05);
  height: 6px;
  border-radius: 3px;
  margin-top: 8px;
  overflow: hidden;
}

.progress-fill {
  background: #00f2ff;
  height: 100%;
  box-shadow: 0 0 10px rgba(0, 242, 255, 0.5);
}

/* Secção da Equipa */
.team-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
}

.team-member {
  background: #0b0e14;
  padding: 16px;
  border-radius: 4px;
  border: 1px solid rgba(255, 255, 255, 0.02);
}

.member-name {
  color: #e1fdff;
  font-size: 16px;
  display: block;
  margin-top: 2px;
}

/* Botão de Ação */
.btn-primary-action {
  width: 100%;
  background: #00f2ff;
  color: #00363a;
  border: none;
  padding: 16px;
  font-weight: 700;
  border-radius: 4px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}
.btn-primary-action:hover {
  background: #53e4ff;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.3);
}

/* Responsividade Mobile */
@media (max-width: 992px) {
  .mission-grid {
    grid-template-columns: 1fr; /* Força os blocos a empilhar verticalmente em ecrãs pequenos */
  }
  
  .list-row.three-cols, .list-row.split-cols {
    grid-template-columns: 1fr; /* Transforma as colunas internas em linhas no telemóvel */
    gap: 16px;
  }
}
</style>
<template>
  <main class="page-shell">
    <section class="content-container">
      
      <div class="section-header">
        <span class="small-note">Feedback de Voo</span>
        <h1 class="headline">Avalie a Missão</h1>
        <p class="subtitle">Your feedback ensures the safety and efficiency of future deep-space operations.</p>
      </div>

      <!-- Mensagem de Erro ou Sucesso -->
      <div v-if="message" :class="['message-box', messageType]" style="margin-bottom: 24px;">
        {{ message }}
      </div>

      <div v-if="reviewExists" class="existing-review">
        <div class="review-grid">
          <div class="panel review-panel">
            <h3 class="card-title">Avaliação da Missão</h3>
            <div class="rating-section">
              <div class="stars-container">
                <span
                  v-for="star in 5"
                  :key="`missao-readonly-${star}`"
                  class="star readonly"
                  :class="{ active: avaliacaoMissao >= star }"
                >★</span>
              </div>
              <div class="readonly-comment">{{ comentarioMissao }}</div>
            </div>
          </div>

          <div class="panel review-panel">
            <h3 class="card-title">Avaliação do Estafeta</h3>
            <div class="rating-section">
              <div class="stars-container">
                <span
                  v-for="star in 5"
                  :key="`estafeta-readonly-${star}`"
                  class="star readonly"
                  :class="{ active: avaliacaoEstafeta >= star }"
                >★</span>
              </div>
              <div class="readonly-comment">{{ comentarioEstafeta }}</div>
            </div>
          </div>
        </div>
      </div>

      <form @submit.prevent="submitReview" v-else-if="!successfulSubmit">
        <div class="review-grid">
          
          <div class="panel review-panel">
            <h3 class="card-title">Viagem</h3>
            <p class="card-text">Avalie a sua experiência espacial.</p>
            
            <div class="rating-section">
              <label class="field-label">Avaliação da Viagem</label>
              <div class="stars-container">
                <span 
                  v-for="star in 5" 
                  :key="`missao-${star}`"
                  class="star" 
                  :class="{ active: avaliacaoMissao >= star }"
                  @click="avaliacaoMissao = star"
                >★</span>
              </div>
              
              <textarea 
                v-model="comentarioMissao"
                rows="5" 
                placeholder="Detalhe anomalias, pressões, térmica ou conforto..." 
                class="review-textarea"
              ></textarea>
            </div>
          </div>

          <div class="panel review-panel">
            <h3 class="card-title">Estafeta</h3>
            <p class="card-text">Avalie o desempenho, dedicação e suporte do estafeta durante a missão.</p>
            
            <div class="rating-section">
              <label class="field-label">Avaliação do Estafeta</label>
              <div class="stars-container">
                <span 
                  v-for="star in 5" 
                  :key="`estafeta-${star}`"
                  class="star" 
                  :class="{ active: avaliacaoEstafeta >= star }"
                  @click="avaliacaoEstafeta = star"
                >★</span>
              </div>
              
              <textarea 
                v-model="comentarioEstafeta"
                rows="5" 
                placeholder="Avalie a suavidade dos controlos, g-força, e comunicação..." 
                class="review-textarea"
              ></textarea>
            </div>
          </div>

        </div>

        <div class="actions-wrapper">
          <button 
            type="submit" 
            class="btn-primary" 
            :disabled="isSubmitting"
            :style="{ opacity: isSubmitting ? 0.6 : 1, cursor: isSubmitting ? 'not-allowed' : 'pointer' }"
          >
            {{ isSubmitting ? 'Enviando...' : 'Submeter Avaliação →' }}
          </button>
        </div>
      </form>

      <!-- Sucesso -->
      <div v-else style="text-align: center; padding: 60px 20px;">
        <h2 style="color: #00ff91; margin-bottom: 16px; font-size: 28px;">✓ Obrigado pela Avaliação!</h2>
        <p style="color: rgba(185, 202, 203, 0.7); margin-bottom: 24px;">O seu feedback foi registado com sucesso e irá ajudar a melhorar os serviços.</p>
        <router-link to="/missions" class="btn-primary">Voltar às Missões</router-link>
      </div>

    </section>
  </main>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { obterReviewPorBilheteStrapi } from '../services/strapi'

const route = useRoute()
const router = useRouter()

// Extrair params da URL
const ticketId = ref(route.query.ticketId)
const courierId = ref(route.query.courierId)

// Estado do formulário
const avaliacaoMissao = ref(0)
const comentarioMissao = ref('')
const avaliacaoEstafeta = ref(0)
const comentarioEstafeta = ref('')

// Estado da submissão
const isSubmitting = ref(false)
const message = ref('')
const messageType = ref('') // 'error' ou 'success'
const successfulSubmit = ref(false)
const existingReview = ref(null)
const reviewExists = computed(() => !!existingReview.value)

const STRAPI_URL = import.meta.env.VITE_STRAPI_URL || 'http://localhost:1338'

const loadExistingReview = async () => {
  try {
    if (!ticketId.value) return

    const review = await obterReviewPorBilheteStrapi(ticketId.value)
    if (!review) return

    console.log('Review existente encontrada:', review)

    existingReview.value = review
    const attrs = review.attributes || {}
    avaliacaoMissao.value = review.Estrela_missao ?? 0
    comentarioMissao.value = review.Descricao_missao ?? ''
    avaliacaoEstafeta.value = review.Estrela_estafeta ?? 0
    comentarioEstafeta.value = review.Descricao_estafeta ?? ''
    message.value = 'Já existe uma avaliação para este bilhete; ela não pode ser alterada.'
    messageType.value = 'success'
  } catch (error) {
    console.error('Erro ao carregar review existente:', error)
    message.value = 'Erro ao verificar avaliação existente.'
    messageType.value = 'error'
  }
}

onMounted(async () => {
  if (!ticketId.value) {
    message.value = 'Parâmetro inválido: ticketId em falta na URL.'
    messageType.value = 'error'
    return
  }

  await loadExistingReview()

  if (!reviewExists.value && !courierId.value) {
    message.value = 'Parâmetro inválido: courierId em falta na URL.'
    messageType.value = 'error'
  }
})

// Função de submissão
const submitReview = async () => {
  if (reviewExists.value) {
    message.value = 'Já existe uma avaliação para este bilhete e não pode ser alterada.'
    messageType.value = 'error'
    return
  }
  // Validações
  if (avaliacaoMissao.value === 0) {
    message.value = 'Por favor, avalie o equipamento (1-5 estrelas).'
    messageType.value = 'error'
    return
  }

  if (avaliacaoEstafeta.value === 0) {
    message.value = 'Por favor, avalie o estafeta (1-5 estrelas).'
    messageType.value = 'error'
    return
  }

  if (!comentarioMissao.value.trim()) {
    message.value = 'Por favor, adicione um comentário sobre o equipamento.'
    messageType.value = 'error'
    return
  }

  if (!comentarioEstafeta.value.trim()) {
    message.value = 'Por favor, adicione um comentário sobre o estafeta.'
    messageType.value = 'error'
    return
  }

  isSubmitting.value = true
  message.value = ''

  try {
    const payload = {
      data: {
        Estrela_missao: avaliacaoMissao.value,
        Descricao_missao: comentarioMissao.value,
        Estrela_estafeta: avaliacaoEstafeta.value,
        Descricao_estafeta: comentarioEstafeta.value,
        bilhete: ticketId.value,
        estafeta: courierId.value
      }
    }

    const response = await fetch(`${STRAPI_URL}/api/reviews`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => null)
      throw new Error(
        errorData?.error?.message || `Erro ${response.status} ao submeter avaliação`
      )
    }

    successfulSubmit.value = true
    message.value = 'Avaliação submetida com sucesso!'
    messageType.value = 'success'

    // Redirecionar para missões após 3 segundos (opcional)
    setTimeout(() => {
      router.push('/missions')
    }, 3000)
  } catch (error) {
    console.error('Erro ao submeter avaliação:', error)
    message.value = `Erro ao submeter: ${error.message}`
    messageType.value = 'error'
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped>
/* Estrutura de Alinhamento Base */
.page-shell {
  padding: 140px 20px 60px 20px; /* Alinhamento correto com a Navbar fixa */
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
  margin-bottom: 32px;
}

.small-note {
  color: #00f2ff;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 2px;
  font-weight: 700;
  display: block;
  margin-bottom: 12px;
}

.headline {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 44px;
  color: #e1fdff;
  margin: 0 0 12px 0;
  font-weight: 700;
}

.subtitle {
  color: rgba(185, 202, 203, 0.6);
  font-size: 16px;
  margin: 0;
  max-width: 600px;
  line-height: 1.5;
}

/* Grelha de Avaliação Responsiva */
.review-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
  margin-top: 12px;
}

/* Painéis de Feedback */
.panel {
  background: #181c22;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 32px;
  border-radius: 6px;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 20px;
  color: #e1fdff;
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.card-text {
  color: rgba(185, 202, 203, 0.5);
  font-size: 14px;
  margin: 0 0 24px 0;
  line-height: 1.5;
}

/* Sistema de Classificação por Estrelas */
.rating-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  font-size: 11px;
  color: rgba(225, 253, 255, 0.4);
  text-transform: uppercase;
  letter-spacing: 1px;
}

.stars-container {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
  margin-bottom: 16px;
}

.star {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.05);
  color: rgba(159, 203, 220, 0.3);
  text-align: center;
  padding: 12px 0;
  font-size: 18px;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.star.active {
  background: rgba(0, 242, 255, 0.08);
  border-color: rgba(0, 242, 255, 0.3);
  color: #00f2ff;
  text-shadow: 0 0 8px rgba(0, 242, 255, 0.5);
}

.star:hover {
  border-color: #00f2ff;
  color: #00f2ff;
}

.star.readonly {
  cursor: default;
}

.readonly-comment {
  background: rgba(255,255,255,0.04);
  border: 1px solid rgba(255,255,255,0.08);
  color: #e1fdff;
  padding: 16px;
  border-radius: 4px;
  min-height: 120px;
  white-space: pre-wrap;
}

/* Áreas de Texto */
.review-textarea {
  width: 100%;
  background: #0b0e14;
  border: 1px solid rgba(58, 73, 75, 0.5);
  padding: 16px;
  color: #e1fdff;
  border-radius: 4px;
  font-family: inherit;
  font-size: 14px;
  line-height: 1.5;
  resize: vertical;
  transition: border-color 0.3s ease;
}

.review-textarea:focus {
  border-color: #00f2ff;
  outline: none;
}

/* Botão e Alinhamento Inferior */
.actions-wrapper {
  margin-top: 32px;
  display: flex;
  justify-content: flex-start;
}

.btn-primary {
  background: #00f2ff;
  color: #00363a;
  padding: 16px 32px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  border-radius: 4px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 13px;
}

.btn-primary:hover:not(:disabled) {
  background: #e1fdff;
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 242, 255, 0.2);
}

.btn-primary:disabled {
  background: rgba(0, 242, 255, 0.5);
}

/* Caixas de Mensagem */
.message-box {
  padding: 16px 24px;
  border-radius: 4px;
  font-size: 14px;
  border-left: 4px solid;
}

.message-box.error {
  background: rgba(255, 68, 68, 0.1);
  color: #ff6b6b;
  border-left-color: #ff6b6b;
}

.message-box.success {
  background: rgba(0, 255, 145, 0.1);
  color: #00ff91;
  border-left-color: #00ff91;
}

/* Responsividade Mobile */
@media (max-width: 768px) {
  .review-grid {
    grid-template-columns: 1fr; /* Empilha os blocos verticalmente em mobile */
    gap: 24px;
  }
  
  .headline {
    font-size: 32px;
  }
}
</style>
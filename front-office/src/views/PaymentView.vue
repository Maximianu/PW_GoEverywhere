<template>
  <main class="page-shell">
    <section class="content-container">
      <router-link to="/kit" class="btn-back">← VOLTAR</router-link>
      
      <!-- Layout em Grelha: Dados de Pagamento vs Resumo -->
      <div class="payment-grid">
        
        <!-- Coluna da Esquerda: Instruções de Pagamento -->
        <div class="payment-info">
          <div class="section-header">
            <p class="small-note">PAGAMENTO SEGURO</p>
            <h1 class="headline-lg">Autorize o pagamento por transferência bancária.</h1>
          </div>
          
          <p class="subtitle">Utilize os dados abaixo para concluir a reserva da sua missão espacial.</p>

          <div class="payment-details-card">
            <div class="input-row">
              <div class="input-group">
                <label>IBAN</label>
                <input type="text" placeholder="PT50 0000 0000 0000 0000 0000 0" />
              </div>
              <div class="input-group">
                <label>SWIFT / BIC</label>
                <input type="text" placeholder="ORBITPTPLXXX"  />
              </div>
            </div>

            <div class="input-row mt-4">
              <div class="input-group">
                <label>Entidade</label>
                <input type="text" placeholder="12345"  />
              </div>
              <div class="input-group">
                <label>Referência</label>
                <input type="text" placeholder="987 654 321"  />
              </div>
            </div>
            
            <p class="disclaimer">
              * A aprovação do pagamento pode levar até 24 horas úteis após a transferência.
            </p>

            <div class="input-group mt-4">
              <label>MORADA DE ENTREGA</label>
              <textarea 
                v-model="morada" 
                placeholder="Insira a morada onde o kit deve ser entregue"
                rows="4"
              ></textarea>
            </div>
          </div>
        </div>

        <!-- Coluna da Direita: Resumo da Missão (Aside) -->
        <aside class="summary-panel">
          <p class="small-note">RESUMO DA MISSÃO</p>
          <h2 class="mission-title">Resumo Final</h2>

          <div class="summary-list">
            <div class="list-row">
              <span>Missão</span>
              <strong>{{ bookingStore.formatPrice(bookingStore.custoMissao) }}</strong>
            </div>
            <div class="list-row">
              <span>Kit escolhido</span>
              <strong>{{ bookingStore.formatPrice(bookingStore.kitPrice) }}</strong>
            </div>
            <div class="list-row">
              <span>Tripulação</span>
              <strong>{{ bookingStore.numeroPassageiros }} pax</strong>
            </div>
          </div>

          <div class="total-section">
            <p class="label">Total a pagar</p>
            <h2 class="total-price">{{ bookingStore.formatPrice(bookingStore.paymentTotal) }}</h2>
          </div>

          <button
            class="btn-confirm"
            :disabled="isPaymentDisabled"
            @click="confirmarMissao"
          >
            CONFIRMAR E LANÇAR
          </button>
          <p v-if="isPaymentDisabled" class="subtitle" style="color: #ff6666; margin-top: 1rem;">
            {{ !bookingStore.missaoSelecionada ? 'Nenhuma missão selecionada. Volte e escolha uma missão.' : 'Cliente não encontrado. Faça login novamente para continuar.' }}
          </p>
        </aside>

      </div>
    </section>
  </main>
</template>

<script setup>
import { useBookingStore } from '../stores/BookingStore'
import { useUserStore } from '../stores/UserStore'
import { criarBilheteStrapi, criarPedidoStrapi } from '../services/strapi'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const bookingStore = useBookingStore()
const userStore = useUserStore()
const router = useRouter()

const morada = ref('')
const clienteId = computed(() => {
  const id = userStore.clienteData?.id || bookingStore.clienteId || localStorage.getItem('clienteId')
  return Number.isFinite(Number(id)) ? Number(id) : null
})
const isPaymentDisabled = computed(() => {
  const hasMissao = bookingStore.missaoSelecionada && bookingStore.missaoSelecionada.id
  const hasClient = clienteId.value || userStore.userEmail
  return !hasMissao || !hasClient
})

const confirmarMissao = async () => {
  if (!morada.value.trim()) {
    alert('Por favor, preencha a morada de entrega.')
    return
  }

  const selectedMissao = bookingStore.missaoSelecionada
  if (!selectedMissao || !selectedMissao.id) {
    alert('Missão não selecionada. Por favor, volte e selecione uma missão.')
    return
  }

  // Redirecionar se não há missão selecionada
  if (!bookingStore.missaoSelecionada) {
    router.push('/book')
    return
  }

  let effectiveClienteId = clienteId.value
  if (!effectiveClienteId && userStore.userEmail) {
    const cliente = await bookingStore.fetchClienteByEmail(userStore.userEmail)
    effectiveClienteId = cliente?.id || userStore.clienteData?.id || null
  }

  if (!effectiveClienteId) {
    alert('Informações de cliente não encontradas. Por favor, faça login novamente.')
    return
  }

  try {
    const bilheteResponse = await criarBilheteStrapi(effectiveClienteId, selectedMissao.id)
    const bilheteId = bilheteResponse?.data?.id

    if (!bilheteId) {
      throw new Error('Falha ao criar bilhete no Strapi.')
    }

    const pedidoPayload = {
      bilhete: bilheteId,
      LocalEntrega: morada.value,
      Estado: 'Pendente',
      cliente: effectiveClienteId,
      cliente2: effectiveClienteId
    }

    if (bookingStore.selectedKit !== null && bookingStore.selectedKitId) {
      pedidoPayload.kit = bookingStore.selectedKitId
    }

    await criarPedidoStrapi(pedidoPayload)

    alert('Reserva concluída com sucesso! Redirecionando para a página de missões...')
    morada.value = ''
    router.push('/missions')
  } catch (error) {
    console.error('Erro ao confirmar missão:', error)
    alert(`Erro ao confirmar missão: ${error.message}`)
  }
}
</script>

<style scoped>
/* Base Layout - Segue o mesmo padrão da KitView */
.page-shell {
  padding: 7.5rem 1.25rem 3.75rem 1.25rem;
  background-color: #0b0e14;
  min-height: 100vh;
  display: flex;
  justify-content: center;
}

.content-container {
  width: 100%;
  max-width: 72rem;
}

/* Grelha Principal */
.payment-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 3.75rem;
  align-items: start;
}

/* Tipografia */
.small-note {
  font-family: 'Space Grotesk', sans-serif;
  color: #00f2ff;
  font-size: 0.75rem;
  letter-spacing: 0.125rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.btn-back {
  display: inline-block;
  font-family: 'Space Grotesk', sans-serif;
  color: #00f2ff;
  font-size: 0.875rem;
  font-weight: 700;
  letter-spacing: 0.0625rem;
  margin-bottom: 1.5rem;
  text-decoration: none;
  transition: all 0.2s ease;
}

.btn-back:hover {
  color: #e1fdff;
  transform: translateX(-0.25rem);
}

.headline-lg {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 2.625rem;
  line-height: 1.1;
  color: #e1fdff;
  margin-bottom: 1rem;
}

.subtitle {
  color: rgba(225, 253, 255, 0.6);
  font-size: 1.125rem;
  margin-bottom: 2.5rem;
}

/* Cartão de Detalhes de Pagamento */
.payment-details-card {
  background: #181c22;
  border: 0.0625rem solid rgba(255, 255, 255, 0.05);
  padding: 2.5rem;
  border-radius: 0.25rem;
}

.input-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.mt-4 { margin-top: 1.5rem; }

.input-group label {
  display: block;
  font-size: 0.75rem;
  color: rgba(225, 253, 255, 0.4);
  text-transform: uppercase;
  margin-bottom: 0.5rem;
  letter-spacing: 0.0625rem;
}

.input-group input {
  width: 100%;
  background: #0b0e14;
  border: 0.0625rem solid rgba(0, 242, 255, 0.1);
  padding: 0.875rem;
  color: #00f2ff;
  font-family: monospace;
  font-size: 0.9375rem;
  border-radius: 0.25rem;
}

.input-group textarea {
  width: 100%;
  background: #0b0e14;
  border: 0.0625rem solid rgba(0, 242, 255, 0.1);
  padding: 0.875rem;
  color: #e1fdff;
  font-family: 'Inter', sans-serif;
  font-size: 0.9375rem;
  border-radius: 0.25rem;
  resize: vertical;
}

.input-group textarea::placeholder {
  color: rgba(225, 253, 255, 0.4);
}

.disclaimer {
  margin-top: 1.5rem;
  font-size: 0.8125rem;
  color: rgba(225, 253, 255, 0.4);
  font-style: italic;
}

/* Painel de Resumo (Aside) */
.summary-panel {
  background: #1c2026;
  border: 0.0625rem solid rgba(0, 242, 255, 0.1);
  padding: 2.5rem;
  border-radius: 0.25rem;
  position: sticky;
  top: 7.5rem;
}

.mission-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 1.5rem;
  color: #e1fdff;
  margin-top: 0.5rem;
  margin-bottom: 1.875rem;
}

.summary-list {
  border-bottom: 0.0625rem solid rgba(255, 255, 255, 0.05);
  padding-bottom: 1.5rem;
  margin-bottom: 1.5rem;
}

.list-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 1rem;
  font-size: 0.9375rem;
}

.list-row span { color: rgba(225, 253, 255, 0.6); }
.list-row strong { color: #e1fdff; }

.total-section .label {
  font-size: 0.75rem;
  color: #00f2ff;
  text-transform: uppercase;
  letter-spacing: 0.0625rem;
}

.total-price {
  font-size: 2.25rem;
  color: #e1fdff;
  margin-top: 0.5rem;
  margin-bottom: 2rem;
}

.btn-confirm {
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

.btn-confirm:hover {
  background: #53e4ff;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.3);
}

/* Responsividade */
@media (max-width: 56.25rem) {
  .payment-grid {
    grid-template-columns: 1fr;
  }
  .summary-panel {
    position: static;
  }
}
</style>
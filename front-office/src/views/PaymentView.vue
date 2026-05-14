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
                <input type="text" value="PT50 0000 0000 0000 0000 0000 0" readonly />
              </div>
              <div class="input-group">
                <label>SWIFT / BIC</label>
                <input type="text" value="ORBITPTPLXXX" readonly />
              </div>
            </div>

            <div class="input-row mt-4">
              <div class="input-group">
                <label>Entidade</label>
                <input type="text" value="12345" readonly />
              </div>
              <div class="input-group">
                <label>Referência</label>
                <input type="text" value="987 654 321" readonly />
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
              <span>Trajetória</span>
              <strong>{{ bookingStore.formatPrice(bookingStore.custoTrajetoria) }}</strong>
            </div>
            <div class="list-row">
              <span>Combustível</span>
              <strong>{{ bookingStore.formatPrice(bookingStore.custoCombustivel) }}</strong>
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
            Cliente não encontrado. Faça login novamente para continuar.
          </p>
        </aside>

      </div>
    </section>
  </main>
</template>

<script setup>
import { useBookingStore } from '../stores/BookingStore'
import { useUserStore } from '../stores/UserStore'
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const bookingStore = useBookingStore()
const userStore = useUserStore()
const router = useRouter()

const morada = ref('')
const clienteId = computed(() => {
  const id = bookingStore.clienteId || localStorage.getItem('clienteId')
  return Number.isFinite(Number(id)) ? Number(id) : null
})
const isPaymentDisabled = computed(() => !clienteId.value)

const STRAPI_URL = 'http://localhost:1338'
const STRAPI_API_TOKEN = 'e5c8410d2d4b81559a226941df1112c58791d9ebfeaf62f90e3f1055e06b05bae371cf49690d3f832aa83e8c577292c95f2b1f2a917f85bd5fc5888c755dea11276758af6986d1e5323ec20a12a361a4898dff9f2337da80b1c9cda498e71b56c81917ef9a62821fcf49529819510110fd66a0cbf965822ef7f2493181ed373e'

const confirmarMissao = async () => {
  // Validar se a morada foi preenchida
  if (!morada.value.trim()) {
    alert('Por favor, preencha a morada de entrega.')
    return
  }

  // Validar se há destino selecionado
  if (!bookingStore.destinoSelecionado || !bookingStore.destinoSelecionado.id) {
    alert('Destino não selecionado. Por favor, volte e selecione um destino.')
    return
  }

  // Validar se há cliente ID numérico
  if (!clienteId.value) {
    alert('Informações de cliente não encontradas. Por favor, faça login novamente.')
    return
  }

  try {
    const payload = {
      data: {
        destino: bookingStore.destinoSelecionado.id,
        cliente: clienteId.value,
        LocalEntrega: morada.value,
        Kit: bookingStore.selectedKit,
        NumeroPassageiros: bookingStore.numeroPassageiros,
        Estado: 'Pendente'
      }
    }

    const response = await fetch(`${STRAPI_URL}/api/pedido-missions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${STRAPI_API_TOKEN}`
      },
      body: JSON.stringify(payload)
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(`Erro ao criar missão: ${errorData.error?.message || response.statusText}`)
    }

    const data = await response.json()
    console.log('Missão criada com sucesso:', data)
    
    alert('Missão confirmada com sucesso! Redirecionando para o histórico de missões...')
    
    // Limpar dados e redirecionar
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
  display: flex;
  justify-content: center;
  align-items: center;
  background: #00f2ff;
  color: #00363a;
  padding: 1.25rem;
  text-decoration: none;
  font-weight: 800;
  letter-spacing: 0.125rem;
  border-radius: 0.25rem;
  transition: all 0.3s ease;
}

.btn-confirm:hover {
  background: #e1fdff;
  transform: translateY(-0.125rem);
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
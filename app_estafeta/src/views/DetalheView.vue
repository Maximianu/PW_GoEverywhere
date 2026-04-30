<template>
  <div class="app-shell">
    <div class="screen details-screen">
      <button class="back-btn" @click="voltar">&lt; Voltar</button>

      <h1 class="details-title">Detalhes da Encomenda</h1>

      <div class="info-box">
       <p><strong>Cliente :</strong> {{ pedido.name }}</p>
       <p><strong>Encomenda:</strong> #{{ pedido.id }}</p>
       <p><strong>Morada:</strong> {{ pedido.address }}</p>
       <p><strong>Telefone:</strong> {{ pedido.phone }}</p>
       <p><strong>Janela:</strong> {{ pedido.time }}</p>
       <p><strong>Estado:</strong> {{ pedido.status }}</p>
      </div>

      <p class="notas-entrega"><strong>Notas da Entrega :</strong> {{ pedido.notes }}</p>

      <div class="map-container">
        <iframe 
          src="https://maps.google.com/maps?q=Rua+da+Serpa+Pinto+12,+Guimarães&t=&z=15&ie=UTF8&iwloc=&output=embed" 
          width="100%" 
          height="100%" 
          frameborder="0" 
          style="border:0;" 
          allowfullscreen="" 
          aria-hidden="false" 
          tabindex="0">
        </iframe>
      </div>

      <!-- Iniciar Entrega Button -->
      <button 
        class="full-action-btn"
        :class="isEmRota ? 'primary-btn btn-no-glow' : 'secondary-btn'"
        @click="iniciarCorrida"
      >
        Iniciar Entrega
      </button>

      <!-- Registar Problema Button -->
      <button 
        class="full-action-btn"
        :class="[
          isRegistarProblema ? 'primary-btn btn-no-glow merged-bottom' : 'secondary-btn'
        ]"
        @click="toggleProblema"
      >
        Registar Problema
      </button>

      <!-- Problema expanded panel -->
      <div v-if="isRegistarProblema" class="expanded-panel radio-panel merged-top">
        <label class="radio-option">
          <input type="radio" value="Tentativa de entrega" v-model="statusOption" />
          <span class="radio-custom"></span>
          Tentativa de entrega
        </label>
        <label class="radio-option">
          <input type="radio" value="Não Entregue" v-model="statusOption" />
          <span class="radio-custom"></span>
          Não Entregue
        </label>
      </div>
      
      <p v-if="isRegistarProblema" class="notas-entrega mt-small"><strong>Nota(s) :</strong> Cliente não estava em casa, voltar às 18h.</p>

      <!-- Registar Entrega Button -->
      <button 
        class="full-action-btn"
        :class="isRegistarEntrega ? 'primary-btn btn-no-glow' : 'secondary-btn'"
        @click="toggleEntrega"
      >
        Registar Entrega
      </button>

      <template v-if="isRegistarEntrega">
        <!-- Assinatura -->
        <div class="info-box signature-box" style="margin-top: 20px;">
          <p><strong>Assinatura :</strong></p>
        </div>

        <!-- Fotografia -->
        <div class="photo-box mt-small">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          <p>Adicionar fotografia da entrega</p>
        </div>

        <p class="notas-entrega" style="margin-top: 12px;"><strong>Nota(s) :</strong></p>
      </template>

      <!-- Guardar Alterações Button -->
      <button 
        class="full-action-btn mt-small"
        :class="isGuardarSelecionado ? 'primary-btn btn-glow' : 'primary-btn btn-no-glow'"
        @click="guardarAlteracoes"
      >
        Guardar Alterações
      </button>

    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { getPedidoById, updatePedidoEstado } from '../services/api'

const router = useRouter()
const route = useRoute()

const isEmRota = ref(false)
const isRegistarProblema = ref(false)
const isRegistarEntrega = ref(false)
const isGuardarSelecionado = ref(false)
const statusOption = ref('Tentativa de entrega')

const pedido = ref({
  id: '',
  name: '',
  address: '',
  phone: '',
  time: '',
  status: 'Pendente',
  notes: '',
})

function getAttr(item) {
  return item.attributes || item
}

function mapStatus(status) {
  if (!status) return 'Pendente'

  const normalized = status.toLowerCase()

  if (normalized.includes('transito') || normalized.includes('trânsito') || normalized.includes('rota')) {
    return 'Em Rota'
  }

  if (normalized.includes('concluido') || normalized.includes('concluído')) {
    return 'Concluída'
  }

  if (normalized.includes('não') || normalized.includes('nao')) {
    return 'Não Entregue'
  }

  return 'Pendente'
}

function mapPedido(item) {
  const data = getAttr(item)
  const cliente = data.cliente?.data?.attributes || data.cliente || {}

  return {
    id: item.id,
    name: cliente.Nome || cliente.nome || data.Cliente || data.clienteNome || 'Cliente sem nome',
    address: data.LocalEntrega || data.Destino || data.Morada || 'Morada não definida',
    phone: cliente.Telefone || cliente.telefone || data.Telefone || 'Sem telefone',
    time: data.Horario || data.Janela || data.DataHora || 'Horário não definido',
    status: mapStatus(data.Estado),
    notes: data.Observacoes || data.Notas || data.Descricao || 'Sem notas',
  }
}

async function carregarPedido() {
  try {
    const response = await getPedidoById(route.params.id)
    pedido.value = mapPedido(response.data)

    if (pedido.value.status === 'Em Rota') {
      isEmRota.value = true
    }
  } catch (err) {
    console.error(err)
  }
}

onMounted(carregarPedido)

const estadoStr = computed(() => pedido.value.status)

function voltar() {
  router.back()
}

async function iniciarCorrida() {
  try {
    await updatePedidoEstado(route.params.id, 'Transito')
    pedido.value.status = 'Em Rota'
    isEmRota.value = true
    isRegistarProblema.value = false
    isRegistarEntrega.value = false
  } catch (err) {
    console.error(err)
    alert('Erro ao atualizar o estado da entrega.')
  }
}

function toggleProblema() {
  isRegistarProblema.value = !isRegistarProblema.value
  if (isRegistarProblema.value) isRegistarEntrega.value = false
}

function toggleEntrega() {
  isRegistarEntrega.value = !isRegistarEntrega.value
  if (isRegistarEntrega.value) isRegistarProblema.value = false
}

async function guardarAlteracoes() {
  try {
    let novoEstado = pedido.value.status

    if (isRegistarEntrega.value) {
      novoEstado = 'Concluido'
    }

    if (isRegistarProblema.value) {
      novoEstado = statusOption.value
    }

    await updatePedidoEstado(route.params.id, novoEstado)
    pedido.value.status = mapStatus(novoEstado)
    isGuardarSelecionado.value = true
  } catch (err) {
    console.error(err)
    alert('Erro ao guardar alterações.')
  }
}
</script>
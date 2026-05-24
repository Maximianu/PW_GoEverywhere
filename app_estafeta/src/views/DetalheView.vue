<template>
  <div class="app-shell">
    <div class="screen details-screen">
      <button class="back-btn" @click="voltar">&lt; Voltar</button>

      <h1 class="details-title">Detalhes da Encomenda</h1>

      <div class="info-box">
        <p><strong>Cliente :</strong> {{ pedido.name }}</p>
        <p><strong>Encomenda:</strong> #{{ pedido.numero }}</p>
        <p><strong>Morada:</strong> {{ pedido.address }}</p>
        <p><strong>Telefone:</strong> {{ pedido.phone }}</p>
        <p><strong>Janela:</strong> {{ pedido.time }}</p>
        <p><strong>Estado:</strong> {{ pedido.status }}</p>
      </div>

      <p class="notas-entrega">
        <strong>Notas da Entrega :</strong> {{ pedido.notes }}
      </p>

      <div class="map-container">
        <iframe
          :src="mapUrl"
          width="100%"
          height="100%"
          frameborder="0"
          style="border:0;"
          allowfullscreen=""
          aria-hidden="false"
          tabindex="0"
        ></iframe>
      </div>

      <button
        class="full-action-btn"
        :class="isEmRota ? 'primary-btn btn-no-glow' : 'secondary-btn'"
        @click="iniciarCorrida"
      >
        Iniciar Entrega
      </button>

      <button
        class="full-action-btn"
        :class="isRegistarProblema ? 'primary-btn btn-no-glow merged-bottom' : 'secondary-btn'"
        @click="toggleProblema"
      >
        Registar Problema
      </button>

      <div v-if="isRegistarProblema" class="expanded-panel merged-top">
        <textarea
          v-model="problemaTexto"
          class="search-input"
          placeholder="Descreva o problema da entrega..."
          rows="4"
        ></textarea>
      </div>

      <button
        class="full-action-btn"
        :class="isRegistarEntrega ? 'primary-btn btn-no-glow' : 'secondary-btn'"
        @click="toggleEntrega"
      >
        Registar Entrega
      </button>

      <template v-if="isRegistarEntrega">
        <div class="info-box signature-box" style="margin-top: 20px;">
          <p><strong>Assinatura :</strong></p>
        </div>

        <div class="photo-box mt-small">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="rgba(255,255,255,0.4)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          <p>Adicionar fotografia da entrega</p>
        </div>
      </template>

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
import { getPedidoById, updatePedido } from '../services/api'

const router = useRouter()
const route = useRoute()

const isEmRota = ref(false)
const isRegistarProblema = ref(false)
const isRegistarEntrega = ref(false)
const isGuardarSelecionado = ref(false)
const problemaTexto = ref('')

const pedido = ref({
  id: '',
  numero: '',
  name: '',
  address: '',
  phone: '',
  time: '',
  status: 'Pendente',
  notes: '',
})

const mapUrl = computed(() => {
  const morada = encodeURIComponent(pedido.value.address || 'Guimarães')
  return `https://maps.google.com/maps?q=${morada}&t=&z=15&ie=UTF8&iwloc=&output=embed`
})

function getCliente(item) {
  return item.cliente || item.bilhete?.cliente || item.bilhete?.cliente2 || null
}

function getClienteNome(item) {
  const cliente = getCliente(item)

  if (!cliente) return 'Cliente não definido'

  const primeiro = cliente.PrimeiroNome || cliente.primeiroNome || ''
  const ultimo = cliente.UltimoNome || cliente.ultimoNome || ''
  const nomeCompleto = `${primeiro} ${ultimo}`.trim()

  return nomeCompleto || cliente.Email || cliente.email || 'Cliente não definido'
}

function getClienteTelefone(item) {
  const cliente = getCliente(item)

  return (
    cliente?.Telemovel ||
    cliente?.Telefone ||
    cliente?.telemovel ||
    cliente?.telefone ||
    item.Telefone ||
    'Sem telefone'
  )
}

function mapStatus(status) {
  if (!status) return 'Pendente'

  const value = status.toLowerCase()

  if (value.includes('transito') || value.includes('trânsito') || value.includes('rota')) {
    return 'Em Rota'
  }

  if (value.includes('concluido') || value.includes('concluído')) {
    return 'Entregue'
  }

  if (value.includes('não') || value.includes('nao')) {
    return 'Não Entregue'
  }

  return 'Pendente'
}

function mapPedido(item) {
  return {
    id: item.documentId,
    numero: item.id,
    name: getClienteNome(item),
    address: item.LocalEntrega || item.Destino || 'Morada não definida',
    phone: getClienteTelefone(item),
    time: item.Horario || 'Horário não definido',
    status: mapStatus(item.Estado),
    notes: item.Problema || item.Observacoes || item.Notas || item.Descricao || 'Sem notas',
  }
}

async function carregarPedido() {
  try {
    const response = await getPedidoById(route.params.id)
    pedido.value = mapPedido(response.data)

    isEmRota.value = pedido.value.status === 'Em Rota'
  } catch (err) {
    console.error(err)
    alert('Erro ao carregar os detalhes da entrega.')
  }
}

onMounted(carregarPedido)

function voltar() {
  router.back()
}

async function iniciarCorrida() {
  try {
    await updatePedido(route.params.id, {
      Estado: 'Transito',
    })

    pedido.value.status = 'Em Rota'
    isEmRota.value = true
    isRegistarProblema.value = false
    isRegistarEntrega.value = false
  } catch (err) {
    console.error(err)
    alert('Erro ao iniciar entrega.')
  }
}

function toggleProblema() {
  isRegistarProblema.value = !isRegistarProblema.value

  if (isRegistarProblema.value) {
    isRegistarEntrega.value = false
  }
}

function toggleEntrega() {
  isRegistarEntrega.value = !isRegistarEntrega.value

  if (isRegistarEntrega.value) {
    isRegistarProblema.value = false
  }
}

async function guardarAlteracoes() {
  try {
    let dadosAtualizados = {}

    if (isRegistarProblema.value) {
      if (!problemaTexto.value.trim()) {
        alert('Escreve o problema antes de guardar.')
        return
      }

      dadosAtualizados = {
        Estado: 'Não Entregue',
        Problema: problemaTexto.value,
      }
    } else if (isRegistarEntrega.value) {
      dadosAtualizados = {
        Estado: 'Concluido',
      }
    } else if (isEmRota.value) {
      dadosAtualizados = {
        Estado: 'Transito',
      }
    }

    if (Object.keys(dadosAtualizados).length === 0) {
      alert('Seleciona uma ação antes de guardar.')
      return
    }

    await updatePedido(route.params.id, dadosAtualizados)

    pedido.value.status = mapStatus(dadosAtualizados.Estado)
    isGuardarSelecionado.value = true

    if (
      dadosAtualizados.Estado === 'Concluido' ||
      dadosAtualizados.Estado === 'Não Entregue'
    ) {
      router.push('/historico')
    }
  } catch (err) {
    console.error(err)
    alert('Erro ao guardar alterações.')
  }
}
</script>
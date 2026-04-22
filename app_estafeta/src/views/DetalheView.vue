<template>
  <div class="app-shell">
    <div class="screen details-screen">
      <button class="back-btn" @click="voltar">&lt; Voltar</button>

      <h1 class="details-title">Detalhes da Encomenda</h1>

      <div class="info-box">
        <p><strong>Cliente :</strong> Maria Silva</p>
        <p><strong>Encomenda:</strong> #102</p>
        <p><strong>Morada:</strong> Rua da Serpa Pinto 12, Guimarães</p>
        <p><strong>Telefone:</strong> 912 345 678</p>
        <p><strong>Janela:</strong> 11:00-13:00</p>
        <p><strong>Estado:</strong> {{ estadoStr }}</p>
      </div>

      <p class="notas-entrega"><strong>Notas da Entrega :</strong> Deixar na receção</p>

      <div class="map-container">
        <img src="../assets/mapa.png" alt="Mapa da entrega" />
      </div>

      <!-- Iniciar Corrida Button -->
      <button 
        class="full-action-btn"
        :class="isEmRota ? 'primary-btn btn-no-glow' : 'secondary-btn'"
        @click="iniciarCorrida"
      >
        Iniciar Corrida
      </button>

      <!-- Registar Problema Button -->
      <button 
        class="full-action-btn mt-small"
        :class="isRegistarProblema ? 'primary-btn btn-no-glow' : 'secondary-btn'"
        @click="toggleProblema"
      >
        Registar Problema
      </button>

      <!-- Problema expanded panel -->
      <div v-if="isRegistarProblema" class="expanded-panel radio-panel mt-small">
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
        class="full-action-btn secondary-btn mt-small"
      >
        Registar Entrega
      </button>

      <!-- Guardar Alterações Button -->
      <button 
        class="full-action-btn mt-small"
        :class="isRegistarProblema ? 'primary-btn btn-glow' : 'secondary-btn'"
      >
        Guardar Alterações
      </button>

    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isEmRota = ref(false)
const isRegistarProblema = ref(false)
const statusOption = ref('Tentativa de entrega')

const estadoStr = computed(() => {
  if (isEmRota.value) return 'Em Rota'
  return 'Pendente'
})

function voltar() {
  router.back()
}

function iniciarCorrida() {
  isEmRota.value = true
  isRegistarProblema.value = false
}

function toggleProblema() {
  isRegistarProblema.value = !isRegistarProblema.value
}
</script>
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

      <div class="small-box">
        <p><strong>Instruções :</strong> Deixar na receção</p>
      </div>

      <!-- Atualizar Estado Button -->
      <button 
        class="full-action-btn"
        :class="isUpdatingStatus ? 'primary-btn btn-no-glow' : (isBaseState ? 'primary-btn btn-glow' : 'secondary-btn')"
        @click="toggleStatus"
      >
        Atualizar Estado
      </button>

      <!-- Status expanded panel -->
      <div v-if="isUpdatingStatus" class="expanded-panel radio-panel">
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
      
      <div v-if="isUpdatingStatus" class="small-box notes-box">
         <p><strong>Nota(s) :</strong> Cliente não estava em casa, voltar às 18h.</p>
      </div>

      <!-- Registar Entrega Button -->
      <button 
        class="full-action-btn"
        :class="isRegistering ? 'primary-btn btn-no-glow' : 'secondary-btn'"
        @click="toggleRegister"
      >
        Registar Entrega
      </button>

      <!-- Register expanded panel -->
      <div v-if="isRegistering" class="expanded-panel small-box signature-box">
        <p><strong>Assinatura :</strong></p>
      </div>
      <div v-if="isRegistering" class="expanded-panel photo-box">
        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M4 8V20H20V8H4ZM3 6H21C21.5523 6 22 6.44772 22 7V21C22 21.5523 21.5523 22 21 22H3C2.44772 22 2 21.5523 2 21V7C2 6.44772 2.44772 6 3 6Z" fill="#182736"/>
          <path d="M8 6V4C8 3.44772 8.44772 3 9 3H15C15.5523 3 16 3.44772 16 4V6H8ZM9 4V6H15V4H9Z" fill="#182736"/>
          <circle cx="12" cy="14" r="3" stroke="#182736" stroke-width="2"/>
        </svg>
        <p>Adicionar fotografia da entrega</p>
      </div>

      <button v-if="isBaseState" class="secondary-btn full-action-btn mt-extra">
        Guardar Alterações
      </button>

      <button v-if="isBaseState" class="secondary-btn full-action-btn">
        Iniciar corrida
      </button>

      <!-- Guardar always at bottom if one of them is open -->
      <button v-if="!isBaseState" class="primary-btn full-action-btn btn-glow form-save-btn">
        Guardar alterações
      </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const isUpdatingStatus = ref(false)
const isRegistering = ref(false)
const statusOption = ref('Tentativa de entrega')

const isBaseState = computed(() => !isUpdatingStatus.value && !isRegistering.value)

const estadoStr = computed(() => {
  if (isRegistering.value) return 'Entregue'
  return 'Em Rota'
})

function voltar() {
  router.back()
}

function toggleStatus() {
  isUpdatingStatus.value = true
  isRegistering.value = false
}

function toggleRegister() {
  isRegistering.value = true
  isUpdatingStatus.value = false
}
</script>
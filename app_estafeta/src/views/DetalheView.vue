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
        <p><strong>Estado:</strong> Em Rota</p>
      </div>

      <div class="small-box">
        <p><strong>Instruções :</strong> Deixar na receção</p>
      </div>

      <button class="primary-btn full-action-btn">
        Atualizar Estado
      </button>

      <button class="secondary-btn full-action-btn">
        Registar Entrega
      </button>

      <button class="secondary-btn full-action-btn">
        Guardar Alterações
      </button>

      <button class="secondary-btn full-action-btn">
        Iniciar corrida
      </button>
    </div>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

function voltar() {
  router.back()
}
</script>
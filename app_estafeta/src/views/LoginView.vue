<template>
  <div class="app-shell">
    <div class="screen login-screen">

      <div class="login-panel">

        <div class="field-group">
          <label>Nome de Utilizador</label>
          <input v-model="username" />
        </div>

        <div class="field-group">
          <label>Palavra-passe</label>
          <input type="password" v-model="password" />
        </div>

        <button class="primary-btn login-btn" @click="login">
          Entrar
        </button>

        <p v-if="erro" class="error-message">
          Credenciais inválidas
        </p>

      </div>

      <img class="planet-image" :src="planetImage" />

    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import planetImage from '../assets/planet-login.png'

const username = ref('')
const password = ref('')
const erro = ref(false)
const router = useRouter()

function login() {
  if (username.value === '1234' && password.value === '1234') {
    erro.value = false
    router.push('/entregas')
  } else {
    erro.value = true
  }
}
</script>
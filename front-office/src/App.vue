<script setup>
import { RouterView } from 'vue-router'
import Navbar from './components/Navbar.vue'
</script>

<template>
  <div class="front-office-app">
    <Navbar />
    
    <router-view />
  </div>
</template>

<style>
/* Estilos globais para garantir que o fundo ocupe tudo */
.front-office-app {
  min-height: 100vh;
  background: #0a0c0f; /* Cor de fundo do teu design */
  color: #e0e2eb;
}
</style>
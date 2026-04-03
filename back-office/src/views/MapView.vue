<script setup>
import { Map } from 'lucide-vue-next'
</script>

<template>
  <div class="h-full w-full flex flex-col justify-center items-center text-gray-400 bg-surface/30">
    <Map :size="80" class="mb-6 text-[#233246]" strokeWidth="1" />
    <h1 class="text-3xl font-bold text-white mb-3">Mapa de Operações</h1>
    <p class="text-lg">Integração funcional com geolocalização em desenvolvimento.</p>
  </div>
</template>

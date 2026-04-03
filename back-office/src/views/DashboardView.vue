<script setup>
import { mockData } from '../mockData'
import { MapPin, ShoppingCart, Clock } from 'lucide-vue-next'
</script>

<template>
  <div class="p-8 pb-20 max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-700">
    <header class="space-y-2">
      <h1 class="text-3xl font-bold text-white tracking-tight">Dashboard Logística</h1>
      <p class="text-gray-400 font-medium">Gestão centralizada de operações para monitorização de indicadores e suporte à tomada de decisão em tempo real.</p>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <!-- Card 1 -->
      <div class="bg-surface rounded-[2rem] p-7 border border-[#233246] flex flex-col justify-between hover:border-primary/40 transition-colors duration-300 shadow-xl relative overflow-hidden group min-h-[160px]">
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
        <div class="flex items-center gap-3 text-gray-300 font-bold mb-4 uppercase text-xs tracking-widest relative z-10">
          ESTAFETAS DISPONÍVEIS
          <div class="bg-primary/10 p-1.5 rounded-full">
            <MapPin :size="14" class="text-primary" />
          </div>
        </div>
        <div class="text-5xl font-black text-white tracking-tighter relative z-10">{{ mockData.stats.availableCouriers.toLocaleString() }}</div>
      </div>

      <!-- Card 2 -->
      <div class="bg-surface rounded-[2rem] p-7 border border-[#233246] flex flex-col justify-between hover:border-primary/40 transition-colors duration-300 shadow-xl relative overflow-hidden group min-h-[160px]">
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
        <div class="flex items-center gap-3 text-gray-300 font-bold mb-4 uppercase text-xs tracking-widest relative z-10">
          TOTAL DE PEDIDOS
          <div class="bg-primary/10 p-1.5 rounded-full">
            <ShoppingCart :size="14" class="text-primary" />
          </div>
        </div>
        <div class="text-5xl font-black text-white tracking-tighter relative z-10">{{ mockData.stats.totalOrders.toLocaleString() }}</div>
      </div>

      <!-- Card 3 -->
      <div class="bg-surface rounded-[2rem] p-7 border border-[#233246] flex flex-col justify-between hover:border-primary/40 transition-colors duration-300 shadow-xl relative overflow-hidden group min-h-[160px]">
        <div class="absolute -right-8 -top-8 w-32 h-32 bg-primary/5 rounded-full blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
        <div class="flex items-center gap-3 text-gray-300 font-bold mb-4 uppercase text-xs tracking-widest relative z-10">
          TEMPO DE ENTREGA MÉDIO
          <div class="bg-primary/10 p-1.5 rounded-full">
            <Clock :size="14" class="text-primary" />
          </div>
        </div>
        <div class="text-5xl font-black text-white tracking-tighter relative z-10">{{ mockData.stats.avgDeliveryTime }}</div>
      </div>
    </div>

    <!-- Chart area mockup -->
    <div class="bg-surface border border-[#233246] hover:border-[#384a60] transition-colors duration-300 rounded-[2.5rem] p-8 shadow-2xl mt-8">
      <h2 class="text-xl font-bold text-white mb-10">Entregas por Região</h2>
      <div class="space-y-8">
        <div v-for="region in mockData.regionStats" :key="region.name" class="space-y-2.5">
          <div class="flex justify-between text-sm font-semibold">
            <span class="text-gray-200">{{ region.name }}</span>
            <span class="text-primary tracking-wide">{{ region.count }} ({{ region.percent }}%)</span>
          </div>
          <div class="w-full bg-[#080d14] rounded-full h-3 overflow-hidden flex">
            <div class="bg-gradient-to-r from-primary/40 to-primary h-full rounded-full shadow-[0_0_15px_rgba(0,242,255,0.6)]" :style="`width: ${region.percent}%`"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

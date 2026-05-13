<script setup>
import { ref, onMounted } from 'vue'
import { MapPin, ShoppingCart, Clock } from 'lucide-vue-next'

const stats = ref({
  availableCouriers: 0,
  totalOrders: 0,
  avgDeliveryTime: '18.4h'
})

const regionStats = ref([])

onMounted(async () => {
  try {
    const resCouriers = await fetch('http://127.0.0.1:1338/api/estafetas?filters[Disponivel][$eq]=true')
    if (resCouriers.ok) {
      const jsonCouriers = await resCouriers.json()
      stats.value.availableCouriers = jsonCouriers.meta?.pagination?.total ?? jsonCouriers.data?.length ?? 0
    }
  } catch (error) {
    console.error('Erro ao buscar estafetas:', error)
  }

  try {
    const resOrders = await fetch('http://127.0.0.1:1338/api/pedido-missions?pagination[limit]=1000')
    if (resOrders.ok) {
      const jsonOrders = await resOrders.json()
      const dataLength = jsonOrders.data?.length ?? 0
      stats.value.totalOrders = jsonOrders.meta?.pagination?.total ?? dataLength
      
      if (jsonOrders.data && dataLength > 0) {
        const regionsMap = {}
        jsonOrders.data.forEach(order => {
          const dest = order.Destino || 'Desconhecido'
          regionsMap[dest] = (regionsMap[dest] || 0) + 1
        })
        
        regionStats.value = Object.keys(regionsMap).map(name => {
          const count = regionsMap[name]
          return {
            name,
            count: count >= 1000 ? (count / 1000).toFixed(1) + 'k' : count.toString(),
            percent: Math.round((count / dataLength) * 100)
          }
        }).sort((a,b) => b.percent - a.percent)
      } else {
        regionStats.value = []
      }
    }
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error)
  }
})
</script>

<template>
  <div class="p-8 pb-20 max-w-[1400px] mx-auto space-y-10 section-fade relative">

    <!-- Header — igual ao GoEverywhere -->
    <header class="space-y-2 relative z-10">
      <h1 class="text-4xl font-black text-white mb-2 tracking-tighter italic opacity-90 uppercase">
        Dashboard
      </h1>
      <div class="flex items-center gap-2 opacity-60">
        <div class="h-[1px] w-5 bg-blue-500"></div>
        <p class="text-white text-[9px] font-mono uppercase tracking-[0.2em] whitespace-nowrap">
          Plataforma de Gestão
        </p>
        <div class="h-[1px] w-5 bg-blue-500"></div>
      </div>
    </header>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
      <div class="bg-surface rounded-3xl p-6 border border-[#233246] relative overflow-hidden group">
        <div class="text-gray-300 font-bold mb-3 uppercase text-xs tracking-widest relative z-10 border-b border-muted/50 pb-3">ESTAFETAS DISPONÍVEIS</div>
        <div class="text-5xl font-black text-white relative z-10 p-2">{{ stats.availableCouriers.toLocaleString() }}</div>
      </div>
      <div class="bg-surface rounded-3xl p-6 border border-[#233246] relative overflow-hidden group">
        <div class="text-gray-300 font-bold mb-3 uppercase text-xs tracking-widest relative z-10 border-b border-muted/50 pb-3">TOTAL DE PEDIDOS</div>
        <div class="text-5xl font-black text-white relative z-10 p-2">{{ stats.totalOrders.toLocaleString() }}</div>
      </div>
      <div class="bg-surface rounded-3xl p-6 border border-[#233246] relative overflow-hidden group">
        <div class="text-gray-300 font-bold mb-3 uppercase text-xs tracking-widest relative z-10 border-b border-muted/50 pb-3">TEMPO MÉDIO DE ENTREGA</div>
        <div class="text-5xl font-black text-white relative z-10 p-2">{{ stats.avgDeliveryTime }}</div>
      </div>
    </div>

    <!-- Chart Section -->
    <div class="card card-dashboard relative p-8 min-h-[400px] overflow-hidden group z-10">
      <div class="absolute -right-20 -bottom-20 w-96 h-96 bg-cyan-500/5 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
      
      <div class="relative z-10">
        <div class="flex items-center justify-between mb-8">
          <div>
            <h2 class="text-2xl font-bold text-white mb-2 line-accent">Entregas por Região</h2>
            <p class="text-gray-400 text-sm">Distribuição geográfica das operações</p>
          </div>
          <div class="badge-glow">
            {{ regionStats.length }} Regiões
          </div>
        </div>

        <div class="divider-glass mb-8"></div>

        <div v-if="regionStats.length > 0" class="space-y-6">
          <div v-for="(region, index) in regionStats" :key="region.name" class="animate-in" :style="`animation-delay: ${index * 100}ms`">
            <div class="flex items-end justify-between mb-3">
              <div>
                <p class="text-gray-200 font-semibold">{{ region.name }}</p>
                <p class="text-xs text-gray-500 mt-0.5">{{ region.count }} entregas</p>
              </div>
              <div class="text-right">
                <span class="text-lg font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">{{ region.percent }}%</span>
              </div>
            </div>
            <div class="w-full bg-white/5 rounded-full h-3 overflow-hidden border border-white/10 backdrop-blur-sm">
              <div 
                class="h-full rounded-full bg-gradient-to-r from-cyan-500 via-blue-500 to-cyan-500 transition-all duration-1000 ease-out shadow-glow-cyan"
                :style="{ width: region.percent + '%', animation: `slideIn 0.8s ease-out ${index * 100}ms both` }"
              ></div>
            </div>
          </div>
        </div>

        <div v-else class="flex items-center justify-center h-40 text-gray-400">
          <p>Sem dados de regiões disponíveis</p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes slideIn {
  from {
    width: 0;
    opacity: 0;
  }
  to {
    width: var(--width, 100%);
    opacity: 1;
  }
}
</style>
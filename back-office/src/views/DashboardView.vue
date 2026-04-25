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
    const resCouriers = await fetch('http://localhost:1338/api/estafetas?filters[Disponivel][$eq]=true')
    if (resCouriers.ok) {
      const jsonCouriers = await resCouriers.json()
      stats.value.availableCouriers = jsonCouriers.meta?.pagination?.total ?? jsonCouriers.data?.length ?? 0
    }
  } catch (error) {
    console.error('Erro ao buscar estafetas:', error)
  }

  try {
    const resOrders = await fetch('http://localhost:1338/api/pedido-missions?pagination[limit]=1000')
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
    <!-- Lua decorativa de fundo (atrás dos cards) -->
    <div class="moon-backdrop"></div>
    
    <!-- Header -->
    <header class="space-y-3 relative z-10">
      <div class="absolute -top-2 left-0 w-32 h-1 bg-gradient-to-r from-cyan-500 to-transparent rounded-full"></div>
      <h1 class="text-4xl font-bold text-white tracking-tight line-accent">Dashboard Logística</h1>
      <p class="text-gray-400 font-medium max-w-2xl">Gestão centralizada de operações para monitorização de indicadores e suporte à tomada de decisão em tempo real.</p>
    </header>

    <!-- Stats Grid -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10">
      <!-- Card: Estafetas Disponíveis -->
      <div class="card card-dashboard relative p-7 min-h-[180px] flex flex-col justify-between group overflow-hidden">
        <div class="absolute -right-12 -top-12 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
        
        <div class="flex items-center justify-between relative z-10">
          <div class="space-y-1">
            <div class="badge-glow bg-blue-500/10 border-blue-500/30 text-blue-400">
              <div class="w-2 h-2 rounded-full bg-blue-500"></div>
              Estafetas
            </div>
            <p class="text-sm text-gray-400 uppercase tracking-widest">Disponíveis agora</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-600/20 flex items-center justify-center border border-blue-500/30 group-hover:scale-110 transition-transform duration-300">
            <MapPin :size="24" class="text-blue-400" />
          </div>
        </div>

        <div class="text-5xl font-black text-white tracking-tighter mt-6 relative z-10">
          {{ stats.availableCouriers.toLocaleString() }}
        </div>

        <div class="h-1 bg-gradient-to-r from-blue-500/50 to-transparent rounded-full mt-4"></div>
      </div>

      <!-- Card: Total de Pedidos -->
      <div class="card card-pedidos relative p-7 min-h-[180px] flex flex-col justify-between group overflow-hidden">
        <div class="absolute -right-12 -top-12 w-40 h-40 bg-red-500/10 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
        
        <div class="flex items-center justify-between relative z-10">
          <div class="space-y-1">
            <div class="badge-glow bg-red-500/10 border-red-500/30 text-red-400">
              <div class="w-2 h-2 rounded-full bg-red-500"></div>
              Pedidos
            </div>
            <p class="text-sm text-gray-400 uppercase tracking-widest">Em sistema</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500/20 to-red-600/20 flex items-center justify-center border border-red-500/30 group-hover:scale-110 transition-transform duration-300">
            <ShoppingCart :size="24" class="text-red-400" />
          </div>
        </div>

        <div class="text-5xl font-black text-white tracking-tighter mt-6 relative z-10">
          {{ stats.totalOrders.toLocaleString() }}
        </div>

        <div class="h-1 bg-gradient-to-r from-red-500/50 to-transparent rounded-full mt-4"></div>
      </div>

      <!-- Card: Tempo Médio -->
      <div class="card card-clientes relative p-7 min-h-[180px] flex flex-col justify-between group overflow-hidden">
        <div class="absolute -right-12 -top-12 w-40 h-40 bg-green-500/10 rounded-full blur-3xl group-hover:blur-2xl transition-all duration-500 opacity-0 group-hover:opacity-100"></div>
        
        <div class="flex items-center justify-between relative z-10">
          <div class="space-y-1">
            <div class="badge-glow bg-green-500/10 border-green-500/30 text-green-400">
              <div class="w-2 h-2 rounded-full bg-green-500"></div>
              Performance
            </div>
            <p class="text-sm text-gray-400 uppercase tracking-widest">Tempo médio</p>
          </div>
          <div class="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-green-600/20 flex items-center justify-center border border-green-500/30 group-hover:scale-110 transition-transform duration-300">
            <Clock :size="24" class="text-green-400" />
          </div>
        </div>

        <div class="text-5xl font-black text-white tracking-tighter mt-6 relative z-10">
          {{ stats.avgDeliveryTime }}
        </div>

        <div class="h-1 bg-gradient-to-r from-green-500/50 to-transparent rounded-full mt-4"></div>
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
/* Lua decorativa de fundo */
.moon-backdrop {
  position: absolute;
  bottom: -150px;
  left: 50%;
  transform: translateX(-50%);
  width: 900px;
  height: 900px;
  background-image: url('/luadash.jpg');
  background-size: cover;
  background-position: center;
  border-radius: 50%;
  opacity: 0.22;
  filter: blur(0.5px) brightness(1.2) saturate(0.85);
  z-index: 0;
  pointer-events: none;
  box-shadow: 
    0 0 100px rgba(0, 242, 255, 0.15),
    inset 0 0 80px rgba(0, 0, 0, 0.2);
}

/* Em ecrãs pequenos, reduzir ou esconder */
@media (max-width: 768px) {
  .moon-backdrop {
    width: 600px;
    height: 600px;
    bottom: -100px;
    opacity: 0.12;
  }
}

/* Animação sutil de pulsação */
@keyframes moonGlow {
  0%, 100% {
    opacity: 0.22;
    filter: blur(0.5px) brightness(1.2) saturate(0.85);
  }
  50% {
    opacity: 0.26;
    filter: blur(1px) brightness(1.25) saturate(0.9);
  }
}

.moon-backdrop:hover {
  animation: moonGlow 4s ease-in-out infinite;
}

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

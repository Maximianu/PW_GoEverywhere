<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Calendar, Filter, CheckCircle2, XCircle, Clock, MapPin, User } from 'lucide-vue-next'

const searchQuery = ref('')
const statusFilter = ref('todos')
const dateFilter = ref('todos')
const orders = ref([])
const isDetailsOpen = ref(false)
const selectedOrder = ref(null)

const loadOrders = async () => {
  try {
    const res = await fetch('http://localhost:1338/api/pedido-missions?populate=*&pagination[limit]=500')
    const json = await res.json()
    
    orders.value = json.data.map(item => ({
      id: item.documentId || item.id,
      client: item.Cliente || 'Sem Cliente',
      initials: item.Cliente ? item.Cliente.substring(0, 2).toUpperCase() : '??',
      destination: item.Destino || 'Não Definido',
      date: new Date(item.createdAt || Date.now()).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' }),
      time: new Date(item.createdAt || Date.now()).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' }),
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
      localEntrega: item.LocalEntrega || 'Não Definido',
      status: item.Estado || 'Pendente',
      priority: item.Prioridade || 0,
      courier: item.estafeta?.Nome || 'Não atribuído',
      price: item.Preco || '0€'
    }))
    
    // Ordenar por data mais recente
    orders.value.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  } catch (error) {
    console.error('Erro ao buscar histórico de pedidos:', error)
    orders.value = []
  }
}

onMounted(loadOrders)

const openDetailsDrawer = (order) => {
  selectedOrder.value = order
  isDetailsOpen.value = true
}

const closeDetailsDrawer = () => {
  isDetailsOpen.value = false
  selectedOrder.value = null
}

const getStatusColor = (status) => {
  switch (status) {
    case 'Entregue':
      return 'bg-green-500/20 text-green-300 border-green-500/30'
    case 'Transito':
      return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    case 'Aprovado':
      return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    case 'Pendente':
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    case 'Cancelado':
      return 'bg-red-500/20 text-red-300 border-red-500/30'
    default:
      return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'Entregue':
      return CheckCircle2
    case 'Transito':
      return Clock
    case 'Cancelado':
      return XCircle
    default:
      return Clock
  }
}

const stats = computed(() => {
  return {
    total: orders.value.length,
    entregues: orders.value.filter(o => o.status === 'Entregue').length,
    emTransito: orders.value.filter(o => o.status === 'Transito').length,
    cancelados: orders.value.filter(o => o.status === 'Cancelado').length
  }
})

const filteredOrders = computed(() => {
  let filtered = orders.value

  // Filtrar por status
  if (statusFilter.value !== 'todos') {
    filtered = filtered.filter(o => o.status === statusFilter.value)
  }

  // Filtrar por data
  if (dateFilter.value !== 'todos') {
    const now = new Date()
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const weekAgo = new Date(today)
    weekAgo.setDate(weekAgo.getDate() - 7)

    const orderDate = (order) => {
      const d = new Date(order.createdAt)
      return new Date(d.getFullYear(), d.getMonth(), d.getDate())
    }

    if (dateFilter.value === 'hoje') {
      filtered = filtered.filter(o => orderDate(o).getTime() === today.getTime())
    } else if (dateFilter.value === 'ontem') {
      filtered = filtered.filter(o => orderDate(o).getTime() === yesterday.getTime())
    } else if (dateFilter.value === 'semana') {
      filtered = filtered.filter(o => orderDate(o) >= weekAgo)
    }
  }

  // Filtrar por pesquisa
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase()
    filtered = filtered.filter(o =>
      o.client.toLowerCase().includes(q) ||
      o.destination.toLowerCase().includes(q) ||
      o.id.toLowerCase().includes(q)
    )
  }

  return filtered
})
</script>

<template>
  <div class="p-8 pb-20 max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-700 relative">
    <!-- Lua decorativa -->
    <div class="moon-backdrop moon-backdrop-historico"></div>
    
    <!-- Header -->
    <header class="space-y-3 relative z-10">
      <h1 class="text-3xl font-bold text-white tracking-tight">Histórico de Pedidos</h1>
      <p class="text-gray-400 font-medium tracking-wide">Visualize o histórico completo de todos os pedidos processados.</p>
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-4 gap-6">
      <div class="bg-gradient-to-br from-slate-500/20 to-slate-600/10 border border-slate-500/30 rounded-2xl p-6">
        <div class="text-sm text-gray-400 font-medium mb-2">Total</div>
        <div class="text-4xl font-bold text-white">{{ stats.total }}</div>
      </div>
      <div class="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl p-6">
        <div class="text-sm text-gray-400 font-medium mb-2">Entregues</div>
        <div class="text-4xl font-bold text-white">{{ stats.entregues }}</div>
      </div>
      <div class="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6">
        <div class="text-sm text-gray-400 font-medium mb-2">Em Trânsito</div>
        <div class="text-4xl font-bold text-white">{{ stats.emTransito }}</div>
      </div>
      <div class="bg-gradient-to-br from-red-500/20 to-red-600/10 border border-red-500/30 rounded-2xl p-6">
        <div class="text-sm text-gray-400 font-medium mb-2">Cancelados</div>
        <div class="text-4xl font-bold text-white">{{ stats.cancelados }}</div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="bg-[#141b27] rounded-2xl p-4 border border-[#1f2937] space-y-4">
      <div class="flex items-center gap-4">
        <div class="flex-1 relative">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" :size="18" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Procurar por cliente, destino ou ID..."
            class="w-full pl-12 pr-4 py-2.5 bg-[#0c1219] border border-[#2a3b4f] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary"
          />
        </div>
      </div>

      <div class="flex items-center gap-4">
        <div class="flex items-center gap-2">
          <Filter :size="18" class="text-gray-400" />
          <span class="text-sm font-medium text-gray-300">Filtros:</span>
        </div>

        <select
          v-model="statusFilter"
          class="px-4 py-2 bg-[#0c1219] border border-[#2a3b4f] rounded-lg text-white text-sm focus:outline-none focus:border-primary"
        >
          <option value="todos">Todos os Status</option>
          <option value="Pendente">Pendente</option>
          <option value="Aprovado">Aprovado</option>
          <option value="Transito">Em Trânsito</option>
          <option value="Entregue">Entregue</option>
          <option value="Cancelado">Cancelado</option>
        </select>

        <select
          v-model="dateFilter"
          class="px-4 py-2 bg-[#0c1219] border border-[#2a3b4f] rounded-lg text-white text-sm focus:outline-none focus:border-primary"
        >
          <option value="todos">Qualquer Data</option>
          <option value="hoje">Hoje</option>
          <option value="ontem">Ontem</option>
          <option value="semana">Esta Semana</option>
        </select>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="bg-[#141b27] border border-[#1f2937] rounded-2xl overflow-hidden">
      <div v-if="filteredOrders.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-[#1f2937] bg-[#0c1219]">
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">ID</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Cliente</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Destino</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Estafeta</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Status</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Data & Hora</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Ação</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#1f2937]">
            <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-[#1a2332] transition-colors">
              <td class="px-6 py-4">
                <span class="font-mono text-xs text-gray-300 bg-[#0c1219] px-2 py-1 rounded">
                  {{ order.id.substring(0, 8) }}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-black font-semibold text-xs">
                    {{ order.initials }}
                  </div>
                  <span class="text-white font-medium text-sm">{{ order.client }}</span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 text-sm text-gray-300">
                  <MapPin :size="16" class="text-gray-500 shrink-0" />
                  {{ order.destination }}
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-300">{{ order.courier }}</td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2">
                  <component :is="getStatusIcon(order.status)" :size="16" class="shrink-0" />
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border" :class="getStatusColor(order.status)">
                    {{ order.status }}
                  </span>
                </div>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center gap-2 text-sm text-gray-400">
                  <Calendar :size="16" class="text-gray-500" />
                  <div>
                    <div>{{ order.date }}</div>
                    <div class="text-xs">{{ order.time }}</div>
                  </div>
                </div>
              </td>
              <td class="px-6 py-4">
                <button
                  @click="openDetailsDrawer(order)"
                  class="text-primary hover:text-primary/80 font-medium text-sm transition-colors"
                >
                  Ver Detalhes
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="flex items-center justify-center py-12">
        <div class="text-center">
          <Clock class="mx-auto mb-4 text-gray-600" :size="48" />
          <p class="text-gray-400 font-medium">Nenhum pedido encontrado</p>
        </div>
      </div>
    </div>

    <!-- Details Drawer -->
    <Teleport to="body">
      <Transition
        enterActiveClass="transition-opacity duration-300"
        leaveActiveClass="transition-opacity duration-300"
      >
        <div v-if="isDetailsOpen" class="fixed inset-0 bg-black/50 z-40" @click="closeDetailsDrawer" />
      </Transition>

      <Transition
        enterActiveClass="transition-transform duration-300"
        leaveActiveClass="transition-transform duration-300"
        enterFromClass="translate-x-full"
        leaveToClass="translate-x-full"
      >
        <div v-if="isDetailsOpen && selectedOrder" class="fixed right-0 top-0 h-full w-96 bg-[#141b27] border-l border-[#1f2937] z-50 flex flex-col shadow-2xl overflow-y-auto">
          <!-- Header -->
          <div class="sticky top-0 flex items-center justify-between p-6 border-b border-[#1f2937] bg-[#141b27]">
            <h3 class="text-xl font-bold text-white">Detalhes do Pedido</h3>
            <button @click="closeDetailsDrawer" class="text-gray-400 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 p-6 space-y-6">
            <!-- Order ID -->
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase mb-2">ID do Pedido</p>
              <p class="text-white font-mono">{{ selectedOrder.id }}</p>
            </div>

            <!-- Client -->
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase mb-2">Cliente</p>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-black font-semibold">
                  {{ selectedOrder.initials }}
                </div>
                <p class="text-white">{{ selectedOrder.client }}</p>
              </div>
            </div>

            <!-- Destination -->
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase mb-2">Destino</p>
              <div class="flex items-start gap-2">
                <MapPin :size="16" class="text-gray-500 mt-1 shrink-0" />
                <p class="text-white">{{ selectedOrder.destination }}</p>
              </div>
            </div>

            <!-- Local de Entrega -->
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase mb-2">Local de Entrega</p>
              <p class="text-white">{{ selectedOrder.localEntrega }}</p>
            </div>

            <!-- Courier -->
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase mb-2">Estafeta Atribuído</p>
              <div class="flex items-center gap-2">
                <User :size="16" class="text-gray-500" />
                <p class="text-white">{{ selectedOrder.courier }}</p>
              </div>
            </div>

            <!-- Status -->
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase mb-2">Status</p>
              <div class="flex items-center gap-2">
                <component :is="getStatusIcon(selectedOrder.status)" :size="16" />
                <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border" :class="getStatusColor(selectedOrder.status)">
                  {{ selectedOrder.status }}
                </span>
              </div>
            </div>

            <!-- Date and Time -->
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase mb-2">Data e Hora</p>
              <div class="flex items-center gap-2">
                <Calendar :size="16" class="text-gray-500" />
                <p class="text-white">{{ selectedOrder.date }} às {{ selectedOrder.time }}</p>
              </div>
            </div>

            <!-- Priority -->
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase mb-2">Prioridade</p>
              <p class="text-white">{{ selectedOrder.priority > 0 ? '🔴 Alta' : '🟢 Normal' }}</p>
            </div>

            <!-- Price -->
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase mb-2">Preço</p>
              <p class="text-white font-semibold text-lg">{{ selectedOrder.price }}</p>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
/* Lua decorativa de fundo - Histórico (Âmbar) */
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
    0 0 100px rgba(217, 119, 6, 0.15),
    inset 0 0 80px rgba(0, 0, 0, 0.2);
}

.moon-backdrop-historico {
  box-shadow: 
    0 0 100px rgba(217, 119, 6, 0.2),
    inset 0 0 80px rgba(0, 0, 0, 0.2);
}

@media (max-width: 768px) {
  .moon-backdrop {
    width: 600px;
    height: 600px;
    bottom: -100px;
    opacity: 0.12;
  }
}

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
</style>

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
    const res = await fetch('http://127.0.0.1:1338/api/pedido-missions?populate=*&pagination[limit]=500')
    const json = await res.json()
    
    orders.value = json.data.map(item => ({
      id: item.documentId || item.id,
      client: item.cliente ? `${item.cliente.PrimeiroNome || ''} ${item.cliente.UltimoNome || ''}`.trim() : (item.Cliente || 'Sem Cliente'),
      initials: item.cliente ? ((item.cliente.PrimeiroNome ? item.cliente.PrimeiroNome[0] : '') + (item.cliente.UltimoNome ? item.cliente.UltimoNome[0] : '')).toUpperCase() || '??' : (item.Cliente ? item.Cliente.substring(0, 2).toUpperCase() : '??'),
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
    case 'Entregue': return 'bg-green-500/20 text-green-300 border-green-500/30'
    case 'Transito': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
    case 'Aprovado': return 'bg-amber-500/20 text-amber-300 border-amber-500/30'
    case 'Pendente': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    case 'Cancelado': return 'bg-red-500/20 text-red-300 border-red-500/30'
    default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
  }
}

const getStatusIcon = (status) => {
  switch (status) {
    case 'Entregue': return CheckCircle2
    case 'Cancelado': return XCircle
    default: return Clock
  }
}

const stats = computed(() => ({
  total: orders.value.length,
  entregues: orders.value.filter(o => o.status === 'Entregue').length,
  emTransito: orders.value.filter(o => o.status === 'Transito').length,
  cancelados: orders.value.filter(o => o.status === 'Cancelado').length
}))

const filteredOrders = computed(() => {
  let filtered = orders.value

  if (statusFilter.value !== 'todos') {
    filtered = filtered.filter(o => o.status === statusFilter.value)
  }

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

    <!-- Header — igual ao GoEverywhere -->
    <header class="space-y-2 relative z-10">
      <h1 class="text-4xl font-black text-white mb-2 tracking-tighter italic opacity-90 uppercase">
        Histórico
      </h1>
      <div class="flex items-center gap-2 opacity-60">
        <div class="h-[1px] w-5 bg-blue-500"></div>
        <p class="text-white text-[9px] font-mono uppercase tracking-[0.2em] whitespace-nowrap">
          Histórico completo de todos os pedidos processados
        </p>
        <div class="h-[1px] w-5 bg-blue-500"></div>
      </div>
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 relative z-10">
      <div class="bg-surface rounded-3xl p-6 border border-[#233246] relative overflow-hidden group">
        <div class="text-gray-300 font-bold mb-3 uppercase text-xs tracking-widest relative z-10 border-b border-muted/50 pb-3">TOTAL</div>
        <div class="text-5xl font-black text-white relative z-10 p-2">{{ stats.total }}</div>
      </div>
      <div class="bg-surface rounded-3xl p-6 border border-[#233246] relative overflow-hidden group">
        <div class="text-gray-300 font-bold mb-3 uppercase text-xs tracking-widest relative z-10 border-b border-muted/50 pb-3">ENTREGUES</div>
        <div class="text-5xl font-black text-white relative z-10 p-2">{{ stats.entregues }}</div>
      </div>
      <div class="bg-surface rounded-3xl p-6 border border-[#233246] relative overflow-hidden group">
        <div class="text-gray-300 font-bold mb-3 uppercase text-xs tracking-widest relative z-10 border-b border-muted/50 pb-3">EM TRÂNSITO</div>
        <div class="text-5xl font-black text-white relative z-10 p-2">{{ stats.emTransito }}</div>
      </div>
      <div class="bg-surface rounded-3xl p-6 border border-[#233246] relative overflow-hidden group">
        <div class="text-gray-300 font-bold mb-3 uppercase text-xs tracking-widest relative z-10 border-b border-muted/50 pb-3">CANCELADOS</div>
        <div class="text-5xl font-black text-white relative z-10 p-2">{{ stats.cancelados }}</div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="bg-surface rounded-3xl p-6 border border-[#233246] space-y-4">
      <div class="flex flex-col md:flex-row items-center gap-6">
        <div class="flex-1 w-full relative">
          <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" :size="18" />
          <input
            v-model="searchQuery"
            type="text"
            placeholder="Procurar por cliente, destino ou ID..."
            class="w-full pl-12 pr-4 py-3 bg-[#111926] border border-[#233246] rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,242,255,0.15)] transition-all"
          />
        </div>
        <div class="flex items-center gap-4 w-full md:w-auto">
          <div class="flex items-center gap-2 px-2">
            <Filter :size="18" class="text-gray-400" />
            <span class="text-sm font-semibold text-gray-300">Filtros:</span>
          </div>
          <select v-model="statusFilter" class="px-4 py-3 bg-[#111926] border border-[#233246] rounded-xl text-white text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,242,255,0.15)] transition-all cursor-pointer">
            <option value="todos">Todos os Status</option>
            <option value="Pendente">Pendente</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Transito">Em Trânsito</option>
            <option value="Entregue">Entregue</option>
            <option value="Cancelado">Cancelado</option>
          </select>
          <select v-model="dateFilter" class="px-4 py-3 bg-[#111926] border border-[#233246] rounded-xl text-white text-sm focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,242,255,0.15)] transition-all cursor-pointer">
            <option value="todos">Qualquer Data</option>
            <option value="hoje">Hoje</option>
            <option value="ontem">Ontem</option>
            <option value="semana">Esta Semana</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="bg-surface border border-[#233246] rounded-[2rem] overflow-hidden shadow-2xl">
      <div v-if="filteredOrders.length > 0" class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[1000px]">
          <thead>
            <tr class="border-b border-[#233246] text-gray-400 text-xs uppercase tracking-widest font-semibold bg-[#111926]">
              <th class="p-6 font-semibold">ID</th>
              <th class="p-6 font-semibold">Cliente</th>
              <th class="p-6 font-semibold">Destino</th>
              <th class="p-6 font-semibold">Estafeta</th>
              <th class="p-6 font-semibold">Status</th>
              <th class="p-6 font-semibold">Data & Hora</th>
              <th class="p-6 font-semibold">Ação</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#233246]">
            <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-[#1a2636] transition-colors group cursor-pointer" @click="openDetailsDrawer(order)">
              <td class="p-6">
                <span class="font-mono text-xs font-bold text-gray-400 bg-[#111926] border border-[#233246] px-2 py-1 rounded">
                  {{ order.id.substring(0, 8) }}
                </span>
              </td>
              <td class="p-6">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-[#1e2e42] flex items-center justify-center text-sm font-bold text-primary shrink-0 shadow-inner">
                    {{ order.initials }}
                  </div>
                  <span class="text-white font-semibold">{{ order.client }}</span>
                </div>
              </td>
              <td class="p-6 text-sm">
                <div class="flex items-center gap-2 text-gray-300">
                  <MapPin :size="16" class="text-gray-500" />
                  {{ order.destination }}
                </div>
              </td>
              <td class="p-6 text-sm text-gray-300 font-medium">{{ order.courier }}</td>
              <td class="p-6">
                <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border" :class="getStatusColor(order.status)">
                  <component :is="getStatusIcon(order.status)" :size="14" class="shrink-0" />
                  {{ order.status }}
                </span>
              </td>
              <td class="p-6 text-gray-300 text-sm">
                <div class="flex flex-col">
                  <span>{{ order.date }}</span>
                  <span class="text-xs text-gray-500">{{ order.time }}</span>
                </div>
              </td>
              <td class="p-6">
                <button
                  @click.stop="openDetailsDrawer(order)"
                  class="text-primary hover:text-white font-semibold text-sm transition-colors border border-primary/30 px-4 py-2 rounded-full hover:bg-primary/10"
                >
                  Detalhes
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
      <Transition enterActiveClass="transition-opacity duration-300" leaveActiveClass="transition-opacity duration-300">
        <div v-if="isDetailsOpen" class="fixed inset-0 bg-black/50 z-40" @click="closeDetailsDrawer" />
      </Transition>
      <Transition enterActiveClass="transition-transform duration-300" leaveActiveClass="transition-transform duration-300" enterFromClass="translate-x-full" leaveToClass="translate-x-full">
        <div v-if="isDetailsOpen && selectedOrder" class="fixed right-0 top-0 h-full w-96 bg-[#141b27] border-l border-[#1f2937] z-50 flex flex-col shadow-2xl overflow-y-auto">
          <div class="sticky top-0 flex items-center justify-between p-6 border-b border-[#1f2937] bg-[#141b27]">
            <h3 class="text-xl font-bold text-white">Detalhes do Pedido</h3>
            <button @click="closeDetailsDrawer" class="text-gray-400 hover:text-white transition-colors">
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div class="flex-1 p-6 space-y-6">
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase mb-2">ID do Pedido</p>
              <p class="text-white font-mono">{{ selectedOrder.id }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase mb-2">Cliente</p>
              <div class="flex items-center gap-3">
                <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-black font-semibold">
                  {{ selectedOrder.initials }}
                </div>
                <p class="text-white">{{ selectedOrder.client }}</p>
              </div>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase mb-2">Destino</p>
              <div class="flex items-start gap-2">
                <MapPin :size="16" class="text-gray-500 mt-1 shrink-0" />
                <p class="text-white">{{ selectedOrder.destination }}</p>
              </div>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase mb-2">Local de Entrega</p>
              <p class="text-white">{{ selectedOrder.localEntrega }}</p>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase mb-2">Estafeta Atribuído</p>
              <div class="flex items-center gap-2">
                <User :size="16" class="text-gray-500" />
                <p class="text-white">{{ selectedOrder.courier }}</p>
              </div>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase mb-2">Status</p>
              <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium border" :class="getStatusColor(selectedOrder.status)">
                <component :is="getStatusIcon(selectedOrder.status)" :size="14" />
                {{ selectedOrder.status }}
              </span>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase mb-2">Data e Hora</p>
              <div class="flex items-center gap-2">
                <Calendar :size="16" class="text-gray-500" />
                <p class="text-white">{{ selectedOrder.date }} às {{ selectedOrder.time }}</p>
              </div>
            </div>
            <div>
              <p class="text-xs font-semibold text-gray-400 uppercase mb-2">Prioridade</p>
              <p class="text-white">{{ selectedOrder.priority > 0 ? '🔴 Alta' : '🟢 Normal' }}</p>
            </div>
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
<script setup>
import { ref, computed, onMounted } from 'vue'
import { mockData } from '../mockData'
import { MapPin, CheckCircle2, XCircle, UserPlus, ChevronLeft, ChevronRight, X } from 'lucide-vue-next'

const filter = ref('pendentes')

const orders = ref([])
const availableCouriers = ref([])
const isAssignOpen = ref(false)
const orderToAssign = ref(null)
const selectedCourierId = ref('')
const isSubmitting = ref(false)

const loadOrders = async () => {
  try {
    const res = await fetch('http://localhost:1338/api/pedido-missions?populate=*')
    const json = await res.json()
    
    orders.value = json.data.map(item => ({
      id: item.documentId || item.id,
      client: item.Cliente || 'Sem Cliente',
      initials: item.Cliente ? item.Cliente.substring(0, 2).toUpperCase() : '??',
      email: 'n/a', // Não tem no Strapi
      destination: item.Destino || 'Não Definido',
      date: new Date(item.createdAt || Date.now()).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
      status: item.Estado || 'Pendente',
      priority: item.Prioridade || 0,
      courier: item.estafeta || null
    }))
  } catch (error) {
    console.error('Erro ao buscar pedidos do Strapi:', error)
    orders.value = mockData.orders // fallback caso o Strapi não esteja acessível
  }
}

const loadCouriers = async () => {
  try {
    const res = await fetch('http://localhost:1338/api/estafetas?filters[Disponivel][$eq]=true')
    const json = await res.json()
    availableCouriers.value = json.data
  } catch (error) {
    console.error(error)
  }
}

onMounted(() => {
  loadOrders()
  loadCouriers()
})

const updateOrderStatus = async (order, newStatus) => {
  try {
    const response = await fetch(`http://localhost:1338/api/pedido-missions/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { Estado: newStatus } })
    })
    if(response.ok) {
      await loadOrders()
    } else {
      if(response.status === 403) alert('Erro 403: Permissão negada! Ative a permissão "update" para Pedido(Mission) na Role Public do Strapi.')
      else alert('Falha ao atualizar o estado.')
    }
  } catch (error) {
    console.error(error)
  }
}

const openAssignModal = (order) => {
  if (order.status !== 'Aprovado') return
  orderToAssign.value = order
  selectedCourierId.value = ''
  isAssignOpen.value = true
}

const closeAssignDrawer = () => {
  isAssignOpen.value = false
  orderToAssign.value = null
  selectedCourierId.value = ''
}

const confirmAssign = async () => {
  if (!selectedCourierId.value) return
  isSubmitting.value = true
  try {
    const response = await fetch(`http://localhost:1338/api/pedido-missions/${orderToAssign.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { estafeta: selectedCourierId.value, Estado: 'Transito' } })
    })
    
    if (response.ok) {
      await loadOrders()
      closeAssignDrawer()
    } else {
      if(response.status === 403) alert('Erro 403: Permissão negada! Ative a permissão "update" para Pedido(Mission) no Strapi.')
      else alert('Falha ao atribuir estafeta.')
    }
  } catch(error) {
    console.error(error)
  } finally {
    isSubmitting.value = false
  }
}

const stats = computed(() => {
  return {
    total: orders.value.length,
    pending: orders.value.filter(o => o.status === 'Pendente').length,
    approvedToday: orders.value.filter(o => o.status === 'Aprovado').length
  }
})

const filteredOrders = computed(() => {
  if (filter.value === 'todos') return orders.value
  if (filter.value === 'pendentes') return orders.value.filter(o => o.status === 'Pendente')
  if (filter.value === 'aprovados') return orders.value.filter(o => o.status === 'Aprovado')
  return orders.value
})

const setFilter = (val) => {
  filter.value = val
}
</script>

<template>
  <div class="p-8 pb-20 max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-700">
    <!-- Header -->
    <header class="space-y-2">
      <h1 class="text-3xl font-bold text-white tracking-tight">Pedidos</h1>
      <p class="text-gray-400 font-medium tracking-wide">Veja, aprove e atribua estafetas aos pedidos dos clientes.</p>
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-surface rounded-3xl p-6 border border-[#233246] relative overflow-hidden group">
        <div class="text-gray-300 font-bold mb-3 uppercase text-xs tracking-widest relative z-10 border-b border-muted/50 pb-3">TOTAL DE PEDIDOS</div>
        <div class="text-5xl font-black text-white relative z-10 p-2">{{ stats.total }}</div>
      </div>
      <div class="bg-surface rounded-3xl p-6 border border-[#233246] relative overflow-hidden group">
        <div class="text-gray-300 font-bold mb-3 uppercase text-xs tracking-widest relative z-10 border-b border-muted/50 pb-3">PEDIDOS PENDENTES</div>
        <div class="text-5xl font-black text-white relative z-10 p-2">{{ stats.pending }}</div>
      </div>
      <div class="bg-surface rounded-3xl p-6 border border-[#233246] relative overflow-hidden group">
        <div class="text-gray-300 font-bold mb-3 uppercase text-xs tracking-widest relative z-10 border-b border-muted/50 pb-3">APROVADOS HOJE</div>
        <div class="text-5xl font-black text-white relative z-10 p-2">{{ stats.approvedToday }}</div>
      </div>
    </div>

    <!-- Filters & Table -->
    <div class="space-y-6">
      <!-- Tabs -->
      <div class="flex gap-8 border-b border-[#233246] px-2 text-sm font-semibold">
        <button 
          @click="setFilter('todos')"
          class="pb-4 border-b-[3px] transition-colors duration-300"
          :class="filter === 'todos' ? 'border-primary text-primary shadow-[0_4px_10px_-4px_rgba(0,242,255,0.4)]' : 'border-transparent text-gray-500 hover:text-gray-300'"
        >Todos</button>
        <button 
          @click="setFilter('pendentes')"
          class="pb-4 border-b-[3px] transition-colors duration-300"
          :class="filter === 'pendentes' ? 'border-primary text-primary shadow-[0_4px_10px_-4px_rgba(0,242,255,0.4)]' : 'border-transparent text-gray-500 hover:text-gray-300'"
        >Pendentes ({{ stats.pending }})</button>
        <button 
          @click="setFilter('aprovados')"
          class="pb-4 border-b-[3px] transition-colors duration-300"
          :class="filter === 'aprovados' ? 'border-primary text-primary shadow-[0_4px_10px_-4px_rgba(0,242,255,0.4)]' : 'border-transparent text-gray-500 hover:text-gray-300'"
        >Aprovados</button>
      </div>

      <!-- Table Section -->
      <div class="bg-surface border border-[#233246] rounded-[2rem] overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr class="border-b border-[#233246] text-gray-400 text-xs uppercase tracking-widest font-semibold bg-[#111926]">
                <th class="p-6 font-semibold w-1/3">Cliente</th>
                <th class="p-6 font-semibold w-1/4">Destino</th>
                <th class="p-6 font-semibold w-1/6">Data</th>
                <th class="p-6 font-semibold">Estado</th>
                <th class="p-6 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#233246]">
              <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-[#1a2636] transition-colors group">
                <td class="p-6">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full bg-[#1e2e42] flex items-center justify-center text-sm font-bold text-primary shrink-0 shadow-inner">
                      {{ order.initials }}
                    </div>
                    <div>
                      <div class="text-white font-semibold flex items-center gap-2">
                        {{ order.client }}
                      </div>
                      <div class="text-xs text-gray-500 mt-0.5">{{ order.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="p-6 text-sm">
                  <div class="flex items-center gap-2 text-gray-300">
                    <MapPin :size="16" class="text-gray-500" />
                    {{ order.destination }}
                  </div>
                </td>
                <td class="p-6 text-gray-300 text-sm">
                  <div class="flex flex-col">
                    <span>{{ order.date.split(',')[0] }}</span>
                    <span class="text-xs text-gray-500">2026</span>
                  </div>
                </td>
                <td class="p-6">
                  <span 
                    class="px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border"
                    :class="order.status === 'Pendente' ? 'bg-warning/5 text-warning border-warning/10' : 'bg-success/5 text-success border-success/10'"
                  >
                    {{ order.status }}
                  </span>
                </td>
                <td class="p-6">
                  <div class="flex items-center gap-3">
                    <template v-if="order.status === 'Pendente'">
                      <button @click="updateOrderStatus(order, 'Aprovado')" class="w-8 h-8 flex items-center justify-center text-success border border-success/30 rounded-full hover:bg-success hover:text-black transition-all shadow-[0_0_5px_rgba(16,185,129,0.2)] hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]" title="Aprovar">
                        <CheckCircle2 :size="16" strokeWidth="3" />
                      </button>
                      <button @click="updateOrderStatus(order, 'Rejeitado')" class="w-8 h-8 flex items-center justify-center text-danger border border-danger/30 rounded-full hover:bg-danger hover:text-black transition-all shadow-[0_0_5px_rgba(239,68,68,0.2)] hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]" title="Rejeitar">
                        <XCircle :size="16" strokeWidth="3" />
                      </button>
                    </template>
                    <button 
                      v-if="!order.courier"
                      @click="order.status === 'Aprovado' ? openAssignModal(order) : null"
                      class="flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all ml-2"
                      :class="order.status === 'Aprovado' ? 'bg-primary text-black shadow-[0_0_15px_rgba(0,242,255,0.4)] hover:bg-[#33f5ff] hover:-translate-y-0.5 cursor-pointer' : 'bg-transparent border border-muted text-gray-300 hover:bg-muted hover:text-white cursor-not-allowed opacity-50'"
                    >
                      Atribuir estafeta
                      <UserPlus :size="14" strokeWidth="2.5" />
                    </button>
                    <div v-else class="ml-2 px-5 py-2.5 rounded-full text-xs font-bold bg-[#1a2636] text-primary border border-primary/30 flex items-center gap-2" :title="order.courier.Nome">
                       Atribuído
                       <CheckCircle2 :size="14" strokeWidth="3" />
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination footer  -->
        <div class="border-t border-[#233246] p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#111926]">
          <span class="text-sm text-gray-400">
            <strong class="text-white">1-{{ filteredOrders.length }}</strong> de {{ filteredOrders.length }} resultados
          </span>
          <div class="flex gap-2">
            <button class="w-9 h-9 flex items-center justify-center rounded-full border border-[#233246] text-gray-400 hover:text-white hover:border-gray-500 hover:bg-[#1a2636] transition-colors bg-[#080d14]">
              <ChevronLeft :size="16" />
            </button>
            <button class="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-black font-bold shadow-[0_0_10px_rgba(0,242,255,0.4)]">1</button>
            <button class="w-9 h-9 flex items-center justify-center rounded-full border border-[#233246] text-gray-400 hover:text-white hover:border-gray-500 hover:bg-[#1a2636] transition-colors bg-[#0c121e]">2</button>
            <button class="w-9 h-9 flex items-center justify-center rounded-full border border-[#233246] text-gray-400 hover:text-white hover:border-gray-500 hover:bg-[#1a2636] transition-colors bg-[#0c121e]">3</button>
            <span class="px-1 text-gray-500 flex items-center justify-center">...</span>
            <button class="w-9 h-9 flex items-center justify-center rounded-full border border-[#233246] text-gray-400 hover:text-white hover:border-gray-500 hover:bg-[#1a2636] transition-colors bg-[#0c121e]">12</button>
            <button class="w-9 h-9 flex items-center justify-center rounded-full border border-[#233246] text-gray-400 hover:text-white hover:border-gray-500 hover:bg-[#1a2636] transition-colors bg-[#080d14]">
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>
    <!-- Assign Courier Drawer -->
    <div 
      v-if="isAssignOpen" 
      class="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity"
      @click="closeAssignDrawer"
    ></div>

    <div 
      class="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#0c121e] border-l border-[#233246] z-50 transform transition-transform duration-500 ease-in-out shadow-2xl flex flex-col"
      :class="isAssignOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="px-8 py-10 border-b border-[#233246] flex justify-between items-start bg-surface/50">
        <div>
          <h2 class="text-2xl font-bold text-white tracking-tight">Atribuir Estafeta</h2>
          <p class="text-sm text-gray-400 mt-2 tracking-wide block">Escolha o estafeta para entregar o pedido</p>
        </div>
        <button @click="closeAssignDrawer" class="p-2 text-gray-400 hover:text-white rounded-full hover:bg-[#233246] transition-colors -mt-2 -mr-2">
          <X :size="24" />
        </button>
      </div>

      <div class="p-8 flex-1 overflow-y-auto space-y-7">
        <div class="space-y-3 relative">
          <label class="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Estafeta</label>
          <div class="relative">
            <UserPlus :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
            <select v-model="selectedCourierId" class="w-full bg-[#111926] border border-[#233246] rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,242,255,0.15)] transition-all appearance-none cursor-pointer">
              <option value="" disabled>Selecione um estafeta disponível</option>
              <option v-for="c in availableCouriers" :key="c.documentId || c.id" :value="c.documentId || c.id">
                {{ c.Nome }} ({{ c.AreaDeAtuacao }})
              </option>
            </select>
          </div>
          <p v-if="availableCouriers.length === 0" class="text-warning text-sm mt-4 font-medium px-1">
            Não existem estafetas disponíveis neste momento.
          </p>
        </div>
      </div>

      <div class="p-8 border-t border-[#233246] space-y-4 bg-surface/50">
        <button 
          @click="confirmAssign"
          :disabled="isSubmitting || !selectedCourierId"
          class="w-full bg-primary text-black font-bold py-4 rounded-full shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:bg-[#33f5ff] transition-all hover:-translate-y-0.5 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isSubmitting">A Guardar...</span>
          <span v-else>Confirmar Atribuição</span>
        </button>
        <button class="w-full bg-transparent text-white font-medium py-4 rounded-full border border-muted hover:bg-muted/50 hover:border-gray-400 transition-colors tracking-wide" @click="closeAssignDrawer">
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

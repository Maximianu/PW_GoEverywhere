<script setup>
import { ref, computed, onMounted } from 'vue'
import { mockData } from '../mockData'
import { MapPin, CheckCircle2, XCircle, UserPlus, ChevronLeft, ChevronRight, X, Clock, List, Layers, ChevronDown } from 'lucide-vue-next'

const filter = ref('todos')
const viewMode = ref('missions')
const expandedMissions = ref([])

const orders = ref([])
const availableCouriers = ref([])
const isAssignOpen = ref(false)
const orderToAssign = ref(null)
const selectedCourierId = ref('')
const isSubmitting = ref(false)

const isPriorityOpen = ref(false)
const orderToSetPriority = ref(null)
const selectedPriority = ref('')

const loadOrders = async () => {
  try {
    const res = await fetch('http://127.0.0.1:1338/api/pedido-missions?populate[0]=bilhete.cliente&populate[1]=bilhete.cliente2&populate[2]=estafeta&populate[3]=bilhete.missao&populate[4]=bilhete.missao2')
    const json = await res.json()
    
    orders.value = json.data.map(item => {
      const clienteObj = item.cliente || (item.bilhete && item.bilhete.cliente) || (item.bilhete && item.bilhete.cliente2) || null;
      const missaoObj = (item.bilhete && item.bilhete.missao) || (item.bilhete && item.bilhete.missao2) || null;
      return {
      id: item.documentId || item.id,
      client: clienteObj ? `${clienteObj.PrimeiroNome || ''} ${clienteObj.UltimoNome || ''}`.trim() : (item.Cliente || 'Sem Cliente'),
      initials: clienteObj ? ((clienteObj.PrimeiroNome ? clienteObj.PrimeiroNome[0] : '') + (clienteObj.UltimoNome ? clienteObj.UltimoNome[0] : '')).toUpperCase() || '??' : (item.Cliente ? item.Cliente.substring(0, 2).toUpperCase() : '??'),
      email: clienteObj ? (clienteObj.Email || 'n/a') : 'n/a',
      destination: item.Destino || 'Não Definido',
      date: new Date(item.createdAt || Date.now()).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' }),
      createdAt: item.createdAt || Date.now(),
      updatedAt: item.updatedAt || Date.now(),
      localEntrega: item.LocalEntrega || 'Não Definido',
      status: item.Estado || 'Pendente',
      priority: item.Prioridade_Entrega || 'Não Definida',
      courier: item.estafeta || null,
      mission: missaoObj ? {
        id: missaoObj.documentId || missaoObj.id,
        nome: missaoObj.Nome || 'Sem Nome',
        planeta: missaoObj.Planeta || 'Desconhecido',
        data: missaoObj.Data ? new Date(missaoObj.Data).toLocaleDateString('pt-PT') : 'N/A',
        lota: missaoObj.Lota || 0
      } : null
    }
    })
  } catch (error) {
    console.error('Erro ao buscar pedidos do Strapi:', error)
    orders.value = mockData.orders
  }
}

const loadCouriers = async () => {
  try {
    const res = await fetch('http://127.0.0.1:1338/api/estafetas?filters[Disponivel][$eq]=true')
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
    const response = await fetch(`http://127.0.0.1:1338/api/pedido-missions/${order.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { Estado: newStatus } })
    })
    if (response.ok) {
      await loadOrders()
    } else {
      if (response.status === 403) alert('Erro 403: Permissão negada! Ative a permissão "update" para Pedido(Mission) na Role Public do Strapi.')
      else alert('Falha ao atualizar o estado.')
    }
  } catch (error) {
    console.error(error)
  }
}

const openPriorityModal = (order) => {
  orderToSetPriority.value = order
  selectedPriority.value = ''
  isPriorityOpen.value = true
}

const closePriorityDrawer = () => {
  isPriorityOpen.value = false
  orderToSetPriority.value = null
  selectedPriority.value = ''
}

const confirmPriorityAndApprove = async () => {
  if (!selectedPriority.value) return
  isSubmitting.value = true
  try {
    const response = await fetch(`http://127.0.0.1:1338/api/pedido-missions/${orderToSetPriority.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { Estado: 'Aprovado', Prioridade_Entrega: selectedPriority.value } })
    })
    
    if (response.ok) {
      await loadOrders()
      closePriorityDrawer()
    } else {
      if (response.status === 403) alert('Erro 403: Permissão negada! Ative a permissão "update" para Pedido(Mission) no Strapi.')
      else alert('Falha ao atualizar o estado e prioridade.')
    }
  } catch(error) {
    console.error(error)
  } finally {
    isSubmitting.value = false
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
    const response = await fetch(`http://127.0.0.1:1338/api/pedido-missions/${orderToAssign.value.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: { estafeta: selectedCourierId.value, Estado: 'Transito' } })
    })
    
    if (response.ok) {
      await loadOrders()
      closeAssignDrawer()
    } else {
      if (response.status === 403) alert('Erro 403: Permissão negada! Ative a permissão "update" para Pedido(Mission) no Strapi.')
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
    total: orders.value.filter(o => o.status === 'Pendente' || o.status === 'Aprovado').length,
    pending: orders.value.filter(o => o.status === 'Pendente').length
  }
})

const filteredOrders = computed(() => {
  const activeOrders = orders.value.filter(o => o.status === 'Pendente' || o.status === 'Aprovado')
  if (filter.value === 'todos') return activeOrders
  if (filter.value === 'pendentes') return activeOrders.filter(o => o.status === 'Pendente')
  if (filter.value === 'aprovados') return activeOrders.filter(o => o.status === 'Aprovado')
  return activeOrders
})

const setFilter = (val) => {
  filter.value = val
}

const toggleMission = (missionId) => {
  const index = expandedMissions.value.indexOf(missionId)
  if (index > -1) {
    expandedMissions.value.splice(index, 1)
  } else {
    expandedMissions.value.push(missionId)
  }
}

const groupedByMission = computed(() => {
  const groups = {}
  
  // Create a default group for unassigned orders
  groups['unassigned'] = {
    mission: null,
    orders: []
  }
  
  filteredOrders.value.forEach(order => {
    if (order.mission && order.mission.id) {
      const mId = order.mission.id
      if (!groups[mId]) {
        groups[mId] = {
          mission: order.mission,
          orders: []
        }
      }
      groups[mId].orders.push(order)
    } else {
      groups['unassigned'].orders.push(order)
    }
  })

  // Remove unassigned group if it's empty
  if (groups['unassigned'].orders.length === 0) {
    delete groups['unassigned']
  }

  return groups
})
</script>

<template>
  <div class="p-8 pb-20 max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-700 relative">

    <!-- Header — igual ao GoEverywhere -->
    <header class="flex flex-col items-start relative z-10">
      <h1 class="text-4xl font-black text-white mb-2 tracking-tighter italic opacity-90 uppercase">
        Pedidos
      </h1>
      <div class="flex items-center gap-2 opacity-60">
        <div class="h-[1px] w-5 bg-blue-500"></div>
        <p class="text-white text-[9px] font-mono uppercase tracking-[0.2em] whitespace-nowrap">
          Veja, aprove e atribua estafetas aos pedidos
        </p>
        <div class="h-[1px] w-5 bg-blue-500"></div>
      </div>
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
      <div class="bg-surface rounded-3xl p-6 border border-[#233246] relative overflow-hidden group">
        <div class="text-gray-300 font-bold mb-3 uppercase text-xs tracking-widest relative z-10 border-b border-muted/50 pb-3">A AGUARDAR AÇÃO</div>
        <div class="text-5xl font-black text-white relative z-10 p-2">{{ stats.total }}</div>
      </div>
      <div class="bg-surface rounded-3xl p-6 border border-[#233246] relative overflow-hidden group">
        <div class="text-gray-300 font-bold mb-3 uppercase text-xs tracking-widest relative z-10 border-b border-muted/50 pb-3">POR APROVAR (PENDENTES)</div>
        <div class="text-5xl font-black text-white relative z-10 p-2">{{ stats.pending }}</div>
      </div>
    </div>

    <!-- Filters & Table -->
    <div class="space-y-6">
      <!-- Tabs and View Mode Toggle -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <!-- Tabs -->
        <div class="flex gap-8 border-b border-[#233246] px-2 text-sm font-semibold">
          <button 
            @click="setFilter('todos')"
            class="pb-4 border-b-[3px] transition-colors duration-300"
            :class="filter === 'todos' ? 'border-primary text-primary shadow-[0_4px_10px_-4px_rgba(0,242,255,0.4)]' : 'border-transparent text-gray-500 hover:text-gray-300'"
          >A Aguardar Ação ({{ stats.total }})</button>
          <button 
            @click="setFilter('pendentes')"
            class="pb-4 border-b-[3px] transition-colors duration-300"
            :class="filter === 'pendentes' ? 'border-primary text-primary shadow-[0_4px_10px_-4px_rgba(0,242,255,0.4)]' : 'border-transparent text-gray-500 hover:text-gray-300'"
          >Por Aprovar ({{ stats.pending }})</button>
          <button 
            @click="setFilter('aprovados')"
            class="pb-4 border-b-[3px] transition-colors duration-300"
            :class="filter === 'aprovados' ? 'border-primary text-primary shadow-[0_4px_10px_-4px_rgba(0,242,255,0.4)]' : 'border-transparent text-gray-500 hover:text-gray-300'"
          >Por Atribuir ({{ stats.total - stats.pending }})</button>
        </div>
        
        <!-- View Mode Toggle -->
        <div class="flex bg-[#111926] p-1.5 rounded-xl border border-[#233246] shrink-0">
          <button 
            @click="viewMode = 'list'"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            :class="viewMode === 'list' ? 'bg-primary text-black shadow-[0_0_15px_rgba(0,242,255,0.2)]' : 'text-gray-400 hover:text-gray-200'"
          >
            <List :size="16" /> Lista
          </button>
          <button 
            @click="viewMode = 'missions'"
            class="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all"
            :class="viewMode === 'missions' ? 'bg-primary text-black shadow-[0_0_15px_rgba(0,242,255,0.2)]' : 'text-gray-400 hover:text-gray-200'"
          >
            <Layers :size="16" /> Missões
          </button>
        </div>
      </div>

      <!-- Table Section (List View) -->
      <div v-if="viewMode === 'list'" class="bg-surface border border-[#233246] rounded-[2rem] overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[900px]">
            <thead>
              <tr class="border-b border-[#233246] text-gray-400 text-xs uppercase tracking-widest font-semibold bg-[#111926]">
                <th class="p-6 font-semibold w-24 text-center">ID</th>
                <th class="p-6 font-semibold w-1/3">Cliente</th>
                <th class="p-6 font-semibold w-1/4">Destino</th>
                <th class="p-6 font-semibold w-1/6">Data</th>
                <th class="p-6 font-semibold">Estado</th>
                <th class="p-6 font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#233246]">
              <tr v-for="order in filteredOrders" :key="order.id" class="hover:bg-[#1a2636] transition-colors group">
                <td class="p-6 text-center">
                  <span class="font-mono text-xs font-bold text-gray-400 bg-[#111926] border border-[#233246] px-2 py-1 rounded">
                    {{ order.id.substring(0, 8) }}
                  </span>
                </td>
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
                  <div class="flex items-center gap-2">
                    <span class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border" :class="order.status === 'Pendente' ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'">
                      <Clock v-if="order.status === 'Pendente'" :size="14" class="shrink-0" />
                      <CheckCircle2 v-else :size="14" class="shrink-0" />
                      {{ order.status }}
                    </span>
                  </div>
                </td>
                <td class="p-6">
                  <div class="flex items-center gap-3">
                    <template v-if="order.status === 'Pendente'">
                      <button @click.stop="openPriorityModal(order)" class="w-8 h-8 flex items-center justify-center text-success border border-success/30 rounded-full hover:bg-success hover:text-black transition-all shadow-[0_0_5px_rgba(16,185,129,0.2)] hover:shadow-[0_0_15px_rgba(16,185,129,0.5)]" title="Aprovar">
                        <CheckCircle2 :size="16" strokeWidth="3" />
                      </button>
                      <button @click.stop="updateOrderStatus(order, 'Rejeitado')" class="w-8 h-8 flex items-center justify-center text-danger border border-danger/30 rounded-full hover:bg-danger hover:text-black transition-all shadow-[0_0_5px_rgba(239,68,68,0.2)] hover:shadow-[0_0_15px_rgba(239,68,68,0.5)]" title="Rejeitar">
                        <XCircle :size="16" strokeWidth="3" />
                      </button>
                    </template>
                    <button 
                      v-if="!order.courier"
                      @click.stop="order.status === 'Aprovado' ? openAssignModal(order) : null"
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
      </div>

      <!-- Missions View -->
      <div v-else class="space-y-4">
        <div v-if="Object.keys(groupedByMission).length > 0" class="space-y-4">
          <div v-for="(group, mId) in groupedByMission" :key="mId" class="bg-surface border border-[#233246] rounded-2xl overflow-hidden shadow-lg transition-all duration-300" :class="{'ring-1 ring-primary/50': expandedMissions.includes(mId)}">
            <!-- Accordion Header -->
            <div 
              @click="toggleMission(mId)"
              class="p-6 flex items-center justify-between cursor-pointer hover:bg-[#1a2636] transition-colors"
            >
              <div class="flex items-center gap-6">
                <div class="w-12 h-12 rounded-full flex items-center justify-center shrink-0 shadow-inner"
                     :class="group.mission ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30 text-indigo-400' : 'bg-gray-800 border border-gray-700 text-gray-400'">
                   <Layers v-if="group.mission" :size="24" />
                   <List v-else :size="24" />
                </div>
                <div>
                  <h3 class="text-xl font-bold text-white">
                    {{ group.mission ? group.mission.nome : 'Sem Missão Atribuída' }}
                  </h3>
                  <div v-if="group.mission" class="flex items-center gap-3 text-sm text-gray-400 mt-1">
                    <span class="inline-flex items-center gap-1"><MapPin :size="14"/> {{ group.mission.planeta }}</span>
                    <span>&bull;</span>
                    <span class="text-gray-300 font-medium">Lotação: {{ group.orders.length }} / {{ group.mission.lota }}</span>
                  </div>
                  <div v-else class="text-sm text-gray-400 mt-1">Pedidos sem missão específica</div>
                </div>
              </div>
              
              <div class="flex items-center gap-6">
                <div class="flex -space-x-2">
                  <div class="text-xs font-bold bg-primary/10 text-primary border border-primary/20 px-3 py-1 rounded-full">
                    {{ group.orders.length }} Pedido{{ group.orders.length !== 1 ? 's' : '' }}
                  </div>
                </div>
                <div class="text-gray-400 transition-transform duration-300" :class="{'rotate-180 text-white': expandedMissions.includes(mId)}">
                  <ChevronDown :size="24" />
                </div>
              </div>
            </div>
            
            <!-- Accordion Content (Table) -->
            <div v-show="expandedMissions.includes(mId)" class="border-t border-[#233246] bg-[#111926]">
               <div class="overflow-x-auto">
                <table class="w-full text-left border-collapse min-w-[900px]">
                  <thead>
                    <tr class="border-b border-[#233246] text-gray-400 text-xs uppercase tracking-widest font-semibold bg-[#0c1219]">
                      <th class="p-5 pl-6 font-semibold">ID</th>
                      <th class="p-5 font-semibold">Cliente</th>
                      <th class="p-5 font-semibold">Destino Final</th>
                      <th class="p-5 font-semibold">Status</th>
                      <th class="p-5 pr-6 font-semibold">Ações</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[#233246]">
                    <tr v-for="order in group.orders" :key="order.id" class="hover:bg-[#1a2636] transition-colors group">
                      <td class="p-5 pl-6">
                        <span class="font-mono text-xs font-bold text-gray-400 bg-[#111926] border border-[#233246] px-2 py-1 rounded">
                          {{ order.id.substring(0, 8) }}
                        </span>
                      </td>
                      <td class="p-5">
                        <div class="flex items-center gap-3">
                          <div class="w-8 h-8 rounded-full bg-[#1e2e42] flex items-center justify-center text-xs font-bold text-primary shrink-0 shadow-inner">
                            {{ order.initials }}
                          </div>
                          <span class="text-gray-200 font-semibold text-sm">{{ order.client }}</span>
                        </div>
                      </td>
                      <td class="p-5 text-sm">
                        <div class="flex items-center gap-2 text-gray-400">
                          <MapPin :size="14" class="text-gray-500" />
                          {{ order.destination }}
                        </div>
                      </td>
                      <td class="p-5">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider border" :class="order.status === 'Pendente' ? 'bg-gray-500/20 text-gray-300 border-gray-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'">
                          <Clock v-if="order.status === 'Pendente'" :size="12" class="shrink-0" />
                          <CheckCircle2 v-else :size="12" class="shrink-0" />
                          {{ order.status }}
                        </span>
                      </td>
                      <td class="p-5 pr-6">
                        <div class="flex items-center gap-3">
                          <template v-if="order.status === 'Pendente'">
                            <button @click.stop="openPriorityModal(order)" class="w-6 h-6 flex items-center justify-center text-success border border-success/30 rounded-full hover:bg-success hover:text-black transition-all text-xs" title="Aprovar">
                              <CheckCircle2 :size="14" strokeWidth="3" />
                            </button>
                            <button @click.stop="updateOrderStatus(order, 'Rejeitado')" class="w-6 h-6 flex items-center justify-center text-danger border border-danger/30 rounded-full hover:bg-danger hover:text-black transition-all text-xs" title="Rejeitar">
                              <XCircle :size="14" strokeWidth="3" />
                            </button>
                          </template>
                          <button 
                            v-if="!order.courier"
                            @click.stop="order.status === 'Aprovado' ? openAssignModal(order) : null"
                            class="flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all"
                            :class="order.status === 'Aprovado' ? 'bg-primary text-black shadow-[0_0_10px_rgba(0,242,255,0.3)] hover:bg-[#33f5ff]' : 'bg-transparent border border-muted text-gray-300 cursor-not-allowed opacity-50'"
                          >
                            Atribuir
                            <UserPlus :size="12" strokeWidth="2.5" />
                          </button>
                          <div v-else class="px-3 py-1 rounded-full text-xs font-bold bg-[#1a2636] text-primary border border-primary/30 flex items-center gap-1">
                             Atribuído
                             <CheckCircle2 :size="12" strokeWidth="3" />
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
               </div>
            </div>
          </div>
        </div>
        <div v-else class="flex items-center justify-center py-12 bg-surface border border-[#233246] rounded-[2rem] shadow-2xl">
          <div class="text-center">
            <Layers class="mx-auto mb-4 text-gray-600" :size="48" />
            <p class="text-gray-400 font-medium">Nenhum pedido encontrado</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Priority Drawer -->
    <Teleport to="body">
      <Transition
        enterActiveClass="transition-opacity duration-300"
        leaveActiveClass="transition-opacity duration-300"
      >
        <div 
          v-if="isPriorityOpen" 
          class="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          @click="closePriorityDrawer"
        ></div>
      </Transition>

      <Transition
        enterActiveClass="transition-transform duration-300"
        leaveActiveClass="transition-transform duration-300"
        enterFromClass="translate-x-full"
        leaveToClass="translate-x-full"
      >
        <div 
          v-if="isPriorityOpen"
          class="fixed top-0 right-0 h-full w-96 bg-[#141b27] border-l border-[#1f2937] z-50 flex flex-col shadow-2xl"
        >
          <div class="p-6 border-b border-[#1f2937] flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-white tracking-tight">Definir Prioridade</h3>
              <p class="text-xs text-gray-400 mt-1 tracking-wide block">Escolha a prioridade para aprovar o pedido</p>
            </div>
            <button @click="closePriorityDrawer" class="p-2 text-gray-400 hover:text-white rounded-full hover:bg-[#1f2937] transition-colors">
              <X :size="24" />
            </button>
          </div>

          <div class="p-6 flex-1 overflow-y-auto space-y-6">
            <div class="space-y-2 relative">
              <label class="text-xs font-bold text-primary uppercase tracking-widest pl-1">Prioridade</label>
              <div class="relative">
                <Layers :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                <select v-model="selectedPriority" class="w-full bg-[#0c1219] border border-[#2a3b4f] rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,242,255,0.15)] transition-all appearance-none cursor-pointer">
                  <option value="" disabled>Selecione a prioridade</option>
                  <option value="Alta">Alta</option>
                  <option value="Média">Média</option>
                  <option value="Baixa">Baixa</option>
                </select>
              </div>
            </div>
          </div>

          <div class="p-6 border-t border-[#1f2937] space-y-3 bg-[#141b27]">
            <button 
              @click="confirmPriorityAndApprove"
              :disabled="isSubmitting || !selectedPriority"
              class="w-full bg-success text-black font-bold py-3.5 rounded-lg shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:bg-[#34d399] transition-all hover:-translate-y-0.5 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmitting">A Guardar...</span>
              <span v-else>Aprovar Pedido</span>
            </button>
            <button class="w-full bg-[#0c1219] text-white font-medium py-3.5 rounded-lg border border-[#2a3b4f] hover:bg-[#1a2332] transition-colors tracking-wide" @click="closePriorityDrawer">
              Cancelar
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>

    <!-- Assign Courier Drawer -->
    <Teleport to="body">
      <Transition
        enterActiveClass="transition-opacity duration-300"
        leaveActiveClass="transition-opacity duration-300"
      >
        <div 
          v-if="isAssignOpen" 
          class="fixed inset-0 bg-black/70 backdrop-blur-sm z-40"
          @click="closeAssignDrawer"
        ></div>
      </Transition>

      <Transition
        enterActiveClass="transition-transform duration-300"
        leaveActiveClass="transition-transform duration-300"
        enterFromClass="translate-x-full"
        leaveToClass="translate-x-full"
      >
        <div 
          v-if="isAssignOpen"
          class="fixed top-0 right-0 h-full w-96 bg-[#141b27] border-l border-[#1f2937] z-50 flex flex-col shadow-2xl"
        >
          <div class="p-6 border-b border-[#1f2937] flex items-center justify-between">
            <div>
              <h3 class="text-xl font-bold text-white tracking-tight">Atribuir Estafeta</h3>
              <p class="text-xs text-gray-400 mt-1 tracking-wide block">Escolha o estafeta para entregar o pedido</p>
            </div>
            <button @click="closeAssignDrawer" class="p-2 text-gray-400 hover:text-white rounded-full hover:bg-[#1f2937] transition-colors">
              <X :size="24" />
            </button>
          </div>

          <div class="p-6 flex-1 overflow-y-auto space-y-6">
            <div class="space-y-2 relative">
              <label class="text-xs font-bold text-primary uppercase tracking-widest pl-1">Estafeta</label>
              <div class="relative">
                <UserPlus :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                <select v-model="selectedCourierId" class="w-full bg-[#0c1219] border border-[#2a3b4f] rounded-xl py-3.5 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,242,255,0.15)] transition-all appearance-none cursor-pointer">
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

          <div class="p-6 border-t border-[#1f2937] space-y-3 bg-[#141b27]">
            <button 
              @click="confirmAssign"
              :disabled="isSubmitting || !selectedCourierId"
              class="w-full bg-primary text-black font-bold py-3.5 rounded-lg shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:bg-[#33f5ff] transition-all hover:-translate-y-0.5 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isSubmitting">A Guardar...</span>
              <span v-else>Confirmar Atribuição</span>
            </button>
            <button class="w-full bg-[#0c1219] text-white font-medium py-3.5 rounded-lg border border-[#2a3b4f] hover:bg-[#1a2332] transition-colors tracking-wide" @click="closeAssignDrawer">
              Cancelar
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
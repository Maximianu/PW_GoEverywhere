<script setup>
import { ref, computed, onMounted } from 'vue'
import { mockData } from '../mockData'
import { Search, ChevronLeft, ChevronRight, Plus, X, User, Phone, Calendar, CheckCircle, MapPin } from 'lucide-vue-next'

const filter = ref('disponiveis')
const searchQuery = ref('')
const isAddCourierOpen = ref(false)
const editingCourierId = ref(null)

const couriers = ref([])

const newCourier = ref({
  Nome: '',
  Telemovel: '',
  Idade: '',
  AreaDeAtuacao: 'Braga',
  Disponivel: true
})
const isSubmitting = ref(false)

const loadCouriers = async () => {
  try {
    const res = await fetch('http://localhost:1338/api/estafetas')
    const json = await res.json()
    couriers.value = json.data.map(item => ({
      id: `C-${item.documentId ? item.documentId.substring(0,4) : item.id}`,
      dbId: item.documentId || item.id,
      dbNome: item.Nome || '',
      dbTelemovel: item.Telemovel || '',
      dbIdade: item.Idade || '',
      dbAreaDeAtuacao: item.AreaDeAtuacao || 'Braga',
      dbDisponivel: item.Disponivel !== undefined ? item.Disponivel : true,
      initials: item.Nome ? item.Nome.substring(0, 2).toUpperCase() : '??',
      name: item.Nome || 'Estafeta Sem Nome',
      performance: Math.floor(Math.random() * 20) + 80, // Aleatório entre 80 e 100 já que não há no DB
      status: item.Disponivel ? 'Disponível' : 'Ativo'
    }))
  } catch (error) {
    console.error('Erro ao buscar estafetas do Strapi:', error)
    couriers.value = mockData.couriers // fallback se o Strapi falhar
  }
}

onMounted(loadCouriers)

const submitCourier = async () => {
  if (!newCourier.value.Nome) {
    alert('O nome do estafeta é obrigatório.')
    return
  }
  isSubmitting.value = true
  try {
    const payload = {
      data: {
        Nome: newCourier.value.Nome,
        Telemovel: newCourier.value.Telemovel ? parseInt(newCourier.value.Telemovel) : null,
        Idade: newCourier.value.Idade ? parseInt(newCourier.value.Idade) : null,
        AreaDeAtuacao: newCourier.value.AreaDeAtuacao,
        Disponivel: newCourier.value.Disponivel
      }
    }
    const isEdit = !!editingCourierId.value
    const url = isEdit 
      ? `http://localhost:1338/api/estafetas/${editingCourierId.value}`
      : 'http://localhost:1338/api/estafetas'
      
    const response = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })
    
    if (response.ok) {
      await loadCouriers()
      closeDrawer()
    } else {
      const errorData = await response.json()
      console.error(isEdit ? 'Falha ao atualizar estafeta' : 'Falha ao adicionar estafeta', errorData)
      if (response.status === 403) {
        alert(isEdit ? 'Erro 403: Permissão negada! Precisa de ativar a permissão "update" para Estafeta.' : 'Erro 403: Permissão negada! Precisa de ir ao painel do Strapi > Settings > Roles > Public e ativar a permissão "create" para Estafeta.')
      } else {
        alert(isEdit ? 'Falha ao atualizar estafeta.' : 'Falha ao adicionar estafeta. Verifique a consola para mais detalhes.')
      }
    }
  } catch(error) {
    console.error(error)
    alert('Erro ao comunicar com o servidor.')
  } finally {
    isSubmitting.value = false
  }
}

const stats = computed(() => {
  return {
    total: couriers.value.length,
    available: couriers.value.filter(c => c.status === 'Disponível').length,
    active: couriers.value.filter(c => c.status === 'Ativo').length
  }
})

const filteredCouriers = computed(() => {
  let list = couriers.value
  if (filter.value === 'ativos') list = couriers.value.filter(c => c.status === 'Ativo')
  else if (filter.value === 'disponiveis') list = couriers.value.filter(c => c.status === 'Disponível')
  
  if (searchQuery.value) {
    list = list.filter(c => c.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  }
  return list
})

const setFilter = (val) => {
  filter.value = val
}

const openAddDrawer = () => {
  editingCourierId.value = null
  newCourier.value = { Nome: '', Telemovel: '', Idade: '', AreaDeAtuacao: 'Braga', Disponivel: true }
  isAddCourierOpen.value = true
}

const openEditDrawer = (courier) => {
  editingCourierId.value = courier.dbId
  newCourier.value = {
    Nome: courier.dbNome,
    Telemovel: courier.dbTelemovel,
    Idade: courier.dbIdade,
    AreaDeAtuacao: courier.dbAreaDeAtuacao,
    Disponivel: courier.dbDisponivel
  }
  isAddCourierOpen.value = true
}

const closeDrawer = () => {
  isAddCourierOpen.value = false
  editingCourierId.value = null
  newCourier.value = { Nome: '', Telemovel: '', Idade: '', AreaDeAtuacao: 'Braga', Disponivel: true }
}

const deleteCourier = async (courier) => {
  if (!confirm(`Tem a certeza que deseja eliminar o estafeta ${courier.name}?`)) return
  
  try {
    const response = await fetch(`http://localhost:1338/api/estafetas/${courier.dbId}`, {
      method: 'DELETE'
    })
    
    if (response.ok) {
      await loadCouriers()
    } else {
      const errorData = await response.json()
      console.error('Falha ao eliminar estafeta', errorData)
      if (response.status === 403) {
        alert('Erro 403: Permissão negada! Precisa de ativar a permissão "delete" para Estafeta no painel do Strapi.')
      } else {
        alert('Falha ao eliminar estafeta. Verifique a consola para mais detalhes.')
      }
    }
  } catch (error) {
    console.error(error)
    alert('Erro ao comunicar com o servidor.')
  }
}
</script>

<template>
  <div class="p-8 pb-20 max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-700 relative">
    
    <!-- Header -->
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
      <div class="space-y-2">
        <h1 class="text-3xl font-bold text-white tracking-tight">Estafetas</h1>
        <p class="text-gray-400 font-medium tracking-wide">Faça a gestão e a monitorização do desempenho dos estafetas.</p>
      </div>
      <button 
        @click="openAddDrawer"
        class="flex items-center gap-2 bg-primary text-black px-6 py-3.5 rounded-full font-bold shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:bg-[#33f5ff] transition-all hover:-translate-y-0.5"
      >
        <Plus :size="20" strokeWidth="2.5" />
        Adicionar Estafeta
      </button>
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div class="bg-surface rounded-3xl p-6 border border-[#233246] relative overflow-hidden group">
        <div class="text-gray-300 font-bold mb-3 uppercase text-xs tracking-widest relative z-10 border-b border-[#233246] pb-3">TOTAL DE ESTAFETAS</div>
        <div class="text-5xl font-black text-white relative z-10 p-2">{{ stats.total }}</div>
      </div>
      <div class="bg-surface rounded-3xl p-6 border border-[#233246] relative overflow-hidden group">
        <div class="text-primary font-bold mb-3 uppercase text-xs tracking-widest relative z-10 border-b border-[#233246] pb-3">ESTAFETAS DISPONÍVEIS</div>
        <div class="text-5xl font-black text-white relative z-10 p-2">{{ stats.available }}</div>
      </div>
      <div class="bg-surface rounded-3xl p-6 border border-[#233246] relative overflow-hidden group">
        <div class="text-gray-300 font-bold mb-3 uppercase text-xs tracking-widest relative z-10 border-b border-[#233246] pb-3">ESTAFETAS ATIVOS</div>
        <div class="text-5xl font-black text-white relative z-10 p-2">{{ stats.active }}</div>
      </div>
    </div>

    <!-- Filters, Search & Table -->
    <div class="space-y-8">
      <div class="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 px-1">
        <!-- Tabs -->
        <div class="flex gap-8 border-b border-[#233246] px-2 text-sm font-semibold w-full md:w-auto">
          <button 
            @click="setFilter('todos')"
            class="pb-4 border-b-[3px] transition-colors duration-300"
            :class="filter === 'todos' ? 'border-primary text-primary shadow-[0_4px_10px_-4px_rgba(0,242,255,0.4)]' : 'border-transparent text-gray-500 hover:text-gray-300'"
          >Todos</button>
          <button 
            @click="setFilter('disponiveis')"
            class="pb-4 border-b-[3px] transition-colors duration-300"
            :class="filter === 'disponiveis' ? 'border-primary text-primary shadow-[0_4px_10px_-4px_rgba(0,242,255,0.4)]' : 'border-transparent text-gray-500 hover:text-gray-300'"
          >Disponíveis ({{ stats.available }})</button>
          <button 
            @click="setFilter('ativos')"
            class="pb-4 border-b-[3px] transition-colors duration-300"
            :class="filter === 'ativos' ? 'border-primary text-primary shadow-[0_4px_10px_-4px_rgba(0,242,255,0.4)]' : 'border-transparent text-gray-500 hover:text-gray-300'"
          >Ativos</button>
        </div>

        <!-- Search -->
        <div class="relative w-full md:w-72">
          <Search :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input 
            v-model="searchQuery"
            type="text" 
            placeholder="Procurar estafeta..." 
            class="w-full bg-[#111926] border border-[#233246] rounded-full py-2.5 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_10px_rgba(0,242,255,0.15)] transition-all"
          >
        </div>
      </div>

      <!-- Table Section -->
      <div class="bg-surface border border-[#233246] rounded-[2rem] overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr class="border-b border-[#233246] text-gray-400 text-xs uppercase tracking-widest font-semibold bg-[#111926]">
                <th class="p-6 text-center w-32">ID</th>
                <th class="p-6 w-1/3">Nome</th>
                <th class="p-6 w-1/4">Performance</th>
                <th class="p-6">Estado</th>
                <th class="p-6 text-center">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#233246]">
              <tr v-for="courier in filteredCouriers" :key="courier.id" class="hover:bg-[#1a2636] transition-colors group">
                <td class="p-6 text-gray-400 font-mono text-sm text-center">{{ courier.id }}</td>
                <td class="p-6">
                  <div class="flex items-center gap-4">
                    <div class="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0 shadow-inner"
                         :class="{
                           'bg-blue-600': courier.id === 'C-1024',
                           'bg-indigo-400 text-black': courier.id === 'C-1025',
                           'bg-yellow-500 text-black': courier.id === 'C-1026',
                           'bg-rose-300 text-black': courier.id === 'C-1027'
                         }">
                      {{ courier.initials }}
                    </div>
                    <span class="text-white font-semibold">{{ courier.name }}</span>
                  </div>
                </td>
                <td class="p-6">
                  <div class="flex items-center gap-4 max-w-[200px]">
                    <div class="flex-1 bg-[#080d14] h-1.5 rounded-full overflow-hidden border border-[#233246]/50">
                      <div class="h-full rounded-full transition-all duration-1000"
                           :class="{
                             'bg-primary shadow-[0_0_8px_rgba(0,242,255,0.8)]': courier.performance >= 90,
                             'bg-primary/80': courier.performance >= 80 && courier.performance < 90,
                             'bg-warning shadow-[0_0_8px_rgba(245,158,11,0.8)]': courier.performance < 80
                           }"
                           :style="`width: ${courier.performance}%`"></div>
                    </div>
                    <span class="text-sm font-bold text-white w-10 text-right">{{ courier.performance }}%</span>
                  </div>
                </td>
                <td class="p-6">
                  <div class="flex items-center gap-2.5 text-sm text-gray-300 bg-[#111926] w-fit px-3 py-1.5 rounded-full border border-[#233246]">
                    <span class="w-2 h-2 rounded-full" :class="courier.status === 'Disponível' ? 'bg-success shadow-[0_0_8px_rgba(16,185,129,0.9)]' : 'bg-gray-500'"></span>
                    {{ courier.status }}
                  </div>
                </td>
                <td class="p-6 text-center">
                  <div class="flex items-center justify-center gap-4">
                    <button @click="openEditDrawer(courier)" class="text-primary hover:text-[#33f5ff] font-bold text-sm tracking-wide transition-colors">
                      Editar
                    </button>
                    <button @click="deleteCourier(courier)" class="text-red-500 hover:text-red-400 font-bold text-sm tracking-wide transition-colors">
                      Eliminar
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <!-- Pagination -->
        <div class="border-t border-[#233246] p-6 flex flex-col md:flex-row items-center justify-between gap-4 bg-[#111926]">
          <span class="text-sm text-gray-400">
            <strong class="text-white">1-{{ filteredCouriers.length }}</strong> de {{ filteredCouriers.length }} resultados
          </span>
          <div class="flex gap-2">
            <button class="w-9 h-9 flex items-center justify-center rounded-full border border-[#233246] text-gray-400 hover:text-white hover:border-gray-500 hover:bg-[#1a2636] transition-colors bg-[#080d14]">
              <ChevronLeft :size="16" />
            </button>
            <button class="w-9 h-9 flex items-center justify-center rounded-full bg-primary text-black font-bold shadow-[0_0_10px_rgba(0,242,255,0.4)]">1</button>
            <button class="w-9 h-9 flex items-center justify-center rounded-full border border-[#233246] text-gray-400 hover:text-white hover:border-gray-500 hover:bg-[#1a2636] transition-colors bg-[#0c121e]">2</button>
            <button class="w-9 h-9 flex items-center justify-center rounded-full border border-[#233246] text-gray-400 hover:text-white hover:border-gray-500 hover:bg-[#1a2636] transition-colors bg-[#0c121e]">3</button>
            <span class="px-1 text-gray-500 flex items-center justify-center">...</span>
            <button class="w-9 h-9 flex items-center justify-center rounded-full border border-[#233246] text-gray-400 hover:text-white hover:border-gray-500 hover:bg-[#1a2636] transition-colors bg-[#0c121e]">6</button>
            <button class="w-9 h-9 flex items-center justify-center rounded-full border border-[#233246] text-gray-400 hover:text-white hover:border-gray-500 hover:bg-[#1a2636] transition-colors bg-[#080d14]">
              <ChevronRight :size="16" />
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Drawer Overlay -->
    <div 
      v-if="isAddCourierOpen" 
      class="fixed inset-0 bg-black/70 backdrop-blur-sm z-40 transition-opacity"
      @click="closeDrawer"
    ></div>

    <!-- Add Courier Drawer -->
    <div 
      class="fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#0c121e] border-l border-[#233246] z-50 transform transition-transform duration-500 ease-in-out shadow-2xl flex flex-col"
      :class="isAddCourierOpen ? 'translate-x-0' : 'translate-x-full'"
    >
      <div class="px-8 py-10 border-b border-[#233246] flex justify-between items-start bg-surface/50">
        <div>
          <h2 class="text-2xl font-bold text-white tracking-tight">{{ editingCourierId ? 'Editar Estafeta' : 'Adicionar Estafeta' }}</h2>
          <p class="text-sm text-gray-400 mt-2 tracking-wide block">{{ editingCourierId ? 'Altere os dados do estafeta' : 'Registe os dados do novo estafeta' }}</p>
        </div>
        <button @click="closeDrawer" class="p-2 text-gray-400 hover:text-white rounded-full hover:bg-[#233246] transition-colors -mt-2 -mr-2">
          <X :size="24" />
        </button>
      </div>

      <div class="p-8 flex-1 overflow-y-auto space-y-7">
        <div class="space-y-3 relative">
          <label class="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Nome Completo</label>
          <div class="relative">
            <User :size="18" class="absolute left-5 top-1/2 -translate-y-1/2 text-primary" />
            <input v-model="newCourier.Nome" type="text" placeholder="e.g. Marcus Thorne" class="w-full bg-[#111926] border border-[#233246] rounded-2xl py-4 pl-14 pr-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,242,255,0.15)] transition-all placeholder:text-gray-600">
          </div>
        </div>

        <div class="space-y-3 relative">
          <label class="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Telemóvel</label>
          <div class="relative">
            <Phone :size="18" class="absolute left-5 top-1/2 -translate-y-1/2 text-primary" />
            <input v-model="newCourier.Telemovel" type="number" placeholder="912345678" class="w-full bg-[#111926] border border-[#233246] rounded-2xl py-4 pl-14 pr-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,242,255,0.15)] transition-all placeholder:text-gray-600">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-5">
          <div class="space-y-3 relative">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Idade</label>
            <div class="relative">
              <Calendar :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
              <input v-model="newCourier.Idade" type="number" placeholder="25" class="w-full bg-[#111926] border border-[#233246] rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,242,255,0.15)] transition-all placeholder:text-gray-600">
            </div>
          </div>
          
          <div class="space-y-3 relative">
            <label class="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Área de Atuação</label>
            <div class="relative">
              <MapPin :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
              <select v-model="newCourier.AreaDeAtuacao" class="w-full bg-[#111926] border border-[#233246] rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,242,255,0.15)] transition-all appearance-none cursor-pointer">
                <option value="Braga">Braga</option>
                <option value="Porto">Porto</option>
                <option value="Guimaraes">Guimarães</option>
              </select>
            </div>
          </div>
        </div>
        
        <div class="space-y-3 relative pt-2">
          <label class="flex items-center gap-3 cursor-pointer">
            <div class="relative flex items-center justify-center">
              <input v-model="newCourier.Disponivel" type="checkbox" class="peer sr-only">
              <div class="w-6 h-6 border-2 border-[#233246] rounded-lg peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
              <CheckCircle :size="14" class="absolute text-black opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth="3" />
            </div>
            <span class="text-sm font-semibold text-gray-300">Disponível Imediatamente</span>
          </label>
        </div>
      </div>

      <div class="p-8 border-t border-[#233246] space-y-4 bg-surface/50">
        <button 
          @click="submitCourier"
          :disabled="isSubmitting"
          class="w-full bg-primary text-black font-bold py-4 rounded-full shadow-[0_0_20px_rgba(0,242,255,0.3)] hover:bg-[#33f5ff] transition-all hover:-translate-y-0.5 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <span v-if="isSubmitting">A Guardar...</span>
          <span v-else>Confirmar</span>
        </button>
        <button class="w-full bg-transparent text-white font-medium py-4 rounded-full border border-muted hover:bg-muted/50 hover:border-gray-400 transition-colors tracking-wide" @click="closeDrawer">
          Cancelar
        </button>
      </div>
    </div>
  </div>
</template>

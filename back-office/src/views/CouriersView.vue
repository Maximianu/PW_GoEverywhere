<script setup>
import { ref, computed, onMounted } from 'vue'
import { mockData } from '../mockData'
import { Search, ChevronLeft, ChevronRight, Plus, X, User, Phone, Calendar, CheckCircle, MapPin, Mail } from 'lucide-vue-next'

const filter = ref('todos')
const searchQuery = ref('')
const isAddCourierOpen = ref(false)
const editingCourierId = ref(null)

const couriers = ref([])

const newCourier = ref({
  Nome: '',
  Email: '',
  Telemovel: '',
  Idade: '',
  AreaDeAtuacao: 'Braga',
  Disponivel: true
})
const isSubmitting = ref(false)

const loadCouriers = async () => {
  try {
    const res = await fetch('http://127.0.0.1:1338/api/estafetas?populate=reviews')
    const json = await res.json()
    couriers.value = json.data.map(item => {
      let avgRating = 0;
      let reviewCount = 0;
      if (item.reviews && Array.isArray(item.reviews)) {
        let sum = 0;
        item.reviews.forEach(r => {
           if (r.Estrela_estafeta) {
             sum += r.Estrela_estafeta;
             reviewCount++;
           }
        });
        if (reviewCount > 0) {
           avgRating = sum / reviewCount;
        }
      }

      return {
        id: `C-${item.documentId ? item.documentId.substring(0,4) : item.id}`,
        dbId: item.documentId || item.id,
        dbNome: item.Nome || '',
        dbEmail: item.Email || '',
        dbTelemovel: item.Telemovel || '',
        dbIdade: item.Idade || '',
        dbAreaDeAtuacao: item.AreaDeAtuacao || 'Braga',
        dbDisponivel: item.Disponivel !== undefined ? item.Disponivel : true,
        initials: item.Nome ? item.Nome.substring(0, 2).toUpperCase() : '??',
        name: item.Nome || 'Estafeta Sem Nome',
        performance: avgRating,
        reviewCount: reviewCount,
        status: item.Disponivel ? 'Disponível' : 'Ativo'
      };
    })
  } catch (error) {
    console.error('Erro ao buscar estafetas do Strapi:', error)
    couriers.value = mockData.couriers
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
        Email: newCourier.value.Email,
        Telemovel: newCourier.value.Telemovel ? parseInt(newCourier.value.Telemovel) : null,
        Idade: newCourier.value.Idade ? parseInt(newCourier.value.Idade) : null,
        AreaDeAtuacao: newCourier.value.AreaDeAtuacao,
        Disponivel: newCourier.value.Disponivel
      }
    }
    const isEdit = !!editingCourierId.value
    const url = isEdit 
      ? `http://127.0.0.1:1338/api/estafetas/${editingCourierId.value}`
      : 'http://127.0.0.1:1338/api/estafetas'
      
    const response = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
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

const stats = computed(() => ({
  total: couriers.value.length,
  available: couriers.value.filter(c => c.status === 'Disponível').length,
  active: couriers.value.filter(c => c.status === 'Ativo').length
}))

const filteredCouriers = computed(() => {
  let list = couriers.value
  if (filter.value === 'ativos') list = couriers.value.filter(c => c.status === 'Ativo')
  else if (filter.value === 'disponiveis') list = couriers.value.filter(c => c.status === 'Disponível')
  if (searchQuery.value) {
    list = list.filter(c => c.name.toLowerCase().includes(searchQuery.value.toLowerCase()))
  }
  return list
})

const setFilter = (val) => { filter.value = val }

const openAddDrawer = () => {
  editingCourierId.value = null
  newCourier.value = { Nome: '', Email: '', Telemovel: '', Idade: '', AreaDeAtuacao: 'Braga', Disponivel: true }
  isAddCourierOpen.value = true
}

const openEditDrawer = (courier) => {
  editingCourierId.value = courier.dbId
  newCourier.value = {
    Nome: courier.dbNome,
    Email: courier.dbEmail,
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
  newCourier.value = { Nome: '', Email: '', Telemovel: '', Idade: '', AreaDeAtuacao: 'Braga', Disponivel: true }
}

const deleteCourier = async (courier) => {
  if (!confirm(`Tem a certeza que deseja eliminar o estafeta ${courier.name}?`)) return
  try {
    const response = await fetch(`http://127.0.0.1:1338/api/estafetas/${courier.dbId}`, { method: 'DELETE' })
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

    <!-- Header — igual ao GoEverywhere, com botão à direita -->
    <header class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
      <div>
        <h1 class="text-4xl font-black text-white mb-2 tracking-tighter italic opacity-90 uppercase">
          Estafetas
        </h1>
        <div class="flex items-center gap-2 opacity-60">
          <div class="h-[1px] w-5 bg-blue-500"></div>
          <p class="text-white text-[9px] font-mono uppercase tracking-[0.2em] whitespace-nowrap">
            Gestão e monitorização dos estafetas
          </p>
          <div class="h-[1px] w-5 bg-blue-500"></div>
        </div>
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
        <div class="text-gray-300 font-bold mb-3 uppercase text-xs tracking-widest relative z-10 border-b border-[#233246] pb-3">ESTAFETAS DISPONÍVEIS</div>
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
        <div class="flex gap-8 border-b border-[#233246] px-2 text-sm font-semibold w-full md:w-auto">
          <button @click="setFilter('todos')" class="pb-4 border-b-[3px] transition-colors duration-300" :class="filter === 'todos' ? 'border-primary text-primary shadow-[0_4px_10px_-4px_rgba(0,242,255,0.4)]' : 'border-transparent text-gray-500 hover:text-gray-300'">Todos</button>
          <button @click="setFilter('disponiveis')" class="pb-4 border-b-[3px] transition-colors duration-300" :class="filter === 'disponiveis' ? 'border-primary text-primary shadow-[0_4px_10px_-4px_rgba(0,242,255,0.4)]' : 'border-transparent text-gray-500 hover:text-gray-300'">Disponíveis ({{ stats.available }})</button>
          <button @click="setFilter('ativos')" class="pb-4 border-b-[3px] transition-colors duration-300" :class="filter === 'ativos' ? 'border-primary text-primary shadow-[0_4px_10px_-4px_rgba(0,242,255,0.4)]' : 'border-transparent text-gray-500 hover:text-gray-300'">Ativos</button>
        </div>
        <div class="relative w-full md:w-72">
          <Search :size="16" class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
          <input v-model="searchQuery" type="text" placeholder="Procurar estafeta..." class="w-full bg-[#111926] border border-[#233246] rounded-full py-2.5 pl-12 pr-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary/50 focus:shadow-[0_0_10px_rgba(0,242,255,0.15)] transition-all">
        </div>
      </div>

      <div class="bg-surface border border-[#233246] rounded-[2rem] overflow-hidden shadow-2xl">
        <div class="overflow-x-auto">
          <table class="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr class="border-b border-[#233246] text-gray-400 text-xs uppercase tracking-widest font-semibold bg-[#111926]">
                <th class="p-6 font-semibold">Nome</th>
                <th class="p-6 font-semibold">Área de Atuação</th>
                <th class="p-6 font-semibold">Email</th>
                <th class="p-6 font-semibold">Avaliação</th>
                <th class="p-6 font-semibold">Estado</th>
                <th class="p-6 text-center font-semibold">Ações</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[#233246]">
              <tr v-for="courier in filteredCouriers" :key="courier.id" class="hover:bg-[#1a2636] transition-colors group">
                <td class="p-6">
                  <span class="text-white font-semibold">{{ courier.name }}</span>
                </td>
                <td class="p-6 text-sm text-gray-300">
                  <span class="bg-[#1a2636] px-3 py-1.5 rounded-lg border border-[#2a3b4f]">{{ courier.dbAreaDeAtuacao }}</span>
                </td>
                <td class="p-6 text-sm text-gray-300">
                  <div class="flex items-center gap-2">
                    <Mail :size="14" class="text-gray-500" />
                    {{ courier.dbEmail || 'N/A' }}
                  </div>
                </td>
                <td class="p-6">
                  <div class="flex items-center gap-2">
                    <span v-if="courier.reviewCount > 0" class="text-sm font-bold text-white flex items-center gap-1">
                      {{ courier.performance.toFixed(1) }} <span class="text-yellow-500 text-base leading-none">★</span>
                    </span>
                    <span v-else class="text-sm font-bold text-gray-500">S/A</span>
                    <span v-if="courier.reviewCount > 0" class="text-xs text-gray-500">({{ courier.reviewCount }})</span>
                  </div>
                </td>
                <td class="p-6">
                  <div class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border" :class="courier.status === 'Disponível' ? 'bg-green-500/20 text-green-300 border-green-500/30' : 'bg-blue-500/20 text-blue-300 border-blue-500/30'">
                    <span class="w-1.5 h-1.5 rounded-full" :class="courier.status === 'Disponível' ? 'bg-green-400' : 'bg-blue-400'"></span>
                    {{ courier.status }}
                  </div>
                </td>
                <td class="p-6 text-center">
                  <div class="flex items-center justify-center gap-2">
                    <button @click="openEditDrawer(courier)" class="text-primary hover:text-white font-semibold text-xs transition-colors border border-primary/30 px-3 py-1.5 rounded-full hover:bg-primary/10">Editar</button>
                    <button @click="deleteCourier(courier)" class="text-red-500 hover:text-white font-semibold text-xs transition-colors border border-red-500/30 px-3 py-1.5 rounded-full hover:bg-red-500/10">Eliminar</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Drawer -->
    <Teleport to="body">
      <Transition enterActiveClass="transition-opacity duration-300" leaveActiveClass="transition-opacity duration-300">
        <div v-if="isAddCourierOpen" class="fixed inset-0 bg-black/70 backdrop-blur-sm z-40" @click="closeDrawer"></div>
      </Transition>
      <Transition enterActiveClass="transition-transform duration-300" leaveActiveClass="transition-transform duration-300" enterFromClass="translate-x-full" leaveToClass="translate-x-full">
        <div v-if="isAddCourierOpen" class="fixed top-0 right-0 h-full w-96 bg-[#141b27] border-l border-[#1f2937] z-50 flex flex-col shadow-2xl">
          <div class="flex items-center justify-between p-6 border-b border-[#1f2937]">
            <h3 class="text-xl font-bold text-white">{{ editingCourierId ? 'Editar Estafeta' : 'Adicionar Estafeta' }}</h3>
            <button @click="closeDrawer" class="text-gray-400 hover:text-white transition-colors">
              <X :size="24" />
            </button>
          </div>
          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <div class="space-y-2">
              <label class="text-xs font-bold text-primary uppercase tracking-widest pl-1">Nome Completo</label>
              <div class="relative">
                <User :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                <input v-model="newCourier.Nome" type="text" placeholder="e.g. Marcus Thorne" class="w-full bg-[#0c1219] border border-[#2a3b4f] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all placeholder:text-gray-600">
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-primary uppercase tracking-widest pl-1">Email</label>
              <div class="relative">
                <Mail :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                <input v-model="newCourier.Email" type="email" placeholder="estafeta@goeverywhere.pt" class="w-full bg-[#0c1219] border border-[#2a3b4f] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all placeholder:text-gray-600">
              </div>
            </div>
            <div class="space-y-2">
              <label class="text-xs font-bold text-primary uppercase tracking-widest pl-1">Telemóvel</label>
              <div class="relative">
                <Phone :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                <input v-model="newCourier.Telemovel" type="number" placeholder="912345678" class="w-full bg-[#0c1219] border border-[#2a3b4f] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all placeholder:text-gray-600">
              </div>
            </div>
            <div class="grid grid-cols-2 gap-4">
              <div class="space-y-2">
                <label class="text-xs font-bold text-primary uppercase tracking-widest pl-1">Idade</label>
                <div class="relative">
                  <Calendar :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                  <input v-model="newCourier.Idade" type="number" placeholder="25" class="w-full bg-[#0c1219] border border-[#2a3b4f] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all placeholder:text-gray-600">
                </div>
              </div>
              <div class="space-y-2">
                <label class="text-xs font-bold text-primary uppercase tracking-widest pl-1">Área</label>
                <div class="relative">
                  <MapPin :size="18" class="absolute left-4 top-1/2 -translate-y-1/2 text-primary" />
                  <select v-model="newCourier.AreaDeAtuacao" class="w-full bg-[#0c1219] border border-[#2a3b4f] rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-primary transition-all appearance-none cursor-pointer">
                    <option value="Braga">Braga</option>
                    <option value="Porto">Porto</option>
                    <option value="Guimaraes">Guimarães</option>
                  </select>
                </div>
              </div>
            </div>
            <div class="space-y-3 pt-2">
              <label class="flex items-center gap-3 cursor-pointer">
                <div class="relative flex items-center justify-center">
                  <input v-model="newCourier.Disponivel" type="checkbox" class="peer sr-only">
                  <div class="w-5 h-5 border-2 border-[#2a3b4f] rounded bg-[#0c1219] peer-checked:bg-primary peer-checked:border-primary transition-all"></div>
                  <CheckCircle :size="14" class="absolute text-black opacity-0 peer-checked:opacity-100 transition-opacity" strokeWidth="3" />
                </div>
                <span class="text-sm font-semibold text-gray-300">Disponível Imediatamente</span>
              </label>
            </div>
          </div>
          <div class="p-6 border-t border-[#1f2937] space-y-3">
            <button @click="submitCourier" :disabled="isSubmitting" class="w-full bg-primary text-black font-bold py-3 rounded-lg shadow-[0_0_15px_rgba(0,242,255,0.2)] hover:bg-[#33f5ff] transition-all hover:-translate-y-0.5 tracking-wide disabled:opacity-50 disabled:cursor-not-allowed">
              <span v-if="isSubmitting">A Guardar...</span>
              <span v-else>Confirmar</span>
            </button>
            <button class="w-full bg-[#0c1219] text-white font-medium py-3 rounded-lg border border-[#2a3b4f] hover:bg-[#1a2332] transition-colors tracking-wide" @click="closeDrawer">Cancelar</button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
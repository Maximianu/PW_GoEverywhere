<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, X, User, Mail, Phone, Calendar, MapPin, Rocket } from 'lucide-vue-next'

const searchQuery = ref('')
const isDetailsCustomerOpen = ref(false)
const selectedCustomer = ref(null)
const customers = ref([])

const loadCustomers = async () => {
  try {
    const res = await fetch('http://127.0.0.1:1338/api/clientes?populate[0]=bilhetes&populate[1]=bilhetes.pedido&populate[2]=bilhetes.missao&populate[3]=bilhetes.missao2')
    const json = await res.json()
    customers.value = json.data.map(item => {
      const rawMissoes = item.bilhetes?.map(b => b.missao || b.missao2).filter(m => m) || []
      const uniqueMissoesMap = new Map()
      rawMissoes.forEach(m => {
        const mId = m.documentId || m.id
        if (!uniqueMissoesMap.has(mId)) {
          uniqueMissoesMap.set(mId, m)
        }
      })
      const missoesList = Array.from(uniqueMissoesMap.values())

      return {
        id: item.documentId || item.id,
        nome: `${item.PrimeiroNome || ''} ${item.UltimoNome || ''}`.trim() || 'Sem Nome',
        primeiroNome: item.PrimeiroNome || '',
        ultimoNome: item.UltimoNome || '',
        email: item.Email || 'n/a',
        initials: ((item.PrimeiroNome ? item.PrimeiroNome[0] : '') + (item.UltimoNome ? item.UltimoNome[0] : '')).toUpperCase() || '??',
        pedidos: item.bilhetes?.length || 0,
        pedidosList: item.bilhetes?.map(b => b.pedido).filter(p => p) || [],
        missoesList: missoesList,
        dataCriacao: new Date(item.createdAt).toLocaleDateString('pt-PT'),
        createdAt: item.createdAt
      }
    })
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    customers.value = []
  }
}

onMounted(loadCustomers)

const openDetailsDrawer = (customer) => {
  selectedCustomer.value = customer
  isDetailsCustomerOpen.value = true
}

const closeDrawer = () => {
  isDetailsCustomerOpen.value = false
  selectedCustomer.value = null
}

const stats = computed(() => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const thisMonthCount = customers.value.filter(c => {
    if (!c.createdAt) return false;
    const d = new Date(c.createdAt);
    return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
  }).length;

  return {
    total: customers.value.length,
    thisMonth: thisMonthCount
  }
})

const filteredCustomers = computed(() => {
  if (!searchQuery.value) return customers.value
  return customers.value.filter(c =>
    c.nome.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    c.email.toLowerCase().includes(searchQuery.value.toLowerCase())
  )
})
</script>

<template>
  <div class="p-8 pb-20 max-w-[1400px] mx-auto space-y-10 animate-in fade-in duration-700 relative">

    <!-- Header — igual ao GoEverywhere -->
    <header class="flex flex-col items-start relative z-10">
      <h1 class="text-4xl font-black text-white mb-2 tracking-tighter italic opacity-90 uppercase">
        Clientes
      </h1>
      <div class="flex items-center gap-2 opacity-60">
        <div class="h-[1px] w-5 bg-blue-500"></div>
        <p class="text-white text-[9px] font-mono uppercase tracking-[0.2em] whitespace-nowrap">
          Gerencie e visualize todos os clientes registados
        </p>
        <div class="h-[1px] w-5 bg-blue-500"></div>
      </div>
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 relative z-10">
      <div class="bg-surface rounded-3xl p-6 border border-[#233246] relative overflow-hidden group">
        <div class="text-gray-300 font-bold mb-3 uppercase text-xs tracking-widest relative z-10 border-b border-muted/50 pb-3">TOTAL DE CLIENTES</div>
        <div class="text-5xl font-black text-white relative z-10 p-2">{{ stats.total }}</div>
      </div>
      <div class="bg-surface rounded-3xl p-6 border border-[#233246] relative overflow-hidden group">
        <div class="text-gray-300 font-bold mb-3 uppercase text-xs tracking-widest relative z-10 border-b border-muted/50 pb-3">ESTE MÊS</div>
        <div class="text-5xl font-black text-white relative z-10 p-2">{{ stats.thisMonth }}</div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center justify-between bg-surface rounded-3xl p-4 border border-[#233246]">
      <div class="flex-1 relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" :size="18" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Procurar clientes..."
          class="w-full pl-12 pr-4 py-3 bg-[#111926] border border-[#233246] rounded-2xl text-white placeholder-gray-500 focus:outline-none focus:border-primary focus:shadow-[0_0_15px_rgba(0,242,255,0.15)] transition-all"
        />
      </div>
    </div>

    <!-- Customers Table -->
    <div class="bg-surface border border-[#233246] rounded-[2rem] overflow-hidden shadow-2xl">
      <div v-if="filteredCustomers.length > 0" class="overflow-x-auto">
        <table class="w-full text-left border-collapse min-w-[900px]">
          <thead>
            <tr class="border-b border-[#233246] text-gray-400 text-xs uppercase tracking-widest font-semibold bg-[#111926]">
              <th class="p-6 font-semibold w-1/3">Cliente</th>
              <th class="p-6 font-semibold w-1/3">Email</th>
              <th class="p-6 font-semibold w-1/6">Pedidos</th>
              <th class="p-6 font-semibold w-1/6">Data</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#233246]">
            <tr v-for="customer in filteredCustomers" :key="customer.id" class="hover:bg-[#1a2636] transition-colors group cursor-pointer" @click="openDetailsDrawer(customer)">
              <td class="p-6">
                <div class="flex items-center gap-4">
                  <div class="w-10 h-10 rounded-full bg-[#1e2e42] flex items-center justify-center text-sm font-bold text-primary shrink-0 shadow-inner">
                    {{ customer.initials }}
                  </div>
                  <span class="text-white font-semibold">{{ customer.nome }}</span>
                </div>
              </td>
              <td class="p-6 text-sm">
                <div class="flex items-center gap-2 text-gray-300">
                  <Mail :size="16" class="text-gray-500" />
                  {{ customer.email }}
                </div>
              </td>
              <td class="p-6">
                <span class="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold tracking-wide border bg-blue-500/10 text-blue-400 border-blue-500/20">
                  {{ customer.pedidos }}
                </span>
              </td>
              <td class="p-6 text-gray-300 text-sm">{{ customer.dataCriacao }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-else class="flex items-center justify-center py-12">
        <div class="text-center">
          <User class="mx-auto mb-4 text-gray-600" :size="48" />
          <p class="text-gray-400 font-medium">Nenhum cliente encontrado</p>
        </div>
      </div>
    </div>

    <!-- Customer Details Drawer -->
    <Teleport to="body">
      <Transition
        enterActiveClass="transition-opacity duration-300"
        leaveActiveClass="transition-opacity duration-300"
      >
        <div v-if="isDetailsCustomerOpen" class="fixed inset-0 bg-black/50 z-40" @click="closeDrawer" />
      </Transition>

      <Transition
        enterActiveClass="transition-transform duration-300"
        leaveActiveClass="transition-transform duration-300"
        enterFromClass="translate-x-full"
        leaveToClass="translate-x-full"
      >
        <div v-if="isDetailsCustomerOpen && selectedCustomer" class="fixed right-0 top-0 h-full w-96 bg-[#141b27] border-l border-[#1f2937] z-50 flex flex-col shadow-2xl">
          <div class="flex items-center justify-between p-6 border-b border-[#1f2937]">
            <h3 class="text-xl font-bold text-white">Detalhes do Cliente</h3>
            <button @click="closeDrawer" class="text-gray-400 hover:text-white transition-colors">
              <X :size="24" />
            </button>
          </div>

          <div class="flex-1 overflow-y-auto p-6 space-y-6">
            <div class="flex flex-col items-center justify-center space-y-4 mb-8">
              <div class="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-black font-bold text-2xl shadow-lg">
                {{ selectedCustomer.initials }}
              </div>
              <div class="text-center">
                <h4 class="text-xl font-bold text-white">{{ selectedCustomer.nome }}</h4>
                <p class="text-gray-400 mt-1 flex items-center justify-center gap-2"><Mail :size="16"/> {{ selectedCustomer.email }}</p>
              </div>
            </div>

            <div class="space-y-4">
              <h5 class="text-xs font-bold text-primary uppercase tracking-widest border-b border-[#1f2937] pb-2">Estatísticas</h5>
              <div class="bg-[#0c1219] p-4 rounded-xl border border-[#2a3b4f] flex justify-between items-center">
                <span class="text-gray-400 font-medium">Total de Pedidos</span>
                <span class="text-white font-bold text-lg bg-blue-500/20 px-3 py-1 rounded-lg text-blue-300">{{ selectedCustomer.pedidos }}</span>
              </div>
            </div>

            <div class="space-y-4">
              <h5 class="text-xs font-bold text-primary uppercase tracking-widest border-b border-[#1f2937] pb-2">Informação de Registo</h5>
              <div class="bg-[#0c1219] p-4 rounded-xl border border-[#2a3b4f] flex justify-between items-center">
                <span class="text-gray-400 font-medium">Data de Registo</span>
                <span class="text-white font-medium flex items-center gap-2"><Calendar :size="16" class="text-gray-500"/> {{ selectedCustomer.dataCriacao }}</span>
              </div>
            </div>

            <div class="space-y-4">
              <h5 class="text-xs font-bold text-primary uppercase tracking-widest border-b border-[#1f2937] pb-2">Missões Associadas</h5>
              <div v-if="selectedCustomer.missoesList && selectedCustomer.missoesList.length > 0" class="space-y-3">
                <div v-for="missao in selectedCustomer.missoesList" :key="missao.id" class="bg-[#0c1219] p-4 rounded-xl border border-[#2a3b4f] flex flex-col gap-2">
                  <div class="flex justify-between items-start">
                    <span class="text-white font-semibold flex items-center gap-2"><Rocket :size="14" class="text-primary" /> {{ missao.Nome || 'Missão sem nome' }}</span>
                    <span class="text-xs font-bold px-2 py-1 rounded-full border bg-opacity-20 whitespace-nowrap text-purple-400 border-purple-500/30 bg-purple-500/10">
                      {{ missao.Planeta || 'Desconhecido' }}
                    </span>
                  </div>
                  <p v-if="missao.Descricao_missao" class="text-xs text-gray-400 mt-1 mb-1 italic line-clamp-2">
                    {{ missao.Descricao_missao }}
                  </p>
                  <div class="flex justify-between items-center text-[10px] text-gray-500 mt-2 border-t border-[#1f2937] pt-2">
                    <span class="font-mono">ID: {{ (missao.documentId || missao.id).toString().substring(0,8) }}</span>
                    <span>{{ missao.Data ? new Date(missao.Data).toLocaleDateString('pt-PT') : 'N/A' }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-6 bg-[#0c1219] rounded-xl border border-[#2a3b4f]">
                <p class="text-gray-500 text-sm">Nenhuma missão associada.</p>
              </div>
            </div>

            <div class="space-y-4">
              <h5 class="text-xs font-bold text-primary uppercase tracking-widest border-b border-[#1f2937] pb-2">Histórico de Pedidos</h5>
              <div v-if="selectedCustomer.pedidosList && selectedCustomer.pedidosList.length > 0" class="space-y-3">
                <div v-for="pedido in selectedCustomer.pedidosList" :key="pedido.id" class="bg-[#0c1219] p-4 rounded-xl border border-[#2a3b4f] flex flex-col gap-2">
                  <div class="flex justify-between items-start">
                    <span class="text-white font-semibold flex items-center gap-2"><MapPin :size="14" class="text-gray-400" /> {{ pedido.LocalEntrega || pedido.Destino || 'N/A' }}</span>
                    <span class="text-xs font-bold px-2 py-1 rounded-full border bg-opacity-20 whitespace-nowrap" :class="pedido.Estado === 'Entregue' ? 'text-green-400 border-green-500/30 bg-green-500/10' : (pedido.Estado === 'Cancelado' ? 'text-red-400 border-red-500/30 bg-red-500/10' : 'text-blue-400 border-blue-500/30 bg-blue-500/10')">
                      {{ pedido.Estado || 'Pendente' }}
                    </span>
                  </div>
                  <div class="flex justify-between items-center text-xs text-gray-400">
                    <span class="font-mono">ID: {{ (pedido.documentId || pedido.id).toString().substring(0,8) }}</span>
                    <span>{{ new Date(pedido.createdAt).toLocaleDateString('pt-PT') }}</span>
                  </div>
                </div>
              </div>
              <div v-else class="text-center py-6 bg-[#0c1219] rounded-xl border border-[#2a3b4f]">
                <p class="text-gray-500 text-sm">Nenhum pedido efetuado.</p>
              </div>
            </div>
          </div>

          <div class="p-6 border-t border-[#1f2937]">
            <button
              @click="closeDrawer"
              class="w-full px-4 py-3 bg-[#0c1219] border border-[#2a3b4f] rounded-lg text-white font-medium hover:bg-[#1a2332] transition-colors"
            >
              Fechar Atalhos
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>
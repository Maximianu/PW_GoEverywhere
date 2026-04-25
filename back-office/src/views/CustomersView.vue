<script setup>
import { ref, computed, onMounted } from 'vue'
import { Search, Plus, X, User, Mail, Phone, Calendar, MapPin } from 'lucide-vue-next'

const searchQuery = ref('')
const isAddCustomerOpen = ref(false)
const editingCustomerId = ref(null)
const customers = ref([])
const isSubmitting = ref(false)

const newCustomer = ref({
  Nome: '',
  Email: '',
  Telemovel: '',
  Endereco: '',
  Cidade: ''
})

const loadCustomers = async () => {
  try {
    // Nota: Você precisa ter uma API de clientes no Strapi
    // ou pode adaptar para buscar de "pedido-missions" para extrair clientes únicos
    const res = await fetch('http://localhost:1338/api/clientes')
    const json = await res.json()
    customers.value = json.data.map(item => ({
      id: item.documentId || item.id,
      nome: item.Nome || 'Sem Nome',
      email: item.Email || 'n/a',
      telemovel: item.Telemovel || 'n/a',
      endereco: item.Endereco || 'Não informado',
      cidade: item.Cidade || 'Não informado',
      initials: (item.Nome || '??').substring(0, 2).toUpperCase(),
      pedidos: item.pedidos?.length || 0,
      dataCriacao: new Date(item.createdAt).toLocaleDateString('pt-PT')
    }))
  } catch (error) {
    console.error('Erro ao buscar clientes:', error)
    customers.value = [] // Sem dados mock por agora
  }
}

onMounted(loadCustomers)

const submitCustomer = async () => {
  if (!newCustomer.value.Nome || !newCustomer.value.Email) {
    alert('Nome e Email são obrigatórios.')
    return
  }
  
  isSubmitting.value = true
  try {
    const payload = {
      data: {
        Nome: newCustomer.value.Nome,
        Email: newCustomer.value.Email,
        Telemovel: newCustomer.value.Telemovel,
        Endereco: newCustomer.value.Endereco,
        Cidade: newCustomer.value.Cidade
      }
    }
    
    const isEdit = !!editingCustomerId.value
    const url = isEdit 
      ? `http://localhost:1338/api/clientes/${editingCustomerId.value}`
      : 'http://localhost:1338/api/clientes'
    
    const response = await fetch(url, {
      method: isEdit ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })
    
    if (response.ok) {
      await loadCustomers()
      closeDrawer()
    } else {
      if (response.status === 403) {
        alert('Erro 403: Permissão negada! Ative a permissão no Strapi.')
      } else {
        alert(isEdit ? 'Falha ao atualizar cliente.' : 'Falha ao adicionar cliente.')
      }
    }
  } catch (error) {
    console.error(error)
    alert('Erro ao comunicar com o servidor.')
  } finally {
    isSubmitting.value = false
  }
}

const openAddDrawer = () => {
  editingCustomerId.value = null
  newCustomer.value = { Nome: '', Email: '', Telemovel: '', Endereco: '', Cidade: '' }
  isAddCustomerOpen.value = true
}

const closeDrawer = () => {
  isAddCustomerOpen.value = false
  editingCustomerId.value = null
}

const stats = computed(() => {
  return {
    total: customers.value.length,
    premium: customers.value.filter(c => c.pedidos > 5).length,
    thisMonth: customers.value.length // Pode ser melhorado com data
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
    <!-- Header -->
    <header class="space-y-2 relative z-10">
      <h1 class="text-3xl font-bold text-white tracking-tight">Clientes</h1>
      <p class="text-gray-400 font-medium tracking-wide">Gerencie e visualize todos os clientes registrados.</p>
    </header>

    <!-- Stats -->
    <div class="grid grid-cols-3 gap-6">
      <div class="bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30 rounded-2xl p-6">
        <div class="text-sm text-gray-400 font-medium mb-2">Total de Clientes</div>
        <div class="text-4xl font-bold text-white">{{ stats.total }}</div>
      </div>
      <div class="bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-2xl p-6">
        <div class="text-sm text-gray-400 font-medium mb-2">Clientes Premium</div>
        <div class="text-4xl font-bold text-white">{{ stats.premium }}</div>
      </div>
      <div class="bg-gradient-to-br from-green-500/20 to-green-600/10 border border-green-500/30 rounded-2xl p-6">
        <div class="text-sm text-gray-400 font-medium mb-2">Este Mês</div>
        <div class="text-4xl font-bold text-white">{{ stats.thisMonth }}</div>
      </div>
    </div>

    <!-- Toolbar -->
    <div class="flex items-center justify-between bg-[#141b27] rounded-2xl p-4 border border-[#1f2937]">
      <div class="flex-1 relative">
        <Search class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" :size="18" />
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Procurar clientes..."
          class="w-full pl-12 pr-4 py-2.5 bg-[#0c1219] border border-[#2a3b4f] rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-primary"
        />
      </div>
      <button
        @click="openAddDrawer"
        class="ml-4 flex items-center gap-2 px-6 py-2.5 bg-primary text-black rounded-xl font-semibold hover:bg-primary/90 transition-colors"
      >
        <Plus :size="18" />
        Novo Cliente
      </button>
    </div>

    <!-- Customers Table -->
    <div class="bg-[#141b27] border border-[#1f2937] rounded-2xl overflow-hidden">
      <div v-if="filteredCustomers.length > 0" class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="border-b border-[#1f2937] bg-[#0c1219]">
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Cliente</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Email</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Telefone</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Cidade</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Pedidos</th>
              <th class="px-6 py-4 text-left text-xs font-semibold text-gray-400 uppercase">Data</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[#1f2937]">
            <tr v-for="customer in filteredCustomers" :key="customer.id" class="hover:bg-[#1a2332] transition-colors">
              <td class="px-6 py-4">
                <div class="flex items-center gap-3">
                  <div class="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center text-black font-semibold text-sm">
                    {{ customer.initials }}
                  </div>
                  <span class="text-white font-medium">{{ customer.nome }}</span>
                </div>
              </td>
              <td class="px-6 py-4 text-gray-300">
                <div class="flex items-center gap-2 text-sm">
                  <Mail :size="16" class="text-gray-500" />
                  {{ customer.email }}
                </div>
              </td>
              <td class="px-6 py-4 text-gray-300">
                <div class="flex items-center gap-2 text-sm">
                  <Phone :size="16" class="text-gray-500" />
                  {{ customer.telemovel }}
                </div>
              </td>
              <td class="px-6 py-4 text-gray-300">
                <div class="flex items-center gap-2 text-sm">
                  <MapPin :size="16" class="text-gray-500" />
                  {{ customer.cidade }}
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-500/20 text-blue-300">
                  {{ customer.pedidos }}
                </span>
              </td>
              <td class="px-6 py-4 text-gray-400 text-sm">{{ customer.dataCriacao }}</td>
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

    <!-- Add/Edit Customer Drawer -->
    <Teleport to="body">
      <Transition
        enterActiveClass="transition-opacity duration-300"
        leaveActiveClass="transition-opacity duration-300"
      >
        <div v-if="isAddCustomerOpen" class="fixed inset-0 bg-black/50 z-40" @click="closeDrawer" />
      </Transition>

      <Transition
        enterActiveClass="transition-transform duration-300"
        leaveActiveClass="transition-transform duration-300"
        enterFromClass="translate-x-full"
        leaveToClass="translate-x-full"
      >
        <div v-if="isAddCustomerOpen" class="fixed right-0 top-0 h-full w-96 bg-[#141b27] border-l border-[#1f2937] z-50 flex flex-col shadow-2xl">
          <!-- Header -->
          <div class="flex items-center justify-between p-6 border-b border-[#1f2937]">
            <h3 class="text-xl font-bold text-white">
              {{ editingCustomerId ? 'Editar Cliente' : 'Novo Cliente' }}
            </h3>
            <button @click="closeDrawer" class="text-gray-400 hover:text-white transition-colors">
              <X :size="24" />
            </button>
          </div>

          <!-- Content -->
          <div class="flex-1 overflow-y-auto p-6 space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Nome *</label>
              <input
                v-model="newCustomer.Nome"
                type="text"
                class="w-full px-4 py-2 bg-[#0c1219] border border-[#2a3b4f] rounded-lg text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Email *</label>
              <input
                v-model="newCustomer.Email"
                type="email"
                class="w-full px-4 py-2 bg-[#0c1219] border border-[#2a3b4f] rounded-lg text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Telefone</label>
              <input
                v-model="newCustomer.Telemovel"
                type="tel"
                class="w-full px-4 py-2 bg-[#0c1219] border border-[#2a3b4f] rounded-lg text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Endereço</label>
              <input
                v-model="newCustomer.Endereco"
                type="text"
                class="w-full px-4 py-2 bg-[#0c1219] border border-[#2a3b4f] rounded-lg text-white focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-300 mb-2">Cidade</label>
              <input
                v-model="newCustomer.Cidade"
                type="text"
                class="w-full px-4 py-2 bg-[#0c1219] border border-[#2a3b4f] rounded-lg text-white focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <!-- Footer -->
          <div class="p-6 border-t border-[#1f2937] flex gap-3">
            <button
              @click="closeDrawer"
              class="flex-1 px-4 py-2 bg-[#0c1219] border border-[#2a3b4f] rounded-lg text-white font-medium hover:bg-[#1a2332] transition-colors"
            >
              Cancelar
            </button>
            <button
              @click="submitCustomer"
              :disabled="isSubmitting"
              class="flex-1 px-4 py-2 bg-primary text-black rounded-lg font-medium hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {{ isSubmitting ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>



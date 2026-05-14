import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBookingStore = defineStore('booking', () => {
  // Estado - Destinos carregados do Strapi
  const destinos = ref([])
  const loading = ref(false)
  const error = ref(null)

  // Estado - Seleção atual
  const destinoSelecionado = ref(null)
  const numeroPassageiros = ref(1)
  const dataLancamento = ref('')
  const selectedKit = ref(localStorage.getItem('selectedKit') || 'normal')
  const clienteId = ref(localStorage.getItem('clienteId') || null)
  const clienteData = ref(localStorage.getItem('clienteData') ? JSON.parse(localStorage.getItem('clienteData')) : null)
  const clienteLoading = ref(false)

  // URLs do Strapi
  const STRAPI_URL = 'http://localhost:1338'
  const STRAPI_API_TOKEN = 'e5c8410d2d4b81559a226941df1112c58791d9ebfeaf62f90e3f1055e06b05bae371cf49690d3f832aa83e8c577292c95f2b1f2a917f85bd5fc5888c755dea11276758af6986d1e5323ec20a12a361a4898dff9f2337da80b1c9cda498e71b56c81917ef9a62821fcf49529819510110fd66a0cbf965822ef7f2493181ed373e'

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
  }

  // Fetch destinos do Strapi
  async function fetchDestinos() {
    loading.value = true
    error.value = null
    
    try {
      const response = await fetch(`${STRAPI_URL}/api/destinos`, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        throw new Error(`Erro ao carregar destinos: ${response.status}`)
      }

      const data = await response.json()
      destinos.value = data.data || []
      
      // Se não há destinos do Strapi, usar dados de fallback
      if (destinos.value.length === 0) {
        console.log('Nenhum destino encontrado no Strapi, carregando fallbacks...')
        destinos.value = [
          {
            id: 1,
            attributes: {
              Tipo: 'Orbita da Terra',
              Dias: 3,
              Combustivel: 350000,
              LifeSupport: 25000,
              Seguro: 5000
            }
          },
          {
            id: 2,
            attributes: {
              Tipo: 'Base Lunar',
              Dias: 12,
              Combustivel: 1250000,
              LifeSupport: 35000,
              Seguro: 12500
            }
          },
          {
            id: 3,
            attributes: {
              Tipo: 'Colonia de Marte',
              Dias: 210,
              Combustivel: 4500000,
              LifeSupport: 85000,
              Seguro: 45000
            }
          },
          {
            id: 4,
            attributes: {
              Tipo: 'Aneis de Saturno',
              Dias: 1095,
              Combustivel: 12000000,
              LifeSupport: 150000,
              Seguro: 120000
            }
          }
        ]
      }
      console.log('Destinos carregados do Strapi:', destinos.value)

      // Selecionar primeiro destino por defeito se nenhum selecionado
      if (!destinoSelecionado.value && destinos.value.length > 0) {
        destinoSelecionado.value = destinos.value[0]
      }
    } catch (err) {
      console.error('Erro ao buscar destinos:', err)
      error.value = err.message
      
      // Dados fallback se Strapi não disponível - sempre carrega
      console.log('A carregar dados fallback...')
      destinos.value = [
        {
          id: 1,
          attributes: {
            Tipo: 'Orbita da Terra',
            Dias: 3,
            Combustivel: 350000,
            LifeSupport: 25000,
            Seguro: 5000
          }
        },
        {
          id: 2,
          attributes: {
            Tipo: 'Base Lunar',
            Dias: 12,
            Combustivel: 1250000,
            LifeSupport: 35000,
            Seguro: 12500
          }
        },
        {
          id: 3,
          attributes: {
            Tipo: 'Colonia de Marte',
            Dias: 210,
            Combustivel: 4500000,
            LifeSupport: 85000,
            Seguro: 45000
          }
        },
        {
          id: 4,
          attributes: {
            Tipo: 'Aneis de Saturno',
            Dias: 1095,
            Combustivel: 12000000,
            LifeSupport: 150000,
            Seguro: 120000
          }
        }
      ]
      if (!destinoSelecionado.value && destinos.value.length > 0) {
        destinoSelecionado.value = destinos.value[0]
      }
      console.log('Dados fallback carregados:', destinos.value)
    } finally {
      loading.value = false
    }
  }

  // Selecionar destino
  function selecionarDestino(destino) {
    destinoSelecionado.value = destino
  }

  // Definir kit selecionado
  function setSelectedKit(kitId) {
    selectedKit.value = kitId
    localStorage.setItem('selectedKit', kitId)
  }

  // Definir cliente ID
  function setClienteId(id) {
    clienteId.value = id
    localStorage.setItem('clienteId', id)
  }

  function setClienteData(data) {
    clienteData.value = data
    localStorage.setItem('clienteData', JSON.stringify(data))
  }

  // Buscar cliente pelo email e definir o ID e clienteData
  async function fetchClienteByEmail(email) {
    clienteLoading.value = true
    try {
      const encodedEmail = encodeURIComponent(email)
      const filterUrl = `${STRAPI_URL}/api/clientes?filters[Email][$eq]=${encodedEmail}`

      const response = await fetch(filterUrl, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        throw new Error(`Erro ao buscar cliente: ${response.status}`)
      }

      const data = await response.json()
      if (data.data && data.data.length > 0) {
        const foundCliente = data.data[0]
        const attributes = foundCliente.attributes || {}
        const cliente = {
          id: foundCliente.id,
          nome: attributes.PrimeiroNome || attributes.nome || '',
          sobrenome: attributes.UltimoNome || attributes.sobrenome || '',
          email: attributes.Email || attributes.email || ''
        }

        setClienteId(foundCliente.id)
        setClienteData(cliente)
        return cliente
      }
      return null
    } catch (error) {
      console.error('Erro ao buscar cliente pelo email:', error)
      return null
    } finally {
      clienteLoading.value = false
    }
  }

  // Atualizar número de passageiros
  function setPassageiros(count) {
    if (count >= 1 && count <= 20) {
      numeroPassageiros.value = count
    }
  }

  function incrementarPassageiros() {
    setPassageiros(numeroPassageiros.value + 1)
  }

  function decrementarPassageiros() {
    setPassageiros(numeroPassageiros.value - 1)
  }

  // Atualizar data de lançamento
  function setDataLancamento(data) {
    dataLancamento.value = data
  }

  // Computed: Preços individuais
  const custoCombustivel = computed(() => {
    if (!destinoSelecionado.value) return 0
    return destinoSelecionado.value.Combustivel || destinoSelecionado.value.attributes?.Combustivel || destinoSelecionado.value.combustivel || destinoSelecionado.value.attributes?.combustivel || 0
  })

  const custoLifeSupport = computed(() => {
    if (!destinoSelecionado.value) return 0
    const dias = destinoSelecionado.value.Dias || destinoSelecionado.value.attributes?.Dias || 0
    const lifeSupportDia = destinoSelecionado.value.LifeSupport || destinoSelecionado.value.attributes?.LifeSupport || destinoSelecionado.value.lifeSupport || destinoSelecionado.value.attributes?.lifeSupport || 0
    return dias * lifeSupportDia
  })

  const custoSeguro = computed(() => {
    if (!destinoSelecionado.value) return 0
    return destinoSelecionado.value.Seguro || destinoSelecionado.value.attributes?.Seguro || destinoSelecionado.value.seguro || destinoSelecionado.value.attributes?.seguro || 0
  })

  const custoTrajetoria = computed(() => {
    if (!destinoSelecionado.value) return 0
    return custoCombustivel.value
  })

  const kitPrice = computed(() => {
    switch (selectedKit.value) {
      case 'basico':
        return 1750
      case 'vip':
        return 3250
      default:
        return 2150
    }
  })

  const selectedKitLabel = computed(() => {
    switch (selectedKit.value) {
      case 'basico':
        return 'BÁSICO'
      case 'vip':
        return 'VIP'
      default:
        return 'NORMAL'
    }
  })

  const paymentTotal = computed(() => {
    return custoTotal.value + kitPrice.value
  })

  // Computed: Total
  const custoTotal = computed(() => {
    const lifeSupport = custoLifeSupport.value * numeroPassageiros.value
    const seguro = custoSeguro.value * numeroPassageiros.value
    return custoTrajetoria.value + custoCombustivel.value + lifeSupport + seguro
  })

  // Computed: Nome do destino selecionado
  const nomeDestino = computed(() => {
    if (!destinoSelecionado.value) return ''
    return destinoSelecionado.value.Tipo || destinoSelecionado.value.attributes?.Tipo || ''
  })

  const diasDestino = computed(() => {
    if (!destinoSelecionado.value) return 0
    return destinoSelecionado.value.Dias || destinoSelecionado.value.attributes?.Dias || 0
  })

  // Formatar preço para display
  function formatPrice(value) {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value)
  }

  // Limpar seleção (para logout)
  function reset() {
    destinoSelecionado.value = null
    numeroPassageiros.value = 1
    dataLancamento.value = ''
  }

  return {
    // Estado
    destinos,
    loading,
    error,
    destinoSelecionado,
    numeroPassageiros,
    dataLancamento,
    clienteId,
    clienteData,
    clienteLoading,
    
    // Ações
    fetchDestinos,
    selecionarDestino,
    setSelectedKit,
    setClienteId,
    setClienteData,
    fetchClienteByEmail,
    setPassageiros,
    incrementarPassageiros,
    decrementarPassageiros,
    setDataLancamento,
    reset,
    
    // Getters computados
    custoCombustivel,
    custoLifeSupport,
    custoSeguro,
    custoTrajetoria,
    custoTotal,
    kitPrice,
    selectedKit,
    selectedKitLabel,
    paymentTotal,
    nomeDestino,
    diasDestino,
    formatPrice
  }
})
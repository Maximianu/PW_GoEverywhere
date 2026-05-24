import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useBookingStore = defineStore('booking', () => {
  const missoes = ref([])
  const kits = ref([])
  const loading = ref(false)
  const error = ref(null)

  const getLotacaoMaxima = (missao) => {
    const raw = missao?.Lota ?? missao?.attributes?.Lota ?? missao?.lotacaoMaxima ?? missao?.attributes?.lotacaoMaxima ?? missao?.Lotacao ?? missao?.attributes?.Lotacao
    const parsed = Number(raw)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const getBilhetesVendidos = (missao) => {
    // Support multiple shapes: direct arrays, Strapi v4 attributes.bilhetes.data, or alternative relation name 'missao2'
    const bilhetes = missao?.Bilhetes ?? missao?.bilhetes ?? missao?.attributes?.Bilhetes ?? missao?.attributes?.bilhetes ?? missao?.attributes?.missao2 ?? missao?.missao2
    if (bilhetes == null) return 0
    if (typeof bilhetes === 'number') return bilhetes
    if (Array.isArray(bilhetes)) return bilhetes.length
    if (bilhetes.data && Array.isArray(bilhetes.data)) return bilhetes.data.length
    if (typeof bilhetes === 'object') {
      const count = bilhetes.length ?? bilhetes.data?.length
      if (Number.isFinite(count)) return count
    }
    const parsed = Number(bilhetes)
    return Number.isFinite(parsed) ? parsed : 0
  }

  const missaoSelecionada = ref(null)
  const numeroPassageiros = ref(1)
  const dataLancamento = ref('')
  const storedSelectedKit = localStorage.getItem('selectedKit')
  const selectedKit = ref(storedSelectedKit === 'null' || storedSelectedKit === null ? null : storedSelectedKit || 'normal')
  const clienteId = ref(localStorage.getItem('clienteId') || null)
  const clienteData = ref(localStorage.getItem('clienteData') ? JSON.parse(localStorage.getItem('clienteData')) : null)
  const clienteLoading = ref(false)

  const STRAPI_URL = 'http://localhost:1338'
  const STRAPI_API_TOKEN = 'e5c8410d2d4b81559a226941df1112c58791d9ebfeaf62f90e3f1055e06b05bae371cf49690d3f832aa83e8c577292c95f2b1f2a917f85bd5fc5888c755dea11276758af6986d1e5323ec20a12a361a4898dff9f2337da80b1c9cda498e71b56c81917ef9a62821fcf49529819510110fd66a0cbf965822ef7f2493181ed373e'

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${STRAPI_API_TOKEN}`
  }

  async function fetchMissoes() {
    loading.value = true
    error.value = null

    try {
      // Populate the bilhetes relation so we can count tickets per mission (Strapi v4)
      const response = await fetch(`${STRAPI_URL}/api/missaos?filters[Data][$notNull]=true&filters[Planeta][$notNull]=true&sort=Data:asc&populate=bilhetes`, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        throw new Error(`Erro ao carregar missões: ${response.status}`)
      }

      const data = await response.json()
      missoes.value = data.data || []

      if (missoes.value.length === 0) {
        console.log('Nenhuma missão encontrada no Strapi, carregando fallbacks...')
        missoes.value = [
          {
            id: 1,
            attributes: {
              Nome: 'Órbita Terrestre',
              Data: '2026-10-12',
              Planeta: 'Terra',
              Lota: 3,
              Preco: 120000
            }
          },
          {
            id: 2,
            attributes: {
              Nome: 'Base Lunar',
              Data: '2027-03-01',
              Planeta: 'Lua',
              Lota: 5,
              Preco: 350000
            }
          }
        ]
      }

      if (!missaoSelecionada.value && missoes.value.length > 0) {
        selecionarMissao(missoes.value[0])
      }
    } catch (err) {
      console.error('Erro ao buscar missões:', err)
      error.value = err.message
      missoes.value = [
        {
          id: 1,
          attributes: {
            Nome: 'Órbita Terrestre',
            Data: '2026-10-12',
            Planeta: 'Terra',
            Lota: 3,
            Preco: 120000
          }
        },
        {
          id: 2,
          attributes: {
            Nome: 'Base Lunar',
            Data: '2027-03-01',
            Planeta: 'Lua',
            Lota: 5,
            Preco: 350000
          }
        }
      ]
      if (!missaoSelecionada.value && missoes.value.length > 0) {
        selecionarMissao(missoes.value[0])
      }
    } finally {
      loading.value = false
    }
  }

  async function fetchKits() {
    try {
      const response = await fetch(`${STRAPI_URL}/api/kits?sort=Modelo:asc`, {
        method: 'GET',
        headers
      })

      if (!response.ok) {
        throw new Error(`Erro ao carregar kits: ${response.status}`)
      }

      const data = await response.json()
      kits.value = data.data || []
    } catch (err) {
      console.error('Erro ao buscar kits:', err)
    }
  }

  function selecionarMissao(missao) {
    console.log('Missão selecionada:', missao)
    missaoSelecionada.value = missao
    const lota = missao.Lota || missao.attributes?.Lota || 1
    console.log('Lotação:', lota)
    numeroPassageiros.value = lota
  }

  function setSelectedKit(kitId) {
    if (kitId === null) {
      selectedKit.value = null
      localStorage.removeItem('selectedKit')
      return
    }

    selectedKit.value = kitId
    localStorage.setItem('selectedKit', kitId)
  }

  function setClienteId(id) {
    clienteId.value = id
    localStorage.setItem('clienteId', id)
  }

  function setClienteData(data) {
    clienteData.value = data
    localStorage.setItem('clienteData', JSON.stringify(data))
  }

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
          primeiroNome: attributes.PrimeiroNome || attributes.primeiroNome || attributes.Nome || attributes.nome || attributes.firstName || '',
          ultimoNome: attributes.UltimoNome || attributes.ultimoNome || attributes.sobrenome || attributes.lastName || '',
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

  function setDataLancamento(data) {
    dataLancamento.value = data
  }

  const lotacaoDisponivel = computed(() => {
    const missao = missaoSelecionada.value
    if (!missao) return 0
    console.log("lotacao max: ", getLotacaoMaxima(missao))
    console.log("bilhetes vendidos: ", getBilhetesVendidos(missao))
    return Math.max(0, getLotacaoMaxima(missao) - getBilhetesVendidos(missao))
  })

  const missoesDisponiveis = computed(() => {
    return missoes.value.filter((missao) => {
      return getLotacaoMaxima(missao) - getBilhetesVendidos(missao) > 0
    })
  })

  const custoMissao = computed(() => {
    if (!missaoSelecionada.value) return 0
    return missaoSelecionada.value.Preco || missaoSelecionada.value.attributes?.Preco || 0
  })

  const kitPrice = computed(() => {
    switch (selectedKit.value) {
      case 'basico':
        return 1750
      case 'vip':
        return 3250
      default:
        return selectedKit.value === null ? 0 : 2150
    }
  })

  const selectedKitLabel = computed(() => {
    if (selectedKit.value === null) {
      return 'REGISTAR EQUIPAMENTO'
    }
    switch (selectedKit.value) {
      case 'basico':
        return 'BÁSICO'
      case 'vip':
        return 'VIP'
      default:
        return 'NORMAL'
    }
  })

  const selectedKitId = computed(() => {
    if (selectedKit.value === null) return null
    const normalized = String(selectedKit.value).toLowerCase()
    const mappedModel = {
      basico: 'básico',
      normal: 'normal',
      vip: 'vip'
    }[normalized] || normalized

    const foundKit = kits.value.find((kit) => {
      const modelo = String(kit.Modelo || kit.modelo || kit.attributes?.Modelo || kit.attributes?.modelo || '').toLowerCase()
      return modelo === mappedModel || modelo.includes(mappedModel)
    })

    if (foundKit) {
      return foundKit.documentId || foundKit.id
    }

    return Number.isFinite(Number(selectedKit.value)) ? Number(selectedKit.value) : null
  })

  const custoTotal = computed(() => custoMissao.value)

  const paymentTotal = computed(() => {
    return Number(custoTotal.value) + Number(kitPrice.value)
  })

  const nomeMissao = computed(() => {
    if (!missaoSelecionada.value) return ''
    return missaoSelecionada.value.Nome || missaoSelecionada.value.attributes?.Nome || ''
  })

  const dataMissao = computed(() => {
    if (!missaoSelecionada.value) return ''
    return missaoSelecionada.value.Data || missaoSelecionada.value.attributes?.Data || ''
  })

  const planetaMissao = computed(() => {
    if (!missaoSelecionada.value) return ''
    return missaoSelecionada.value.Planeta || missaoSelecionada.value.attributes?.Planeta || ''
  })

  const formatPrice = (value) => {
    return new Intl.NumberFormat('pt-PT', {
      style: 'currency',
      currency: 'EUR',
      maximumFractionDigits: 0
    }).format(value)
  }

  function reset() {
    missaoSelecionada.value = null
    numeroPassageiros.value = 1
    dataLancamento.value = ''
    selectedKit.value = 'normal'
    localStorage.removeItem('selectedKit')
  }

  return {
    missoes,
    kits,
    loading,
    error,
    missaoSelecionada,
    numeroPassageiros,
    dataLancamento,
    selectedKit,
    clienteId,
    clienteData,
    clienteLoading,

    fetchMissoes,
    fetchKits,
    selecionarMissao,
    setSelectedKit,
    setClienteId,
    setClienteData,
    fetchClienteByEmail,
    setPassageiros,
    incrementarPassageiros,
    decrementarPassageiros,
    setDataLancamento,
    reset,

    custoMissao,
    kitPrice,
    selectedKitLabel,
    selectedKitId,
    paymentTotal,
    nomeMissao,
    dataMissao,
    planetaMissao,
    formatPrice,
    lotacaoDisponivel,
    missoesDisponiveis
  }
})
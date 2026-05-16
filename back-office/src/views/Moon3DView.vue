<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, computed } from 'vue'
import { useRouter } from 'vue-router'
import { Settings, Home, MapPin, Calendar, Clock, Trash2, ChevronUp, ChevronDown } from 'lucide-vue-next'

const containerRef = ref(null)
const router = useRouter()
const selectedPoint = ref(null)
const isLoading = ref(true)
const labelsContainer = ref(null)

const todayDate = computed(() => {
  const hoje = new Date()
  const ano = hoje.getFullYear()
  const mes = String(hoje.getMonth() + 1).padStart(2, '0')
  const dia = String(hoje.getDate()).padStart(2, '0')
  return `${ano}-${mes}-${dia}`
})

const planetaOptions = [
  { value: 'Lua', label: 'Lua' },
  { value: 'Marte', label: 'Marte' },
  { value: 'Terra', label: 'Órbita Terrestre' }
]

const lotacaoOptions = [5, 10, 15, 20]
const precoOptions = [100000, 200000, 400000]
const cargaOptions = [500, 1000, 1500]
const hourOptions = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const minuteOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))
const secondOptions = Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0'))

const showPlanetaOptions = ref(false)
const showLotacaoOptions = ref(false)
const showPrecoOptions = ref(false)
const showCargaOptions = ref(false)
const showTimePicker = ref(false)
const dateInputRef = ref(null)
const isDatePickerOpen = ref(false)

const showMissionModal = ref(false)
const missionPlanet = ref('')
const missionForm = ref({
  Nome: '',
  Planeta: '',
  Lota: '',
  Data: '',
  Hora_Partida: '',
  Carga: '',
  Preco: '',
  X: 0,
  Y: 0,
  Z: 0
})

const closeComboOptions = () => {
  showPlanetaOptions.value = false
  showLotacaoOptions.value = false
  showPrecoOptions.value = false
  showCargaOptions.value = false
  showTimePicker.value = false
  closeDatePicker()
}

const closeFieldOptions = (except = '') => {
  showPlanetaOptions.value = except === 'planeta' ? showPlanetaOptions.value : false
  showLotacaoOptions.value = except === 'lotacao' ? showLotacaoOptions.value : false
  showPrecoOptions.value = except === 'preco' ? showPrecoOptions.value : false
  showCargaOptions.value = except === 'carga' ? showCargaOptions.value : false
  showTimePicker.value = except === 'time' ? showTimePicker.value : false
  if (except !== 'date') closeDatePicker()
}

function closeDatePicker () {
  isDatePickerOpen.value = false
  dateInputRef.value?.blur()
}

const toggleDatePicker = async () => {
  const wasOpen = isDatePickerOpen.value
  closeFieldOptions('date')

  if (wasOpen) {
    closeDatePicker()
    return
  }

  isDatePickerOpen.value = true
  await nextTick()

  if (typeof dateInputRef.value?.showPicker === 'function') {
    dateInputRef.value.showPicker()
  } else {
    dateInputRef.value?.focus()
  }
}

const toggleTimePicker = () => {
  showTimePicker.value = !showTimePicker.value
  closeFieldOptions('time')
}

const selectedHour = computed(() => (missionForm.value.Hora_Partida || '').split(':')[0] || '')
const selectedMinute = computed(() => (missionForm.value.Hora_Partida || '').split(':')[1] || '')
const selectedSecond = computed(() => (missionForm.value.Hora_Partida || '').split(':')[2] || '')

const selectTimePart = (part, value) => {
  const hour = part === 'hour' ? value : (selectedHour.value || '09')
  const minute = part === 'minute' ? value : (selectedMinute.value || '00')
  const second = part === 'second' ? value : (selectedSecond.value || '00')
  missionForm.value.Hora_Partida = `${hour}:${minute}:${second}`
}

const selectPlaneta = (value) => {
  missionForm.value.Planeta = value
  missionPlanet.value = getPlanetaLabel(value) || value
  showPlanetaOptions.value = false
  closeFieldOptions()

  const layoutByPlanet = {
    Lua: 'moon',
    Marte: 'mars',
    Terra: 'earth'
  }

  const targetLayout = layoutByPlanet[value]
  if (targetLayout) startWarp(targetLayout)
}

const getPlanetaLabel = (value) => {
  return planetaOptions.find(option => option.value === value)?.label || ''
}

const selectLotacao = (value) => {
  missionForm.value.Lota = value
  showLotacaoOptions.value = false
}

const selectPreco = (value) => {
  missionForm.value.Preco = value
  showPrecoOptions.value = false
}

const selectCarga = (value) => {
  missionForm.value.Carga = value
  showCargaOptions.value = false
}

const formatNumber = (value) => {
  const number = Number(value || 0)
  return number.toLocaleString('pt-PT')
}

const goToMissionPlanet = (mission) => {
  const layoutByPlanet = {
    Lua: 'moon',
    Marte: 'mars',
    Terra: 'earth'
  }

  const targetLayout = layoutByPlanet[mission.Planeta]
  if (targetLayout) startWarp(targetLayout)
}

const adjustPosition = (axis, amount) => {
  const current = Number(missionForm.value[axis]) || 0
  missionForm.value[axis] = current + amount
}

const openMission = (planet = '') => {
  missionPlanet.value = planet
  missionForm.value = {
    Nome: '',
    Planeta: planet || 'Terra',
    Lota: '',
    Data: todayDate.value,
    Hora_Partida: '',
    Carga: '',
    Preco: '',
    X: 0,
    Y: 0,
    Z: 0
  }
  closeComboOptions()
  showMissionModal.value = true
  selectedPoint.value = null
}

const isSubmitting = ref(false)

const submitMission = async () => {
  isSubmitting.value = true
  try {
    const payload = { data: { ...missionForm.value } }

    if (payload.data.Lota) payload.data.Lota = parseInt(payload.data.Lota)
    if (payload.data.Preco) payload.data.Preco = parseInt(payload.data.Preco)
    if (payload.data.Carga) payload.data.Carga = parseInt(payload.data.Carga)
    payload.data.X = parseFloat(payload.data.X) || 0
    payload.data.Y = parseFloat(payload.data.Y) || 0
    payload.data.Z = parseFloat(payload.data.Z) || 0

    const response = await fetch('http://127.0.0.1:1338/api/missaos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    })

    if (response.ok) {
      showMissionModal.value = false
      await loadMissions()
    } else {
      const err = await response.json()
      alert('Falha ao criar a missão: ' + (err.error?.message || 'Erro desconhecido'))
    }
  } catch (error) {
    console.error(error)
    alert('Erro ao ligar ao servidor.')
  } finally {
    isSubmitting.value = false
  }
}

const deleteMission = async (mission) => {
  const confirmDelete = window.confirm(`Tens a certeza que queres apagar a missão "${mission.Nome || 'Sem Nome'}"?`)
  if (!confirmDelete) return

  try {
    const id = mission.documentId || mission.id
    const res = await fetch(`http://127.0.0.1:1338/api/missaos/${id}`, { method: 'DELETE' })
    if (res.ok) {
      await loadMissions()
    } else {
      alert('Erro ao apagar a missão.')
    }
  } catch (e) {
    console.error(e)
    alert('Erro ao ligar ao servidor.')
  }
}

const allMissions = ref([])
const showMissionsDrawer = ref(false)
const isLoadingMissions = ref(false)

const openMissionsDrawer = () => {
  showMissionsDrawer.value = true
  loadMissions()
}

const loadMissions = async () => {
  isLoadingMissions.value = true
  try {
    const res = await fetch('http://127.0.0.1:1338/api/missaos?populate[bilhetes][populate]=cliente')
    const json = await res.json()
    allMissions.value = json.data || []
    renderDynamicMissions(allMissions.value)
  } catch (error) {
    console.error('Erro ao buscar missões do Strapi:', error)
  } finally {
    isLoadingMissions.value = false
  }
}

const dynamicPoints = ref([])
const dynamicMissionMeshes = []

const renderDynamicMissions = (missions) => {
  if (!moon || !earth || !mars) {
    setTimeout(() => renderDynamicMissions(missions), 500)
    return
  }

  dynamicMissionMeshes.forEach(mesh => {
    if (mesh.parent) mesh.parent.remove(mesh)
    const idx = points.indexOf(mesh.children[0])
    if (idx > -1) points.splice(idx, 1)
  })

  dynamicMissionMeshes.length = 0
  dynamicPoints.value = []

  missions.forEach(m => {
    if (!m.X && !m.Y && !m.Z) return

    let targetPlanet, radius
    if (m.Planeta === 'Lua') {
      targetPlanet = moon
      radius = 100
    } else if (m.Planeta === 'Terra') {
      targetPlanet = earth
      radius = 145
    } else if (m.Planeta === 'Marte') {
      targetPlanet = mars
      radius = 55
    } else {
      return
    }

    const v = new window.THREE.Vector3(m.X, m.Y, m.Z).normalize()
    if (v.lengthSq() === 0) return

    const missionColor = 0xff3dcb
    const pin = createPinMesh(missionColor)
    if (targetPlanet === earth) pin.scale.set(1.2, 1.2, 1.2)
    else if (targetPlanet === mars) pin.scale.set(0.7, 0.7, 0.7)

    pin.position.copy(v.clone().multiplyScalar(radius))
    pin.quaternion.setFromUnitVectors(new window.THREE.Vector3(0, 1, 0), v)

    const pointData = {
      id: 'dyn_' + (m.documentId || m.id),
      name: m.Nome || 'Sem Nome',
      description: `Data: ${m.Data} | Hora Partida: ${m.Hora_Partida} | Lotação: ${m.Lota} pessoas | Preço: ${formatNumber(m.Preco)} €`,
      date: m.Data,
      color: missionColor,
      isDynamic: true,
      planet: m.Planeta
    }

    pin.children[0].userData = pointData
    targetPlanet.add(pin)
    points.push(pin.children[0])
    dynamicMissionMeshes.push(pin)
    dynamicPoints.value.push(pointData)
  })

  nextTick(updateLabels)
}

let scene, camera, renderer, moon, earth, mars, raycaster, mouse, stars, warpLines
let moonWrapper, earthWrapper, marsWrapper
let isDragging = ref(false)
let dragStartPosition = { x: 0, y: 0 }

let currentLayout = 'moon'
let activeMainPlanet = null
let isWarping = false
let warpProgress = 0
let warpSourceLayout = null
let warpTargetLayout = null

const layouts = {
  moon: {
    moon: { pos: [0, 0, 0], scale: 1, squish: [1, 1, 1] },
    earth: { pos: [1330, 300, -2140], scale: 1, squish: [1, 1, 1] },
    mars: { pos: [550, 700, -1580], scale: 1, squish: [1, 1, 1] }
  },
  earth: {
    earth: { pos: [0, 0, 0], scale: 100 / 145, squish: [1, 1, 1] },
    mars: { pos: [-1000, 500, -2780], scale: 1.4, squish: [1, 1, 1] },
    moon: { pos: [1330, 300, -2140], scale: 1.6, squish: [1, 1, 1] }
  },
  mars: {
    mars: { pos: [0, 0, 0], scale: 100 / 55, squish: [1, 1, 1] },
    earth: { pos: [1330, 300, -2140], scale: 1, squish: [1, 1, 1] },
    moon: { pos: [550, 700, -1580], scale: 55 / 100, squish: [1, 1, 1] }
  }
}

const lerp = (a, b, t) => a + (b - a) * t
const smoothStep = t => t * t * (3 - 2 * t)

const lerpArc = (fromPos, toPos, t, swingUnits = 400) => {
  const lx = lerp(fromPos[0], toPos[0], t)
  const ly = lerp(fromPos[1], toPos[1], t)
  const lz = lerp(fromPos[2], toPos[2], t)

  const arcPeak = Math.sin(Math.PI * t)

  const dx = toPos[0] - fromPos[0]
  const dz = toPos[2] - fromPos[2]
  const horizLen = Math.sqrt(dx * dx + dz * dz) || 1

  const perpX = -dz / horizLen
  const perpZ = dx / horizLen

  return [
    lx + perpX * swingUnits * arcPeak,
    ly,
    lz + perpZ * swingUnits * arcPeak
  ]
}

const applyInterpolatedLayout = (t) => {
  if (!warpSourceLayout || !warpTargetLayout) return

  ;['moon', 'earth', 'mars'].forEach(pName => {
    const wrapper =
      pName === 'moon' ? moonWrapper
        : pName === 'earth' ? earthWrapper
          : marsWrapper

    const mesh =
      pName === 'moon' ? moon
        : pName === 'earth' ? earth
          : mars

    if (!wrapper || !mesh) return

    const from = warpSourceLayout[pName]
    const to = warpTargetLayout[pName]

    const fromIsCenter = from.pos[0] === 0 && from.pos[1] === 0 && from.pos[2] === 0
    const toIsCenter = to.pos[0] === 0 && to.pos[1] === 0 && to.pos[2] === 0
    const swing = (fromIsCenter || toIsCenter) ? 380 : 220

    const newPos = lerpArc(from.pos, to.pos, t, swing)
    wrapper.position.set(newPos[0], newPos[1], newPos[2])

    mesh.scale.set(
      lerp(from.scale * from.squish[0], to.scale * to.squish[0], t),
      lerp(from.scale * from.squish[1], to.scale * to.squish[1], t),
      lerp(from.scale * from.squish[2], to.scale * to.squish[2], t)
    )
  })
}

const startWarp = (targetLayoutName) => {
  if (isWarping || currentLayout === targetLayoutName) return

  selectedPoint.value = null
  isWarping = true
  warpProgress = 0
  warpSourceLayout = layouts[currentLayout]
  warpTargetLayout = layouts[targetLayoutName]
  currentLayout = targetLayoutName

  if (currentLayout === 'moon') activeMainPlanet = moon
  else if (currentLayout === 'earth') activeMainPlanet = earth
  else if (currentLayout === 'mars') activeMainPlanet = mars
}

const points = []
let animationId = null
const flyingObjects = []

const MODEL_SCALE = {
  rocket: 3.2,
  astronaut: 0.32,
  ice: 0.95
}

const moonPoints = [
  { id: 1, name: 'Apollo 11', description: 'A histórica missão da NASA que levou os primeiros seres humanos à superfície lunar. Neil Armstrong e Buzz Aldrin exploraram o Mar da Tranquilidade enquanto Michael Collins os aguardava em órbita. Este marco monumental ocorreu no auge da Corrida Espacial, mudando para sempre a nossa compreensão sobre os limites da exploração espacial e demonstrando a incrível capacidade da engenharia humana.', date: 'Julho 1969', color: 0x00f2ff, x: 50, y: 20, z: 80 },
  { id: 2, name: 'Apollo 12', description: 'A segunda aterragem tripulada, que se destacou pela sua enorme precisão. A tripulação aterrou a uma curta distância da sonda Surveyor 3, no Oceano das Tormentas, permitindo-lhes recuperar peças que estavam expostas ao ambiente lunar há anos. O voo enfrentou momentos de tensão após ser atingido por um raio durante a descolagem, mas a missão foi um sucesso estrondoso.', date: 'Novembro 1969', color: 0xff6b6b, x: -60, y: -30, z: 70 },
  { id: 3, name: 'Apollo 15', description: 'A primeira das missões "J" da Apollo, desenhada para uma permanência mais prolongada e exploração científica mais profunda. Introduziu o icónico Lunar Roving Vehicle (LRV), permitindo aos astronautas percorrer distâncias inéditas na zona de Hadley-Apennine. A missão recolheu amostras vitais de rocha, incluindo a famosa Rocha do Génesis, revolucionando os estudos lunares.', date: 'Julho 1971', color: 0xffd93d, x: -20, y: 70, z: 60 },
  { id: 4, name: "Chang'e 4", description: 'Uma missão pioneira da agência espacial chinesa, tornando-se a primeira sonda a efetuar uma alunagem suave no lado oculto da Lua. Pousou na cratera Von Kármán, transmitindo dados através de um satélite de retransmissão estrategicamente posicionado. Esta missão abriu as portas a estudos de radioastronomia num ambiente livre de interferências terrestres.', date: 'Janeiro 2019', color: 0x6bcf7f, x: 80, y: -60, z: -20 },
  { id: 5, name: 'Artemis I', description: 'O voo inaugural sem tripulação do monumental foguetão SLS e da nave Orion. Viajou até à Lua e colocou-se em órbita retrógrada, atestando a segurança e o desempenho de todos os sistemas críticos. Este passo crucial foi desenhado para testar as capacidades de reentrada na atmosfera terrestre a alta velocidade, certificando as bases para o futuro retorno humano.', date: 'Novembro 2022', color: 0xa78bfa, x: 10, y: 90, z: 20 },
  { id: 10, name: 'Artemis II', description: 'A primeira missão tripulada do programa Artemis. Quatro astronautas farão uma viagem à volta da Lua, testando os sistemas de suporte de vida e navegação em espaço profundo da nave Orion. Esta missão histórica não só assinala o regresso da humanidade às redondezas lunares desde a era Apollo, mas também prepara as fundações cruciais para futuras missões a Marte.', date: 'Novembro 2025', color: 0x38b6ff, x: -80, y: 10, z: 40 },
  { id: 20, name: '+ Criar Missão', isMissionPoint: true, planet: 'Lua', color: 0xffffff, x: 30, y: -80, z: 50 }
]

const marsPoints = [
  { id: 6, name: 'Perseverance', description: 'Um rover altamente avançado desenhado para investigar astrobiologia e procurar vestígios de vida microbiana antiga. Aterrou na Cratera Jezero, onde outrora existiu um lago e um delta de rio. Em conjunto com o helicóptero Ingenuity, tem recolhido e armazenado amostras vitais de rochas marcianas que deverão ser trazidas de volta à Terra em missões futuras.', date: 'Fevereiro 2021', color: 0xff4500, x: 60, y: 50, z: 50 },
  { id: 7, name: 'Curiosity', description: 'Aterrou de forma espetacular com a ajuda de um "sky crane" na Cratera Gale. O seu principal objetivo é estudar o clima e a geologia, determinando se a região alguma vez ofereceu condições favoráveis à vida microbiana. Equipado com um poderoso laboratório móvel a laser e vários sensores, alterou fundamentalmente o nosso conhecimento sobre o passado húmido de Marte.', date: 'Agosto 2012', color: 0x00ff00, x: 80, y: -30, z: 30 },
  { id: 8, name: 'Viking 1', description: 'A primeira parte da missão Viking e a primeira sonda americana a realizar uma aterragem suave no planeta vermelho. Tocou o solo em Chryse Planitia e tirou as primeiras fotos panorâmicas a cores da superfície marciana. O lander e o orbiter executaram diversas experiências biológicas que ainda hoje são analisadas e geram debate sobre os seus resultados controversos.', date: 'Julho 1976', color: 0xffd700, x: -60, y: 60, z: 40 },
  { id: 9, name: 'Opportunity', description: 'Um dos rovers gémeos da missão MER, aterrou no Meridiani Planum e revelou provas conclusivas de que a água líquida já fluiu em Marte. Originalmente concebido para uma missão de apenas 90 dias, o pequeno e robusto veículo surpreendeu a todos ao permanecer ativo por incríveis 15 anos. Explorou diversas crateras até se silenciar devido a uma colossal tempestade de poeira global.', date: 'Janeiro 2004', color: 0x00f2ff, x: -30, y: -50, z: 80 },
  { id: 21, name: '+ Criar Missão', isMissionPoint: true, planet: 'Marte', color: 0xffffff, x: -40, y: -70, z: 40 }
]

const earthPoints = [
  {
    id: 11,
    name: 'Órbita Baixa',
    description: 'A órbita terrestre baixa (LEO) situa-se entre 200 e 2000 km de altitude. É onde circula a Estação Espacial Internacional, satélites de observação e as constelações de internet por satélite como a Starlink. A maioria das missões tripuladas opera nesta faixa, onde a Terra ainda ocupa grande parte do céu.',
    date: 'Contínuo',
    color: 0x00f2ff,
    orbitRadius: 175,
    orbitAngle: 0.3
  },
  {
    id: 12,
    name: 'Órbita Alta',
    description: 'A órbita geoestacionária (GEO) fica a cerca de 35 786 km de altitude, onde os satélites orbitam à mesma velocidade que a rotação terrestre, parecendo fixos no céu. É usada para telecomunicações, meteorologia e transmissão televisiva. Daqui, um único satélite cobre quase 40% da superfície da Terra.',
    date: 'Contínuo',
    color: 0xffd93d,
    orbitRadius: 220,
    orbitAngle: Math.PI * 1.25
  },
  {
    id: 22,
    name: '+ Criar Missão',
    isMissionPoint: true,
    planet: 'Terra',
    color: 0xffffff,
    x: 60,
    y: 80,
    z: 60
  }
]

const orbitRings = []
const randomBetween = (min, max) => min + Math.random() * (max - min)

const RESTRICTED_ZONES = [
  { pos: [0, 0, 0], radius: 250 },
  { pos: [1330, 300, -2140], radius: 350 },
  { pos: [550, 700, -1580], radius: 200 },
  { pos: [-1000, 500, -2780], radius: 250 }
]

const isSafeFromPlanets = (x, y, z) => {
  for (const zone of RESTRICTED_ZONES) {
    const dx = x - zone.pos[0]
    const dy = y - zone.pos[1]
    const dz = z - zone.pos[2]
    if (dx * dx + dy * dy + dz * dz < zone.radius * zone.radius) return false
  }
  return true
}

const safeLateralPos = (zVal, isRocket = false) => {
  const lateral = (isRocket && Math.random() < 0.4)
    ? randomBetween(50, 250)
    : randomBetween(300, 1500)

  const signX = Math.random() > 0.5 ? 1 : -1
  const signY = Math.random() > 0.5 ? 1 : -1

  return {
    x: signX * lateral * (0.5 + Math.random()),
    y: signY * lateral * (0.5 + Math.random())
  }
}

const createOrbitalCurve = (type = 'default') => {
  const isComing = Math.random() > 0.5
  const farZ = -2800
  let nearZ

  if (type === 'rocket') nearZ = Math.random() < 0.60 ? randomBetween(750, 950) : randomBetween(450, 700)
  else if (type === 'astronaut') nearZ = randomBetween(300, 500)
  else nearZ = randomBetween(250, 450)

  const startZ = isComing ? farZ : nearZ
  const endZ = isComing ? nearZ : farZ

  const buildSafePoint = (z) => {
    let attempt = 0
    while (attempt++ < 50) {
      const { x, y } = safeLateralPos(z, type === 'rocket')
      if (isSafeFromPlanets(x, y, z)) return new THREE.Vector3(x, y, z)
    }

    return new THREE.Vector3(
      randomBetween(1000, 2000) * (Math.random() > 0.5 ? 1 : -1),
      randomBetween(800, 1500) * (Math.random() > 0.5 ? 1 : -1),
      z
    )
  }

  const midZ = (startZ + endZ) / 2 + randomBetween(50, 250)
  const curvePoints = []

  if (isComing) {
    curvePoints.push(buildSafePoint(startZ))
    curvePoints.push(buildSafePoint(midZ))
    if (type === 'rocket' && Math.random() < 0.35) {
      curvePoints.push(new window.THREE.Vector3(randomBetween(-70, 70), randomBetween(-50, 50), 220))
    }
    curvePoints.push(buildSafePoint(endZ))
  } else {
    curvePoints.push(buildSafePoint(startZ))
    if (type === 'rocket' && Math.random() < 0.35) {
      curvePoints.push(new window.THREE.Vector3(randomBetween(-70, 70), randomBetween(-50, 50), 220))
    }
    curvePoints.push(buildSafePoint(midZ))
    curvePoints.push(buildSafePoint(endZ))
  }

  return new window.THREE.CatmullRomCurve3(curvePoints, false, 'catmullrom', 0.5)
}

const initThreeJS = () => {
  const container = containerRef.value
  if (!container) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 5000)
  camera.position.z = 550

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  scene.add(new window.THREE.AmbientLight(0xffffff, 0.45))

  const sunLight = new window.THREE.DirectionalLight(0xffffff, 0.9)
  sunLight.position.set(10, 5, 10)
  scene.add(sunLight)

  createStars()
  createWarpLines()
  loadMoon()
  loadPlanets()

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  window.addEventListener('mousemove', onMouseMove)
  container.addEventListener('click', onContainerClick)
  window.addEventListener('resize', onWindowResize)

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && isWarping) {
      e.preventDefault()
      applyInterpolatedLayout(1)
      isWarping = false
      warpProgress = 0
      camera.fov = 45
      if (warpLines) {
        warpLines.material.opacity = 0
        warpLines.scale.z = 1
      }
      if (stars) stars.material.opacity = 1
      camera.updateProjectionMatrix()
    }
  })

  let prevMouse = { x: 0, y: 0 }

  container.addEventListener('mousedown', (e) => {
    dragStartPosition = { x: e.clientX, y: e.clientY }

    const rect = container.getBoundingClientRect()
    mouse.x = ((e.clientX - rect.left) / container.clientWidth) * 2 - 1
    mouse.y = -((e.clientY - rect.top) / container.clientHeight) * 2 + 1
    raycaster.setFromCamera(mouse, camera)

    const planetHits = activeMainPlanet
      ? raycaster.intersectObject(activeMainPlanet, true)
      : []

    if (planetHits.length === 0) return

    isDragging.value = true
    prevMouse = { x: e.clientX, y: e.clientY }
  })

  window.addEventListener('mousemove', (e) => {
    if (isDragging.value && activeMainPlanet) {
      activeMainPlanet.rotation.y += (e.clientX - prevMouse.x) * 0.005
      activeMainPlanet.rotation.x += (e.clientY - prevMouse.y) * 0.005
      prevMouse = { x: e.clientX, y: e.clientY }
      if (activeMainPlanet === moon) updateLabels()
    }
  })

  window.addEventListener('mouseup', () => {
    setTimeout(() => isDragging.value = false, 50)
  })

  loadModels()
  animate()
}

const loadModels = () => {
  const loader = new window.THREE.GLTFLoader()
  const dracoLoader = new window.THREE.DRACOLoader()

  dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/')
  loader.setDRACOLoader(dracoLoader)

  const config = [
    { name: 'rocket', path: '/models/Explorer_Jupiter-C_Rocket.glb', scale: MODEL_SCALE.rocket, speed: 0.0004 },
    { name: 'rocket', path: '/models/Explorer_Jupiter-C_Rocket.glb', scale: MODEL_SCALE.rocket * 0.8, speed: 0.00035 },
    { name: 'rocket', path: '/models/Explorer_Jupiter-C_Rocket.glb', scale: MODEL_SCALE.rocket * 0.7, speed: 0.0003 },
    { name: 'rocket', path: '/models/Explorer_Jupiter-C_Rocket.glb', scale: MODEL_SCALE.rocket * 1.1, speed: 0.00045 },
    { name: 'rocket', path: '/models/Explorer_Jupiter-C_Rocket.glb', scale: MODEL_SCALE.rocket * 0.9, speed: 0.0005 },
    { name: 'rocket', path: '/models/Explorer_Jupiter-C_Rocket.glb', scale: MODEL_SCALE.rocket * 0.6, speed: 0.00025 },
    { name: 'rocket', path: '/models/Explorer_Jupiter-C_Rocket.glb', scale: MODEL_SCALE.rocket * 0.75, speed: 0.00038 },
    { name: 'astronaut', path: '/models/Astronaut.glb', scale: MODEL_SCALE.astronaut, speed: 0.0003 },
    { name: 'astronaut', path: '/models/Astronaut.glb', scale: MODEL_SCALE.astronaut, speed: 0.00025 },
    { name: 'astronaut', path: '/models/Astronaut.glb', scale: MODEL_SCALE.astronaut * 1.1, speed: 0.00032 },
    { name: 'ice', path: '/models/Aeronomy_of_Ice_in_the_Mesosphere.glb', scale: MODEL_SCALE.ice, speed: 0.00035 },
    { name: 'ice', path: '/models/Aeronomy_of_Ice_in_the_Mesosphere.glb', scale: MODEL_SCALE.ice * 0.9, speed: 0.0003 }
  ]

  config.forEach(objCfg => {
    loader.load(objCfg.path, (gltf) => {
      const model = gltf.scene
      model.scale.set(objCfg.scale, objCfg.scale, objCfg.scale)
      scene.add(model)

      flyingObjects.push({
        mesh: model,
        type: objCfg.name,
        curve: createOrbitalCurve(objCfg.name),
        speed: objCfg.speed,
        t: Math.random(),
        rotSpeed: {
          x: randomBetween(0.002, 0.008),
          y: randomBetween(0.002, 0.008),
          z: randomBetween(0.002, 0.008)
        }
      })
    })
  })
}

const updateFlyingObjects = () => {
  const pos = new THREE.Vector3()
  const next = new THREE.Vector3()

  flyingObjects.forEach(obj => {
    obj.t += obj.speed

    if (obj.t >= 1) {
      obj.t = 0
      obj.curve = createOrbitalCurve(obj.type)
    }

    obj.curve.getPoint(obj.t, pos)
    obj.mesh.position.copy(pos)

    if (obj.type.includes('astronaut')) {
      obj.mesh.rotation.x += obj.rotSpeed.x
      obj.mesh.rotation.y += obj.rotSpeed.y
    } else {
      obj.curve.getPoint(Math.min(obj.t + 0.01, 1), next)
      obj.mesh.lookAt(next)
      if (obj.type.includes('rocket')) obj.mesh.rotateX(Math.PI / 2)
    }
  })
}

const createStars = () => {
  const geo = new THREE.BufferGeometry()
  const vertices = []

  for (let i = 0; i < 4000; i++) {
    let x, y, z
    do {
      x = (Math.random() - 0.5) * 6000
      y = (Math.random() - 0.5) * 6000
      z = (Math.random() - 0.5) * 6000
    } while (x * x + y * y + z * z < 2500 * 2500)

    vertices.push(x, y, z)
  }

  geo.setAttribute('position', new window.THREE.BufferAttribute(new Float32Array(vertices), 3))

  stars = new window.THREE.Points(
    geo,
    new window.THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.7,
      transparent: true,
      opacity: 1
    })
  )

  scene.add(stars)
}

const createWarpLines = () => {
  const geo = new window.THREE.BufferGeometry()
  const vertices = []

  for (let i = 0; i < 4000; i++) {
    let x, y
    do {
      x = randomBetween(-1500, 1500)
      y = randomBetween(-1500, 1500)
    } while (x * x + y * y < 300 * 300)

    const z = randomBetween(-5000, 1000)
    const length = randomBetween(60, 150)
    vertices.push(x, y, z)
    vertices.push(x, y, z + length)
  }

  geo.setAttribute('position', new window.THREE.BufferAttribute(new Float32Array(vertices), 3))

  warpLines = new window.THREE.LineSegments(
    geo,
    new window.THREE.LineBasicMaterial({
      color: 0x88ccff,
      transparent: true,
      opacity: 0,
      blending: window.THREE.AdditiveBlending
    })
  )

  scene.add(warpLines)
}

const createPinMesh = (color) => {
  const pinGroup = new window.THREE.Group()
  const headGeo = new window.THREE.SphereGeometry(2, 16, 16)
  const headMat = new window.THREE.MeshBasicMaterial({ color })
  const head = new window.THREE.Mesh(headGeo, headMat)
  pinGroup.add(head)
  return pinGroup
}

const createOrbitRing = (radius, color) => {
  const segments = 128
  const geo = new window.THREE.BufferGeometry()
  const verts = []

  for (let i = 0; i <= segments; i++) {
    const angle = (i / segments) * Math.PI * 2
    verts.push(Math.cos(angle) * radius, Math.sin(angle) * radius, 0)
  }

  geo.setAttribute('position', new window.THREE.BufferAttribute(new Float32Array(verts), 3))

  const mat = new window.THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity: 0.6,
    depthTest: true
  })

  return new window.THREE.Line(geo, mat)
}

const loadMoon = () => {
  new THREE.TextureLoader().load('/moon.jpg', (tex) => {
    moon = new THREE.Mesh(
      new THREE.SphereGeometry(100, 64, 64),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, metalness: 0.2 })
    )

    moonPoints.forEach(p => {
      const v = new window.THREE.Vector3(p.x, p.y, p.z).normalize()
      const pin = createPinMesh(p.color)

      pin.position.copy(v.clone().multiplyScalar(100))
      pin.quaternion.setFromUnitVectors(new window.THREE.Vector3(0, 1, 0), v)

      pin.children[0].userData = p
      moon.add(pin)
      points.push(pin.children[0])
    })

    moonWrapper = new window.THREE.Group()
    moonWrapper.add(moon)
    scene.add(moonWrapper)

    isLoading.value = false
    activeMainPlanet = moon

    nextTick(updateLabels)
  })
}

const loadPlanets = () => {
  const texLoader = new window.THREE.TextureLoader()

  texLoader.load('/terra.jpg', (tex) => {
    earth = new window.THREE.Mesh(
      new window.THREE.SphereGeometry(145, 64, 64),
      new window.THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, metalness: 0.2 })
    )

    earth.rotation.z = 23.5 * Math.PI / 180

    earthPoints.forEach((p, i) => {
      if (p.isMissionPoint) {
        const v = new window.THREE.Vector3(p.x, p.y, p.z).normalize()
        const pin = createPinMesh(p.color)
        pin.scale.set(1.2, 1.2, 1.2)
        pin.position.copy(v.clone().multiplyScalar(145))
        pin.quaternion.setFromUnitVectors(new window.THREE.Vector3(0, 1, 0), v)
        pin.children[0].userData = p
        earth.add(pin)
        points.push(pin.children[0])
      } else {
        const ringIndex = earthPoints.filter((ep, j) => j < i && !ep.isMissionPoint).length
        const ring = createOrbitRing(p.orbitRadius, p.color)
        ring.rotation.y = ringIndex === 0 ? Math.PI / 5 : -Math.PI / 7
        ring.rotation.x = ringIndex === 0 ? Math.PI / 12 : -Math.PI / 10
        earth.add(ring)
        orbitRings.push(ring)

        const angle = p.orbitAngle
        const localPos = new window.THREE.Vector3(
          Math.cos(angle) * p.orbitRadius,
          Math.sin(angle) * p.orbitRadius,
          0
        )
        const euler = new window.THREE.Euler(
          ringIndex === 0 ? Math.PI / 12 : -Math.PI / 10,
          ringIndex === 0 ? Math.PI / 5 : -Math.PI / 7,
          0
        )
        localPos.applyEuler(euler)

        const pin = createPinMesh(p.color)
        pin.scale.set(1.4, 1.4, 1.4)
        pin.position.copy(localPos)
        const outDir = localPos.clone().normalize()
        pin.quaternion.setFromUnitVectors(new window.THREE.Vector3(0, 1, 0), outDir)
        pin.children[0].userData = p
        earth.add(pin)
        points.push(pin.children[0])
      }
    })

    earthWrapper = new window.THREE.Group()
    earthWrapper.add(earth)

    const eTgt = layouts.moon.earth
    earthWrapper.position.set(eTgt.pos[0], eTgt.pos[1], eTgt.pos[2])
    earth.scale.set(
      eTgt.scale * eTgt.squish[0],
      eTgt.scale * eTgt.squish[1],
      eTgt.scale * eTgt.squish[2]
    )

    scene.add(earthWrapper)
  })

  texLoader.load('/marte.jpg', (tex) => {
    mars = new window.THREE.Mesh(
      new window.THREE.SphereGeometry(55, 64, 64),
      new window.THREE.MeshStandardMaterial({ map: tex, roughness: 0.9, metalness: 0.1 })
    )

    marsPoints.forEach(p => {
      const v = new window.THREE.Vector3(p.x, p.y, p.z).normalize()
      const pin = createPinMesh(p.color)

      pin.scale.set(0.7, 0.7, 0.7)
      pin.position.copy(v.clone().multiplyScalar(55))
      pin.quaternion.setFromUnitVectors(new window.THREE.Vector3(0, 1, 0), v)

      pin.children[0].userData = p
      mars.add(pin)
      points.push(pin.children[0])
    })

    mars.rotation.z = 25 * Math.PI / 180
    marsWrapper = new window.THREE.Group()
    marsWrapper.add(mars)

    const mTgt = layouts.moon.mars
    marsWrapper.position.set(mTgt.pos[0], mTgt.pos[1], mTgt.pos[2])
    mars.scale.set(
      mTgt.scale * mTgt.squish[0],
      mTgt.scale * mTgt.squish[1],
      mTgt.scale * mTgt.squish[2]
    )

    scene.add(marsWrapper)
  })
}

const updateLabels = () => {
  if (!camera || !renderer || !labelsContainer.value) return

  const v = new THREE.Vector3()

  points.forEach(p => {
    p.getWorldPosition(v)
    v.project(camera)

    const el = labelsContainer.value.querySelector(`[data-id="${p.userData.id}"]`)

    if (el) {
      const x = (v.x * 0.5 + 0.5) * renderer.domElement.clientWidth
      const y = (v.y * -0.5 + 0.5) * renderer.domElement.clientHeight

      const isMoonPoint = moonPoints.some(mp => mp.id === p.userData.id)
      const isMarsPoint = marsPoints.some(mp => mp.id === p.userData.id)
      const isEarthPoint = earthPoints.some(ep => ep.id === p.userData.id)

      const isDynamicPoint = p.userData.isDynamic
      const isDynamicOnActive = isDynamicPoint && (
        (activeMainPlanet === moon && p.userData.planet === 'Lua') ||
        (activeMainPlanet === mars && p.userData.planet === 'Marte') ||
        (activeMainPlanet === earth && p.userData.planet === 'Terra')
      )

      const shouldShow =
        !isWarping &&
        (
          (activeMainPlanet === moon && isMoonPoint) ||
          (activeMainPlanet === mars && isMarsPoint) ||
          (activeMainPlanet === earth && isEarthPoint) ||
          isDynamicOnActive
        )

      el.style.transform = `translate(10px, -50%) translate(${x}px, ${y}px)`
      el.style.opacity = (v.z > 1 || !shouldShow) ? '0' : '1'
      el.style.pointerEvents = (v.z > 1 || isDragging.value || !shouldShow) ? 'none' : 'auto'
    }
  })
}

const onMouseMove = (e) => {
  const rect = containerRef.value.getBoundingClientRect()
  mouse.x = ((e.clientX - rect.left) / containerRef.value.clientWidth) * 2 - 1
  mouse.y = -((e.clientY - rect.top) / containerRef.value.clientHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)

  const intersects = raycaster.intersectObjects(points)
  containerRef.value.style.cursor = intersects.length > 0
    ? 'pointer'
    : (isDragging.value ? 'grabbing' : 'grab')
}

const onContainerClick = (e) => {
  if (Math.hypot(e.clientX - dragStartPosition.x, e.clientY - dragStartPosition.y) > 5) return

  raycaster.setFromCamera(mouse, camera)
  const hits = raycaster.intersectObjects(points)

  if (hits.length > 0) {
    const pointData = hits[0].object.userData
    if (pointData.isMissionPoint) openMission(pointData.planet)
    else selectedPoint.value = pointData
    return
  }

  const planetHits = raycaster.intersectObjects([moon, earth, mars].filter(Boolean))

  if (planetHits.length > 0) {
    const hitObj = planetHits[0].object
    if (hitObj === moon) startWarp('moon')
    else if (hitObj === earth) startWarp('earth')
    else if (hitObj === mars) startWarp('mars')
  }
}

const selectFromLabel = (point) => {
  if (isDragging.value) return
  if (point.isMissionPoint) openMission(point.planet)
  else selectedPoint.value = point
}

const onWindowResize = () => {
  if (!containerRef.value) return
  camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  if (isWarping) {
    const transitionBlend = Math.min(Math.max((warpProgress - 0.35) / 0.15, 0), 1)
    const finalBoost = Math.min(Math.max((warpProgress - 0.72) / 0.28, 0), 1)
    const step = 0.0018 + transitionBlend * (0.0026 - 0.0018) + finalBoost * 0.00155

    warpProgress += step

    const easeInOut = t =>
      t < 0.5
        ? 4 * t * t * t
        : 1 - Math.pow(-2 * t + 2, 3) / 2

    let fov = 45
    let opacity = 0
    let speed = 0
    let scaleZ = 1

    if (warpProgress <= 0.4) {
      const p = warpProgress / 0.4
      const e = easeInOut(p)
      fov = 45 + e * 8
      opacity = e * 0.45
      speed = 3 + e * 7
      scaleZ = 1 + e * 1.8
    } else {
      const p = (warpProgress - 0.4) / 0.6
      const e = smoothStep(p)
      const peak = Math.sin(e * Math.PI)
      fov = 53 + peak * 18
      opacity = 0.45 + peak * 0.4
      speed = 10 + peak * 22
      scaleZ = 2.8 + peak * 5.5

      if (p > 0.7) {
        const fade = 1 - easeInOut((p - 0.7) / 0.3)
        opacity *= fade
      }
    }

    const layoutT = smoothStep(Math.min(Math.max((warpProgress - 0.18) / 0.74, 0), 1))
    applyInterpolatedLayout(layoutT)

    camera.fov = fov

    if (warpLines) {
      warpLines.material.opacity = opacity
      warpLines.scale.z = scaleZ

      const positions = warpLines.geometry.attributes.position.array
      for (let i = 0; i < positions.length; i += 6) {
        positions[i + 2] += speed
        positions[i + 5] += speed

        if (positions[i + 2] > 500) {
          const len = positions[i + 5] - positions[i + 2]
          positions[i + 2] = randomBetween(-6000, -5000)
          positions[i + 5] = positions[i + 2] + len
        }
      }

      warpLines.geometry.attributes.position.needsUpdate = true
    }

    if (stars) stars.material.opacity = 1 - opacity * 0.65
    camera.updateProjectionMatrix()

    if (warpProgress >= 1) {
      applyInterpolatedLayout(1)
      isWarping = false
      warpProgress = 0
      camera.fov = 45

      if (warpLines) {
        warpLines.material.opacity = 0
        warpLines.scale.z = 1
      }

      if (stars) stars.material.opacity = 1
      camera.updateProjectionMatrix()
    }
  }

  if (activeMainPlanet && !isDragging.value && !isWarping) activeMainPlanet.rotation.y += 0.0008
  if (moon && activeMainPlanet !== moon) moon.rotation.y += 0.0005
  if (earth && activeMainPlanet !== earth) earth.rotation.y += 0.0005
  if (mars && activeMainPlanet !== mars) mars.rotation.y += 0.0005

  updateFlyingObjects()
  updateLabels()
  renderer.render(scene, camera)
}

onMounted(() => {
  loadMissions()

  const check = setInterval(() => {
    if (window.THREE && window.THREE.GLTFLoader) {
      clearInterval(check)
      initThreeJS()
    }
  }, 100)
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
  renderer?.dispose()
})
</script>

<template>
  <div class="w-full h-screen bg-black relative overflow-hidden font-sans select-none">
    <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center z-20 bg-black">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-white/20"></div>
    </div>

    <div ref="containerRef" class="w-full h-full" />

    <div ref="labelsContainer" class="absolute inset-0 pointer-events-none z-10">
      <div
        v-for="point in [...moonPoints, ...marsPoints, ...earthPoints, ...dynamicPoints]"
        :key="point.id"
        :data-id="point.id"
        class="absolute left-0 top-0 transition-opacity duration-300"
        :style="{ pointerEvents: isDragging ? 'none' : 'auto' }"
        @click="selectFromLabel(point)"
      >
        <div
          v-if="!point.isMissionPoint"
          class="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 border border-white/10 rounded-md hover:bg-white/20 hover:scale-110 transition-all cursor-pointer"
        >
          <MapPin :size="14" :style="{ color: '#' + point.color.toString(16).padStart(6, '0') }" />
          <span class="text-white text-[11px] font-bold tracking-wider uppercase whitespace-nowrap">
            {{ point.name }}
          </span>
        </div>

        <div
          v-else
          class="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 border border-white/30 border-dashed rounded-md hover:bg-white/20 hover:scale-110 transition-all cursor-pointer"
        >
          <span class="text-white text-[11px] font-bold tracking-wider uppercase whitespace-nowrap">+ Criar Missão</span>
        </div>
      </div>
    </div>

    <div class="absolute top-10 left-10 z-20 flex flex-col items-start pointer-events-none">
      <h1 class="text-4xl font-black text-white mb-2 tracking-tighter italic opacity-90 uppercase">
        GoEverywhere
      </h1>
      <div class="flex items-center justify-center w-full gap-2 opacity-60">
        <div class="h-[1px] flex-1 bg-blue-500 max-w-[20px]"></div>
        <p class="text-white text-[9px] font-mono uppercase tracking-[0.2em] whitespace-nowrap">
          Gestão Orbital de Entregas
        </p>
        <div class="h-[1px] flex-1 bg-blue-500 max-w-[20px]"></div>
      </div>
    </div>

    <div class="absolute top-10 right-10 z-20 flex gap-3">
      <router-link
        to="/dashboard"
        class="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all text-xs font-semibold backdrop-blur-xl"
      >
        <Home :size="14" />
        Dashboard
      </router-link>

      <button class="p-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all">
        <Settings :size="14" />
      </button>
    </div>

    <div class="absolute bottom-8 left-8 z-20 flex gap-4">
      <button
        @click="openMission('')"
        class="flex items-center gap-2 px-5 py-3 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all shadow-2xl active:scale-95"
      >
        <span class="text-base leading-none">+</span>
        Crie a sua Missão
      </button>

      <button
        @click="openMissionsDrawer"
        class="flex items-center gap-2 px-5 py-3 bg-white/10 text-white border border-white/20 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/20 transition-all shadow-2xl active:scale-95 backdrop-blur-md"
      >
        <span class="text-base leading-none">📋</span>
        Consultar Missões
      </button>
    </div>

    <Teleport to="body">
      <Transition
        enterActiveClass="transition-all duration-400 ease-out"
        leaveActiveClass="transition-all duration-300 ease-in"
        enterFromClass="opacity-0 scale-95 translate-y-10"
        leaveToClass="opacity-0 scale-95 translate-y-10"
      >
        <div
          v-if="selectedPoint"
          class="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-[#0a0a0a]/95 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl max-w-2xl w-full"
        >
          <div class="flex justify-between items-start mb-4">
            <div class="flex items-center gap-3">
              <div
                class="w-3 h-3 rounded-full"
                :style="{ backgroundColor: '#' + selectedPoint.color.toString(16).padStart(6, '0') }"
              ></div>
              <h3 class="text-2xl font-bold text-white uppercase">{{ selectedPoint.name }}</h3>
            </div>
            <button @click="selectedPoint = null" class="text-white/30 hover:text-white transition-colors text-xl">✕</button>
          </div>
          <p class="text-cyan-400 text-xs mb-2 font-mono">{{ selectedPoint.date }}</p>
          <p class="text-gray-400 text-sm mb-8 leading-relaxed text-justify">{{ selectedPoint.description }}</p>
          <button
            @click="selectedPoint = null"
            class="w-full py-4 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95"
          >
            Fechar Relatório
          </button>
        </div>
      </Transition>

      <Transition
        enterActiveClass="transition-transform duration-400 ease-out"
        leaveActiveClass="transition-transform duration-300 ease-in"
        enterFromClass="translate-x-full"
        leaveToClass="translate-x-full"
      >
        <div v-if="showMissionModal" class="fixed inset-y-0 right-0 z-50 flex pointer-events-none">

          <div class="relative w-[420px] bg-[#0d0d0f] border-l border-white/10 shadow-2xl flex flex-col h-full pointer-events-auto" style="overflow: visible;">
            <div class="flex items-center justify-between px-7 pt-5 pb-4 border-b border-white/10 shrink-0">
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <div>
                  <p class="text-white/40 text-[9px] font-mono uppercase tracking-[0.2em]">Nova Missão</p>
                  <h2 class="text-lg font-black text-white uppercase tracking-tight">
                    {{ missionPlanet ? `Destino: ${missionPlanet}` : 'Criar Missão' }}
                  </h2>
                </div>
              </div>
              <button @click="showMissionModal = false" class="text-white/30 hover:text-white transition-colors text-xl leading-none">✕</button>
            </div>

            <div class="flex-1 overflow-y-auto px-7 py-4 flex flex-col gap-4" style="overflow-x: visible;">
              <div>
                <label class="field-label">Nome da Missão</label>
                <input
                  v-model="missionForm.Nome"
                  type="text"
                  placeholder="Ex: Missão Lunar Alpha"
                  class="field-control"
                  @focus="closeFieldOptions()"
                />
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="field-label">Destino</label>
                  <div class="combo-field">
                    <button
                      type="button"
                      class="combo-display field-control"
                      @click="showPlanetaOptions = !showPlanetaOptions; closeFieldOptions('planeta')"
                    >
                      <span>{{ getPlanetaLabel(missionForm.Planeta) }}</span>
                      <span class="combo-arrow-static"></span>
                    </button>

                    <div v-if="showPlanetaOptions" class="combo-menu">
                      <button
                        v-for="option in planetaOptions"
                        :key="option.value"
                        type="button"
                        class="combo-option"
                        @click="selectPlaneta(option.value)"
                      >
                        {{ option.label }}
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="field-label">Lotação</label>
                  <div class="combo-field">
                    <input
                      v-model="missionForm.Lota"
                      type="number"
                      min="1"
                      class="combo-input field-control"
                      @focus="closeFieldOptions()"
                    />
                    <button
                      type="button"
                      class="combo-arrow"
                      @click="showLotacaoOptions = !showLotacaoOptions; closeFieldOptions('lotacao')"
                    />
                    <div v-if="showLotacaoOptions" class="combo-menu">
                      <button
                        v-for="v in lotacaoOptions"
                        :key="v"
                        class="combo-option"
                        @click="selectLotacao(v)"
                      >
                        {{ v }} pessoas
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="field-label">Data</label>
                  <div class="date-field">
                    <input
                      ref="dateInputRef"
                      v-model="missionForm.Data"
                      type="date"
                      :min="todayDate"
                      class="field-control date-white"
                      @focus="isDatePickerOpen = true; closeFieldOptions('date')"
                      @blur="isDatePickerOpen = false"
                    />
                    <button type="button" class="calendar-icon calendar-icon-button" @mousedown.prevent @click="toggleDatePicker">
                      <Calendar :size="17" />
                    </button>
                  </div>
                </div>

                <div>
                  <label class="field-label">Preço (€)</label>
                  <div class="combo-field">
                    <input
                      v-model="missionForm.Preco"
                      type="number"
                      min="0"
                      class="combo-input field-control"
                      @focus="closeFieldOptions()"
                    />
                    <button
                      type="button"
                      class="combo-arrow"
                      @click="showPrecoOptions = !showPrecoOptions; closeFieldOptions('preco')"
                    />
                    <div v-if="showPrecoOptions" class="combo-menu">
                      <button
                        v-for="v in precoOptions"
                        :key="v"
                        class="combo-option"
                        @click="selectPreco(v)"
                      >
                        {{ v.toLocaleString('pt-PT') }} €
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-2 gap-3">
                <div>
                  <label class="field-label">Hora Partida</label>
                  <div class="date-field">
                    <button type="button" class="picker-display field-control" @click="toggleTimePicker">
                      <span :class="missionForm.Hora_Partida ? 'text-white' : 'text-white/30'">
                        {{ missionForm.Hora_Partida || 'Escolher hora' }}
                      </span>
                      <span class="picker-icon">
                        <Clock :size="17" />
                      </span>
                    </button>

                    <div v-if="showTimePicker" class="time-menu">
                      <div class="time-scroll-column">
                        <p class="time-menu-label">Hora</p>
                        <div class="time-scroll">
                          <button
                            v-for="hour in hourOptions"
                            :key="hour"
                            type="button"
                            class="time-option"
                            :class="{ 'time-option-selected': selectedHour === hour }"
                            @click="selectTimePart('hour', hour)"
                          >
                            {{ hour }}
                          </button>
                        </div>
                      </div>

                      <div class="time-scroll-column">
                        <p class="time-menu-label">Minutos</p>
                        <div class="time-scroll">
                          <button
                            v-for="minute in minuteOptions"
                            :key="minute"
                            type="button"
                            class="time-option"
                            :class="{ 'time-option-selected': selectedMinute === minute }"
                            @click="selectTimePart('minute', minute)"
                          >
                            {{ minute }}
                          </button>
                        </div>
                      </div>

                      <div class="time-scroll-column">
                        <p class="time-menu-label">Segundos</p>
                        <div class="time-scroll">
                          <button
                            v-for="second in secondOptions"
                            :key="second"
                            type="button"
                            class="time-option"
                            :class="{ 'time-option-selected': selectedSecond === second }"
                            @click="selectTimePart('second', second)"
                          >
                            {{ second }}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="field-label">Carga (kg)</label>
                  <div class="combo-field">
                    <input
                      v-model="missionForm.Carga"
                      type="number"
                      min="0"
                      class="combo-input field-control"
                      @focus="closeFieldOptions()"
                    />
                    <button
                      type="button"
                      class="combo-arrow"
                      @click="showCargaOptions = !showCargaOptions; closeFieldOptions('carga')"
                    />
                    <div v-if="showCargaOptions" class="combo-menu">
                      <button
                        v-for="v in cargaOptions"
                        :key="v"
                        class="combo-option"
                        @click="selectCarga(v)"
                      >
                        {{ v }} kg
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div class="grid grid-cols-3 gap-3">
                <div>
                  <label class="field-label">Posição X</label>
                  <div class="position-field">
                    <input v-model="missionForm.X" type="number" step="10" class="position-input" @focus="closeFieldOptions()" />
                    <div class="position-controls">
                      <button type="button" class="position-btn" @click="adjustPosition('X', 10)">
                        <ChevronUp :size="13" />
                      </button>
                      <button type="button" class="position-btn" @click="adjustPosition('X', -10)">
                        <ChevronDown :size="13" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="field-label">Posição Y</label>
                  <div class="position-field">
                    <input v-model="missionForm.Y" type="number" step="10" class="position-input" @focus="closeFieldOptions()" />
                    <div class="position-controls">
                      <button type="button" class="position-btn" @click="adjustPosition('Y', 10)">
                        <ChevronUp :size="13" />
                      </button>
                      <button type="button" class="position-btn" @click="adjustPosition('Y', -10)">
                        <ChevronDown :size="13" />
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <label class="field-label">Posição Z</label>
                  <div class="position-field">
                    <input v-model="missionForm.Z" type="number" step="10" class="position-input" @focus="closeFieldOptions()" />
                    <div class="position-controls">
                      <button type="button" class="position-btn" @click="adjustPosition('Z', 10)">
                        <ChevronUp :size="13" />
                      </button>
                      <button type="button" class="position-btn" @click="adjustPosition('Z', -10)">
                        <ChevronDown :size="13" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div class="px-7 py-4 border-t border-white/10 flex gap-3 shrink-0">
              <button
                @click="showMissionModal = false"
                class="flex-1 py-2.5 bg-white/5 border border-white/10 text-white/60 rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-white/10 transition-all active:scale-95"
              >
                Cancelar
              </button>
              <button
                @click="submitMission"
                :disabled="isSubmitting"
                class="flex-1 py-2.5 bg-blue-600 text-white rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-500 transition-all shadow-lg active:scale-95 disabled:opacity-50"
              >
                {{ isSubmitting ? 'A lançar...' : 'Lançar Missão' }}
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>

    <Teleport to="body">
      <Transition
        enterActiveClass="transition-transform duration-400 ease-out"
        leaveActiveClass="transition-transform duration-300 ease-in"
        enterFromClass="translate-x-full"
        leaveToClass="translate-x-full"
      >
        <div v-if="showMissionsDrawer" class="fixed inset-y-0 right-0 z-50 flex">
          <div class="fixed inset-0 -z-10" @click="showMissionsDrawer = false" />

          <div class="relative w-[450px] bg-[#0d0d0f] border-l border-white/10 shadow-2xl flex flex-col h-full overflow-hidden">
            <div class="flex items-center justify-between px-7 pt-5 pb-4 border-b border-white/10 shrink-0">
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                <div>
                  <p class="text-white/40 text-[9px] font-mono uppercase tracking-[0.2em]">Registos</p>
                  <h2 class="text-lg font-black text-white uppercase tracking-tight">
                    Missões & Clientes
                  </h2>
                </div>
              </div>
              <button @click="showMissionsDrawer = false" class="text-white/30 hover:text-white transition-colors text-xl leading-none">✕</button>
            </div>

            <div class="flex-1 overflow-y-auto px-7 py-4 flex flex-col gap-4">
              <div v-if="isLoadingMissions" class="text-white/50 text-xs text-center py-10">
                A carregar missões...
              </div>

              <div v-else-if="allMissions.length === 0" class="text-white/50 text-xs text-center py-10">
                Nenhuma missão encontrada.
              </div>

              <div v-else class="space-y-4">
                <div
                  v-for="m in allMissions"
                  :key="m.documentId || m.id"
                  class="bg-white/5 border border-white/10 rounded-xl p-4 hover:bg-white/10 transition-colors cursor-pointer"
                  @click="goToMissionPlanet(m)"
                >
                  <div class="flex justify-between items-start mb-2">
                    <h3 class="text-sm font-bold text-white uppercase">{{ m.Nome || 'Sem Nome' }}</h3>
                    <div class="flex items-center gap-2">
                      <span class="text-[9px] bg-blue-600 px-2 py-0.5 rounded font-mono uppercase tracking-wider text-white">{{ m.Planeta }}</span>
                      <button
                        @click.stop="deleteMission(m)"
                        class="text-red-500 hover:text-red-400 transition-colors ml-1 flex items-center justify-center"
                        title="Apagar missão"
                      >
                        <Trash2 :size="14" />
                      </button>
                    </div>
                  </div>

                  <div class="text-[10px] text-white/60 font-mono mb-2">
                    Planeta: <span class="text-white">{{ m.Planeta }}</span>
                  </div>

                  <div class="grid grid-cols-2 gap-2 text-[10px] text-white/60 font-mono mb-3">
                    <div>Data: <span class="text-white">{{ m.Data }}</span></div>
                    <div>Preço: <span class="text-white">{{ formatNumber(m.Preco) }} €</span></div>
                    <div>Partida: <span class="text-white">{{ m.Hora_Partida }}</span></div>
                    <div>Carga: <span class="text-white">{{ m.Carga }} kg</span></div>
                    <div>Lotação: <span class="text-white">{{ m.Lota }} pessoas</span></div>
                    <div>XYZ: <span class="text-white">{{ m.X }}, {{ m.Y }}, {{ m.Z }}</span></div>
                  </div>

                  <div class="mt-3 pt-3 border-t border-white/10">
                    <h4 class="text-[9px] text-white/40 uppercase tracking-[0.2em] mb-2">Clientes Associados (Bilhetes)</h4>
                    <div v-if="!m.bilhetes || m.bilhetes.length === 0" class="text-xs text-white/30 italic">
                      Nenhum bilhete vendido ainda.
                    </div>
                    <ul v-else class="space-y-1">
                      <li v-for="b in m.bilhetes" :key="b.documentId || b.id" class="text-xs text-white/80 flex items-center gap-2">
                        <span class="w-1 h-1 bg-white/40 rounded-full"></span>
                        <span v-if="b.cliente">
                          {{ b.cliente.PrimeiroNome }} {{ b.cliente.UltimoNome }}
                          <span class="text-white/40">({{ b.cliente.Email }})</span>
                        </span>
                        <span v-else class="italic text-white/40">Cliente desconhecido</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
:deep(body) {
  margin: 0;
  overflow: hidden;
  background: black;
}

.field-label {
  display: block;
  color: rgba(255, 255, 255, 0.4);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 9px;
  font-weight: 700;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  margin-bottom: 0.5rem;
}

.field-control {
  width: 100%;
  min-height: 42px;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  padding: 0.625rem 1rem;
  color: white;
  font-size: 0.875rem;
  outline: none;
  transition: border-color 0.15s ease, background-color 0.15s ease;
}

.field-control::placeholder {
  color: rgba(255, 255, 255, 0.2);
}

.field-control:focus,
.combo-display:focus {
  border-color: rgba(59, 130, 246, 0.6);
}

.select-white-arrow {
  appearance: none;
  -webkit-appearance: none;
  -moz-appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 14px center;
  background-size: 16px;
  padding-right: 42px;
}

.date-field,
.combo-field,
.position-field {
  position: relative;
  overflow: visible;
}

.date-white {
  color-scheme: dark;
  padding-right: 42px;
}

.date-white::-webkit-calendar-picker-indicator {
  opacity: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: 42px;
  height: 100%;
  cursor: pointer;
  z-index: 1;
}

.calendar-icon {
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: #ffffff;
  pointer-events: none;
  z-index: 0;
}

.calendar-icon-button {
  right: 0;
  width: 42px;
  height: 100%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  background: transparent;
  cursor: pointer;
  pointer-events: auto;
  z-index: 2;
}

.calendar-icon-button:hover {
  background: rgba(255, 255, 255, 0.06);
}

.picker-display {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  text-align: left;
  cursor: pointer;
}

.picker-display:hover {
  background: rgba(255, 255, 255, 0.08);
}

.picker-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 30px;
  height: 30px;
  margin: -0.25rem -0.55rem -0.25rem 0;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
}

.time-menu {
  position: absolute;
  bottom: calc(100% + 8px);
  left: 0;
  z-index: 9999;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 0.75rem;
  background: #0d0d0f;
  box-shadow: 0 20px 55px rgba(0, 0, 0, 0.55);
}

.time-option-selected {
  background: #2563eb;
  color: white;
}

.time-menu {
  width: 320px;
  padding: 0.9rem;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.6rem;
}

.time-menu-label {
  margin-bottom: 0.45rem;
  color: rgba(255, 255, 255, 0.42);
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-size: 0.58rem;
  font-weight: 800;
  letter-spacing: 0.18em;
  text-transform: uppercase;
}

.time-scroll-column {
  min-width: 0;
}

.time-scroll {
  max-height: 170px;
  display: grid;
  gap: 0.3rem;
  overflow-y: auto;
  padding-right: 0.25rem;
}

.time-scroll::-webkit-scrollbar {
  width: 5px;
}

.time-scroll::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 999px;
}

.time-scroll::-webkit-scrollbar-thumb {
  background: rgba(59, 130, 246, 0.65);
  border-radius: 999px;
}

.time-option {
  height: 30px;
  border-radius: 0.5rem;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.78);
  font-size: 0.74rem;
  font-weight: 800;
  transition: background-color 0.15s ease, color 0.15s ease, transform 0.15s ease;
}

.time-option:hover {
  background: rgba(59, 130, 246, 0.45);
  color: white;
  transform: translateY(-1px);
}

.combo-input {
  padding-right: 42px;
  appearance: textfield;
  -moz-appearance: textfield;
}

.combo-input::-webkit-outer-spin-button,
.combo-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.combo-display {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  cursor: pointer;
}

.combo-arrow,
.combo-arrow-static {
  position: absolute;
  top: 1px;
  right: 1px;
  width: 42px;
  height: calc(100% - 2px);
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0 0.5rem 0.5rem 0;
  background-color: transparent;
  background-image: url("data:image/svg+xml,%3Csvg width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2.5' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: center;
  background-size: 16px;
}

.combo-arrow {
  border-top: 0;
  border-right: 0;
  border-bottom: 0;
  cursor: pointer;
}

.combo-arrow:hover,
.combo-display:hover .combo-arrow-static {
  background-color: rgba(255, 255, 255, 0.06);
}

.combo-menu {
  position: absolute;
  top: calc(100% + 6px);
  left: 0;
  right: 0;
  z-index: 9999;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 0.5rem;
  background: #0d0d0f;
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.45);
}

.combo-option {
  width: 100%;
  padding: 0.7rem 1rem;
  background: transparent;
  color: white;
  text-align: left;
  font-size: 0.875rem;
  transition: background-color 0.15s ease;
  cursor: pointer;
}

.combo-option:hover {
  background: rgba(255, 255, 255, 0.08);
}

.position-input {
  width: 100%;
  height: 42px;
  border-radius: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.05);
  padding: 0 38px 0 0.75rem;
  color: white;
  font-size: 0.8rem;
  outline: none;
  transition: border-color 0.15s ease, background-color 0.15s ease;
  appearance: textfield;
  -moz-appearance: textfield;
}

.position-input:focus {
  border-color: rgba(59, 130, 246, 0.6);
}

.position-input::-webkit-outer-spin-button,
.position-input::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

.position-controls {
  position: absolute;
  top: 1px;
  right: 1px;
  width: 34px;
  height: calc(100% - 2px);
  display: grid;
  grid-template-rows: 1fr 1fr;
  overflow: hidden;
  border-left: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 0 0.5rem 0.5rem 0;
}

.position-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  border: 0;
  background: rgba(255, 255, 255, 0.02);
  color: white;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.position-btn:first-child {
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.position-btn:hover {
  background: rgba(255, 255, 255, 0.1);
}
</style>

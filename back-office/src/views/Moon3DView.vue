<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Settings, Home, MapPin } from 'lucide-vue-next'

const containerRef = ref(null)
const router = useRouter()
const selectedPoint = ref(null)
const isLoading = ref(true)
const labelsContainer = ref(null)

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

// ─── Interpolação com arco orbital ────────────────────────────────────────────
// Arco perpendicular ao movimento no plano XZ — evita que planetas se atravessem.
// A amplitude é fixa em unidades de cena (não proporcional à distância) para
// que planetas que percorrem trajetos longos (como a lua) não saiam do ecrã.
const lerpArc = (fromPos, toPos, t, swingUnits = 400) => {
  const lx = lerp(fromPos[0], toPos[0], t)
  const ly = lerp(fromPos[1], toPos[1], t)
  const lz = lerp(fromPos[2], toPos[2], t)

  const arcPeak = Math.sin(Math.PI * t)

  const dx = toPos[0] - fromPos[0]
  const dz = toPos[2] - fromPos[2]
  const horizLen = Math.sqrt(dx * dx + dz * dz) || 1

  // Perpendicular no plano XZ
  const perpX = -dz / horizLen
  const perpZ =  dx / horizLen

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
    const to   = warpTargetLayout[pName]

    // Qualquer planeta que passe pelo centro (pos 0,0,0) recebe arco forte
    // para não colidir visualmente com o planeta principal.
    // Os que se movem entre duas posições secundárias recebem arco suave.
    const fromIsCenter = from.pos[0] === 0 && from.pos[1] === 0 && from.pos[2] === 0
    const toIsCenter   = to.pos[0]   === 0 && to.pos[1]   === 0 && to.pos[2]   === 0
    // Unidades fixas de desvio: suficiente para evitar sobreposição, pequeno o suficiente para não sair de ecrã
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
  {
    id: 1,
    name: 'Apollo 11',
    description: 'A histórica missão da NASA que levou os primeiros seres humanos à superfície lunar. Neil Armstrong e Buzz Aldrin exploraram o Mar da Tranquilidade enquanto Michael Collins os aguardava em órbita. Este marco monumental ocorreu no auge da Corrida Espacial, mudando para sempre a nossa compreensão sobre os limites da exploração espacial e demonstrando a incrível capacidade da engenharia humana.',
    date: 'Julho 1969',
    color: 0x00f2ff,
    x: 50,
    y: 20,
    z: 80
  },
  {
    id: 2,
    name: 'Apollo 12',
    description: 'A segunda aterragem tripulada, que se destacou pela sua enorme precisão. A tripulação aterrou a uma curta distância da sonda Surveyor 3, no Oceano das Tormentas, permitindo-lhes recuperar peças que estavam expostas ao ambiente lunar há anos. O voo enfrentou momentos de tensão após ser atingido por um raio durante a descolagem, mas a missão foi um sucesso estrondoso.',
    date: 'Novembro 1969',
    color: 0xff6b6b,
    x: -60,
    y: -30,
    z: 70
  },
  {
    id: 3,
    name: 'Apollo 15',
    description: 'A primeira das missões "J" da Apollo, desenhada para uma permanência mais prolongada e exploração científica mais profunda. Introduziu o icónico Lunar Roving Vehicle (LRV), permitindo aos astronautas percorrer distâncias inéditas na zona de Hadley-Apennine. A missão recolheu amostras vitais de rocha, incluindo a famosa Rocha do Génesis, revolucionando os estudos lunares.',
    date: 'Julho 1971',
    color: 0xffd93d,
    x: -20,
    y: 70,
    z: 60
  },
  {
    id: 4,
    name: "Chang'e 4",
    description: 'Uma missão pioneira da agência espacial chinesa, tornando-se a primeira sonda a efetuar uma alunagem suave no lado oculto da Lua. Pousou na cratera Von Kármán, transmitindo dados através de um satélite de retransmissão estrategicamente posicionado. Esta missão abriu as portas a estudos de radioastronomia num ambiente livre de interferências terrestres.',
    date: 'Janeiro 2019',
    color: 0x6bcf7f,
    x: 80,
    y: -60,
    z: -20
  },
  {
    id: 5,
    name: 'Artemis I',
    description: 'O voo inaugural sem tripulação do monumental foguetão SLS e da nave Orion. Viajou até à Lua e colocou-se em órbita retrógrada, atestando a segurança e o desempenho de todos os sistemas críticos. Este passo crucial foi desenhado para testar as capacidades de reentrada na atmosfera terrestre a alta velocidade, certificando as bases para o futuro retorno humano.',
    date: 'Novembro 2022',
    color: 0xa78bfa,
    x: 10,
    y: 90,
    z: 20
  },
  {
    id: 10,
    name: 'Artemis II',
    description: 'A primeira missão tripulada do programa Artemis. Quatro astronautas farão uma viagem à volta da Lua, testando os sistemas de suporte de vida e navegação em espaço profundo da nave Orion. Esta missão histórica não só assinala o regresso da humanidade às redondezas lunares desde a era Apollo, mas também prepara as fundações cruciais para futuras missões a Marte.',
    date: 'Novembro 2025',
    color: 0x38b6ff,
    x: -80,
    y: 10,
    z: 40
  }
]

const marsPoints = [
  {
    id: 6,
    name: 'Perseverance',
    description: 'Um rover altamente avançado desenhado para investigar astrobiologia e procurar vestígios de vida microbiana antiga. Aterrou na Cratera Jezero, onde outrora existiu um lago e um delta de rio. Em conjunto com o helicóptero Ingenuity, tem recolhido e armazenado amostras vitais de rochas marcianas que deverão ser trazidas de volta à Terra em missões futuras.',
    date: 'Fevereiro 2021',
    color: 0xff4500,
    x: 60,
    y: 50,
    z: 50
  },
  {
    id: 7,
    name: 'Curiosity',
    description: 'Aterrou de forma espetacular com a ajuda de um "sky crane" na Cratera Gale. O seu principal objetivo é estudar o clima e a geologia, determinando se a região alguma vez ofereceu condições favoráveis à vida microbiana. Equipado com um poderoso laboratório móvel a laser e vários sensores, alterou fundamentalmente o nosso conhecimento sobre o passado húmido de Marte.',
    date: 'Agosto 2012',
    color: 0x00ff00,
    x: 80,
    y: -30,
    z: 30
  },
  {
    id: 8,
    name: 'Viking 1',
    description: 'A primeira parte da missão Viking e a primeira sonda americana a realizar uma aterragem suave no planeta vermelho. Tocou o solo em Chryse Planitia e tirou as primeiras fotos panorâmicas a cores da superfície marciana. O lander e o orbiter executaram diversas experiências biológicas que ainda hoje são analisadas e geram debate sobre os seus resultados controversos.',
    date: 'Julho 1976',
    color: 0xffd700,
    x: -60,
    y: 60,
    z: 40
  },
  {
    id: 9,
    name: 'Opportunity',
    description: 'Um dos rovers gémeos da missão MER, aterrou no Meridiani Planum e revelou provas conclusivas de que a água líquida já fluiu em Marte. Originalmente concebido para uma missão de apenas 90 dias, o pequeno e robusto veículo surpreendeu a todos ao permanecer ativo por incríveis 15 anos. Explorou diversas crateras até se silenciar devido a uma colossal tempestade de poeira global.',
    date: 'Janeiro 2004',
    color: 0x00f2ff,
    x: -30,
    y: -50,
    z: 80
  }
]

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

    if (dx * dx + dy * dy + dz * dz < zone.radius * zone.radius) {
      return false
    }
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

  if (type === 'rocket') {
    nearZ = Math.random() < 0.60
      ? randomBetween(750, 950)
      : randomBetween(450, 700)
  } else if (type === 'astronaut') {
    nearZ = randomBetween(300, 500)
  } else {
    nearZ = randomBetween(250, 450)
  }

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
      curvePoints.push(new window.THREE.Vector3(
        randomBetween(-70, 70),
        randomBetween(-50, 50),
        220
      ))
    }

    curvePoints.push(buildSafePoint(endZ))
  } else {
    curvePoints.push(buildSafePoint(startZ))

    if (type === 'rocket' && Math.random() < 0.35) {
      curvePoints.push(new window.THREE.Vector3(
        randomBetween(-70, 70),
        randomBetween(-50, 50),
        220
      ))
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

  camera = new THREE.PerspectiveCamera(
    45,
    container.clientWidth / container.clientHeight,
    0.1,
    5000
  )
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

  let prevMouse = { x: 0, y: 0 }

  container.addEventListener('mousedown', (e) => {
    isDragging.value = true
    prevMouse = { x: e.clientX, y: e.clientY }
    dragStartPosition = { x: e.clientX, y: e.clientY }
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

      if (obj.type.includes('rocket')) {
        obj.mesh.rotateX(Math.PI / 2)
      }
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

  const headGeo = new window.THREE.SphereGeometry(2, 12, 12)
  const headMat = new window.THREE.MeshBasicMaterial({ color })
  const head = new window.THREE.Mesh(headGeo, headMat)
  head.position.y = 5

  const needleGeo = new window.THREE.CylinderGeometry(0.2, 0.05, 5, 8)
  const needleMat = new window.THREE.MeshBasicMaterial({ color: 0xdddddd })
  const needle = new window.THREE.Mesh(needleGeo, needleMat)
  needle.position.y = 2.5

  pinGroup.add(head)
  pinGroup.add(needle)

  return pinGroup
}

const loadMoon = () => {
  new THREE.TextureLoader().load('/moon.jpg', (tex) => {
    moon = new THREE.Mesh(
      new THREE.SphereGeometry(100, 64, 64),
      new THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.8,
        metalness: 0.2
      })
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
      new window.THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.8,
        metalness: 0.2
      })
    )

    earth.rotation.z = 23.5 * Math.PI / 180

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
      new window.THREE.MeshStandardMaterial({
        map: tex,
        roughness: 0.9,
        metalness: 0.1
      })
    )

    marsPoints.forEach(p => {
      const v = new window.THREE.Vector3(p.x, p.y, p.z).normalize()
      const pin = createPinMesh(p.color)

      pin.scale.set(0.6, 0.6, 0.6)
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

      const shouldShow =
        !isWarping &&
        (
          (activeMainPlanet === moon && isMoonPoint) ||
          (activeMainPlanet === mars && isMarsPoint)
        )

      el.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`
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
    selectedPoint.value = hits[0].object.userData
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
  if (!isDragging.value) selectedPoint.value = point
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

    if (stars) {
      stars.material.opacity = 1 - opacity * 0.65
    }

    camera.updateProjectionMatrix()

    if (warpProgress >= 1) {
      applyInterpolatedLayout(1)

      isWarping = false
      warpProgress = 0
      camera.fov = 45

      if (currentLayout === 'earth' && earth) {
        earth.rotation.set(0.3, -0.2, 23.5 * Math.PI / 180)
      }

      if (warpLines) {
        warpLines.material.opacity = 0
        warpLines.scale.z = 1
      }

      if (stars) {
        stars.material.opacity = 1
      }

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
        v-for="point in [...moonPoints, ...marsPoints]"
        :key="point.id"
        :data-id="point.id"
        class="absolute left-0 top-0 transition-opacity duration-300"
        :style="{ pointerEvents: isDragging ? 'none' : 'auto' }"
        @click="selectFromLabel(point)"
      >
        <div class="flex items-center gap-2 bg-black/70 backdrop-blur-md px-3 py-1.5 border border-white/10 rounded-md hover:bg-white/20 hover:scale-110 transition-all cursor-pointer">
          <MapPin :size="14" :style="{ color: '#' + point.color.toString(16).padStart(6, '0') }" />
          <span class="text-white text-[11px] font-bold tracking-wider uppercase whitespace-nowrap">
            {{ point.name }}
          </span>
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

              <h3 class="text-2xl font-bold text-white uppercase">
                {{ selectedPoint.name }}
              </h3>
            </div>

            <button
              @click="selectedPoint = null"
              class="text-white/30 hover:text-white transition-colors text-xl"
            >
              ✕
            </button>
          </div>

          <p class="text-cyan-400 text-xs mb-2 font-mono">{{ selectedPoint.date }}</p>

          <p class="text-gray-400 text-sm mb-8 leading-relaxed text-justify">
            {{ selectedPoint.description }}
          </p>

          <button
            @click="selectedPoint = null"
            class="w-full py-4 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-600 hover:text-white transition-all shadow-lg active:scale-95"
          >
            Fechar Relatório
          </button>
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
</style>
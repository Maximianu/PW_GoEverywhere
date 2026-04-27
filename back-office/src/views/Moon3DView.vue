<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router'
import { Settings, Home } from 'lucide-vue-next'

const containerRef = ref(null)
const router = useRouter()
const selectedPoint = ref(null)
const isLoading = ref(true)
const labelsContainer = ref(null)

let scene, camera, renderer, moon, raycaster, mouse
let isDragging = false
let dragStartPosition = { x: 0, y: 0 }
const points = []
let animationId = null

const flyingObjects = []

// ALTERAÇÃO: Tamanho do foguetão aumentado ligeiramente
const MODEL_SCALE = {
  rocket: 1.35,     
  astronaut: 0.22, 
  ice: 0.65        
}

const moonPoints = [
  { id: 1, name: 'Dashboard', description: 'Visão geral das operações', path: '/dashboard', color: 0x00f2ff, x: 0, y: 85, z: 50 },
  { id: 2, name: 'Pedidos', description: 'Gerencie pedidos activos', path: '/orders', color: 0xff6b6b, x: 80, y: 40, z: -30 },
  { id: 3, name: 'Histórico', description: 'Ver histórico completo', path: '/order-history', color: 0xffd93d, x: 50, y: -70, z: 50 },
  { id: 4, name: 'Clientes', description: 'Gerencie todos os clientes', path: '/customers', color: 0x6bcf7f, x: -50, y: -70, z: 50 },
  { id: 5, name: 'Estafetas', description: 'Gerencie estafetas disponíveis', path: '/couriers', color: 0xa78bfa, x: -80, y: 40, z: -30 },
  { id: 6, name: 'Mapa', description: 'Visualize rotas e entregas', path: '/map', color: 0x38b6ff, x: 0, y: -30, z: 95 }
]

const randomBetween = (min, max) => min + Math.random() * (max - min)

const createOrbitalCurve = () => {
  const isComing = Math.random() > 0.5
  const farZ = -1200
  const nearZ = 800
  const startZ = isComing ? farZ : nearZ
  const endZ = isComing ? nearZ : farZ
  const offset = 180 

  return new THREE.CatmullRomCurve3([
    new THREE.Vector3(randomBetween(-600, 600), randomBetween(-400, 400), startZ),
    new THREE.Vector3(isComing ? offset : -offset, randomBetween(-150, 150), (startZ + endZ) / 2),
    new THREE.Vector3(randomBetween(-700, 700), randomBetween(-500, 500), endZ)
  ], false, 'catmullrom', 0.5)
}

const initThreeJS = () => {
  const container = containerRef.value
  if (!container) return

  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 4000)
  camera.position.z = 280

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 0.4)) 
  const sunLight = new THREE.DirectionalLight(0xffffff, 0.8)
  sunLight.position.set(5, 3, 5)
  scene.add(sunLight)

  createStars()
  loadMoon()

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('click', onMouseClick)
  window.addEventListener('resize', onWindowResize)

  let prevMouse = { x: 0, y: 0 }
  container.addEventListener('mousedown', (e) => {
    isDragging = true
    prevMouse = { x: e.clientX, y: e.clientY }
    dragStartPosition = { x: e.clientX, y: e.clientY }
  })

  container.addEventListener('mousemove', (e) => {
    if (isDragging && moon) {
      moon.rotation.y += (e.clientX - prevMouse.x) * 0.003
      moon.rotation.x += (e.clientY - prevMouse.y) * 0.003
      prevMouse = { x: e.clientX, y: e.clientY }
      updateLabels()
    }
  })

  window.addEventListener('mouseup', () => isDragging = false)
  loadModels()
  animate()
}

const loadModels = () => {
  const loader = new window.THREE.GLTFLoader()
  const dracoLoader = new window.THREE.DRACOLoader()
  dracoLoader.setDecoderPath('https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/libs/draco/')
  loader.setDRACOLoader(dracoLoader)

  // ALTERAÇÃO: Velocidade reduzida para um efeito mais "orbital" e suave
  const config = [
    { name: 'rocket', path: '/models/Explorer_Jupiter-C_Rocket.glb', scale: MODEL_SCALE.rocket, speed: 0.0006 },
    { name: 'astronaut', path: '/models/Astronaut.glb', scale: MODEL_SCALE.astronaut, speed: 0.0004 },
    { name: 'ice', path: '/models/Aeronomy_of_Ice_in_the_Mesosphere.glb', scale: MODEL_SCALE.ice, speed: 0.0005 }
  ]

  config.forEach(objCfg => {
    loader.load(objCfg.path, (gltf) => {
      const model = gltf.scene
      model.scale.set(objCfg.scale, objCfg.scale, objCfg.scale)
      
      model.traverse((child) => {
        if (child.isMesh) {
          child.material.emissive = new THREE.Color(0xffffff)
          child.material.emissiveIntensity = 0.2
        }
      })
      
      scene.add(model)
      flyingObjects.push({
        mesh: model,
        type: objCfg.name,
        curve: createOrbitalCurve(),
        speed: objCfg.speed,
        t: Math.random(),
        active: true
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
        obj.curve = createOrbitalCurve() 
    }
    obj.curve.getPoint(obj.t, pos)
    obj.mesh.position.copy(pos)
    obj.curve.getPoint(Math.min(obj.t + 0.01, 1), next)
    obj.mesh.lookAt(next)
    if (obj.type === 'rocket') obj.mesh.rotateX(Math.PI / 2)
  })
}

const createStars = () => {
  const geo = new THREE.BufferGeometry()
  const vertices = []
  for (let i = 0; i < 2000; i++) vertices.push((Math.random() - 0.5) * 3000, (Math.random() - 0.5) * 3000, (Math.random() - 0.5) * 3000)
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
  scene.add(new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.7 })))
}

const loadMoon = () => {
  new THREE.TextureLoader().load('/moon.jpg', (tex) => {
    moon = new THREE.Mesh(
      new THREE.SphereGeometry(100, 64, 64), 
      new THREE.MeshStandardMaterial({ map: tex, roughness: 1, metalness: 0 })
    )
    scene.add(moon)
    moonPoints.forEach(p => {
      const v = new THREE.Vector3(p.x, p.y, p.z).normalize().multiplyScalar(105)
      const dot = new THREE.Mesh(new THREE.SphereGeometry(3.5, 16, 16), new THREE.MeshBasicMaterial({ color: p.color }))
      dot.position.copy(v)
      dot.userData = p
      moon.add(dot)
      points.push(dot)
    })
    isLoading.value = false
    nextTick(updateLabels)
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
      el.style.left = `${(v.x * 0.5 + 0.5) * renderer.domElement.clientWidth}px`
      el.style.top = `${(v.y * -0.5 + 0.5) * renderer.domElement.clientHeight}px`
      el.style.opacity = v.z > 1 ? '0' : '1'
    }
  })
}

const onMouseMove = (e) => {
  const rect = containerRef.value.getBoundingClientRect()
  mouse.x = ((e.clientX - rect.left) / containerRef.value.clientWidth) * 2 - 1
  mouse.y = -((e.clientY - rect.top) / containerRef.value.clientHeight) * 2 + 1
  raycaster.setFromCamera(mouse, camera)
  containerRef.value.style.cursor = raycaster.intersectObjects(points).length > 0 ? 'pointer' : (isDragging ? 'grabbing' : 'grab')
}

const onMouseClick = (e) => {
  if (Math.hypot(e.clientX - dragStartPosition.x, e.clientY - dragStartPosition.y) > 5) return
  raycaster.setFromCamera(mouse, camera)
  const hits = raycaster.intersectObjects(points)
  if (hits.length > 0) selectedPoint.value = hits[0].object.userData
}

const onWindowResize = () => {
  camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
}

const animate = () => {
  animationId = requestAnimationFrame(animate)
  if (moon && !isDragging) moon.rotation.y += 0.0005
  updateFlyingObjects()
  updateLabels()
  renderer.render(scene, camera)
}

onMounted(() => {
  const check = setInterval(() => { if (window.THREE && window.THREE.GLTFLoader) { clearInterval(check); initThreeJS() } }, 100)
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

    <div ref="labelsContainer" class="absolute inset-0 pointer-events-none">
      <div v-for="point in moonPoints" :key="point.id" :data-id="point.id"
        class="absolute transform -translate-x-1/2 -translate-y-1/2">
        <div class="flex items-center gap-2 bg-black/60 backdrop-blur-md px-3 py-1.5 border border-white/10 rounded-md">
          <div class="w-2 h-2 rounded-full shadow-[0_0_8px_currentColor]" :style="{ color: '#' + point.color.toString(16).padStart(6, '0'), backgroundColor: 'currentColor' }" />
          <span class="text-white text-[11px] font-bold tracking-wider uppercase whitespace-nowrap">{{ point.name }}</span>
        </div>
      </div>
    </div>

    <div class="absolute top-10 left-10 z-10 flex flex-col items-start">
      <h1 class="text-4xl font-black text-white mb-2 tracking-tighter italic opacity-90 uppercase">GoEverywhere</h1>
      <div class="flex items-center justify-center w-full gap-2 opacity-60">
        <div class="h-[1px] flex-1 bg-blue-500 max-w-[20px]"></div>
        <p class="text-white text-[9px] font-mono uppercase tracking-[0.2em] whitespace-nowrap">Gestão Orbital de Entregas</p>
        <div class="h-[1px] flex-1 bg-blue-500 max-w-[20px]"></div>
      </div>
    </div>

    <div class="absolute top-10 right-10 z-10 flex gap-3">
      <router-link to="/dashboard" class="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all text-xs font-semibold backdrop-blur-xl">
        <Home :size="14" /> Dashboard
      </router-link>
      <button class="p-2 bg-white/5 border border-white/10 text-white rounded-lg hover:bg-white/10 transition-all">
        <Settings :size="14" />
      </button>
    </div>

    <Teleport to="body">
      <Transition enterActiveClass="transition-all duration-400 ease-out" leaveActiveClass="transition-all duration-300 ease-in"
        enterFromClass="opacity-0 scale-95" leaveToClass="opacity-0 scale-95">
        <div v-if="selectedPoint" class="fixed bottom-12 left-1/2 -translate-x-1/2 z-50 bg-[#0a0a0a]/90 backdrop-blur-2xl border border-white/10 rounded-2xl p-8 shadow-2xl max-w-sm w-full">
          <div class="flex justify-between items-start mb-4">
            <h3 class="text-2xl font-bold text-white uppercase">{{ selectedPoint.name }}</h3>
            <button @click="selectedPoint = null" class="text-white/30 hover:text-white">✕</button>
          </div>
          <p class="text-gray-400 text-xs mb-8 leading-relaxed">{{ selectedPoint.description }}</p>
          <button @click="router.push(selectedPoint.path)" class="w-full py-4 bg-white text-black rounded-xl font-bold uppercase tracking-widest text-[10px] hover:bg-blue-600 hover:text-white transition-all">
            Abrir Módulo
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
:deep(body) { margin: 0; overflow: hidden; background: black; }
</style>
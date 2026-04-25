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
const pointWorldPositions = new Map()
const comets = []

// Definir os pontos da lua com distribuição melhor espalhada
const moonPoints = [
  { id: 1, name: 'Dashboard', description: 'Visão geral das operações', path: '/dashboard', color: 0x00f2ff, x: 0, y: 85, z: 50 },
  { id: 2, name: 'Pedidos', description: 'Gerencie pedidos activos', path: '/orders', color: 0xff6b6b, x: 80, y: 40, z: -30 },
  { id: 3, name: 'Histórico', description: 'Ver histórico completo', path: '/order-history', color: 0xffd93d, x: 50, y: -70, z: 50 },
  { id: 4, name: 'Clientes', description: 'Gerencie todos os clientes', path: '/customers', color: 0x6bcf7f, x: -50, y: -70, z: 50 },
  { id: 5, name: 'Estafetas', description: 'Gerencie estafetas disponíveis', path: '/couriers', color: 0xa78bfa, x: -80, y: 40, z: -30 },
  { id: 6, name: 'Mapa', description: 'Visualize rotas e entregas', path: '/map', color: 0x38b6ff, x: 0, y: -30, z: 95 }
]

const initThreeJS = () => {
  const container = containerRef.value
  if (!container) return

  // Scene setup
  scene = new THREE.Scene()
  scene.background = new THREE.Color(0x000000)

  // Camera setup
  camera = new THREE.PerspectiveCamera(
    75,
    container.clientWidth / container.clientHeight,
    0.1,
    1000
  )
  camera.position.z = 250

  // Renderer setup
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(window.devicePixelRatio)
  renderer.shadowMap.enabled = true
  container.appendChild(renderer.domElement)

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.6)
  scene.add(ambientLight)

  const sunLight = new THREE.PointLight(0xffffff, 1.2)
  sunLight.position.set(200, 100, 150)
  sunLight.castShadow = true
  sunLight.shadow.mapSize.width = 2048
  sunLight.shadow.mapSize.height = 2048
  scene.add(sunLight)

  // Stars background
  createStars()

  // Load moon
  loadMoon()

  // Raycaster para detectar cliques
  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  // Event listeners
  window.addEventListener('mousemove', onMouseMove, false)
  window.addEventListener('click', onMouseClick, false)
  window.addEventListener('resize', onWindowResize, false)

  // Mouse controls for rotation
  let previousMousePosition = { x: 0, y: 0 }

  container.addEventListener('mousedown', (e) => {
    isDragging = true
    previousMousePosition = { x: e.clientX, y: e.clientY }
    dragStartPosition = { x: e.clientX, y: e.clientY }
  })

  container.addEventListener('mousemove', (e) => {
    if (isDragging && moon) {
      const deltaX = e.clientX - previousMousePosition.x
      const deltaY = e.clientY - previousMousePosition.y

      moon.rotation.y += deltaX * 0.005
      moon.rotation.x += deltaY * 0.005
      previousMousePosition = { x: e.clientX, y: e.clientY }

      updateLabels()
    }
  })

  container.addEventListener('mouseup', () => {
    isDragging = false
  })

  container.addEventListener('mouseleave', () => {
    isDragging = false
  })

  // Create comets
  createComets()

  // Start animation loop
  animate()
}

const createStars = () => {
  const starsGeometry = new THREE.BufferGeometry()
  const starsMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1 })

  const starsVertices = []
  for (let i = 0; i < 1000; i++) {
    const x = (Math.random() - 0.5) * 2000
    const y = (Math.random() - 0.5) * 2000
    const z = (Math.random() - 0.5) * 2000
    starsVertices.push(x, y, z)
  }

  starsGeometry.setAttribute('position', new THREE.BufferAttribute(new Float32Array(starsVertices), 3))
  const stars = new THREE.Points(starsGeometry, starsMaterial)
  scene.add(stars)
}

const loadMoon = () => {
  const textureLoader = new THREE.TextureLoader()
  const onLoad = (texture) => {
    const geometry = new THREE.SphereGeometry(100, 64, 64)
    const material = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.7,
      metalness: 0.3
    })
    moon = new THREE.Mesh(geometry, material)
    moon.castShadow = true
    moon.receiveShadow = true
    scene.add(moon)

    createClickablePoints()
    isLoading.value = false
    nextTick(() => {
      updateLabels()
    })
  }

  const onError = () => {
    console.error('Erro ao carregar a textura da lua')
    const geometry = new THREE.SphereGeometry(100, 64, 64)
    const material = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      roughness: 0.7,
      metalness: 0.3
    })
    moon = new THREE.Mesh(geometry, material)
    moon.castShadow = true
    moon.receiveShadow = true
    scene.add(moon)

    createClickablePoints()
    isLoading.value = false
    nextTick(() => {
      updateLabels()
    })
  }

  textureLoader.load('/moon.jpg', onLoad, undefined, onError)
}

const createClickablePoints = () => {
  moonPoints.forEach((pointData) => {
    const vector = new THREE.Vector3(pointData.x, pointData.y, pointData.z)
    vector.normalize().multiplyScalar(105)

    const geometry = new THREE.SphereGeometry(6, 32, 32)
    const material = new THREE.MeshBasicMaterial({ color: pointData.color })
    const sphere = new THREE.Mesh(geometry, material)
    sphere.position.copy(vector)
    sphere.userData = { ...pointData }
    sphere.name = 'clickPoint'

    moon.add(sphere)
    points.push(sphere)
    pointWorldPositions.set(pointData.id, new THREE.Vector3())
  })
}

const createComets = () => {
  for (let i = 0; i < 3; i++) {
    const cometGeometry = new THREE.SphereGeometry(2, 8, 8)
    const cometMaterial = new THREE.MeshBasicMaterial({ color: 0xffff00 })
    const comet = new THREE.Mesh(cometGeometry, cometMaterial)
    
    const angle = Math.random() * Math.PI * 2
    const distance = 300 + Math.random() * 100
    comet.position.x = Math.cos(angle) * distance
    comet.position.y = (Math.random() - 0.5) * 200
    comet.position.z = Math.sin(angle) * distance
    
    comet.userData = {
      velocity: {
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 1,
        z: (Math.random() - 0.5) * 2
      }
    }
    
    scene.add(comet)
    comets.push(comet)
  }
}

const updateComets = () => {
  comets.forEach((comet) => {
    comet.position.x += comet.userData.velocity.x
    comet.position.y += comet.userData.velocity.y
    comet.position.z += comet.userData.velocity.z
    
    const distance = comet.position.length()
    if (distance > 500) {
      const angle = Math.random() * Math.PI * 2
      const newDistance = 300 + Math.random() * 100
      comet.position.x = Math.cos(angle) * newDistance
      comet.position.y = (Math.random() - 0.5) * 200
      comet.position.z = Math.sin(angle) * newDistance
    }
  })
}

const updateLabels = () => {
  if (!camera || !labelsContainer.value || points.length === 0) return

  const canvas = renderer.domElement
  const vector = new THREE.Vector3()

  points.forEach((point) => {
    point.getWorldPosition(vector)
    pointWorldPositions.set(point.userData.id, vector.clone())

    vector.project(camera)

    const x = (vector.x * 0.5 + 0.5) * canvas.clientWidth
    const y = (vector.y * -0.5 + 0.5) * canvas.clientHeight

    const labelEl = labelsContainer.value?.querySelector(`[data-id="${point.userData.id}"]`)
    if (labelEl) {
      labelEl.style.left = x + 'px'
      labelEl.style.top = y + 'px'
      
      if (vector.z > 1) {
        labelEl.style.opacity = '0'
      } else {
        labelEl.style.opacity = '1'
      }
    }
  })
}

const onMouseMove = (event) => {
  const container = containerRef.value
  if (!container) return
  const rect = container.getBoundingClientRect()
  mouse.x = ((event.clientX - rect.left) / container.clientWidth) * 2 - 1
  mouse.y = -((event.clientY - rect.top) / container.clientHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(points)

  if (intersects.length > 0) {
    containerRef.value.style.cursor = 'pointer'
  } else {
    containerRef.value.style.cursor = 'grab'
  }
}

const onMouseClick = (event) => {
  // Só processar click se não foi um drag significativo
  if (dragStartPosition && event.clientX && event.clientY) {
    const moveDistance = Math.sqrt(
      Math.pow(event.clientX - dragStartPosition.x, 2) + 
      Math.pow(event.clientY - dragStartPosition.y, 2)
    )
    if (moveDistance > 5) return // Ignorar se foi um drag
  }

  raycaster.setFromCamera(mouse, camera)
  const intersects = raycaster.intersectObjects(points)

  if (intersects.length > 0) {
    selectedPoint.value = intersects[0].object.userData
  }
}

const onWindowResize = () => {
  const container = containerRef.value
  const width = container.clientWidth
  const height = container.clientHeight

  camera.aspect = width / height
  camera.updateProjectionMatrix()
  renderer.setSize(width, height)
}

const animate = () => {
  requestAnimationFrame(animate)

  if (moon) {
    moon.rotation.y += 0.0005
  }

  updateLabels()
  updateComets()
  renderer.render(scene, camera)
}

const navigateTo = (path) => {
  selectedPoint.value = null
  router.push(path)
}

const closeModal = () => {
  selectedPoint.value = null
}

onMounted(() => {
  const checkThreeJS = setInterval(() => {
    if (typeof THREE !== 'undefined') {
      clearInterval(checkThreeJS)
      initThreeJS()
    }
  }, 100)

  setTimeout(() => clearInterval(checkThreeJS), 5000)
})

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('click', onMouseClick)
  window.removeEventListener('resize', onWindowResize)

  if (renderer) {
    renderer.dispose()
    containerRef.value?.removeChild(renderer.domElement)
  }
})
</script>

<template>
  <div class="w-full h-screen bg-black relative overflow-hidden">
    <!-- Loading Spinner -->
    <Transition
      enterActiveClass="transition-opacity duration-300"
      leaveActiveClass="transition-opacity duration-300"
    >
      <div v-if="isLoading" class="absolute inset-0 flex items-center justify-center z-20 bg-black/50">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    </Transition>

    <!-- Three.js Canvas Container -->
    <div ref="containerRef" class="w-full h-full" />

    <!-- Labels Container -->
    <div ref="labelsContainer" class="absolute inset-0 pointer-events-none">
      <div
        v-for="point in moonPoints"
        :key="point.id"
        :data-id="point.id"
        class="absolute pointer-events-none transform -translate-x-1/2 -translate-y-1/2 transition-opacity duration-300"
      >
        <div class="flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-lg border border-gray-700 whitespace-nowrap pointer-events-none">
          <div
            class="w-2.5 h-2.5 rounded-full"
            :style="{ backgroundColor: '#' + point.color.toString(16).padStart(6, '0') }"
          ></div>
          <span class="text-white text-xs font-semibold">{{ point.name }}</span>
        </div>
      </div>
    </div>

    <!-- Header Info -->
    <div class="absolute top-8 left-8 z-10">
      <h1 class="text-3xl font-bold text-white mb-2">🌙 Lua</h1>
      <p class="text-gray-400 text-sm">Clique e arraste para rodar • Clique nos pontos para explorar</p>
    </div>

    <!-- Control Buttons -->
    <div class="absolute top-8 right-8 z-10 flex gap-3">
      <router-link
        to="/dashboard"
        class="flex items-center gap-2 px-4 py-2 bg-[#141b27] border border-[#1f2937] text-white rounded-lg hover:border-primary transition-colors font-medium text-sm"
      >
        <Home :size="16" />
        Dashboard
      </router-link>
      <button
        class="flex items-center gap-2 px-3 py-2 bg-[#141b27] border border-[#1f2937] text-white rounded-lg hover:border-primary transition-colors font-medium text-sm"
      >
        <Settings :size="16" />
      </button>
    </div>

    <!-- Info Modal -->
    <Teleport to="body">
      <Transition
        enterActiveClass="transition-all duration-300"
        leaveActiveClass="transition-all duration-300"
        enterFromClass="opacity-0 translate-y-4"
        leaveToClass="opacity-0 translate-y-4"
      >
        <div v-if="selectedPoint" class="fixed bottom-8 right-8 z-50 bg-gradient-to-br from-[#1a1f2e] to-[#141b27] border-2 border-[#1f2937] rounded-2xl p-6 shadow-2xl max-w-xs">
          <div class="flex items-start justify-between mb-4">
            <div>
              <h3 class="text-xl font-bold text-white">{{ selectedPoint.name }}</h3>
              <p class="text-gray-400 text-sm mt-1">{{ selectedPoint.description }}</p>
            </div>
            <button
              @click="closeModal"
              class="text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>
          </div>

          <button
            @click="navigateTo(selectedPoint.path)"
            class="w-full px-4 py-2 bg-primary text-black rounded-lg font-semibold hover:bg-primary/90 transition-colors"
          >
            Explorar →
          </button>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
div {
  box-sizing: border-box;
}
</style>

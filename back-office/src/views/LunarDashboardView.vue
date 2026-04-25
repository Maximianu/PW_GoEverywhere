<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import { Settings } from 'lucide-vue-next'

const router = useRouter()
const canvasRef = ref(null)
const hoveredFeature = ref(null)

// Definir as funcionalidades da aplicação
const features = [
  { id: 'dashboard', name: 'Dashboard', path: '/', color: '#00f2ff', angle: 0, emoji: '📊' },
  { id: 'orders', name: 'Pedidos', path: '/orders', color: '#ff6b6b', angle: 60, emoji: '📦' },
  { id: 'order-history', name: 'Histórico', path: '/order-history', color: '#ffd93d', angle: 120, emoji: '⏰' },
  { id: 'customers', name: 'Clientes', path: '/customers', color: '#6bcf7f', angle: 180, emoji: '👥' },
  { id: 'couriers', name: 'Estafetas', path: '/couriers', color: '#a78bfa', angle: 240, emoji: '🚴' },
  { id: 'map', name: 'Mapa', path: '/map', color: '#38b6ff', angle: 300, emoji: '🗺️' }
]

let rotationAngle = 0
let velocityX = 0
let velocityY = 0
let isDragging = false
let lastX = 0
let lastY = 0
let lastTime = 0
const animationFrameId = ref(null)

// Gerar textura da lua com craters
const generateMoonTexture = (canvas, width, height) => {
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#d3d3d3'
  ctx.fillRect(0, 0, width, height)

  // Adicionar craters
  for (let i = 0; i < 150; i++) {
    const x = Math.random() * width
    const y = Math.random() * height
    const radius = Math.random() * 8 + 1
    const depth = Math.random() * 0.8

    // Sombra do crater
    ctx.fillStyle = `rgba(100, 100, 100, ${depth})`
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()

    // Brilho do crater
    ctx.fillStyle = `rgba(200, 200, 200, ${depth * 0.5})`
    ctx.beginPath()
    ctx.arc(x - radius * 0.3, y - radius * 0.3, radius * 0.3, 0, Math.PI * 2)
    ctx.fill()
  }

  return canvas
}

const drawMoon = () => {
  const canvas = canvasRef.value
  if (!canvas) return

  const ctx = canvas.getContext('2d')
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const moonRadius = 180

  // Limpar canvas com gradiente
  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height)
  gradient.addColorStop(0, '#0a0e16')
  gradient.addColorStop(0.5, '#0c121e')
  gradient.addColorStop(1, '#1a1f2e')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  // Salvar estado
  ctx.save()

  // Aplicar rotação
  ctx.translate(centerX, centerY)
  ctx.rotate((rotationAngle * Math.PI) / 180)
  ctx.translate(-centerX, -centerY)

  // Desenhar lua com gradiente 3D
  const moonGradient = ctx.createRadialGradient(centerX - 30, centerY - 30, 0, centerX, centerY, moonRadius)
  moonGradient.addColorStop(0, '#ffffff')
  moonGradient.addColorStop(0.3, '#d3d3d3')
  moonGradient.addColorStop(0.7, '#a0a0a0')
  moonGradient.addColorStop(1, '#505050')

  ctx.fillStyle = moonGradient
  ctx.beginPath()
  ctx.arc(centerX, centerY, moonRadius, 0, Math.PI * 2)
  ctx.fill()

  // Desenhar craters na lua
  ctx.fillStyle = 'rgba(80, 80, 80, 0.4)'
  for (let i = 0; i < 60; i++) {
    const angle = Math.random() * Math.PI * 2
    const dist = Math.random() * moonRadius * 0.8
    const x = centerX + Math.cos(angle) * dist
    const y = centerY + Math.sin(angle) * dist
    const craterRadius = Math.random() * 12 + 2
    
    ctx.beginPath()
    ctx.arc(x, y, craterRadius, 0, Math.PI * 2)
    ctx.fill()

    // Luz do crater
    ctx.fillStyle = 'rgba(150, 150, 150, 0.3)'
    ctx.beginPath()
    ctx.arc(x - craterRadius * 0.4, y - craterRadius * 0.4, craterRadius * 0.4, 0, Math.PI * 2)
    ctx.fill()
    
    ctx.fillStyle = 'rgba(80, 80, 80, 0.4)'
  }

  // Desenhar funcionalidades como pontos na lua
  features.forEach((feature, index) => {
    const angle = (feature.angle * Math.PI) / 180
    const x = centerX + Math.cos(angle) * moonRadius * 0.65
    const y = centerY + Math.sin(angle) * moonRadius * 0.65

    // Glow effect
    ctx.fillStyle = feature.color + '30'
    ctx.beginPath()
    ctx.arc(x, y, 35, 0, Math.PI * 2)
    ctx.fill()

    // Círculo da funcionalidade
    const circleRadius = 22
    ctx.fillStyle = feature.color + '50'
    ctx.beginPath()
    ctx.arc(x, y, circleRadius, 0, Math.PI * 2)
    ctx.fill()

    // Border brilhante
    ctx.strokeStyle = feature.color
    ctx.lineWidth = 2.5
    ctx.beginPath()
    ctx.arc(x, y, circleRadius, 0, Math.PI * 2)
    ctx.stroke()

    // Inner glow
    ctx.strokeStyle = feature.color + '80'
    ctx.lineWidth = 1
    ctx.beginPath()
    ctx.arc(x, y, circleRadius - 3, 0, Math.PI * 2)
    ctx.stroke()

    // Ícone
    ctx.font = 'bold 16px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillStyle = '#ffffff'
    ctx.fillText(feature.emoji, x, y)
  })

  // Linhas de conexão suave
  ctx.strokeStyle = '#00f2ff20'
  ctx.lineWidth = 0.5
  features.forEach((feature) => {
    const angle = (feature.angle * Math.PI) / 180
    const x = centerX + Math.cos(angle) * moonRadius * 0.65
    const y = centerY + Math.sin(angle) * moonRadius * 0.65
    ctx.beginPath()
    ctx.moveTo(centerX, centerY)
    ctx.lineTo(x, y)
    ctx.stroke()
  })

  // Círculo central brilhante
  const centerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 15)
  centerGlow.addColorStop(0, '#00f2ff')
  centerGlow.addColorStop(1, '#00f2ff00')
  ctx.fillStyle = centerGlow
  ctx.beginPath()
  ctx.arc(centerX, centerY, 15, 0, Math.PI * 2)
  ctx.fill()

  ctx.fillStyle = '#00f2ff'
  ctx.beginPath()
  ctx.arc(centerX, centerY, 6, 0, Math.PI * 2)
  ctx.fill()

  ctx.restore()
}

const animate = () => {
  // Aplicar inércia
  if (!isDragging) {
    rotationAngle += velocityX * 0.5
    velocityX *= 0.98 // Atrito
    
    if (Math.abs(velocityX) < 0.1) {
      velocityX = 0
    }
  }

  if (rotationAngle >= 360) rotationAngle -= 360
  if (rotationAngle < 0) rotationAngle += 360

  drawMoon()
  animationFrameId.value = requestAnimationFrame(animate)
}

const getFeatureAtCoordinates = (x, y) => {
  const canvas = canvasRef.value
  const centerX = canvas.width / 2
  const centerY = canvas.height / 2
  const moonRadius = 180

  for (const feature of features) {
    const angle = (feature.angle * Math.PI) / 180 + (rotationAngle * Math.PI) / 180
    const featureX = centerX + Math.cos(angle) * moonRadius * 0.65
    const featureY = centerY + Math.sin(angle) * moonRadius * 0.65

    const distance = Math.sqrt((x - featureX) ** 2 + (y - featureY) ** 2)
    if (distance <= 30) {
      return feature
    }
  }
  return null
}

const handleCanvasMouseDown = (event) => {
  isDragging = true
  lastX = event.clientX
  lastY = event.clientY
  lastTime = Date.now()
  velocityX = 0
}

const handleCanvasMouseMove = (event) => {
  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const feature = getFeatureAtCoordinates(x, y)
  hoveredFeature.value = feature
  canvas.style.cursor = feature ? 'pointer' : 'grab'

  if (isDragging) {
    canvas.style.cursor = 'grabbing'
    const deltaX = event.clientX - lastX
    const currentTime = Date.now()
    const deltaTime = currentTime - lastTime

    rotationAngle += deltaX * 0.5
    velocityX = (deltaX * 0.5) / (deltaTime || 1) * 16.67 // Normalizar para 60fps

    lastX = event.clientX
    lastTime = currentTime

    hoveredFeature.value = null
  }
}

const handleCanvasMouseUp = () => {
  isDragging = false
}

const handleCanvasMouseLeave = () => {
  isDragging = false
  hoveredFeature.value = null
}

const handleCanvasClick = (event) => {
  if (Math.abs(velocityX) > 0.1 || isDragging) return

  const canvas = canvasRef.value
  const rect = canvas.getBoundingClientRect()
  const x = event.clientX - rect.left
  const y = event.clientY - rect.top

  const feature = getFeatureAtCoordinates(x, y)
  if (feature) {
    router.push(feature.path)
  }
}

const goToTraditional = () => {
  router.push('/')
}

onMounted(() => {
  animate()
})

onBeforeUnmount(() => {
  if (animationFrameId.value) {
    cancelAnimationFrame(animationFrameId.value)
  }
})
</script>

<template>
  <div class="w-full h-screen flex flex-col items-center justify-center bg-gradient-to-br from-[#0a0e16] via-[#0c121e] to-[#1a1f2e] relative overflow-hidden">
    <!-- Header -->
    <div class="absolute top-8 left-8 right-8 flex items-center justify-between z-10">
      <div>
        <h1 class="text-4xl font-bold text-white tracking-tight">🌙 Dashboard Lunar</h1>
        <p class="text-gray-400 mt-2">Arraste a lua para explorar as funcionalidades</p>
      </div>
      <button
        @click="goToTraditional"
        class="flex items-center gap-2 px-6 py-3 bg-[#141b27] border border-[#1f2937] text-white rounded-xl hover:border-primary transition-colors font-medium"
      >
        <Settings :size="18" />
        Modo Tradicional
      </button>
    </div>

    <!-- Lunar Canvas -->
    <canvas
      ref="canvasRef"
      @mousedown="handleCanvasMouseDown"
      @mousemove="handleCanvasMouseMove"
      @mouseup="handleCanvasMouseUp"
      @mouseleave="handleCanvasMouseLeave"
      @click="handleCanvasClick"
      width="800"
      height="800"
      class="drop-shadow-2xl cursor-grab select-none"
    />

    <!-- Feature Info -->
    <Transition
      enterActiveClass="transition-all duration-300"
      leaveActiveClass="transition-all duration-300"
      enterFromClass="opacity-0 translate-y-4"
      leaveToClass="opacity-0 translate-y-4"
    >
      <div v-if="hoveredFeature" class="absolute bottom-12 bg-[#141b27] border-2 rounded-2xl px-8 py-4 border-[#1f2937] shadow-2xl z-10">
        <p class="text-white font-bold text-lg">{{ hoveredFeature.emoji }} {{ hoveredFeature.name }}</p>
        <p class="text-gray-400 text-sm mt-1">Clique para abrir</p>
      </div>
    </Transition>

    <!-- Instructions -->
    <div class="absolute bottom-8 left-8 bg-[#141b27]/80 border border-[#1f2937] rounded-2xl p-6 backdrop-blur-sm max-w-xs">
      <p class="text-white font-semibold mb-3 text-sm">💡 Como Usar:</p>
      <ul class="space-y-2 text-gray-300 text-xs mb-4">
        <li>🖱️ <strong>Arraste</strong> para rodar a lua</li>
        <li>⏸️ A lua continua a rodar com inércia</li>
        <li>🎯 Clique num ponto para navegar</li>
        <li>✨ Hover mostra a funcionalidade</li>
      </ul>
      <router-link
        to="/moon-3d"
        class="block w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-center rounded-lg font-semibold hover:from-purple-700 hover:to-indigo-700 transition-all text-sm"
      >
        🌙✨ Luna 3D Interativa
      </router-link>
    </div>

    <!-- Legend -->
    <div class="absolute bottom-8 right-8 bg-[#141b27]/80 border border-[#1f2937] rounded-2xl p-6 backdrop-blur-sm max-w-xs">
      <p class="text-white font-semibold mb-3 text-sm">🌙 Funcionalidades:</p>
      <div class="grid grid-cols-2 gap-2">
        <div v-for="feature in features" :key="feature.id" class="flex items-center gap-2">
          <div class="w-2 h-2 rounded-full" :style="{ backgroundColor: feature.color }"></div>
          <span class="text-gray-300 text-xs">{{ feature.emoji }} {{ feature.name }}</span>
        </div>
      </div>
    </div>

    <!-- Stars background effect -->
    <div class="absolute inset-0 pointer-events-none overflow-hidden">
      <div
        v-for="i in 50"
        :key="i"
        class="absolute bg-white rounded-full opacity-30"
        :style="{
          width: Math.random() * 2 + 'px',
          height: Math.random() * 2 + 'px',
          left: Math.random() * 100 + '%',
          top: Math.random() * 100 + '%',
          animation: `twinkle ${Math.random() * 3 + 2}s infinite`
        }"
      />
    </div>
  </div>
</template>

<style scoped>
@keyframes twinkle {
  0%, 100% {
    opacity: 0.3;
  }
  50% {
    opacity: 0.8;
  }
}

canvas {
  display: block;
  transition: filter 0.3s;
}

canvas:hover {
  filter: drop-shadow(0 0 30px rgba(0, 242, 255, 0.3));
}
</style>

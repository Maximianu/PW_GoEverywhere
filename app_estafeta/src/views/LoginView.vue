<template>
  <div class="app-shell">
    <div class="screen login-screen">

      <div class="login-panel">

        <div class="field-group">
          <label>Email</label>
          <input v-model="username" />
        </div>

        <div class="field-group">
          <label>Palavra-passe</label>
          <input type="password" v-model="password" />
        </div>

        <button class="primary-btn login-btn" @click="login">
          Entrar
        </button>

        <p v-if="erro" class="error-message">
          Credenciais inválidas
        </p>

      </div>

      <div class="earth-3d-container" ref="canvasRef"></div>

    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { useRouter } from 'vue-router'
import * as THREE from 'three'

const username = ref('')
const password = ref('')
const erro = ref(false)
const router = useRouter()
const canvasRef = ref(null)

let reqId
let renderer

onMounted(() => {
  const container = canvasRef.value
  if (!container) return

  const width = container.clientWidth
  const height = container.clientHeight

  const scene = new THREE.Scene()
  const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000)
  camera.position.z = 4.5

  renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true })
  renderer.setSize(width, height)
  renderer.setPixelRatio(window.devicePixelRatio)
  container.appendChild(renderer.domElement)

  // Earth Geometry
  const geometry = new THREE.SphereGeometry(1.2, 64, 64)
  
  // Texture Loader
  const textureLoader = new THREE.TextureLoader()
  textureLoader.setCrossOrigin('anonymous')
  // Textura realista do modelo 3D (estilo Blue Marble)
  const earthTexture = textureLoader.load('https://unpkg.com/three-globe/example/img/earth-blue-marble.jpg')
  
  const material = new THREE.MeshStandardMaterial({
    map: earthTexture,
    roughness: 0.6,
    metalness: 0.1
  })
  
  const earth = new THREE.Mesh(geometry, material)
  scene.add(earth)

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
  directionalLight.position.set(5, 3, 5)
  scene.add(directionalLight)

  // Responsive scale and position function
  const updateEarthTransform = () => {
    if (!container) return
    const width = container.clientWidth
    const isMobile = width <= 450

    if (isMobile) {
      // Mobile positioning (as requested)
      earth.position.y = 0
      earth.position.x = 0.8
      earth.scale.set(1.2, 1.2, 1.2)
    } else {
      // Desktop/Larger screen: scale up so it doesn't "end"
      // Ratio of current width vs mobile width
      const ratio = width / 360
      earth.position.y = 0
      earth.position.x = 0.8 + (ratio - 1) * 0.5 // Push it slightly more right to keep the center of gravity
      earth.scale.set(1.2 * ratio * 0.8, 1.2 * ratio * 0.8, 1.2 * ratio * 0.8) 
    }
    earth.rotation.x = 0.2
  }

  updateEarthTransform()

  // Handle window resize
  const onResize = () => {
    if (!container) return
    const newWidth = container.clientWidth
    const newHeight = container.clientHeight
    camera.aspect = newWidth / newHeight
    camera.updateProjectionMatrix()
    renderer.setSize(newWidth, newHeight)
    updateEarthTransform()
  }
  window.addEventListener('resize', onResize)

  // Animation Loop
  const animate = () => {
    reqId = requestAnimationFrame(animate)
    earth.rotation.y += 0.0015
    renderer.render(scene, camera)
  }
  animate()
  
  // Cleanup resize listener
  onBeforeUnmount(() => {
    window.removeEventListener('resize', onResize)
  })
})

onBeforeUnmount(() => {
  if (reqId) cancelAnimationFrame(reqId)
  if (renderer) renderer.dispose()
})

async function login() {
  try {
    const response = await fetch(
      `http://localhost:1338/api/estafetas?filters[Email][$eq]=${username.value}&populate=*`
    )

    const result = await response.json()

    if (!result.data || result.data.length === 0) {
      erro.value = true
      return
    }

    const estafeta = result.data[0]

    if (estafeta.PIN !== password.value) {
      erro.value = true
      return
    }

    localStorage.setItem(
      'estafeta',
      JSON.stringify({
        id: estafeta.id,
        documentId: estafeta.documentId,
        nome: estafeta.Nome,
        email: estafeta.Email,
        telemovel: estafeta.Telemovel,
        area: estafeta.AreaDeAtuacao,
        disponivel: estafeta.Disponivel,
        idade: estafeta.Idade,
      }),
    )

    erro.value = false
    router.push('/entregas')
  } catch (error) {
    console.error(error)
    erro.value = true
  }
}

</script>
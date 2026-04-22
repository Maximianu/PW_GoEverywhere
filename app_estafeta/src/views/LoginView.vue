<template>
  <div class="app-shell">
    <div class="screen login-screen">

      <div class="login-panel">

        <div class="field-group">
          <label>Nome de Utilizador</label>
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
  
  // Position Earth a meio, ligeiramente à direita, e em grande
  earth.position.y = 0.1
  earth.position.x = 0.4
  earth.rotation.x = 0.2 // Inclinação menor para ver mais do equador
  scene.add(earth)

  // Lighting
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.3)
  scene.add(ambientLight)
  
  const directionalLight = new THREE.DirectionalLight(0xffffff, 1.8)
  directionalLight.position.set(5, 3, 5)
  scene.add(directionalLight)

  // Animation Loop
  const animate = () => {
    reqId = requestAnimationFrame(animate)
    earth.rotation.y += 0.0015
    renderer.render(scene, camera)
  }
  animate()
})

onBeforeUnmount(() => {
  if (reqId) cancelAnimationFrame(reqId)
  if (renderer) renderer.dispose()
})

function login() {
  if (username.value === '1234' && password.value === '1234') {
    erro.value = false
    router.push('/entregas')
  } else {
    erro.value = true
  }
}
</script>
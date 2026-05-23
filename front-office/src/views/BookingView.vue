<template>
  <main class="page-shell">
    <div class="booking-layout">
      
      <div class="canvas-side">
        <div class="canvas-header">
          <h1 class="page-title">Configure A Sua Viagem</h1>
          <p class="page-subtitle">Rode o planeta em foco ou clique nos planetas secundários ao fundo para viajar em Hyperspeed.</p>
        </div>

        <div class="three-container">
          <div ref="containerRef" class="canvas-mount-point"></div>
          
          <div v-if="isLoadingScene" class="scene-loader-overlay">
            <span class="spinner"></span>
            <p>A estabelecer projeção holográfica planetária...</p>
          </div>
          
          <div ref="labelsContainer" class="three-labels-layer">
            <div 
              v-for="missao in bookingStore.missoes" \r
              :key="missao.documentId || missao.id"
              :data-id="missao.documentId || missao.id"
              class="planet-label"
              @click="selectFromLabel(missao)"
            >
              <div class="label-pulse" :style="{ backgroundColor: getPlanetColor(missao), boxShadow: '0 0 12px ' + getPlanetColor(missao) }"></div>
              <div class="label-content" :style="{ borderColor: getPlanetColor(missao) }">
                <span class="label-name">{{ getNomeMissao(missao) }}</span>
                <span class="label-date">{{ getMissaoData(missao) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="panel-side">
        <section class="panel config-panel">
          
          <div v-if="!bookingStore.missaoSelecionada" class="empty-selection-state">
            <div class="radar-icon">📡</div>
            <h3>Nenhum Alvo Adquirido</h3>
            <p>Por favor, selecione um planeta e clique num dos marcadores orbitais ativos para carregar os parâmetros de telemetria.</p>
          </div>

          <div v-else class="config-flow animate-fade-in">
            <div class="section-header-inline">
              <span class="small-tag">Telemetria Ativa</span>
              <button class="btn-clear" @click="bookingStore.missaoSelecionada = null">Mudar Destino ↩</button>
            </div>
            
            <h2 class="selected-mission-title">{{ getNomeMissao(bookingStore.missaoSelecionada) }}</h2>
            
            <p class="mission-description">
              {{ getPropSafe(bookingStore.missaoSelecionada, 'Descricao_missao') || 'Sem descrição operacional disponível para esta rota.' }}
            </p>
            
            <div class="mission-tech-specs">
              <div class="spec-item">
                <span class="spec-label">Planeta Alvo</span>
                <span class="spec-value" :style="{ color: getPlanetColor(bookingStore.missaoSelecionada) }">
                  {{ getPropSafe(bookingStore.missaoSelecionada, 'Planeta') || 'N/A' }}
                </span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Data de Partida</span>
                <span class="spec-value">{{ getMissaoData(bookingStore.missaoSelecionada) }}</span>
              </div>
              <div class="spec-item">
                <span class="spec-label">Lotação Disponível</span>
                <span class="spec-value">{{ bookingStore.numeroPassageiros }} Lugares</span>
              </div>
            </div>

            <div class="config-section-block">
              <label class="field-label">02. Kit de Sobrevivência Selecionado</label>
              <div class="kit-selection-display">
                <div v-if="bookingStore.selectedKit" class="kit-selected-card animate-fade-in">
                  <div class="kit-info">
                    <span class="kit-name">{{ bookingStore.selectedKitLabel }}</span>
                  </div>
                  <span class="kit-price">+ {{bookingStore.kitPrice}}€</span>
                </div>
                <div v-else class="kit-empty-card">
                  <span class="empty-text">Não escolhido</span>
                </div>
              </div>
            </div>

            <div class="summary-box">
              <h4 class="summary-title">Sumário do Preço</h4>
              
              <div class="summary-line">
                <span>Custo Base da Missão</span>
                <span>{{ custoBaseExibido }} €</span>
              </div>
              
              <div class="summary-line" v-if="bookingStore.storedSelectedKit">
                <span>Kit Equipamento ({{ getPropSafe(bookingStore.storedSelectedKit, 'Nome') || 'Selecionado' }})</span>
                <span>{{ getPropSafe(bookingStore.storedSelectedKit, 'Preco') || 0 }} €</span>
              </div>

              <div class="summary-total">
                <span>Custo Total</span>
                <span class="total-value">{{ precoTotalCalculado }} €</span>
              </div>

              <button class="btn-primary-action" @click="irParaEscolhaDeKit">
                Escolher Kit →
              </button>
            </div>

          </div>
        </section>
      </div>

    </div>
  </main>
</template>

<script setup>
import { useBookingStore } from '../stores/BookingStore'
import { computed, ref, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRouter } from 'vue-router' // Importação do router adicionada
import * as THREE from 'three'

const bookingStore = useBookingStore()
const router = useRouter() // Instanciação do router

const containerRef = ref(null)
const labelsContainer = ref(null)
const isDragging = ref(false)
const isLoadingScene = ref(true)
const planetaFocado = ref('Terra')
let dragStartPosition = { x: 0, y: 0 }

let scene, camera, renderer, raycaster, mouse, animationId = null
let earth, moon, mars, earthWrapper, moonWrapper, marsWrapper, stars, warpLines
let currentLayout = 'Terra'
let activeMainPlanet = null
let isWarping = false
let warpProgress = 0
let warpSourceLayout = null
let warpTargetLayout = null
const points = []
const missionPinGroups = []

// Computadas corrigidas para garantir persistência e formatação correta
let kitSelecionado = bookingStore.storedSelectedKit/*computed(() => {
  if (!bookingStore.selectedKitId) return null
  return bookingStore.kits.find(kit => String(kit.id) === String(bookingStore.selectedKitId)) || null
})*/

const custoBaseExibido = computed(() => {
  const m = bookingStore.missaoSelecionada
  if (!m) return 0
  return m.Preco ?? m.preco ?? m.attributes?.Preco ?? m.attributes?.preco ?? 0
})

// Correção estrita da soma matemática (Evita concatenação de strings)
const precoTotalCalculado = computed(() => {
  console.log(bookingStore.selectedKit)
  const base = Number(custoBaseExibido.value) || 0
  const kit = bookingStore.kitPrice ? Number(bookingStore.kitPrice) : 0
  return base + kit
})

const irParaEscolhaDeKit = () => {
  // Altera a rota para a página onde o utilizador escolhe os kits
  // Ajusta o caminho '/kit' para coincidir exatamente com a tua rota de kits se for diferente
  router.push('/kit') 
}

const selectFromLabel = (missao) => {
  if (isDragging.value || isWarping) return
  const missaoPlanet = normalizePlanetKey(getPropSafe(missao, 'Planeta'))
  if (missaoPlanet === planetaFocado.value) {
    bookingStore.selecionarMissao(missao)
  } else {
    startWarp(missaoPlanet)
  }
}

const getPropSafe = (obj, prop) => {
  if (!obj) return null
  if (obj[prop] !== undefined) return obj[prop]
  if (obj.attributes && obj.attributes[prop] !== undefined) return obj.attributes[prop]
  return null
}

const getNomeMissao = (missao) => {
  return getPropSafe(missao, 'Nome') || 'Missão Sem Nome'
}

const getMissaoData = (missao) => {
  const rawDate = getPropSafe(missao, 'Data')
  if (!rawDate) return 'Data pendente'
  const date = new Date(rawDate)
  return date.toLocaleDateString('pt-PT', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const normalizePlanetKey = (value) => {
  const key = String(value || '').trim().toLowerCase()
  if (key === 'lua') return 'Lua'
  if (key === 'marte') return 'Marte'
  return 'Terra'
}

const getPlanetColor = (missao) => {
  const p = normalizePlanetKey(getPropSafe(missao, 'Planeta'))
  if (p === 'Lua') return '#fff5ab'
  if (p === 'Marte') return '#ff5722'
  return '#00f2ff'
}

const planetMeta = {
  Terra: { radius: 95, color: 0x00f2ff, texture: '/terra.jpg', rotationZ: 23.5 * Math.PI / 180, mesh: null, wrapper: null },
  Lua: { radius: 60, color: 0xfff5ab, texture: '/moon.jpg', rotationZ: 0, mesh: null, wrapper: null },
  Marte: { radius: 75, color: 0xff5722, texture: '/marte.jpg', rotationZ: 25 * Math.PI / 180, mesh: null, wrapper: null }
}

const layouts = {
  Terra: { earth: { pos: [0, 0, 0], scale: 1 }, moon: { pos: [240, 100, -300], scale: 0.4 }, mars: { pos: [-240, -100, -400], scale: 0.45 } },
  Lua: { earth: { pos: [-240, -100, -400], scale: 0.5 }, moon: { pos: [0, 0, 0], scale: 1.3 }, mars: { pos: [240, 100, -300], scale: 0.45 } },
  Marte: { earth: { pos: [240, 100, -300], scale: 0.5 }, moon: { pos: [-240, -100, -400], scale: 0.4 }, mars: { pos: [0, 0, 0], scale: 1.1 } }
}

const lerp = (a, b, t) => a + (b - a) * t
const smoothStep = (t) => t * t * (3 - 2 * t)

const lerpArc = (fromPos, toPos, t, swingUnits = 150) => {
  const lx = lerp(fromPos[0], toPos[0], t)
  const ly = lerp(fromPos[1], toPos[1], t)
  const lz = lerp(fromPos[2], toPos[2], t)
  const arcPeak = Math.sin(Math.PI * t)
  const dx = toPos[0] - fromPos[0]
  const dz = toPos[2] - fromPos[2]
  const horizLen = Math.sqrt(dx * dx + dz * dz) || 1
  return [lx + (-dz / horizLen) * swingUnits * arcPeak, ly, lz + (dx / horizLen) * swingUnits * arcPeak]
}

const applyInterpolatedLayout = (t) => {
  if (!warpSourceLayout || !warpTargetLayout) return
  ;['earth', 'moon', 'mars'].forEach((layoutKey) => {
    const wrapper = layoutKey === 'earth' ? earthWrapper : layoutKey === 'moon' ? moonWrapper : marsWrapper
    const mesh = layoutKey === 'earth' ? earth : layoutKey === 'moon' ? moon : mars
    if (!wrapper || !mesh) return
    const from = warpSourceLayout[layoutKey]
    const to = warpTargetLayout[layoutKey]
    const swing = (from.pos[0] === 0 || to.pos[0] === 0) ? 180 : 100
    const newPos = lerpArc(from.pos, to.pos, t, swing)
    wrapper.position.set(newPos[0], newPos[1], newPos[2])
    const currentScale = lerp(from.scale, to.scale, t)
    mesh.scale.set(currentScale, currentScale, currentScale)
  })
}

const startWarp = (targetPlanet) => {
  if (isWarping || currentLayout === targetPlanet) return
  bookingStore.missaoSelecionada = null
  warpSourceLayout = layouts[currentLayout]
  warpTargetLayout = layouts[targetPlanet]
  currentLayout = targetPlanet
  planetaFocado.value = targetPlanet
  activeMainPlanet = planetMeta[targetPlanet].mesh
  isWarping = true
  warpProgress = 0
}

const randomUnitVector = () => {
  const u = Math.random()
  const phi = Math.acos(2 * u - 1)
  const theta = 2 * Math.PI * Math.random()
  return new THREE.Vector3(Math.sin(phi) * Math.cos(theta), Math.sin(phi) * Math.sin(theta), Math.cos(phi))
}

const createPinMesh = (color) => {
  const pinGroup = new THREE.Group()
  const headGeo = new THREE.SphereGeometry(4, 16, 16)
  const headMat = new THREE.MeshBasicMaterial({ color })
  const head = new THREE.Mesh(headGeo, headMat)
  pinGroup.add(head)
  return pinGroup
}

const createStars = () => {
  const geo = new THREE.BufferGeometry()
  const vertices = []
  for (let i = 0; i < 2000; i++) {
    let x = (Math.random() - 0.5) * 4000, y = (Math.random() - 0.5) * 4000, z = (Math.random() - 0.5) * 4000
    if (x * x + y * y + z * z > 1200 * 1200) vertices.push(x, y, z)
  }
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
  stars = new THREE.Points(geo, new THREE.PointsMaterial({ color: 0xffffff, size: 0.9, transparent: true, opacity: 0.8 }))
  scene.add(stars)
}

const createWarpLines = () => {
  const geo = new THREE.BufferGeometry()
  const vertices = []
  for (let i = 0; i < 1000; i++) {
    let x = Math.random() * 2000 - 1000, y = Math.random() * 2000 - 1000
    if (x * x + y * y < 200 * 200) continue
    const z = Math.random() * 4000 - 3000, length = Math.random() * 90 + 60
    vertices.push(x, y, z, x, y, z + length)
  }
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(vertices), 3))
  warpLines = new THREE.LineSegments(geo, new THREE.LineBasicMaterial({ color: 0x00f2ff, transparent: true, opacity: 0, blending: THREE.AdditiveBlending }))
  scene.add(warpLines)
}

const createMissionPins = () => {
  points.length = 0
  const missoes = bookingStore.missoes || []
  
  missoes.forEach((missao) => {
    const planetKey = normalizePlanetKey(getPropSafe(missao, 'Planeta'))
    const meta = planetMeta[planetKey]
    if (!meta || !meta.mesh) return

    let x = parseFloat(getPropSafe(missao, 'X')), y = parseFloat(getPropSafe(missao, 'Y')), z = parseFloat(getPropSafe(missao, 'Z'))
    const v = new THREE.Vector3(Number.isFinite(x) ? x : 0, Number.isFinite(y) ? y : 0, Number.isFinite(z) ? z : 0)
    
    if (v.length() === 0) v.copy(randomUnitVector())
    else v.normalize()

    const pin = createPinMesh(meta.color)
    pin.position.copy(v.clone().multiplyScalar(meta.radius + 5))
    pin.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), v)

    pin.children[0].userData = {
      id: missao.documentId || missao.id,
      name: getNomeMissao(missao),
      date: getMissaoData(missao),
      color: meta.color,
      planet: planetKey,
      missao
    }

    meta.mesh.add(pin)
    missionPinGroups.push(pin)
    points.push(pin.children[0])
  })
}

const loadPlanets = () => {
  const loader = new THREE.TextureLoader()
  const keys = ['Terra', 'Lua', 'Marte']
  let processed = 0

  keys.forEach((key) => {
    const meta = planetMeta[key]
    const wrapper = new THREE.Group()
    scene.add(wrapper)

    if (key === 'Terra') earthWrapper = wrapper
    if (key === 'Lua') moonWrapper = wrapper
    if (key === 'Marte') marsWrapper = wrapper

    loader.load(meta.texture, 
      (tex) => {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(meta.radius, 64, 64),
          new THREE.MeshStandardMaterial({ map: tex, roughness: 0.8, metalness: 0.1 })
        )
        mesh.rotation.z = meta.rotationZ
        wrapper.add(mesh)
        meta.mesh = mesh
        
        if (key === 'Terra') earth = mesh
        if (key === 'Lua') moon = mesh
        if (key === 'Marte') mars = mesh

        processed++
        if (processed === 3) finalizeSetup()
      },
      undefined,
      () => {
        const mesh = new THREE.Mesh(
          new THREE.SphereGeometry(meta.radius, 24, 24),
          new THREE.MeshStandardMaterial({ color: meta.color, wireframe: true, transparent: true, opacity: 0.35 })
        )
        mesh.rotation.z = meta.rotationZ
        wrapper.add(mesh)
        meta.mesh = mesh

        if (key === 'Terra') earth = mesh
        if (key === 'Lua') moon = mesh
        if (key === 'Marte') mars = mesh

        processed++
        if (processed === 3) finalizeSetup()
      }
    )
  })
}

const finalizeSetup = () => {
  // INTELIGÊNCIA DE PERSISTÊNCIA: Se já havia uma missão ativa vinda da outra página, foca nela
  if (bookingStore.missaoSelecionada) {
    const pKey = normalizePlanetKey(getPropSafe(bookingStore.missaoSelecionada, 'Planeta'))
    currentLayout = pKey
    planetaFocado.value = pKey
  } else {
    currentLayout = 'Terra'
    planetaFocado.value = 'Terra'
  }

  activeMainPlanet = currentLayout === 'Terra' ? earth : currentLayout === 'Lua' ? moon : mars
  warpSourceLayout = layouts[currentLayout]
  warpTargetLayout = layouts[currentLayout]
  
  applyInterpolatedLayout(1)
  createMissionPins()
  isLoadingScene.value = false
  nextTick(updateLabels)
}

const updateLabels = () => {
  if (!camera || !renderer || !labelsContainer.value) return
  const v = new THREE.Vector3()
  const wHalf = renderer.domElement.clientWidth / 2, hHalf = renderer.domElement.clientHeight / 2

  points.forEach(p => {
    p.getWorldPosition(v)
    v.project(camera)
    const el = labelsContainer.value.querySelector(`[data-id="${p.userData.id}"]`)
    const shouldShow = !isDragging.value && !isWarping && v.z <= 1 && p.userData.planet === planetaFocado.value

    if (el) {
      const x = (v.x * wHalf) + wHalf, y = -(v.y * hHalf) + hHalf
      el.style.transform = `translate(-50%, -100%) translate(${x}px, ${y}px)`
      el.style.opacity = shouldShow ? '1' : '0'
      el.style.pointerEvents = shouldShow ? 'auto' : 'none'
    }
  })
}

const onMouseMove = (e) => {
  if (!containerRef.value || !camera || !raycaster) return
  const rect = containerRef.value.getBoundingClientRect()
  mouse.x = ((e.clientX - rect.left) / containerRef.value.clientWidth) * 2 - 1
  mouse.y = -((e.clientY - rect.top) / containerRef.value.clientHeight) * 2 + 1

  raycaster.setFromCamera(mouse, camera)
  const activePins = points.filter(p => p.userData.planet === planetaFocado.value)
  if (raycaster.intersectObjects(activePins).length > 0) {
    containerRef.value.style.cursor = 'pointer'
    return
  }

  const targets = [moon, earth, mars].filter(p => p && p !== activeMainPlanet)
  containerRef.value.style.cursor = raycaster.intersectObjects(targets).length > 0 ? 'pointer' : (isDragging.value ? 'grabbing' : 'grab')
}

const onContainerClick = (e) => {
  if (Math.hypot(e.clientX - dragStartPosition.x, e.clientY - dragStartPosition.y) > 5) return
  raycaster.setFromCamera(mouse, camera)
  
  const activePins = points.filter(p => p.userData.planet === planetaFocado.value)
  const hits = raycaster.intersectObjects(activePins)
  if (hits.length > 0) {
    bookingStore.selecionarMissao(hits[0].object.userData.missao)
    return
  }

  const planetHits = raycaster.intersectObjects([moon, earth, mars].filter(Boolean))
  if (planetHits.length > 0) {
    let hitObj = planetHits[0].object
    while (hitObj && hitObj.type !== 'Mesh') hitObj = hitObj.parent
    if (hitObj === moon && planetaFocado.value !== 'Lua') startWarp('Lua')
    else if (hitObj === earth && planetaFocado.value !== 'Terra') startWarp('Terra')
    else if (hitObj === mars && planetaFocado.value !== 'Marte') startWarp('Marte')
  }
}

const onWindowResize = () => {
  if (!containerRef.value || !renderer) return
  camera.aspect = containerRef.value.clientWidth / containerRef.value.clientHeight
  camera.updateProjectionMatrix()
  renderer.setSize(containerRef.value.clientWidth, containerRef.value.clientHeight)
  updateLabels()
}

const animate = () => {
  animationId = requestAnimationFrame(animate)

  if (isWarping) {
    warpProgress += 0.008
    const easeInOut = (t) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2

    let fov = 45, opacity = 0, speed = 0, scaleZ = 1
    if (warpProgress <= 0.4) {
      const e = easeInOut(warpProgress / 0.4)
      fov = 45 + e * 12
      opacity = e * 0.7
      speed = 5 + e * 15
      scaleZ = 1 + e * 2.5
    } else {
      const p = (warpProgress - 0.4) / 0.6
      const e = smoothStep(p), peak = Math.sin(e * Math.PI)
      fov = 57 + peak * 22
      opacity = 0.7 + peak * 0.3
      speed = 20 + peak * 30
      scaleZ = 3.5 + peak * 6.0
      if (p > 0.7) opacity *= (1 - easeInOut((p - 0.7) / 0.3))
    }

    applyInterpolatedLayout(smoothStep(Math.min(Math.max((warpProgress - 0.05) / 0.9, 0), 1)))
    camera.fov = fov

    if (warpLines) {
      warpLines.material.opacity = opacity
      warpLines.scale.z = scaleZ
      const pos = warpLines.geometry.attributes.position.array
      for (let i = 0; i < pos.length; i += 6) {
        pos[i + 2] += speed
        pos[i + 5] += speed
        if (pos[i + 2] > 500) {
          const len = pos[i + 5] - pos[i + 2]
          pos[i + 2] = Math.random() * -1000 - 4000
          pos[i + 5] = pos[i + 2] + len
        }
      }
      warpLines.geometry.attributes.position.needsUpdate = true
    }
    if (stars) stars.material.opacity = 1 - opacity * 0.8
    camera.updateProjectionMatrix()

    if (warpProgress >= 1) {
      isWarping = false
      camera.fov = 45
      if (warpLines) warpLines.material.opacity = 0
      if (stars) stars.material.opacity = 0.8
      camera.updateProjectionMatrix()
      applyInterpolatedLayout(1)
    }
  }

  if (activeMainPlanet && !isDragging.value && !isWarping) activeMainPlanet.rotation.y += 0.0012
  if (earth && activeMainPlanet !== earth) earth.rotation.y += 0.0004
  if (moon && activeMainPlanet !== moon) moon.rotation.y += 0.0006
  if (mars && activeMainPlanet !== mars) mars.rotation.y += 0.0005

  updateLabels()
  if (renderer && scene && camera) renderer.render(scene, camera)
}

const initThreeJS = () => {
  const container = containerRef.value
  if (!container) return

  scene = new THREE.Scene()
  camera = new THREE.PerspectiveCamera(45, container.clientWidth / container.clientHeight, 0.1, 5000)
  camera.position.set(0, 0, 480)

  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
  renderer.setSize(container.clientWidth, container.clientHeight)
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
  container.appendChild(renderer.domElement)

  scene.add(new THREE.AmbientLight(0xffffff, 0.65))
  const sunLight = new THREE.DirectionalLight(0xffffff, 0.9)
  sunLight.position.set(100, 50, 100)
  scene.add(sunLight)

  createStars()
  createWarpLines()
  loadPlanets()

  raycaster = new THREE.Raycaster()
  mouse = new THREE.Vector2()

  window.addEventListener('mousemove', onMouseMove)
  container.addEventListener('click', onContainerClick)
  window.addEventListener('resize', onWindowResize)

  container.addEventListener('mousedown', (e) => {
    const rect = containerRef.value.getBoundingClientRect()
    dragStartPosition = { x: e.clientX, y: e.clientY }
    raycaster.setFromCamera(new THREE.Vector2(((e.clientX - rect.left) / containerRef.value.clientWidth) * 2 - 1, -((e.clientY - rect.top) / containerRef.value.clientHeight) * 2 + 1), camera)
    if (raycaster.intersectObject(activeMainPlanet, true).length > 0) isDragging.value = true
  })

  window.addEventListener('mousemove', (e) => {
    if (isDragging.value && activeMainPlanet) {
      activeMainPlanet.rotation.y += (e.clientX - dragStartPosition.x) * 0.005
      activeMainPlanet.rotation.x += (e.clientY - dragStartPosition.y) * 0.005
      dragStartPosition = { x: e.clientX, y: e.clientY }
    }
  })

  window.addEventListener('mouseup', () => { setTimeout(() => { isDragging.value = false }, 50) })
  animate()
}

onMounted(async () => {
  await bookingStore.fetchMissoes()
  // REMOVIDO: bookingStore.missaoSelecionada = null (Causava o bug de limpar tudo ao voltar atrás!)
  await bookingStore.fetchKits()
  nextTick(initThreeJS)
})

onBeforeUnmount(() => {
  if (animationId) cancelAnimationFrame(animationId)
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('resize', onWindowResize)
  renderer?.dispose()
})
</script>

<style scoped>
.page-shell {
  padding: 100px 40px 40px 40px;
  background-color: #0b0e14;
  min-height: 100vh;
  box-sizing: border-box;
}
.booking-layout {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  gap: 40px;
  height: calc(100vh - 140px);
}
.canvas-side {
  display: flex;
  flex-direction: column;
  position: relative;
}
.canvas-header { margin-bottom: 16px; }
.page-title {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 36px;
  color: #e1fdff;
  margin: 0 0 6px 0;
}
.page-subtitle {
  color: rgba(185, 202, 203, 0.6);
  font-size: 14px;
  margin: 0;
}
.three-container {
  flex: 1;
  background: radial-gradient(circle at center, #121824 0%, #07090d 100%);
  border: 1px solid rgba(0, 242, 255, 0.08);
  border-radius: 8px;
  position: relative;
  overflow: hidden;
}
.canvas-mount-point { width: 100%; height: 100%; }
.scene-loader-overlay {
  position: absolute;
  inset: 0;
  background: #0b0e14;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  color: #00f2ff;
  z-index: 10;
  font-size: 14px;
}
.three-labels-layer {
  position: absolute;
  inset: 0;
  pointer-events: none;
  z-index: 5;
}
.planet-label {
  position: absolute;
  left: 0; top: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  cursor: pointer;
  pointer-events: auto;
  transition: opacity 0.25s ease;
}
.label-pulse {
  width: 12px; height: 12px;
  border-radius: 50%;
  margin-bottom: 6px;
}
.label-content {
  background: rgba(11, 14, 20, 0.95);
  border: 1px solid transparent;
  padding: 8px 12px;
  border-radius: 4px;
  display: flex;
  flex-direction: column;
  align-items: center;
  white-space: nowrap;
  box-shadow: 0 4px 20px rgba(0,0,0,0.6);
}
.label-name { color: #fff; font-weight: 700; font-size: 12px; }
.label-date { color: rgba(255,255,255,0.4); font-size: 10px; margin-top: 2px; }
.panel-side { height: 100%; }
.config-panel {
  background: #181c22;
  border: 1px solid rgba(255, 255, 255, 0.05);
  padding: 32px;
  border-radius: 8px;
  height: 100%;
  box-sizing: border-box;
  overflow-y: auto;
}
.empty-selection-state {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: rgba(185, 202, 203, 0.5);
  padding: 20px;
}
.radar-icon { font-size: 48px; margin-bottom: 16px; }
.empty-selection-state h3 { color: #e1fdff; margin: 0 0 12px 0; }
.section-header-inline {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.small-tag {
  color: #00f2ff;
  font-size: 11px;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  font-weight: 700;
}
.btn-clear {
  background: transparent;
  border: none;
  color: rgba(225, 253, 255, 0.4);
  cursor: pointer;
  font-size: 12px;
}
.selected-mission-title { color: #e1fdff; margin: 0 0 8px 0; font-size: 26px; }

/* Estilização da descrição da missão */
.mission-description {
  color: rgba(185, 202, 203, 0.65);
  font-size: 13px;
  line-height: 1.6;
  margin: 0 0 24px 0;
  background: rgba(0, 0, 0, 0.15);
  padding: 12px;
  border-radius: 6px;
  border-left: 2px solid rgba(0, 242, 255, 0.3);
}

.mission-tech-specs {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  background: #0b0e14;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 24px;
  border-left: 3px solid #00f2ff;
}
.spec-item { display: flex; flex-direction: column; }
.spec-label { font-size: 10px; color: rgba(185, 202, 203, 0.4); text-transform: uppercase; }
.spec-value { font-size: 13px; font-weight: 600; margin-top: 4px; }
.config-section-block { margin-bottom: 28px; }
.field-label { display: block; font-size: 11px; color: rgba(225, 253, 255, 0.4); margin-bottom: 12px; }

/* Estilos da secção dinâmica do Kit Escolhido */
.kit-selection-display { width: 100%; }
.kit-selected-card {
  background: #0b0e14;
  border: 1px solid rgba(0, 242, 255, 0.25);
  padding: 14px 18px;
  border-radius: 6px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.05);
}
.kit-empty-card {
  background: rgba(0, 0, 0, 0.2);
  border: 1px dashed rgba(255, 255, 255, 0.1);
  padding: 14px 18px;
  border-radius: 6px;
  text-align: center;
}
.empty-text {
  color: rgba(185, 202, 203, 0.4);
  font-size: 13px;
  font-style: italic;
}
.kit-info { display: flex; flex-direction: column; }
.kit-name { color: #e1fdff; font-size: 14px; font-weight: 600; }
.kit-desc { color: rgba(185, 202, 203, 0.5); font-size: 11px; margin-top: 2px; }
.kit-price { color: #00f2ff; font-weight: 700; font-size: 14px; }

.summary-box {
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}
.summary-title { color: rgba(185, 202, 203, 0.4); font-size: 11px; }
.summary-line { display: flex; justify-content: space-between; font-size: 13px; color: rgba(185, 202, 203, 0.8); }
.summary-total {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 10px;
  padding-top: 12px;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
  font-weight: 700;
}
.total-value { font-size: 24px; color: #00f2ff; text-shadow: 0 0 10px rgba(0, 242, 255, 0.2); }
.btn-primary-action {
  width: 100%;
  background: #00f2ff;
  color: #00363a;
  border: none;
  padding: 16px;
  font-weight: 700;
  border-radius: 4px;
  text-transform: uppercase;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 8px;
}
.btn-primary-action:hover {
  background: #53e4ff;
  box-shadow: 0 0 15px rgba(0, 242, 255, 0.3);
}
.spinner {
  width: 24px; height: 24px;
  border: 2px solid rgba(0, 242, 255, 0.2);
  border-top-color: #00f2ff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
@keyframes spin { to { transform: rotate(360deg); } }
.animate-fade-in {
  animation: fadeIn 0.4s ease forwards;
}
@keyframes fadeIn {
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
}
@media (max-width: 1024px) {
  .booking-layout { grid-template-columns: 1fr; height: auto; }
  .three-container { height: 400px; }
}
</style>
<script setup>
import { onMounted, onUnmounted, ref, computed, watch } from 'vue'
import { MapPin, RefreshCw, Wifi, WifiOff, Search, X, ChevronLeft, ChevronRight } from 'lucide-vue-next'
import L from 'leaflet'

const STRAPI_TOKEN = import.meta.env.VITE_STRAPI_TOKEN || ''
const POLLING_INTERVAL = 10000

const mapContainer = ref(null)
const courierData = ref([])
const isLoading = ref(false)
const isConnected = ref(false)
const lastUpdate = ref(null)
const error = ref(null)
const searchQuery = ref('')
const filterDisponivel = ref('todos')
const showSidebar = ref(false)
let map = null
let markerMap = {}
let pollingTimer = null
let firstLoad = true

const disponiveis = computed(() => courierData.value.filter(c => c.disponivel === true).length)
const ocupados = computed(() => courierData.value.filter(c => c.disponivel === false).length)
const lastUpdateFormatted = computed(() =>
  lastUpdate.value ? lastUpdate.value.toLocaleTimeString('pt-PT') : '--'
)

const filteredCouriers = computed(() => {
  return courierData.value.filter(c => {
    const matchSearch =
      !searchQuery.value ||
      c.nome.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      c.area.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchFilter =
      filterDisponivel.value === 'todos' ||
      (filterDisponivel.value === 'disponivel' && c.disponivel) ||
      (filterDisponivel.value === 'ocupado' && !c.disponivel)
    return matchSearch && matchFilter
  })
})

watch(filteredCouriers, () => {
  updateMapMarkers()
}, { deep: true })

// Observar a abertura/fecho da sidebar para recalcular o tamanho do mapa
watch(showSidebar, () => {
  if (map) {
    setTimeout(() => {
      map.invalidateSize({ animate: true })
    }, 300) // Tempo da transição CSS da sidebar
  }
})

const searchLocation = async () => {
  if (!searchQuery.value || !map) return
  try {
    const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery.value)}&limit=1`)
    const data = await response.json()
    if (data && data.length > 0) {
      const { lat, lon } = data[0]
      map.setView([lat, lon], 13, { animate: true })
    }
  } catch (err) {
    console.error("Erro na pesquisa de localização:", err)
  }
}

const loadLeafletCSS = () => {
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link')
    link.id = 'leaflet-css'
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }
}

const fetchCouriers = async () => {
  try {
    isLoading.value = true
    error.value = null
    const headers = {
      'Content-Type': 'application/json',
      ...(STRAPI_TOKEN && { Authorization: `Bearer ${STRAPI_TOKEN}` })
    }
    const res = await fetch(`/api/estafetas?populate=*&pagination[pageSize]=100`, { headers })
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()

    courierData.value = (json.data || []).map(item => {
      const a = item.attributes ?? item
      return {
        id: item.id,
        nome: a.Nome ?? a.nome ?? `Estafeta ${item.id}`,
        disponivel: a.Disponivel ?? a.disponivel ?? false,
        area: a.AreaDeAtuacao ?? a.areaDeAtuacao ?? '',
        telemovel: a.Telemovel ?? a.telemovel ?? null,
        latitude: parseFloat(a.Latitude ?? a.latitude ?? 0),
        longitude: parseFloat(a.Longitude ?? a.longitude ?? 0),
      }
    }).filter(c => c.latitude !== 0)

    isConnected.value = true
    lastUpdate.value = new Date()
    updateMapMarkers()
  } catch (err) {
    error.value = err.message
    isConnected.value = false
    courierData.value = [
      { id: 7, nome: 'Jorge Alves', disponivel: true, area: 'Porto', telemovel: '910000001', latitude: 41.1579, longitude: -8.6291 },
      { id: 9, nome: 'Maria Silva', disponivel: false, area: 'Guimarães', telemovel: '910000002', latitude: 41.4425, longitude: -8.2918 },
      { id: 5, nome: 'Paulo Costa', disponivel: true, area: 'Braga', telemovel: '910000003', latitude: 41.5503, longitude: -8.4200 },
      { id: 11, nome: 'Sofia Martins', disponivel: true, area: 'Braga', telemovel: '910000004', latitude: 41.5450, longitude: -8.4280 }
    ]
    lastUpdate.value = new Date()
    updateMapMarkers()
  } finally {
    isLoading.value = false
  }
}

const getInitials = (nome) => {
  return nome.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
}

const createCustomMarker = (courier) => {
  const color = courier.disponivel ? '#16a34a' : '#1e3a8a'
  const initials = getInitials(courier.nome)
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 38px; height: 38px; border-radius: 50%;
        border: 3px solid white;
        display: flex; align-items: center; justify-content: center;
        box-shadow: 0 2px 10px rgba(0,0,0,0.3);
        cursor: pointer;
        font-family: 'DM Sans', sans-serif;
        font-size: 11px; font-weight: 700;
        color: white; letter-spacing: 0.5px;
      ">${initials}</div>`,
    iconSize: [38, 38],
    iconAnchor: [19, 19],
    popupAnchor: [0, -22],
    className: 'custom-marker'
  })
}

const buildPopup = (c) => {
  const color = c.disponivel ? '#16a34a' : '#1e3a8a'
  const label = c.disponivel ? 'Disponível' : 'Ocupado'
  const initials = getInitials(c.nome)
  return `
    <div style="font-family:'DM Sans',sans-serif;padding:4px 2px;min-width:180px;">
      <div style="display:flex;align-items:center;gap:10px;margin-bottom:10px;">
        <div style="width:40px;height:40px;border-radius:50%;background:${color};
          display:flex;align-items:center;justify-content:center;
          color:white;font-weight:700;font-size:13px;flex-shrink:0;">${initials}</div>
        <div>
          <div style="font-weight:700;font-size:14px;color:#111827;">${c.nome}</div>
          <div style="font-size:12px;color:#6b7280;">${c.area}</div>
        </div>
      </div>
      <div style="display:flex;align-items:center;justify-content:space-between;">
        <span style="display:inline-flex;align-items:center;gap:4px;padding:3px 10px;border-radius:999px;
          background:${c.disponivel ? '#dcfce7' : '#dbeafe'};color:${color};font-size:11px;font-weight:600;">
          <span style="width:6px;height:6px;border-radius:50%;background:${color};display:inline-block;"></span>
          ${label}
        </span>
        ${c.telemovel ? `<span style="font-size:11px;color:#9ca3af;">${c.telemovel}</span>` : ''}
      </div>
    </div>`
}

const updateMapMarkers = () => {
  if (!map) return
  const currentIds = new Set(filteredCouriers.value.map(c => String(c.id)))
  
  Object.keys(markerMap).forEach(id => {
    if (!currentIds.has(id)) { 
        markerMap[id].remove()
        delete markerMap[id] 
    }
  })

  filteredCouriers.value.forEach(courier => {
    const key = String(courier.id)
    const latlng = [courier.latitude, courier.longitude]
    
    if (markerMap[key]) {
      markerMap[key].setLatLng(latlng)
      markerMap[key].setIcon(createCustomMarker(courier))
      markerMap[key].getPopup()?.setContent(buildPopup(courier))
    } else {
      const marker = L.marker(latlng, { icon: createCustomMarker(courier) }).addTo(map)
      marker.bindPopup(buildPopup(courier), { className: 'clean-popup' })
      markerMap[key] = marker
    }
  })

  if (firstLoad && Object.keys(markerMap).length > 0) {
    firstLoad = false
    fitMarkers()
  }
}

const fitMarkers = () => {
  const all = Object.values(markerMap)
  if (map && all.length > 0) {
    // Ajusta o enquadramento considerando o espaço da sidebar se ela estiver aberta
    const paddingOptions = showSidebar.value ? [40, 380] : [80, 80]
    map.fitBounds(new L.featureGroup(all).getBounds(), { padding: paddingOptions })
  }
}

const focusOnCourier = (courier) => {
  if (!map || !markerMap[String(courier.id)]) return
  
  const latlng = [courier.latitude, courier.longitude]
  
  // Se a sidebar estiver aberta, definimos um padding para o centro visual
  // O Leaflet vai "empurrar" o marcador para a esquerda do centro real do mapa
  const options = {
    animate: true,
    duration: 0.8
  }

  if (showSidebar.value) {
    // paddingTopLeft: [x, y] -> reserva 340px (largura sidebar) + margem à direita
    map.flyTo(latlng, 14, {
      ...options,
      paddingTopLeft: [0, 0],
      paddingBottomRight: [340, 0] 
    })
  } else {
    map.flyTo(latlng, 14, options)
  }

  markerMap[String(courier.id)].openPopup()
}

const initMap = () => {
  loadLeafletCSS()
  if (map) return
  map = L.map(mapContainer.value, {
    center: [39.6, -8.0],
    zoom: 7,
    minZoom: 3,
    zoomControl: false,
    attributionControl: false
  })

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map)

  L.control.zoom({ position: 'bottomright' }).addTo(map)
}

onMounted(() => {
  setTimeout(() => {
    initMap()
    fetchCouriers()
    pollingTimer = setInterval(fetchCouriers, POLLING_INTERVAL)
  }, 150)
})

onUnmounted(() => {
  if (pollingTimer) clearInterval(pollingTimer)
  if (map) { map.remove(); map = null }
  markerMap = {}
  firstLoad = true
})
</script>

<template>
  <div class="map-page">
    <div class="map-area">

      <!-- Overlay Top Left -->
      <div class="map-overlay-top">
        <div class="title-pill">
          <MapPin :size="16" class="title-icon" />
          <span class="title-text">MAPA DE OPERAÇÕES</span>
        </div>
        
        <div class="search-box">
          <Search :size="18" class="search-icon" />
          <input
            v-model="searchQuery"
            placeholder="Pesquisar estafeta ou local..."
            class="search-input"
            @keyup.enter="searchLocation"
          />
          <button v-if="searchQuery" @click="searchQuery = ''" class="clear-btn">
            <X :size="16" />
          </button>
        </div>

        <div class="filter-pills">
          <button :class="['pill', filterDisponivel === 'todos' ? 'active' : '']" @click="filterDisponivel = 'todos'">Todos</button>
          <button :class="['pill', filterDisponivel === 'disponivel' ? 'active-white' : '']" @click="filterDisponivel = 'disponivel'">Disponível</button>
          <button :class="['pill', filterDisponivel === 'ocupado' ? 'active-white' : '']" @click="filterDisponivel = 'ocupado'">Ocupado</button>
        </div>
      </div>

      <!-- Status chip (top-right) -->
      <div class="status-chip">
        <Wifi v-if="isConnected" :size="13" class="chip-icon chip-online" />
        <WifiOff v-else :size="13" class="chip-icon chip-offline" />
        <span>{{ isConnected ? lastUpdateFormatted : 'Offline' }}</span>
        <button @click="fetchCouriers" class="chip-refresh" :disabled="isLoading">
          <RefreshCw :size="12" :class="{ spin: isLoading }" />
        </button>
      </div>

      <div ref="mapContainer" class="map-container" />

      <button
        class="sidebar-arrow"
        :class="{ 'arrow-open': showSidebar }"
        @click="showSidebar = !showSidebar"
      >
        <ChevronRight v-if="showSidebar" :size="16" />
        <ChevronLeft v-else :size="16" />
      </button>

      <transition name="slide-right">
        <aside v-if="showSidebar" class="sidebar">
          <div class="sidebar-header">
            <span class="results-count">
              {{ filteredCouriers.length }} resultados visíveis
            </span>
            <div class="stats-row">
              <span class="stat-chip green"><i class="dot green-dot"></i> {{ disponiveis }} disp.</span>
              <span class="stat-chip blue"><i class="dot blue-dot"></i> {{ ocupados }} ocup.</span>
            </div>
          </div>

          <div class="courier-list">
            <div
              v-for="courier in filteredCouriers"
              :key="courier.id"
              class="courier-card"
              @click="focusOnCourier(courier)"
            >
              <div class="avatar" :style="{ background: courier.disponivel ? '#16a34a' : '#1e3a8a' }">
                {{ getInitials(courier.nome) }}
              </div>
              <div class="card-body">
                <div class="card-top">
                  <span class="card-name">{{ courier.nome }}</span>
                  <span :class="['status-badge', courier.disponivel ? 'badge-green' : 'badge-blue']">
                    {{ courier.disponivel ? 'Disp.' : 'Ocup.' }}
                  </span>
                </div>
                <div class="card-sub">{{ courier.area }}</div>
              </div>
            </div>
          </div>
        </aside>
      </transition>

    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');

* { box-sizing: border-box; margin: 0; padding: 0; }

.map-page {
  font-family: 'DM Sans', sans-serif;
  height: 100vh;
  width: 100%;
}

.map-area {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden; /* Evita scroll indesejado durante transições */
}

.map-container {
  width: 100%;
  height: 100%;
  transition: width 0.3s ease; /* Suaviza a mudança de tamanho se quiseres redimensionar o mapa */
}

/* ── OVERLAY TOP LEFT ── */
.map-overlay-top {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 1000;
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 300px;
}

.title-pill {
  display: flex;
  align-items: center;
  gap: 8px;
  background: #0f172a;
  border-radius: 10px;
  padding: 6px 14px;
  width: fit-content;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.title-icon { color: #0ea5e9; }
.title-text { color: white; font-weight: 700; font-size: 12px; letter-spacing: 0.8px; }

.search-box {
  display: flex;
  align-items: center;
  gap: 10px;
  background: white;
  border-radius: 14px;
  padding: 8px 14px;
  width: 100%;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.search-icon { color: #94a3b8; flex-shrink: 0; }
.search-input {
  flex: 1; border: none; outline: none;
  font-family: 'DM Sans', sans-serif;
  font-size: 14px; color: #1e293b;
  background: transparent;
}

.clear-btn { background: none; border: none; cursor: pointer; color: #94a3b8; display: flex; align-items: center; }

.filter-pills { 
  display: grid; 
  grid-template-columns: repeat(3, 1fr);
  gap: 6px; 
  width: 100%;
}

.pill {
  padding: 8px 0;
  border-radius: 10px;
  font-size: 11px;
  font-weight: 600;
  border: none;
  background: white; 
  cursor: pointer;
  color: #64748b;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  transition: all 0.2s;
}

.pill.active { background: #0f172a; color: white; }
.pill.active-white { background: white; color: #1e293b; border: 1px solid #e2e8f0; }

.status-chip {
  position: absolute;
  top: 20px;
  right: 20px;
  z-index: 1000;
  display: flex;
  align-items: center;
  gap: 6px;
  background: white;
  border-radius: 999px;
  padding: 8px 14px;
  font-size: 12px; font-weight: 600;
  box-shadow: 0 2px 10px rgba(0,0,0,0.09);
}
.chip-online { color: #16a34a; }
.chip-offline { color: #dc2626; }
.chip-refresh { background: none; border: none; cursor: pointer; color: #94a3b8; }

.sidebar-arrow {
  position: absolute;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  z-index: 1100;
  width: 26px;
  height: 52px;
  background: white;
  border-radius: 8px 0 0 8px;
  display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #64748b;
  box-shadow: -3px 0 12px rgba(0,0,0,0.08);
  transition: right 0.3s ease;
}
.sidebar-arrow.arrow-open { right: 340px; }

.sidebar {
  position: absolute;
  top: 0; right: 0; width: 340px; height: 100%;
  background: white; z-index: 1050; box-shadow: -4px 0 28px rgba(0,0,0,0.1);
  display: flex; flex-direction: column;
}

.slide-right-enter-active, .slide-right-leave-active { transition: transform 0.3s ease; }
.slide-right-enter-from, .slide-right-leave-to { transform: translateX(100%); }

.sidebar-header { padding: 20px; border-bottom: 1px solid #f1f5f9; }
.results-count { display: block; font-size: 14px; font-weight: 700; color: #0f172a; margin-bottom: 10px; }
.stats-row { display: flex; gap: 8px; }
.stat-chip { padding: 4px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; display: flex; align-items: center; gap: 4px; }
.dot { width: 6px; height: 6px; border-radius: 50%; display: inline-block; }
.green-dot { background: #16a34a; }
.blue-dot { background: #1e3a8a; }
.stat-chip.green { background: #f0fdf4; color: #16a34a; }
.stat-chip.blue { background: #eff6ff; color: #1e3a8a; }

.courier-list { flex: 1; overflow-y: auto; padding: 10px 0; }
.courier-card { display: flex; gap: 12px; padding: 14px 20px; cursor: pointer; border-bottom: 1px solid #f8fafc; }
.courier-card:hover { background: #f8fafc; }
.avatar { width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 700; font-size: 11px; flex-shrink: 0; }
.card-body { flex: 1; }
.card-top { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2px; }
.card-name { font-size: 14px; font-weight: 700; color: #0f172a; }
.card-sub { font-size: 12px; color: #64748b; }
.status-badge { font-size: 9px; font-weight: 700; padding: 1px 6px; border-radius: 999px; }
.badge-green { background: #dcfce7; color: #16a34a; }
.badge-blue { background: #dbeafe; color: #1e3a8a; }

.spin { animation: spin 1s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

:deep(.custom-marker) { filter: drop-shadow(0 2px 6px rgba(0,0,0,0.3)); }
</style>
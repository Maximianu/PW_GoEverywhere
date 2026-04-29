<script setup>
import { onMounted, ref } from 'vue'
import { MapPin, RefreshCw } from 'lucide-vue-next'
import L from 'leaflet'

// Carregar CSS do Leaflet dinamicamente
const loadLeafletCSS = () => {
  if (!document.getElementById('leaflet-css')) {
    const link = document.createElement('link')
    link.id = 'leaflet-css'
    link.rel = 'stylesheet'
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
    document.head.appendChild(link)
  }
}
const mapContainer = ref(null)
let map = null
let markers = []

// Dados mock dos estafetas
const courierData = [
  {
    id: 'C-y720',
    nome: 'GG ggg',
    estado: 'Disponível',
    latitude: 41.6918,
    longitude: -8.8344,
    performance: 94
  },
  {
    id: 'C-x521',
    nome: 'João Silva',
    estado: 'Ativo',
    latitude: 41.1599,
    longitude: -8.6291,
    performance: 87
  },
  {
    id: 'C-w842',
    nome: 'Maria Costa',
    estado: 'Disponível',
    latitude: 41.7151,
    longitude: -8.6289,
    performance: 91
  },
  {
    id: 'C-v963',
    nome: 'Pedro Santos',
    estado: 'Offline',
    latitude: 41.1571,
    longitude: -8.6291,
    performance: 0
  },
  {
    id: 'C-u184',
    nome: 'Ana Oliveira',
    estado: 'Ativo',
    latitude: 41.4167,
    longitude: -8.2247,
    performance: 89
  }
]

// Função para obter cor do marcador baseado no estado
const getMarkerColor = (estado) => {
  const estados = {
    'Disponível': '#10b981', // verde
    'Ativo': '#3b82f6',      // azul
    'Offline': '#9ca3af'     // cinzento
  }
  return estados[estado] || '#6b7280'
}

// Função para criar ícone customizado
const createCustomMarker = (estado) => {
  const color = getMarkerColor(estado)
  
  return L.divIcon({
    html: `
      <div style="
        background: ${color};
        width: 32px;
        height: 32px;
        border-radius: 50%;
        border: 3px solid white;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.3), 0 0 15px ${color}40;
        cursor: pointer;
        transition: all 0.3s ease;
      ">
        <div style="
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
        "></div>
      </div>
    `,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -20],
    className: 'custom-marker'
  })
}

// Função para inicializar o mapa
const initMap = () => {
  // Carregar CSS do Leaflet primeiro
  loadLeafletCSS()
  
  if (map) return

  // Criar mapa com tiles escuras
  map = L.map(mapContainer.value, {
    center: [41.5, -8.5],
    zoom: 11,
    zoomControl: true,
    attributionControl: true
  })

  // Adicionar tiles escuras (usando CartoDB Positron Dark ou similar)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    maxZoom: 19,
    subdomains: 'abcd'
  }).addTo(map)

  // Adicionar marcadores dos estafetas
  courierData.forEach((courier) => {
    const marker = L.marker([courier.latitude, courier.longitude], {
      icon: createCustomMarker(courier.estado)
    }).addTo(map)

    // Popup customizado
    const popupContent = `
      <div style="font-family: Inter, sans-serif; font-size: 13px; color: white; min-width: 200px;">
        <div style="font-weight: 600; font-size: 14px; margin-bottom: 8px; color: #00f2ff;">
          ${courier.nome}
        </div>
        <div style="margin-bottom: 6px;">
          <span style="color: #9ca3af;">ID:</span> ${courier.id}
        </div>
        <div style="margin-bottom: 6px;">
          <span style="color: #9ca3af;">Estado:</span>
          <span style="display: inline-block; padding: 2px 8px; border-radius: 4px; background: ${getMarkerColor(courier.estado)}20; color: ${getMarkerColor(courier.estado)}; margin-left: 4px;">
            ${courier.estado}
          </span>
        </div>
        <div style="margin-bottom: 6px;">
          <span style="color: #9ca3af;">Performance:</span> ${courier.performance}%
        </div>
        <div style="margin-top: 10px; padding-top: 8px; border-top: 1px solid #374151; font-size: 11px; color: #6b7280;">
          Coordenadas: ${courier.latitude.toFixed(4)}, ${courier.longitude.toFixed(4)}
        </div>
      </div>
    `

    marker.bindPopup(popupContent, {
      className: 'custom-popup',
      maxWidth: 250
    })

    markers.push(marker)
  })

  // Ajustar zoom para mostrar todos os marcadores
  fitMarkers()
}

// Função para centralizar o mapa nos estafetas
const fitMarkers = () => {
  if (map && markers.length > 0) {
    const group = new L.featureGroup(markers)
    map.fitBounds(group.getBounds(), { padding: [50, 50] })
  }
}

// Função para centralizar o mapa manualmente
const centerMap = () => {
  fitMarkers()
}

// Inicializar o mapa quando o componente está montado
onMounted(() => {
  setTimeout(initMap, 100)
})
</script>

<template>
  <div class="w-full h-full flex flex-col gap-6 p-6 overflow-y-auto bg-background">
    <!-- Header -->
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-3xl font-bold text-white flex items-center gap-3">
          <MapPin :size="32" class="text-primary" />
          Mapa de Operações
        </h1>
        <p class="text-gray-400 mt-1">Localização e status dos estafetas em tempo real</p>
      </div>
      <button
        @click="centerMap"
        class="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30 text-primary hover:bg-primary/20 transition-all duration-300"
      >
        <RefreshCw :size="18" />
        Centralizar
      </button>
    </div>

    <!-- Mapa em card premium -->
    <div class="card relative overflow-hidden flex-1 min-h-[600px]">
      <!-- Legendas -->
      <div class="absolute top-4 left-4 z-20 bg-surface/80 backdrop-blur border border-white/10 rounded-lg p-4">
        <p class="text-xs uppercase tracking-wider text-gray-400 font-semibold mb-3">Estado dos Estafetas</p>
        <div class="flex flex-col gap-2">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" style="background: #10b981; box-shadow: 0 0 8px #10b98140;"></div>
            <span class="text-xs text-gray-300">Disponível</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" style="background: #3b82f6; box-shadow: 0 0 8px #3b82f640;"></div>
            <span class="text-xs text-gray-300">Ativo</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full" style="background: #9ca3af; box-shadow: 0 0 8px #9ca3af40;"></div>
            <span class="text-xs text-gray-300">Offline</span>
          </div>
        </div>
      </div>

      <!-- Container do mapa -->
      <div
        ref="mapContainer"
        class="w-full h-full rounded-2xl overflow-hidden"
        style="min-height: 600px;"
      ></div>
    </div>

    <!-- Estatísticas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <div class="card p-4">
        <p class="text-sm text-gray-400 mb-1">Total</p>
        <p class="text-2xl font-bold text-white">{{ courierData.length }}</p>
      </div>
      <div class="card p-4">
        <p class="text-sm text-gray-400 mb-1">Disponíveis</p>
        <p class="text-2xl font-bold text-green-400">{{ courierData.filter(c => c.estado === 'Disponível').length }}</p>
      </div>
      <div class="card p-4">
        <p class="text-sm text-gray-400 mb-1">Ativos</p>
        <p class="text-2xl font-bold text-blue-400">{{ courierData.filter(c => c.estado === 'Ativo').length }}</p>
      </div>
      <div class="card p-4">
        <p class="text-sm text-gray-400 mb-1">Offline</p>
        <p class="text-2xl font-bold text-gray-400">{{ courierData.filter(c => c.estado === 'Offline').length }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Estilos personalizados do mapa */
:deep(.leaflet-container) {
  background-color: #0c121e !important;
  font-family: Inter, sans-serif;
}

/* Popup customizado */
:deep(.custom-popup .leaflet-popup-content-wrapper) {
  background: linear-gradient(135deg, rgba(21, 31, 46, 0.95) 0%, rgba(12, 18, 30, 0.9) 100%);
  border: 1px solid rgba(0, 242, 255, 0.2);
  border-radius: 8px;
  box-shadow: 0 0 30px rgba(0, 242, 255, 0.1);
  padding: 0;
}

:deep(.custom-popup .leaflet-popup-tip) {
  background: linear-gradient(135deg, rgba(21, 31, 46, 0.95), rgba(12, 18, 30, 0.9));
  border: 1px solid rgba(0, 242, 255, 0.2);
}

:deep(.custom-popup .leaflet-popup-content) {
  margin: 12px;
  line-height: 1.4;
}

/* Controles do mapa */
:deep(.leaflet-control-zoom) {
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 8px !important;
  background: rgba(12, 18, 30, 0.8) !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

:deep(.leaflet-control-zoom a) {
  background-color: rgba(0, 242, 255, 0.05) !important;
  color: #00f2ff !important;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1) !important;
  transition: all 0.3s ease !important;
}

:deep(.leaflet-control-zoom a:hover) {
  background-color: rgba(0, 242, 255, 0.15) !important;
  color: #00f2ff !important;
}

:deep(.leaflet-control-attribution) {
  background: rgba(12, 18, 30, 0.8) !important;
  color: #9ca3af !important;
  border-radius: 4px !important;
  border: 1px solid rgba(255, 255, 255, 0.05) !important;
}

:deep(.leaflet-control-attribution a) {
  color: #00f2ff !important;
}

/* Marcadores customizados */
:deep(.custom-marker) {
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2));
}

:deep(.custom-marker:hover) {
  filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.3)) !important;
}
</style>


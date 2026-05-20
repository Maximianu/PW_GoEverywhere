<script setup>
import { useRoute } from 'vue-router'
import { computed, ref, watch } from 'vue'
import { useUserStore } from '../stores/UserStore'

import globoIcon from '../assets/Globo.svg'
import caixaIcon from '../assets/Caixa.svg'
import fogueteIcon from '../assets/Foguete.svg'
import cogIcon from '../assets/Cog.svg'
import ferramentaIcon from '../assets/Ferramenta.svg'
import escudoIcon from '../assets/Escudo.svg'

const route = useRoute()
const userStore = useUserStore()

// CORREÇÃO: Apenas uma declaração que tenta ler do storage ou começa como false
const showSubmenu = ref(sessionStorage.getItem('submenuOpen') === 'true')

const toggleSubmenu = () => {
  showSubmenu.value = !showSubmenu.value
  sessionStorage.setItem('submenuOpen', showSubmenu.value)
}

// Watcher para fechar quando saímos do fluxo de reserva
watch(() => route.name, (newRouteName) => {
  const mainRoutes = ['home', 'missions', 'account', 'login']
  
  if (mainRoutes.includes(newRouteName)) {
    showSubmenu.value = false
    sessionStorage.setItem('submenuOpen', 'false')
  } else if (['booking', 'kit', 'checkout'].includes(newRouteName)) {
    // Garante que fica aberto se estivermos nas páginas de reserva
    showSubmenu.value = true
    sessionStorage.setItem('submenuOpen', 'true')
  }
}, { immediate: true })

// Links Principais com as tuas imagens originais
const mainLinks = computed(() => [
  { 
    name: 'Site', 
    path: '/', 
    route: 'home', 
    // Esta sintaxe diz ao Vite: "Vai buscar este ficheiro e dá-me o URL real dele"
    img: new URL('../assets/Globo.svg', import.meta.url).href 
  },
  { 
    name: 'Entregas', 
    path: '/missions', 
    route: 'missions', 
    img: new URL('../assets/Caixa.svg', import.meta.url).href 
  },
  { 
    name: 'Reservar', 
    path: '/book', 
    route: 'booking', 
    img: new URL('../assets/Foguete.svg', import.meta.url).href, 
    hasSubmenu: true 
  },
  { 
    name: 'Conta', 
    path: userStore.isAuthenticated ? '/account' : '/login', 
    route: userStore.isAuthenticated ? 'account' : 'login', 
    img: new URL('../assets/Cog.svg', import.meta.url).href 
  }
])

// Links do Submenu com as tuas imagens originais
const submenuLinks = [
  { name: 'Destinos', path: '/book', route: 'booking', img: 'https://www.figma.com/api/mcp/asset/d76cba94-50bb-4a43-8ade-b452183ebdcf' },
  { name: 'Equipamento', path: '/kit', route: 'kit', img: 'https://www.figma.com/api/mcp/asset/21bf4aa3-92b4-44e7-a610-b3e46cb252e6' },
  { name: 'Confirmação', path: '/checkout', route: 'checkout', img: 'https://www.figma.com/api/mcp/asset/bc3f34b9-12ea-46e2-a27a-80cb733618b6' }
]

const isActive = (item) => {
  if (item.route === 'booking') {
    return showSubmenu.value || ['booking', 'kit', 'checkout'].includes(route.name)
  }
  return route.name === item.route
}
</script>

<template>
  <header class="navbar">
    <div class="nav-container">
      <router-link to="/" class="nav-item">HOMEPAGE</router-link>
      
      <router-link to="/book" class="nav-item">RESERVAR VIAGEM</router-link>

      <router-link 
        v-if="userStore.isAuthenticated" 
        to="/missions" 
        class="nav-item"
      >
        AS MINHAS VIAGENS
      </router-link>
      
      <router-link 
        :to="userStore.isAuthenticated ? '/account' : '/login'" 
        class="nav-item"
      >
        {{ userStore.isAuthenticated ? 'CONTA' : 'LOGIN' }}
      </router-link>
    </div>
  </header>
</template>

<style scoped>
.navbar {
  position: fixed;
  top: 1.5rem;
  left: 50%;
  transform: translateX(-50%); /* Centraliza a barra */
  z-index: 1000;
}

.nav-container {
  display: flex;
  gap: 2.5rem;
  padding: 1rem 2rem;
  background: rgba(16, 20, 25, 0.8); /* O fundo que já usas */
  backdrop-filter: blur(0.75rem);
  border: 0.0625rem solid rgba(0, 242, 255, 0.2);
  border-radius: 6.25rem; /* Estilo 'pílula' muito comum em headers minimalistas */
}

.nav-item {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 0.875rem;
  color: #b9cacb;
  text-decoration: none;
  letter-spacing: 0.0625rem;
  transition: color 0.3s ease;
}

.nav-item:hover, .router-link-active {
  color: #00f2ff; /* A cor neon do projeto */
}
</style>
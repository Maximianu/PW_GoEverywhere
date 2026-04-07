<script setup>
import { useRoute } from 'vue-router'
const route = useRoute()
const links = [
  { name: 'Site', path: '/', icon: '🌐', route: 'home' },
  { name: 'Reservar', path: '/book', icon: '🚀', route: 'booking' },
  { name: 'Equipamento', path: '/kit', icon: '🛠️', route: 'kit' },
  { name: 'Entregas', path: '/missions', icon: '📦', route: 'missions' },
  { name: 'Settings', path: '/login', icon: '⚙️', route: 'login' }
]
</script>

<template>
  <aside class="side-menu">
    <div class="brand-box">
      <span>GOEVERYWHERE</span>
    </div>
    <nav>
      <ul class="menu-list">
        <li v-for="item in links" :key="item.path">
          <router-link :to="item.path" class="menu-item" :class="{ active: route.name === item.route }">
            <span>{{ item.icon }}</span>
            <span>{{ item.name }}</span>
          </router-link>
        </li>
      </ul>
    </nav>
  </aside>
</template>

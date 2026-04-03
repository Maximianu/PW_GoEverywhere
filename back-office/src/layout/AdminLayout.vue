<script setup>
import { useRoute } from 'vue-router'
import { LayoutDashboard, ListOrdered, Users, Map, LogOut, Rocket } from 'lucide-vue-next'

const route = useRoute()

const navItems = [
  { name: 'Dashboard', path: '/', icon: LayoutDashboard },
  { name: 'Pedidos', path: '/orders', icon: ListOrdered },
  { name: 'Estafetas', path: '/couriers', icon: Users },
  { name: 'Mapa', path: '/map', icon: Map }
]

const isActive = (path) => {
  if (path === '/' && route.path === '/') return true
  if (path !== '/' && route.path.startsWith(path)) return true
  return false
}
</script>

<template>
  <div class="min-h-screen flex bg-background selection:bg-primary/30">
    <!-- Sidebar -->
    <aside class="w-[280px] bg-[#080d14] border-r border-[#151f2e] flex flex-col items-center py-6 px-4 shrink-0 shadow-2xl z-20">
      <!-- Logo -->
      <div class="flex items-center gap-4 w-full px-2 mb-12">
        <div class="p-2 bg-primary rounded-xl text-black shadow-[0_0_15px_rgba(0,242,255,0.4)]">
          <Rocket :size="24" strokeWidth="2.5" />
        </div>
        <div>
          <h1 class="text-white font-bold tracking-wide text-lg">GoEverywhere</h1>
          <p class="text-[10px] text-gray-400 uppercase tracking-widest mt-0.5">Plataforma de Gestão</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 w-full space-y-2">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 font-medium w-full"
          :class="isActive(item.path) ? 'bg-primary text-black shadow-[0_0_20px_rgba(0,242,255,0.2)] font-semibold' : 'text-gray-400 hover:text-white hover:bg-surface'"
        >
          <component :is="item.icon" :size="20" :strokeWidth="isActive(item.path) ? 2.5 : 2" />
          {{ item.name }}
        </router-link>
      </nav>

      <!-- User Profile -->
      <div class="w-full mt-auto">
        <div class="flex items-center justify-between px-3 py-3 rounded-2xl hover:bg-surface transition-colors cursor-pointer text-gray-300 hover:text-white">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs overflow-hidden border border-[#233246]">
              <img src="https://ui-avatars.com/api/?name=Cmdr+Sterling&background=1e293b&color=fff&rounded=true" alt="User" class="w-full h-full object-cover shrink-0">
            </div>
            <span class="text-sm font-medium">Cmdr. Sterling</span>
          </div>
          <LogOut :size="18" class="text-gray-500 hover:text-red-400 transition-colors" />
        </div>
      </div>
    </aside>

    <!-- Main Content Slot -->
    <main class="flex-1 min-w-0 bg-[#0c121e] overflow-y-auto h-screen">
      <slot />
    </main>
  </div>
</template>

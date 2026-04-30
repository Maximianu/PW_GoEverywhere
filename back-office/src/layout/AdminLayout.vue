<script setup>
import { useRoute } from 'vue-router'
import { Moon, LayoutDashboard, ListOrdered, Users, Map, LogOut, Rocket, Clock, User } from 'lucide-vue-next'

const route = useRoute()

const navItems = [
  { name: 'Viagens', path: '/moon-3d', icon: Rocket, color: 'cyan', colorHex: '#FFD93D' },
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, color: 'blue', colorHex: '#3b82f6' },
  { name: 'Pedidos', path: '/orders', icon: ListOrdered, color: 'red', colorHex: '#ef4444' },
  { name: 'Histórico', path: '/order-history', icon: Clock, color: 'amber', colorHex: '#f59e0b' },
  { name: 'Clientes', path: '/customers', icon: User, color: 'green', colorHex: '#10b981' },
  { name: 'Estafetas', path: '/couriers', icon: Users, color: 'purple', colorHex: '#a78bfa' },
  { name: 'Mapa', path: '/map', icon: Map, color: 'cyan', colorHex: '#06b6d4' }
]

const isActive = (path) => {
  if (path === '/dashboard' && route.path === '/dashboard') return true
  if (path !== '/dashboard' && route.path.startsWith(path)) return true
  return false
}
</script>

<template>
  <div class="h-screen overflow-hidden flex bg-gradient-lunar selection:bg-primary/30">
    <!-- Sidebar -->
    <aside class="w-[280px] h-full overflow-hidden bg-gradient-to-b from-[#0a0f18] via-[#080d14] to-[#0c121e] border-r border-white/5 flex flex-col items-center py-6 px-4 shrink-0 shadow-2xl z-20 backdrop-blur-sm">
      <!-- Borda decorativa luminosa -->
      <div class="absolute right-0 top-0 w-1 h-32 bg-gradient-to-b from-cyan-500/30 via-purple-500/20 to-transparent"></div>

      <!-- Logo -->
      <div class="flex items-center gap-4 w-full px-2 mb-10 relative z-10 group">
        <div class="p-2 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl text-black shadow-glow-cyan-lg group-hover:shadow-lg transition-all duration-300 transform group-hover:-translate-y-1">
          <Rocket :size="24" strokeWidth="2.5" />
        </div>
        <div>
          <h1 class="text-white font-bold tracking-wide text-lg group-hover:text-cyan-400 transition-colors duration-300">GoEverywhere</h1>
          <p class="text-[10px] text-gray-500 uppercase tracking-widest mt-0.5 group-hover:text-gray-400 transition-colors duration-300">Plataforma de Gestão</p>
        </div>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 w-full space-y-1.5 relative z-10">
        <router-link
          v-for="item in navItems"
          :key="item.path"
          :to="item.path"
          class="nav-item flex items-center gap-3 px-4 py-3 rounded-2xl transition-all duration-300 font-medium w-full relative overflow-hidden group"
          :class="isActive(item.path) ? 'text-white font-semibold' : 'text-gray-400 hover:text-white'"
          :style="isActive(item.path) ? {
            background: `linear-gradient(135deg, ${item.colorHex}20, ${item.colorHex}08)`,
            boxShadow: `0 0 20px ${item.colorHex}25`
          } : {}"
        >
          <!-- Hover overlay (inactive) -->
          <div
            v-if="!isActive(item.path)"
            class="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10 rounded-2xl"
            :style="{ background: `${item.colorHex}08` }"
          ></div>

          <!-- Active background glow -->
          <div
            v-if="isActive(item.path)"
            class="absolute inset-0 -z-10 rounded-2xl"
            :style="{
              background: `linear-gradient(135deg, ${item.colorHex}15, transparent)`,
            }"
          ></div>

          <!-- Ícone — sempre colorido -->
          <div
            class="icon-wrap flex items-center justify-center transition-all duration-300 group-hover:scale-110"
            :style="{
              color: item.colorHex,
              background: isActive(item.path)
                ? `linear-gradient(135deg, ${item.colorHex}30, ${item.colorHex}15)`
                : `linear-gradient(135deg, ${item.colorHex}20, ${item.colorHex}08)`,
              boxShadow: isActive(item.path)
                ? `0 0 18px ${item.colorHex}50, inset 0 0 10px ${item.colorHex}25`
                : `0 0 12px ${item.colorHex}35`,
              padding: '8px',
              borderRadius: '10px',
              flexShrink: 0
            }"
          >
            <component
              :is="item.icon"
              :size="20"
              :strokeWidth="isActive(item.path) ? 2.5 : 2"
            />
          </div>

          <!-- Label -->
          <span
            class="relative transition-all duration-300"
            :style="{
              color: isActive(item.path) ? item.colorHex : 'inherit'
            }"
          >
            {{ item.name }}
          </span>

          <!-- Indicador ativo -->
          <div
            v-if="isActive(item.path)"
            class="absolute right-3 w-2 h-2 rounded-full"
            :style="{
              backgroundColor: item.colorHex,
              boxShadow: `0 0 10px ${item.colorHex}90`
            }"
          ></div>
        </router-link>
      </nav>

      <!-- Divider -->
      <div class="w-24 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4 relative z-10"></div>

      <!-- User Profile -->
      <div class="w-full mt-auto relative z-10">
        <div class="flex items-center justify-between px-3 py-3 rounded-2xl hover:bg-white/5 transition-all duration-300 cursor-pointer text-gray-300 hover:text-white group">
          <div class="flex items-center gap-3">
            <div class="w-9 h-9 rounded-full bg-gradient-to-br from-gray-600 to-slate-700 flex items-center justify-center text-xs overflow-hidden border border-white/10 group-hover:border-cyan-500/50 transition-all duration-300 shadow-lg">
              <img src="https://ui-avatars.com/api/?name=Cmdr+Sterling&background=1e293b&color=fff&rounded=true" alt="User" class="w-full h-full object-cover shrink-0">
            </div>
            <div>
              <span class="text-sm font-medium block">Cmdr. Sterling</span>
              <span class="text-xs text-gray-500 group-hover:text-gray-400 transition-colors duration-300">Administrador</span>
            </div>
          </div>
          <LogOut :size="18" class="text-gray-500 group-hover:text-red-400 transition-all duration-300 transform group-hover:scale-110" />
        </div>
      </div>

      <!-- Footer accent line -->
      <div class="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/30 to-transparent"></div>
    </aside>

    <!-- Main Content Slot -->
    <main class="flex-1 min-w-0 bg-background relative h-full overflow-y-auto">
      <!-- Lua decorativa global do back-office -->
      <div class="moon-backdrop-global"></div>

      <!-- Subtle animated background elements -->
      <div class="absolute top-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl -z-10 animate-float"></div>
      <div class="absolute bottom-20 left-0 w-80 h-80 bg-purple-500/5 rounded-full blur-3xl -z-10 animate-float" style="animation-delay: 2s;"></div>

      <slot />
    </main>
  </div>
</template>

<style scoped>
/* Lua Global */
.moon-backdrop-global {
  position: fixed;
  bottom: -250px;
  left: calc(50% + 140px);
  transform: translateX(-50%);
  width: 1000px;
  height: 1000px;
  background-image: url('/luadash.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  border-radius: 50%;
  opacity: 0.15;
  filter: blur(1px) brightness(1.1);
  mix-blend-mode: screen;
  z-index: 0;
  pointer-events: none;
}

@media (max-width: 768px) {
  .moon-backdrop-global {
    width: 600px;
    height: 600px;
    bottom: -150px;
    left: 50%;
  }
}

/* Icon hover scale */
nav a:hover .icon-wrap {
  transform: scale(1.12);
  filter: brightness(1.25);
}

/* Smooth active transitions */
.router-link-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
</style>
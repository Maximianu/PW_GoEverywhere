import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '../views/DashboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/moon-3d'
    },
    {
      path: '/moon-3d',
      name: 'moon-3d',
      component: () => import('../views/Moon3DView.vue')
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: DashboardView
    },
    {
      path: '/orders',
      name: 'orders',
      component: () => import('../views/OrdersView.vue')
    },
    {
      path: '/order-history',
      name: 'order-history',
      component: () => import('../views/OrderHistoryView.vue')
    },
    {
      path: '/customers',
      name: 'customers',
      component: () => import('../views/CustomersView.vue')
    },
    {
      path: '/couriers',
      name: 'couriers',
      component: () => import('../views/CouriersView.vue')
    },
    {
      path: '/map',
      name: 'map',
      component: () => import('../views/MapView.vue')
    }
  ]
})

export default router

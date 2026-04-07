import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import BookingView from '../views/BookingView.vue'
import KitView from '../views/KitView.vue'
import PaymentView from '../views/PaymentView.vue'
import MissionsView from '../views/MissionsView.vue'
import MissionDetailView from '../views/MissionDetailView.vue'
import ReviewView from '../views/ReviewView.vue'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/book', name: 'booking', component: BookingView },
  { path: '/kit', name: 'kit', component: KitView },
  { path: '/checkout', name: 'checkout', component: PaymentView },
  { path: '/missions', name: 'missions', component: MissionsView },
  { path: '/missions/:id', name: 'mission-detail', component: MissionDetailView },
  { path: '/review', name: 'review', component: ReviewView }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

export default router

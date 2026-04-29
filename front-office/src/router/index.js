import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LoginView from '../views/LoginView.vue'
import BookingView from '../views/BookingView.vue'
import KitView from '../views/KitView.vue'
import PaymentView from '../views/PaymentView.vue'
import MissionsView from '../views/MissionsView.vue'
import MissionDetailView from '../views/MissionDetailView.vue'
import ReviewView from '../views/ReviewView.vue'
import AccountView from '../views/AccountView.vue'

import { auth } from '../services/firebase'

const routes = [
  { path: '/', name: 'home', component: HomeView },
  { path: '/login', name: 'login', component: LoginView },
  { path: '/account', name: 'account', component: AccountView, meta: { requiresAuth: true } },
  { path: '/book', name: 'booking', component: BookingView, meta: { requiresAuth: true } },
  { path: '/kit', name: 'kit', component: KitView, meta: { requiresAuth: true } },
  { path: '/checkout', name: 'checkout', component: PaymentView, meta: { requiresAuth: true } },
  { path: '/missions', name: 'missions', component: MissionsView, meta: { requiresAuth: true } },
  { path: '/missions/:id', name: 'mission-detail', component: MissionDetailView, meta: { requiresAuth: true } },
  { path: '/review', name: 'review', component: ReviewView, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
  const isAuthenticated = auth.currentUser !== null;

  if (requiresAuth && !isAuthenticated) {
    next('/login');
  } else {
    next();
  }
});

export default router

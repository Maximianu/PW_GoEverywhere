import { createRouter, createWebHistory } from 'vue-router'
import LoginView from './views/LoginView.vue'
import EntregasView from './views/EntregasView.vue'
import DetalheView from './views/DetalheView.vue'
import HistoricoView from './views/HistoricoView.vue'
import PerfilView from './views/PerfilView.vue'

const routes = [
  { path: '/', component: LoginView },
  { path: '/entregas', component: EntregasView },
  { path: '/detalhe/:id', component: DetalheView },
  { path: '/historico', component: HistoricoView },
  { path: '/perfil', component: PerfilView },
]

export default createRouter({
  history: createWebHistory(),
  routes,
})
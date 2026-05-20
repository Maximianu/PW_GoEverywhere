import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import './style.css';
import './assets/theme.css';

import { auth } from './services/firebase.js';
import { onAuthStateChanged } from "firebase/auth";

// Importa o Pinia e a Store
import { createPinia } from 'pinia';
import { useUserStore } from "./stores/UserStore.js";
import { useBookingStore } from './stores/BookingStore.js'

// Criar a instância da App e do Pinia
const app = createApp(App)
const pinia = createPinia()

// A app usa o Pinia e o Router
app.use(pinia)
app.use(router)

let appMounted = false
const mountApp = () => {
  if (!appMounted) {
    app.mount('#app')
    appMounted = true
  }
}

onAuthStateChanged(auth, async (user) => {
  const userStore = useUserStore()
  const bookingStore = useBookingStore()

  if (user) {
    userStore.userEmail = user.email
    console.log("Pinia atualizado com:", user.email)
    if (user.email) {
      await userStore.loadClienteFromStrapi(user.email)
      await bookingStore.fetchClienteByEmail(user.email)
    }
  } else {
    userStore.userEmail = null
    console.log("Nenhum utilizador ligado.")
  }

  mountApp()
})

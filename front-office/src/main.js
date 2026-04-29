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

// Criar a instância da App e do Pinia
const app = createApp(App)
const pinia = createPinia()

// A app usa o Pinia e o Router
app.use(pinia)
app.use(router)


onAuthStateChanged(auth, (user) => {
  const userStore = useUserStore() // Chamar a store aqui dentro
  if (user) {
    userStore.userEmail = user.email
    console.log("Pinia atualizado com:", user.email)
  } else {
    userStore.userEmail = null
    console.log("Nenhum utilizador ligado.")
  }
})

app.mount('#app')

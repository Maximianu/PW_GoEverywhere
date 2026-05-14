<template>
  <main class="page-shell">
    <section class="content-container">
      <div :class="['login-panel', { 'logged-in-panel': user }]">
        
        <!-- ESTADO: JÁ LOGADO -->
        <div v-if="user" class="logged-in-state">
          <div class="login-header">
            <p class="login-label">SESSÃO ATIVA</p>
            <h1 class="login-heading">Comandante Identificado</h1>
            <p class="login-subtitle">A sua ligação à rede orbital está estável. Deseja prosseguir para as missões ou encerrar a sessão?</p>
          </div>
          
          <div class="form-actions mt-6">
            <router-link to="/missions" class="btn-login">Ir para Missões</router-link>
            <button @click="handleLogout" class="btn-create-account">Encerrar Sessão</button>
          </div>
        </div>

        <!-- ESTADO: FORMULÁRIO DE LOGIN/REGISTO -->
        <div v-else>
          <div class="login-header">
            <p class="login-label">Login</p>
            <h1 class="login-heading">Verificação de Identidade</h1>
            <p class="login-subtitle">Ligação segura à rede orbital. Por favor, introduza as suas credenciais de voo.</p>
          </div>

          <div class="login-form">
            <div class="form-field">
              <label class="field-label">Email</label>
              <div class="input-wrapper">
                <input v-model="email" type="email" placeholder="commander@orbital.link" :disabled="isLoading" class="form-input" />
              </div>
            </div>

            <div class="form-field">
              <div class="field-header">
                <label class="field-label">Password</label>
                <a href="#" class="forgot-link">Esqueci a Password</a>
              </div>
              <div class="input-wrapper">
                <input v-model="password" type="password" placeholder="••••••••••••" :disabled="isLoading" class="form-input" />
              </div>
            </div>

            <!-- Campos extras para criação de conta -->
            <div v-if="mostrarCamposConta" class="create-account-fields">
              <div class="form-field">
                <label class="field-label">Primeiro Nome</label>
                <input v-model="primeiroNome" type="text" placeholder="Primeiro nome" class="form-input" />
              </div>
              <div class="form-field">
                <label class="field-label">Último Nome</label>
                <input v-model="ultimoNome" type="text" placeholder="Último nome" class="form-input" />
              </div>
            </div>

            <!-- Feedback de Carregamento -->
            <div v-if="isLoading" class="loading-state">
              <span>A estabelecer ligação...</span>
            </div>
            
            <!-- Botões de Ação -->
            <div v-else class="form-actions">
              <button v-if="!mostrarCamposConta" @click="handleLogin" class="btn-login">Iniciar Login</button>
              <button v-else @click="handleRegisto" class="btn-login">Confirmar Criação</button>
              
              <button @click="toggleCamposConta" class="btn-create-account">
                {{ mostrarCamposConta ? 'Voltar ao Login' : 'Criar Conta' }}
              </button>
            </div>
          </div>

          <div class="login-footer">
            <p class="footer-text">Sistemas de segurança ativos. Encriptação ponta-a-ponta.</p>
          </div>
        </div>
      </div>
    </section>
  </main>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth } from '../services/firebase'
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut 
} from "firebase/auth"
import { criarClienteStrapi } from '../services/strapi'
import { useBookingStore } from '../stores/BookingStore'

const router = useRouter()
const bookingStore = useBookingStore()

const user = ref(null)
const email = ref('')
const password = ref('')
const primeiroNome = ref('')
const ultimoNome = ref('')
const mostrarCamposConta = ref(false)
const isLoading = ref(false)

// Monitorizar estado da sessão
onMounted(() => {
  onAuthStateChanged(auth, async (currentUser) => {
    user.value = currentUser
    if (currentUser?.email) {
      // Sincroniza o cliente do Strapi com o estado global
      await bookingStore.fetchClienteByEmail(currentUser.email)
    }
  })
})

const handleLogout = async () => {
  await signOut(auth)
  user.value = null
}

const toggleCamposConta = () => {
  mostrarCamposConta.value = !mostrarCamposConta.value
}

const handleLogin = async () => {
  if (!email.value || !password.value) return alert('Por favor, preencha as credenciais.')
  
  isLoading.value = true
  try {
    await signInWithEmailAndPassword(auth, email.value, password.value)
    // Após login, carrega os dados do cliente no store para habilitar reservas
    await bookingStore.fetchClienteByEmail(email.value)
    console.log('Cliente carregado no store:', bookingStore.cliente)
    router.push('/')
  } catch (error) {
    alert("Falha na autenticação: " + error.message)
  } finally {
    isLoading.value = false
  }
}

const handleRegisto = async () => {
  if (!email.value || !password.value || !primeiroNome.value || !ultimoNome.value) {
    return alert('Todos os campos são obrigatórios para o registo.')
  }

  isLoading.value = true
  try {
    // 1. Criar no Firebase
    await createUserWithEmailAndPassword(auth, email.value, password.value)
    // 2. Criar no Strapi
    await criarClienteStrapi(email.value, primeiroNome.value, ultimoNome.value)
    // 3. Popular o Store com o novo ID[cite: 3]
    await bookingStore.fetchClienteByEmail(email.value)
    console.log('Cliente carregado no store:', bookingStore.clienteId)
    alert("Conta de explorador criada com sucesso!")
    router.push('/')
  } catch (error) {
    alert("Erro no registo: " + error.message)
  } finally {
    isLoading.value = false
  }
}
</script>

<style scoped>
.page-shell {
  padding: 140px 20px 60px 20px;
  background-color: #0b0e14;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.content-container {
  width: 100%;
  max-width: 500px;
}

.login-panel {
  background: rgba(24, 28, 34, 0.8);
  border: 1px solid rgba(0, 242, 255, 0.1);
  padding: 50px;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
}

.logged-in-panel {
  padding: 40px;
}

.login-header {
  margin-bottom: 40px;
  text-align: center;
}

.login-label {
  font-family: 'Space Grotesk', sans-serif;
  color: #00f2ff;
  font-size: 12px;
  letter-spacing: 3px;
  font-weight: 700;
  text-transform: uppercase;
  margin-bottom: 12px;
}

.login-heading {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 28px;
  color: #e1fdff;
  margin-bottom: 16px;
}

.login-subtitle {
  color: rgba(185, 202, 203, 0.6);
  font-size: 14px;
  line-height: 1.6;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.field-label {
  display: block;
  font-size: 11px;
  color: rgba(225, 253, 255, 0.4);
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: 1px;
}

.field-header {
  display: flex;
  justify-content: space-between;
}

.forgot-link {
  font-size: 10px;
  color: #00f2ff;
  text-decoration: none;
  text-transform: uppercase;
  opacity: 0.7;
}

.form-input {
  width: 100%;
  background: rgba(11, 14, 20, 0.8);
  border: 1px solid rgba(58, 73, 75, 0.5);
  padding: 14px;
  color: #e1fdff;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.form-input:focus {
  border-color: #00f2ff;
  outline: none;
}

.form-actions {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: 10px;
}

.btn-login {
  background: #00f2ff;
  color: #00363a;
  border: none;
  padding: 16px;
  font-weight: 700;
  border-radius: 4px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 1px;
  transition: all 0.3s ease;
  text-align: center;
  text-decoration: none;
}

.btn-login:hover {
  background: #e1fdff;
  transform: translateY(-2px);
}

.btn-create-account {
  background: transparent;
  color: #00f2ff;
  border: 1px solid rgba(0, 242, 255, 0.3);
  padding: 16px;
  font-weight: 700;
  border-radius: 4px;
  cursor: pointer;
  text-transform: uppercase;
  transition: all 0.3s ease;
}

.loading-state {
  text-align: center;
  color: #00f2ff;
  font-family: 'Space Grotesk', sans-serif;
}

.login-footer {
  margin-top: 40px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.05);
  text-align: center;
}

.footer-text {
  font-size: 11px;
  color: rgba(185, 202, 203, 0.4);
}

.mt-6 { margin-top: 24px; }
</style>
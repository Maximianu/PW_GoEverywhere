<template>
  <div class="login-container">
    <main class="page-shell" style="padding: 0;">
      <section class="login-panel">
        <!-- Header -->
        <div class="login-header">
          <p class="login-label">Login</p>
          <h1 class="login-heading">Verificação de Identidade</h1>
          <p class="login-subtitle">Ligação segura à rede orbital. Por favor, introduza as suas credenciais de voo.</p>
        </div>

        <!-- Form -->
        <div class="login-form">
          <!-- Email Field -->
          <div class="form-field">
            <label class="field-label">Email</label>
            <div class="input-wrapper">
              <input 
                v-model="email" 
                type="email" 
                placeholder="commander@orbital.link" 
                :disabled="isLoading"
                class="form-input"
              />
            </div>
          </div>

          <!-- Password Field -->
          <div class="form-field">
            <div class="field-header">
              <label class="field-label">Password</label>
              <a href="#" class="forgot-link">Esqueci a Password</a>
            </div>
            <div class="input-wrapper">
              <input 
                v-model="password" 
                type="password" 
                placeholder="••••••••••••" 
                :disabled="isLoading"
                class="form-input"
              />
            </div>
          </div>

          <!-- Campos para criação de conta -->
          <div v-if="mostrarCamposConta" class="create-account-fields">
            <div class="form-field">
              <label class="field-label">Primeiro Nome</label>
              <div class="input-wrapper">
                <input 
                  v-model="primeiroNome" 
                  type="text" 
                  placeholder="Introduza o primeiro nome" 
                  :disabled="isLoading"
                  class="form-input"
                />
              </div>
            </div>
            <div class="form-field">
              <label class="field-label">Último Nome</label>
              <div class="input-wrapper">
                <input 
                  v-model="ultimoNome" 
                  type="text" 
                  placeholder="Introduza o último nome" 
                  :disabled="isLoading"
                  class="form-input"
                />
              </div>
            </div>
          </div>

          <!-- Loading State -->
          <div v-if="isLoading" class="loading-state">
            <span>A processar...</span>
          </div>

          <!-- Buttons -->
          <div v-else class="form-actions">
            <button v-if="!mostrarCamposConta" @click="toggleCamposConta" class="btn-create-account">
              Criar Conta
            </button>
            <button v-else @click="registarUtilizador" class="btn-submit">
              Confirmar Criação
            </button>
            <button @click="fazerLogin" class="btn-login">
              Iniciar Login
            </button>
          </div>
        </div>

        <!-- Footer -->
        <div class="login-footer">
          <p v-if="!mostrarCamposConta" class="footer-text">
            Novo Explorador? <a href="#" @click.prevent="toggleCamposConta" class="footer-link">Pedir Acesso</a>
          </p>
          <p v-else class="footer-text">
            Já tem conta? <a href="#" @click.prevent="toggleCamposConta" class="footer-link">Voltar ao Login</a>
          </p>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>

import { ref } from 'vue'
import { auth } from '../services/firebase' // Importa a configuração do firebase.js do front-office
import { createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { useRouter } from 'vue-router'
import { criarClienteStrapi, verificarClienteStrapi } from '../services/strapi';

const router = useRouter()
const email = ref('')
const password = ref('')
const primeiroNome = ref('')
const ultimoNome = ref('')
const mostrarCamposConta = ref(false)
const isLoading = ref(false)

// Função para alternar visibilidade dos campos de criação de conta
const toggleCamposConta = () => {
  mostrarCamposConta.value = !mostrarCamposConta.value;
  if (!mostrarCamposConta.value) {
    primeiroNome.value = '';
    ultimoNome.value = '';
  }
};

// Função para Criar Conta (Sign Up) - Firebase + Strapi
const registarUtilizador = async () => {
  if (!email.value || !password.value || !primeiroNome.value || !ultimoNome.value) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  isLoading.value = true;
  
  try {
    // 1. Criar conta no Firebase
    const userCredential = await createUserWithEmailAndPassword(auth, email.value, password.value);
    const user = userCredential.user;
    console.log("Conta criada no Firebase:", user);

    // 2. Criar cliente no Strapi
    try {
      await criarClienteStrapi(email.value, primeiroNome.value, ultimoNome.value);
      console.log("Cliente criado no Strapi com sucesso!");
    } catch (strapiError) {
      console.warn("Aviso: Erro ao criar cliente no Strapi:", strapiError);
      // Não bloqueamos o fluxo se o Strapi falhar
    }

    alert("Conta criada com sucesso!");
    // Limpar campos após sucesso
    primeiroNome.value = '';
    ultimoNome.value = '';
    mostrarCamposConta.value = false;
    router.push('/');
  } catch (error) {
    console.error("Erro no registo:", error.code, error.message);
    alert("Erro ao registar: " + error.message);
  } finally {
    isLoading.value = false;
  }
};

// Função para Fazer Login (Sign In) - Verificar no Firebase + Strapi
const fazerLogin = async () => {
  if (!email.value || !password.value) {
    alert('Por favor, preencha todos os campos.');
    return;
  }

  isLoading.value = true;
  
  try {
    // 1. Fazer login no Firebase
    const userCredential = await signInWithEmailAndPassword(auth, email.value, password.value);
    console.log("Login feito no Firebase:", userCredential.user);

    // 2. Verificar se o cliente existe no Strapi
    try {
      const clienteStrapi = await verificarClienteStrapi(email.value);
      if (clienteStrapi) {
        console.log("Cliente verificado no Strapi:", clienteStrapi);
      } else {
        console.warn("Aviso: Cliente não encontrado no Strapi, mas login no Firebase foi bem-sucedido.");
      }
    } catch (strapiError) {
      console.warn("Aviso: Erro ao verificar cliente no Strapi:", strapiError);
      // Não bloqueamos o fluxo se o Strapi falhar
    }

    router.push('/');
  } catch (error) {
    console.error("Erro no login:", error.code, error.message);
    alert("Erro no login: " + error.message);
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
}

.login-panel {
  max-width: 720px;
  margin: 0 auto;
  padding: 41px;
  background: rgba(24, 28, 34, 0.6);
  border: 1px solid rgba(58, 73, 75, 0.1);
  border-radius: 8px;
  backdrop-filter: blur(10px);
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  gap: 40px;
}

/* Header */
.login-header {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.login-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #00f2ff;
  text-transform: uppercase;
  letter-spacing: 2.4px;
  margin: 0;
}

.login-heading {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 30px;
  font-weight: 700;
  color: #e1fdff;
  letter-spacing: -0.75px;
  margin: 0;
  line-height: 1.2;
}

.login-subtitle {
  font-family: 'Manrope', sans-serif;
  font-size: 14px;
  color: #b9cacb;
  margin: 8px 0 0 0;
  line-height: 1.62;
}

/* Form */
.login-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 4px;
}

.field-label {
  font-family: 'Space Grotesk', sans-serif;
  font-size: 12px;
  font-weight: 400;
  color: #b9cacb;
  text-transform: uppercase;
  letter-spacing: 0.6px;
}

.forgot-link {
  font-family: 'Manrope', sans-serif;
  font-size: 10px;
  color: rgba(0, 242, 255, 0.8);
  text-transform: uppercase;
  letter-spacing: -0.5px;
  white-space: nowrap;
}

.input-wrapper {
  position: relative;
}

.form-input {
  width: 100%;
  padding: 14px 17px;
  background: rgba(49, 53, 60, 0.5);
  border: 1px solid rgba(58, 73, 75, 0.3);
  border-radius: 4px;
  font-family: 'Manrope', sans-serif;
  font-size: 16px;
  color: #e1fdff;
  outline: none;
  transition: border-color 0.2s ease;
}

.form-input::placeholder {
  color: rgba(185, 202, 203, 0.3);
}

.form-input:focus {
  border-color: rgba(0, 242, 255, 0.5);
}

.form-input:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Create Account Fields */
.create-account-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding-top: 8px;
  border-top: 1px solid rgba(58, 73, 75, 0.1);
  margin-top: 8px;
}

/* Loading State */
.loading-state {
  text-align: center;
  color: #00f2ff;
  padding: 16px 0;
}

/* Form Actions */
.form-actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.btn-login {
  flex: 1;
  min-width: 120px;
  padding: 16px 24px;
  background: #00f2ff;
  border: none;
  border-radius: 4px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #00363a;
  text-transform: uppercase;
  letter-spacing: 1.4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-login:hover {
  background: #53e4ff;
}

.btn-login:active {
  transform: scale(0.98);
}

.btn-create-account {
  flex: 1;
  min-width: 120px;
  padding: 16px 24px;
  background: transparent;
  border: 1px solid rgba(0, 242, 255, 0.3);
  border-radius: 4px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #00f2ff;
  text-transform: uppercase;
  letter-spacing: 1.4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-create-account:hover {
  background: rgba(0, 242, 255, 0.1);
  border-color: #00f2ff;
}

.btn-submit {
  flex: 1;
  min-width: 120px;
  padding: 16px 24px;
  background: #00f2ff;
  border: none;
  border-radius: 4px;
  font-family: 'Space Grotesk', sans-serif;
  font-size: 14px;
  font-weight: 700;
  color: #00363a;
  text-transform: uppercase;
  letter-spacing: 1.4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn-submit:hover {
  background: #53e4ff;
}

/* Footer */
.login-footer {
  border-top: 1px solid rgba(58, 73, 75, 0.1);
  padding-top: 33px;
  text-align: center;
}

.footer-text {
  font-family: 'Manrope', sans-serif;
  font-size: 12px;
  color: #b9cacb;
  margin: 0;
}

.footer-link {
  font-family: 'Manrope', sans-serif;
  font-size: 12px;
  font-weight: 700;
  color: #00f2ff;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  cursor: pointer;
}

.footer-link:hover {
  text-decoration: underline;
}
</style>

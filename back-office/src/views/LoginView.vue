<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { Lock, Mail, Rocket } from 'lucide-vue-next'

const router = useRouter()
const email = ref('')
const password = ref('')
const isLoading = ref(false)

const submitLogin = async () => {
  isLoading.value = true
  setTimeout(() => {
    isLoading.value = false
    router.push('/moon-3d')
  }, 450)
}
</script>

<template>
  <div class="login-page">
    <div class="stars-layer"></div>
    <div class="planet-glow"></div>

    <section class="login-shell">
      <div class="brand-panel">
        <div class="brand-mark">
          <Rocket :size="34" strokeWidth="2.5" />
        </div>

        <div>
          <h1>GoEverywhere</h1>
          <div class="brand-divider">
            <span></span>
            <p>Gestão Orbital de Entregas</p>
            <span></span>
          </div>
        </div>
      </div>

      <form class="login-card" @submit.prevent="submitLogin">
        <div class="form-header">
          <p>Acesso restrito</p>
          <h2>Entrar na plataforma</h2>
        </div>

        <label class="login-field">
          <span>Email</span>
          <div class="input-wrap">
            <Mail :size="18" />
            <input v-model="email" type="email" placeholder="admin@goeverywhere.pt" autocomplete="email" />
          </div>
        </label>

        <label class="login-field">
          <span>Password</span>
          <div class="input-wrap">
            <Lock :size="18" />
            <input v-model="password" type="password" placeholder="••••••••" autocomplete="current-password" />
          </div>
        </label>

        <div class="form-row">
          <label class="remember">
            <input type="checkbox" />
            <span>Manter sessão</span>
          </label>
          <button type="button" class="ghost-link">Recuperar acesso</button>
        </div>

        <button class="login-button" type="submit" :disabled="isLoading">
          {{ isLoading ? 'A autenticar...' : 'Entrar' }}
        </button>
      </form>
    </section>
  </div>
</template>

<style scoped>
.login-page {
  position: relative;
  min-height: 100%;
  overflow: hidden;
  display: grid;
  place-items: center;
  padding: 48px;
  background: #000;
  font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.stars-layer {
  position: absolute;
  inset: 0;
  background-image:
    radial-gradient(circle at 18% 22%, rgba(255,255,255,0.9) 0 1px, transparent 1.5px),
    radial-gradient(circle at 72% 18%, rgba(255,255,255,0.65) 0 1px, transparent 1.5px),
    radial-gradient(circle at 42% 74%, rgba(255,255,255,0.75) 0 1px, transparent 1.5px),
    radial-gradient(circle at 83% 64%, rgba(255,255,255,0.55) 0 1px, transparent 1.5px);
  background-size: 240px 240px, 310px 310px, 260px 260px, 360px 360px;
  opacity: 0.65;
}

.planet-glow {
  position: absolute;
  right: -220px;
  bottom: -260px;
  width: 720px;
  height: 720px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 32% 28%, rgba(255,255,255,0.22), transparent 18%),
    radial-gradient(circle at 50% 50%, rgba(56, 182, 255, 0.42), rgba(15, 23, 42, 0.2) 48%, transparent 69%);
  filter: blur(0.4px);
  opacity: 0.65;
}

.login-shell {
  position: relative;
  z-index: 1;
  width: min(920px, 100%);
  display: grid;
  grid-template-columns: 1fr 390px;
  gap: 34px;
  align-items: center;
}

.brand-panel {
  color: white;
}

.brand-mark {
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  margin-bottom: 24px;
  border-radius: 18px;
  background: #2563eb;
  color: white;
  box-shadow: 0 18px 48px rgba(37, 99, 235, 0.35);
}

.brand-panel h1 {
  font-size: clamp(42px, 6vw, 76px);
  line-height: 0.9;
  font-weight: 950;
  font-style: italic;
  text-transform: uppercase;
}

.brand-divider {
  width: fit-content;
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  color: rgba(255,255,255,0.62);
}

.brand-divider span {
  width: 28px;
  height: 1px;
  background: #3b82f6;
}

.brand-divider p {
  font-size: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  text-transform: uppercase;
  letter-spacing: 0.22em;
}

.login-card {
  padding: 30px;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 18px;
  background: rgba(10, 10, 10, 0.82);
  box-shadow: 0 28px 90px rgba(0,0,0,0.48);
  backdrop-filter: blur(18px);
}

.form-header {
  margin-bottom: 28px;
}

.form-header p {
  margin-bottom: 6px;
  color: #38b6ff;
  font-size: 10px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 800;
  letter-spacing: 0.22em;
  text-transform: uppercase;
}

.form-header h2 {
  color: white;
  font-size: 24px;
  font-weight: 900;
}

.login-field {
  display: grid;
  gap: 8px;
  margin-bottom: 16px;
}

.login-field > span {
  color: rgba(255,255,255,0.42);
  font-size: 9px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
  font-weight: 800;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.input-wrap {
  height: 48px;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 0 14px;
  border: 1px solid rgba(255,255,255,0.12);
  border-radius: 10px;
  background: rgba(255,255,255,0.06);
  color: rgba(255,255,255,0.7);
}

.input-wrap:focus-within {
  border-color: rgba(59, 130, 246, 0.75);
  background: rgba(255,255,255,0.08);
}

.input-wrap input {
  min-width: 0;
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: white;
  font-size: 15px;
}

.input-wrap input::placeholder {
  color: rgba(255,255,255,0.26);
}

.form-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 4px 0 24px;
}

.remember {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: rgba(255,255,255,0.55);
  font-size: 12px;
}

.remember input {
  accent-color: #2563eb;
}

.ghost-link {
  border: 0;
  background: transparent;
  color: #60a5fa;
  font-size: 12px;
  font-weight: 800;
  cursor: pointer;
}

.login-button {
  width: 100%;
  height: 48px;
  border: 0;
  border-radius: 12px;
  background: #2563eb;
  color: white;
  font-size: 11px;
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 18px 36px rgba(37, 99, 235, 0.35);
  transition: transform 0.15s ease, background-color 0.15s ease;
}

.login-button:hover {
  background: #3b82f6;
  transform: translateY(-1px);
}

.login-button:disabled {
  opacity: 0.65;
  cursor: wait;
}

@media (max-width: 900px) {
  .login-page {
    padding: 28px;
  }

  .login-shell {
    grid-template-columns: 1fr;
  }
}
</style>

<template>
  <main class="page-shell" style="padding: 7.5rem 0 0;">
    <section class="panel" style="max-width: 45rem; margin: 0 auto;">
        <div class="section-header">
          <div>
            <p class="small-note">Conta</p>
            <h1 class="headline" style="font-size: 2.85rem;">Gerir Conta</h1>
          </div>
        </div>

        <p class="subtitle">Atualize suas informações de conta.</p>

        <div class="account-details-card">
          <template v-if="bookingStore.clienteLoading">
            <p>Loading...</p>
          </template>

          <template v-else-if="bookingStore.clienteData">
            <div class="detail-row">
              <strong>Primeiro Nome: </strong>
              <span>{{ userStore.clienteData.primeiroNome }}</span>
            </div>
            <div class="detail-row">
              <strong>Último Nome: </strong>
              <span>{{ userStore.clienteData.ultimoNome }}</span>
            </div>
            <div class="detail-row">
              <strong>Email: </strong>
              <span>{{ userStore.clienteData.email }}</span>
            </div>
          </template>

          <template v-else>
            <p>Dados do cliente não encontrados. Faça login novamente se necessário.</p>
          </template>
        </div>

        <div class="input-group">
          <label>
            Nova Password
            <input v-model="newPassword" type="password" placeholder="••••••••••••" />
          </label>
        </div>

        <div style="display: flex; flex-wrap: wrap; gap: 1rem; justify-content: flex-start; align-items: center; margin: 1.5rem 0;">
          <button @click="updateAccount" class="btn btn-primary">Atualizar Conta</button>
          <button @click="logout" class="btn btn-secondary">Logout</button>
        </div>

        <p v-if="message" class="subtitle" :style="{ color: messageType === 'error' ? 'red' : 'green' }">{{ message }}</p>
      </section>
    </main>
  <div class="corner-video-wrapper show" aria-hidden="true">
    <video class="corner-video" autoplay muted loop playsinline>
      <source src="../assets/rocket.mp4" type="video/mp4" />
    </video>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { auth } from '../services/firebase'
import { updatePassword, signOut } from "firebase/auth";
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/UserStore'
import { useBookingStore } from '../stores/BookingStore'

const router = useRouter()
const userStore = useUserStore()
const bookingStore = useBookingStore()
const newPassword = ref('')
const message = ref('')
const messageType = ref('')

const updateAccount = async () => {
  const user = auth.currentUser;
  if (!user) {
    message.value = 'Usuário não autenticado.';
    messageType.value = 'error';
    return;
  }

  try {
    if (newPassword.value) {
      await updatePassword(user, newPassword.value);
      message.value = 'Password atualizada com sucesso!';
      messageType.value = 'success';
    }
  } catch (error) {
    message.value = 'Erro ao atualizar: ' + error.message;
    messageType.value = 'error';
  }
}

const logout = async () => {
  try {
    await signOut(auth);
    router.push('/login');
  } catch (error) {
    console.error('Erro no logout:', error);
  }
}
</script>

<style scoped>
.corner-video-wrapper {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  width: 16rem; /* 256px */
  height: 9rem; /* 144px */
  overflow: hidden;
  border-radius: 0.75rem;
  box-shadow: 0 8px 24px rgba(0,0,0,0.45);
  pointer-events: none; /* do not block interaction */
  z-index: 60;
}
.corner-video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transform: translateZ(0);
  /* central radial mask to fade edges so only the ship remains clearly visible */
  -webkit-mask-image: radial-gradient(circle at 40% 55%, rgba(0,0,0,1) 18%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0) 70%);
  mask-image: radial-gradient(circle at 40% 55%, rgba(0,0,0,1) 18%, rgba(0,0,0,0.6) 40%, rgba(0,0,0,0) 70%);
  opacity: 0.98;
}

/* subtle fade-in when component mounts */
.corner-video-wrapper { opacity: 0; transition: opacity 700ms ease; }
.corner-video-wrapper.show { opacity: 1; }

/* hide on very small screens */
@media (max-width: 640px) {
  .corner-video-wrapper { display: none; }
}
</style>
<template>
  <div class="side-layout">
    <main class="page-shell" style="padding: 0;">
      <section class="panel" style="max-width: 720px; margin: 0 auto;">
        <div class="section-header">
          <div>
            <p class="small-note">Conta</p>
            <h1 class="headline" style="font-size: 2.85rem;">Gerenciar Conta</h1>
          </div>
        </div>

        <p class="subtitle">Atualize suas informações de conta.</p>

        <div class="input-group">
          <label>
            Nova Password
            <input v-model="newPassword" type="password" placeholder="••••••••••••" />
          </label>
        </div>

        <div style="display: flex; justify-content: space-between; align-items: center; margin: 24px 0;">
          <button @click="updateAccount" class="btn btn-primary">Atualizar Conta</button>
          <button @click="logout" class="btn btn-secondary">Logout</button>
        </div>

        <p v-if="message" class="subtitle" :style="{ color: messageType === 'error' ? 'red' : 'green' }">{{ message }}</p>
      </section>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { auth } from '../services/firebase'
import { updateEmail, updatePassword, signOut } from "firebase/auth";
import { useRouter } from 'vue-router'
import { useUserStore } from '../stores/UserStore'

const router = useRouter()
const userStore = useUserStore()
const newEmail = ref('')
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
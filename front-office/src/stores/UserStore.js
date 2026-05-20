import {defineStore} from "pinia";
import { ref, computed } from "vue";
import { auth } from '../services/firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";
import { verificarClienteStrapi } from '../services/strapi';

export const useUserStore = defineStore("userEmail", () => {
  const userEmail = ref(null);
  const user = ref(null);
  const clienteData = ref(null);
  const clienteLoading = ref(false);
  const isAuthenticated = ref(false);

  async function loadClienteFromStrapi(email) {
    if (!email) return null;
    clienteLoading.value = true;

    try {
      const cliente = await verificarClienteStrapi(email);
      if (!cliente) {
        clienteData.value = null;
        return null;
      }
      
      const attributes = cliente.attributes || {};
      clienteData.value = {
        id: cliente.id,
        primeiroNome: cliente.PrimeiroNome,
        ultimoNome: cliente.UltimoNome,
        email: cliente.Email
      };
      console.log('este Cliente foi encontrado de certeza:', clienteData.value);

      return clienteData.value;
    } catch (error) {
      console.error('Erro ao carregar cliente do Strapi:', error);
      clienteData.value = null;
      return null;
    } finally {
      clienteLoading.value = false;
    }
  }

  const nomeCompleto = computed(() => {
    if (!clienteData.value) return '';
    return `${clienteData.value.primeiroNome || ''} ${clienteData.value.ultimoNome || ''}`.trim();
  });

  // Listen to auth state changes
  onAuthStateChanged(auth, async (firebaseUser) => {
    if (firebaseUser) {
      user.value = firebaseUser;
      userEmail.value = firebaseUser.email;
      isAuthenticated.value = true;
      await loadClienteFromStrapi(firebaseUser.email);
    } else {
      user.value = null;
      userEmail.value = null;
      isAuthenticated.value = false;
      clienteData.value = null;
    }
  });

  function logout() {
    signOut(auth).then(() => {
      userEmail.value = null;
      user.value = null;
      isAuthenticated.value = false;
      clienteData.value = null;
    }).catch((error) => {
      console.error("Error signing out:", error);
    });
  }

  return {
    userEmail,
    user,
    clienteData,
    clienteLoading,
    nomeCompleto,
    isAuthenticated,
    loadClienteFromStrapi,
    logout
  };
});
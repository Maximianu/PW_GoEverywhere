import {defineStore} from "pinia";
import { ref } from "vue";
import { auth } from '../services/firebase';
import { onAuthStateChanged, signOut } from "firebase/auth";

export const useUserStore = defineStore("userEmail", () => {
  const userEmail = ref(null);
  const user = ref(null);
  const isAuthenticated = ref(false);

  // Listen to auth state changes
  onAuthStateChanged(auth, (firebaseUser) => {
    if (firebaseUser) {
      user.value = firebaseUser;
      userEmail.value = firebaseUser.email;
      isAuthenticated.value = true;
    } else {
      user.value = null;
      userEmail.value = null;
      isAuthenticated.value = false;
    }
  });

  function logout() {
    signOut(auth).then(() => {
      userEmail.value = null;
      user.value = null;
      isAuthenticated.value = false;
    }).catch((error) => {
      console.error("Error signing out:", error);
    });
  }

  return {
    userEmail,
    user,
    isAuthenticated,
    logout
  };
});
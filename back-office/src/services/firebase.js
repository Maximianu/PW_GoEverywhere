// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCk6YJK2kCZxPbwLsrWAQPoaUyuGie8J6I",
  authDomain: "goeverywherespace.firebaseapp.com",
  projectId: "goeverywherespace",
  storageBucket: "goeverywherespace.firebasestorage.app",
  messagingSenderId: "648492895691",
  appId: "1:648492895691:web:a53f8dd58515a5116efa4e"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app); // Exportamos o serviço de autenticação
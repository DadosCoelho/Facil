// facil/lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// Se você for usar Analytics, descomente e inicialize-o
// import { getAnalytics } from "firebase/analytics";

// Suas configurações do Firebase (as que você já forneceu)
const firebaseConfig = {
  apiKey: "AIzaSyAXvE2dvZFGitt6kkCCl-M6yWYt9CRDoHk",
  authDomain: "facil-61f9e.firebaseapp.com",
  projectId: "facil-61f9e",
  storageBucket: "facil-61f9e.firebasestorage.app",
  messagingSenderId: "61940625115",
  appId: "1:61940625115:web:9980f8827a85b5f64766fe",
  measurementId: "G-HDDEN3BF10"
};

// Evita a inicialização múltipla do Firebase em ambientes de desenvolvimento
// (especialmente com Hot Module Reloading do Next.js)
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

// Inicialize o Realtime Database
const database = getDatabase(app);

// Se você for usar Analytics, descomente
// const analytics = getAnalytics(app);

export { database };
// export { database, analytics }; // Se você for usar Analytics
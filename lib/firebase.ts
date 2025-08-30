// facil/lib/firebase.ts

import { initializeApp, getApps, getApp } from "firebase/app";
import { getDatabase } from "firebase/database";
// Se você for usar Analytics, descomente e inicialize-o
// import { getAnalytics } from "firebase/analytics";

// Firebase config loaded from environment variables (.env.local).
// For client-side use in Next.js, prefix with NEXT_PUBLIC_.
// Example variables are provided in the project's .env.local (local-only).
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? '',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? '',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? '',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET ?? '',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID ?? '',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID ?? '',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID ?? ''
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
// Facil/lib/firebase.ts

import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getDatabase, Database } from "firebase/database";

// Configurações para o Firebase Client SDK
const firebaseClientConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY as string,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN as string,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID as string,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID as string,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID as string
};

let initializedClientApp: FirebaseApp | undefined;
let initializedClientDatabase: Database | undefined;

// Função para obter ou inicializar o Firebase Client App (para frontend)
function getOrCreateClientApp(): FirebaseApp {
  if (initializedClientApp) {
    return initializedClientApp;
  }
  // Se houver apps existentes, usa o primeiro, caso contrário, inicializa um novo
  if (getApps().length > 0) {
    initializedClientApp = getApps()[0]; // getApps() retorna um array, pega o primeiro
  } else {
    initializedClientApp = initializeApp(firebaseClientConfig);
  }
  return initializedClientApp;
}

// Função para obter ou inicializar o Firebase Realtime Database (para frontend)
function getOrCreateClientDatabase(): Database {
  if (initializedClientDatabase) {
    return initializedClientDatabase;
  }
  const app = getOrCreateClientApp(); // Garante que o app cliente está inicializado
  initializedClientDatabase = getDatabase(app);
  return initializedClientDatabase;
}

// Exporta a instância do database para o CLIENTE (frontend)
export const database = getOrCreateClientDatabase();

// Exporta o app cliente, caso seja necessário (para outras inicializações de serviços, por exemplo)
export const app = getOrCreateClientApp();
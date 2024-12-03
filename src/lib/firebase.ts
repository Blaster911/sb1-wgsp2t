import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyCQHpFwk5tZAxeMJazAxGVQqfX6quekAoA",
  authDomain: "gestion-des-reparation.firebaseapp.com",
  projectId: "gestion-des-reparation",
  storageBucket: "gestion-des-reparation.firebasestorage.app",
  messagingSenderId: "1075988320857",
  appId: "1:1075988320857:web:773870a997b45b0caf9748",
  measurementId: "G-VB26V5EQYR"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);
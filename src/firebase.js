import { initializeApp } from 'firebase/app';
import { initializeFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyDevhhpxHtS4ue5TX-SHg0WZAkbwdcfKrw",
  authDomain: "voltech-e26bd.firebaseapp.com",
  projectId: "voltech-e26bd",
  storageBucket: "voltech-e26bd.firebasestorage.app",
  messagingSenderId: "781267600980",
  appId: "1:781267600980:web:19e31363a4a65e0e414fc1",
  measurementId: "G-BS7KGXRTSN"
};

export const app = initializeApp(firebaseConfig);
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
});
export const auth = getAuth(app);
export const storage = getStorage(app);


import { initializeApp } from 'firebase/app';
import { initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'PUT_YOUR_API_KEY',
  authDomain: 'PUT_YOUR_AUTH_DOMAIN',
  projectId: 'PUT_YOUR_PROJECT_ID',
  storageBucket: 'PUT_YOUR_STORAGE_BUCKET',
  messagingSenderId: 'PUT_YOUR_MESSAGING_SENDER_ID',
  appId: 'PUT_YOUR_APP_ID'
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);

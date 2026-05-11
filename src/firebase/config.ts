import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyAb4GE2zzRgMKIABTVE9qxe4QXm8YFc_ag",
  authDomain: "videoplayerapp-joviat.firebaseapp.com",
  projectId: "videoplayerapp-joviat",
  storageBucket: "videoplayerapp-joviat.firebasestorage.app",
  messagingSenderId: "808740487021",
  appId: "1:808740487021:web:da451a171790d4b80ce464",
  measurementId: "G-2PT29E351S"
};

const app = initializeApp(firebaseConfig);

export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});
export const db = getFirestore(app);

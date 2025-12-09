// firebaseConfig.js

import ReactNativeAsyncStorage from '@react-native-async-storage/async-storage';
import { getAnalytics, isSupported } from "firebase/analytics";
import { initializeApp } from 'firebase/app';
import { getReactNativePersistence, initializeAuth } from 'firebase/auth'; // Kimlik doğrulama için gerekli

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyDYPGiR6Jfr1Vu0hhLNfSpsDfh_aEI3nNk",
    authDomain: "skyquest-4a306.firebaseapp.com",
    projectId: "skyquest-4a306",
    storageBucket: "skyquest-4a306.firebasestorage.app",
    messagingSenderId: "878547160294",
    appId: "1:878547160294:web:d9d66fb8969e1e5039ff27",
    measurementId: "G-H8S07J7D2W"
};

// Firebase uygulamasını başlat
const app = initializeApp(firebaseConfig);

let analytics;
isSupported().then((supported) => {
    if (supported) {
        analytics = getAnalytics(app);
    }
});

// Kimlik doğrulama servisini al
export const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(ReactNativeAsyncStorage)
});

// İleride diğer servisleri de buradan dışa aktarabilirsiniz:
import { getFirestore } from 'firebase/firestore';
export const db = getFirestore(app);
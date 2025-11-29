// firebaseConfig.js

import { getAnalytics } from "firebase/analytics";
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Kimlik doğrulama için gerekli

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
const analytics = getAnalytics(app);

// Kimlik doğrulama servisini al
export const auth = getAuth(app);

// İleride diğer servisleri de buradan dışa aktarabilirsiniz:
import { getFirestore } from 'firebase/firestore';
export const db = getFirestore(app);
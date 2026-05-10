import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyBWp-8CEFAr2cSrcSHEZu7jnaUWUU9DHtY",
    authDomain: "md-care-hospital.firebaseapp.com",
    projectId: "md-care-hospital",
    storageBucket: "md-care-hospital.firebasestorage.app",
    messagingSenderId: "214966558089",
    appId: "1:214966558089:web:d49f400adb427614089558",
    measurementId: "G-K3S90QH9LT"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
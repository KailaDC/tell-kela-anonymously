import { initializeApp } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBWiZLlM-d8DjB1WjMgNTjeiYRzrtsk5A8",
  authDomain: "tellkelaanonymous.firebaseapp.com",
  projectId: "tellkelaanonymous",
  storageBucket: "tellkelaanonymous.firebasestorage.app",
  messagingSenderId: "744083713060",
  appId: "1:744083713060:web:d91890accde7f80d723cb1",
  measurementId: "G-6LL2D4E9JH"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const auth = getAuth(app);

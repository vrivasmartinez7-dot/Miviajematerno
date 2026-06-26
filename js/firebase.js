// IMPORTAR FIREBASE

import { initializeApp }

from "https://www.gstatic.com/firebasejs/12.13.0/firebase-app.js";

import {

  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail 

} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-auth.js";

import {

  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp

} from "https://www.gstatic.com/firebasejs/12.13.0/firebase-firestore.js";

// CONFIGURACIÓN

const firebaseConfig = {

  apiKey: "AIzaSyDJJ4G3TBjDYr_1Gw2UtqWkQDY2yVS4HFo",

  authDomain: "mi-viaje-materno.firebaseapp.com",

  projectId: "mi-viaje-materno",

  storageBucket: "mi-viaje-materno.firebasestorage.app",

  messagingSenderId: "135257611656",

  appId: "1:135257611656:web:f80fe358d59b916b89ee3d",

  measurementId: "G-HMH4CS8WEW"

};

// INICIALIZAR

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

const db = getFirestore(app);

// EXPORTAR

export {

  auth,
  db,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  serverTimestamp,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  onAuthStateChanged
  sendPasswordResetEmail 

};

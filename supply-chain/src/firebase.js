// firebase.js
import { initializeApp } from "firebase/app";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
  const firebaseConfig = {
    apiKey: "AIzaSyBQqraxKugSrutzxz5O1CqWuGb0JeZvmvY",
    authDomain: "trace-craft.firebaseapp.com",
    projectId: "trace-craft",
    storageBucket: "trace-craft.firebasestorage.app",
    messagingSenderId: "485981815382",
    appId: "1:485981815382:web:2dcbad880a28418d73b1f7",
    measurementId: "G-GM237SCG8K"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
const auth = getAuth(app); // Firebase Authentication
const db = getFirestore(app); // Firestore Database

export { auth, db, createUserWithEmailAndPassword, signInWithEmailAndPassword };

import { initializeApp } from "firebase/app";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

// Your app's Firebase project configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRl4FI6uAT3f_0Cea-GbgR-5nE-VqlB0U",
  authDomain: "b-conn-d5f33.firebaseapp.com",
  projectId: "b-conn-d5f33",
  storageBucket: "b-conn-d5f33.appspot.com",
  messagingSenderId: "224063087515",
  appId: "1:224063087515:web:99f8a6f2932c070ebcf73e",
  measurementId: "G-EK7X4YB7HE"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

export { messaging, getToken, onMessage };
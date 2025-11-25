<<<<<<< HEAD
// This file must be in the public/root directory of your site.

// Import the Firebase scripts for the service worker
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

// Your web app's Firebase configuration
=======
// Import and configure the Firebase SDK
importScripts("https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js");

// Replace with your Firebase project's configuration
>>>>>>> 0988d972d01c0c43ccac0acc91c73ad9c7683e59
const firebaseConfig = {
  apiKey: "AIzaSyBRl4FI6uAT3f_0Cea-GbgR-5nE-VqlB0U",
  authDomain: "b-conn-d5f33.firebaseapp.com",
  projectId: "b-conn-d5f33",
  storageBucket: "b-conn-d5f33.appspot.com", // Corrected format
  messagingSenderId: "224063087515",
  appId: "1:224063087515:web:99f8a6f2932c070ebcf73e",
  measurementId: "G-EK7X4YB7HE"
};

<<<<<<< HEAD
// Initialize Firebase
=======


>>>>>>> 0988d972d01c0c43ccac0acc91c73ad9c7683e59
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

<<<<<<< HEAD
/**
 * Handle incoming messages when the app is in the background or closed.
 */
messaging.onBackgroundMessage(function(payload) {
  console.log(
    "[firebase-messaging-sw.js] Received background message ",
    payload
  );

  // Customize the notification here
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: "/firebase-logo.png", // Optional: Path to an icon
  };

  return self.registration.showNotification(notificationTitle, notificationOptions);
=======
// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico' // Default icon for the notification
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
>>>>>>> 0988d972d01c0c43ccac0acc91c73ad9c7683e59
});
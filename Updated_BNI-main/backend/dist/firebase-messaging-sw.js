// Import and configure the Firebase SDK
importScripts("https://www.gstatic.com/firebasejs/9.2.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/9.2.0/firebase-messaging-compat.js");

// Replace with your Firebase project's configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRl4FI6uAT3f_0Cea-GbgR-5nE-VqlB0U",
  authDomain: "b-conn-d5f33.firebaseapp.com",
  projectId: "b-conn-d5f33",
  storageBucket: "b-conn-d5f33.appspot.com", // Corrected format
  messagingSenderId: "224063087515",
  appId: "1:224063087515:web:99f8a6f2932c070ebcf73e",
  measurementId: "G-EK7X4YB7HE"
};



firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);

  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico' // Default icon for the notification
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
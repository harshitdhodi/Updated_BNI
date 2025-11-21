// This file must be in the public/root directory of your site.

// Import the Firebase scripts for the service worker
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-app.js");
importScripts("https://www.gstatic.com/firebasejs/8.10.0/firebase-messaging.js");

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBRl4FI6uAT3f_0Cea-GbgR-5nE-VqlB0U",
  authDomain: "b-conn-d5f33.firebaseapp.com",
  projectId: "b-conn-d5f33",
  storageBucket: "b-conn-d5f33.appspot.com", // Corrected format
  messagingSenderId: "224063087515",
  appId: "1:224063087515:web:99f8a6f2932c070ebcf73e",
  measurementId: "G-EK7X4YB7HE"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Retrieve an instance of Firebase Messaging so that it can handle background messages.
const messaging = firebase.messaging();

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
});
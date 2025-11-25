import { useEffect } from 'react';
import { messaging, getToken, onMessage } from '../firebaseConfig';
import { useNotifications } from '../context/NotificationContext';

function PushNotificationHandler() {
  const { addNotification } = useNotifications();

  useEffect(() => {
    const requestNotificationPermission = async () => {
      try {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          console.log('Notification permission granted.');

          // Get the token
          const currentToken = await getToken(messaging, {
            vapidKey: 'BFL6JYHGdtTgKv7b6_mnt9ifKTFZc4f5mmc3uz_IzFzqtYcgdUuXUuQalRIkLn5mz97MKl2nIoALBWJx2BCaAr4', // Replace with your VAPID key
          });

          if (currentToken) {
            console.log('FCM Token:', currentToken);
            // You should send this token to your server to associate it with the logged-in user.
            // Your login logic already seems to handle this, just ensure you're passing this token.
          } else {
            console.log('No registration token available. Request permission to generate one.');
          }
        } else {
          console.log('Unable to get permission to notify.');
        }
      } catch (error) {
        console.error('An error occurred while requesting permission:', error);
      }
    };

    requestNotificationPermission();

    // Handle incoming messages when the app is in the foreground
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received in foreground. ', payload);
      // Display the notification using the browser's Notification API
      const { title, body, image } = payload.notification;
      if (title) {
        new Notification(title, { body, icon: '/favicon.ico', image });

        // Also add it to our internal state for the notification center
        addNotification({ title, body });
      }
    });

    return () => unsubscribe(); // Cleanup the listener on component unmount
  }, [addNotification]);

  return null; // This component does not render anything
}

export default PushNotificationHandler;
// public/service-worker.js
// Service Worker for handling push notifications

self.addEventListener('install', (event) => {
    console.log('Service Worker installed');
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    console.log('Service Worker activated');
    event.waitUntil(clients.claim());
});

// Listen for push events
self.addEventListener('push', (event) => {
    console.log('Push notification received', event);

    let notificationData = {
        title: 'Calendar Reminder',
        body: 'You have a reminder',
        icon: '/icon.png',
        badge: '/badge.png',
        data: { url: '/calendar' },
    };

    // Parse the notification payload
    if (event.data) {
        try {
            notificationData = event.data.json();
        } catch (e) {
            notificationData.body = event.data.text();
        }
    }

    const promiseChain = self.registration.showNotification(
        notificationData.title,
        {
            body: notificationData.body,
            icon: notificationData.icon || '/icon.png',
            badge: notificationData.badge || '/badge.png',
            data: notificationData.data,
            actions: notificationData.actions || [],
            tag: notificationData.data?.eventId || 'calendar-notification',
            requireInteraction: true, // Keep notification until user interacts
            vibrate: [200, 100, 200], // Vibration pattern
        }
    );

    event.waitUntil(promiseChain);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
    console.log('Notification clicked', event);

    event.notification.close();

    // Handle action button clicks
    if (event.action === 'view') {
        const urlToOpen = event.notification.data?.url || '/calendar';
        
        event.waitUntil(
            clients.matchAll({ type: 'window', includeUncontrolled: true })
                .then((windowClients) => {
                    // Check if there's already a window open
                    for (let i = 0; i < windowClients.length; i++) {
                        const client = windowClients[i];
                        if (client.url.includes(urlToOpen) && 'focus' in client) {
                            return client.focus();
                        }
                    }
                    // If no window is open, open a new one
                    if (clients.openWindow) {
                        return clients.openWindow(urlToOpen);
                    }
                })
        );
    } else if (event.action === 'dismiss') {
        // Just close the notification (already done above)
        console.log('Notification dismissed');
    } else {
        // Default click (no action button)
        const urlToOpen = event.notification.data?.url || '/calendar';
        
        event.waitUntil(
            clients.openWindow(urlToOpen)
        );
    }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
    console.log('Notification closed', event);
});
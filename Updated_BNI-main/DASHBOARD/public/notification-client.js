// public/js/notification-client.js
// Client-side code for subscribing to push notifications

class NotificationManager {
    constructor() {
        this.publicVapidKey = null;
        this.registration = null;
    }

    /**
     * Initialize notification manager
     */
    async init() {
        try {
            // Check if service workers are supported
            if (!('serviceWorker' in navigator)) {
                console.error('Service Workers not supported');
                return false;
            }

            // Check if Push API is supported
            if (!('PushManager' in window)) {
                console.error('Push API not supported');
                return false;
            }

            // Register service worker
            this.registration = await navigator.serviceWorker.register('/service-worker.js');
            console.log('Service Worker registered');

            // Get VAPID public key
            const response = await fetch('/api/notifications/vapid-public-key');
            const data = await response.json();
            this.publicVapidKey = data.publicKey;

            return true;
        } catch (error) {
            console.error('Error initializing notification manager:', error);
            return false;
        }
    }

    /**
     * Request notification permission
     */
    async requestPermission() {
        const permission = await Notification.requestPermission();
        console.log('Notification permission:', permission);
        return permission === 'granted';
    }

    /**
     * Subscribe to push notifications
     */
    async subscribe() {
        try {
            // Check if already initialized
            if (!this.registration) {
                await this.init();
            }

            // Request permission
            const permissionGranted = await this.requestPermission();
            if (!permissionGranted) {
                throw new Error('Notification permission denied');
            }

            // Subscribe to push notifications
            const subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(this.publicVapidKey),
            });

            console.log('Push subscription:', subscription);

            // Send subscription to server
            const response = await fetch('/api/notifications/subscribe', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add your auth token here
                    // 'Authorization': `Bearer ${yourAuthToken}`,
                },
                body: JSON.stringify({ subscription }),
            });

            if (!response.ok) {
                throw new Error('Failed to save subscription on server');
            }

            const result = await response.json();
            console.log('Subscription saved:', result);
            return true;
        } catch (error) {
            console.error('Error subscribing:', error);
            return false;
        }
    }

    /**
     * Unsubscribe from push notifications
     */
    async unsubscribe() {
        try {
            const subscription = await this.registration.pushManager.getSubscription();
            
            if (subscription) {
                await subscription.unsubscribe();
                
                // Remove from server
                await fetch('/api/notifications/unsubscribe', {
                    method: 'DELETE',
                    headers: {
                        'Content-Type': 'application/json',
                        // Add your auth token here
                    },
                    body: JSON.stringify({ endpoint: subscription.endpoint }),
                });

                console.log('Unsubscribed successfully');
                return true;
            }
            return false;
        } catch (error) {
            console.error('Error unsubscribing:', error);
            return false;
        }
    }

    /**
     * Check if user is subscribed
     */
    async isSubscribed() {
        try {
            if (!this.registration) {
                await this.init();
            }
            const subscription = await this.registration.pushManager.getSubscription();
            return subscription !== null;
        } catch (error) {
            console.error('Error checking subscription:', error);
            return false;
        }
    }

    /**
     * Send test notification
     */
    async sendTestNotification() {
        try {
            const response = await fetch('/api/notifications/test', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Add your auth token here
                },
            });

            const result = await response.json();
            console.log('Test notification sent:', result);
            return result.success;
        } catch (error) {
            console.error('Error sending test notification:', error);
            return false;
        }
    }

    /**
     * Convert VAPID key from base64 to Uint8Array
     */
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/\-/g, '+')
            .replace(/_/g, '/');

        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);

        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }
}

// Export for use in your application
const notificationManager = new NotificationManager();

// Auto-initialize on page load
window.addEventListener('load', async () => {
    await notificationManager.init();
});
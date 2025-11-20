// routes/notificationRoutes.js
const express = require('express');
const router = express.Router();
const Subscription = require('../model/subscription');
const { sendNotificationToUser } = require('../service/NotificationService');
const { sendNotificationToAll } = require('../service/NotificationService');


/**
 * GET /api/notifications/vapid-public-key
 * Get the public VAPID key for client-side subscription
 */
router.get('/vapid-public-key', (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
});

/**
 * POST /api/notifications/subscribe
 * Subscribe user to push notifications
 */
router.post('/subscribe',  async (req, res) => {
    try {
        const { subscription } = req.body;
        const userId = req.userId; // From your auth middleware

        if (!subscription || !subscription.endpoint) {
            return res.status(400).json({ error: 'Invalid subscription object' });
        }

        // Create or update subscription (stored in separate collection)
        const newSubscription = await Subscription.findOneAndUpdate(
            { userId, endpoint: subscription.endpoint },
            {
                userId,
                endpoint: subscription.endpoint,
                keys: {
                    p256dh: subscription.keys.p256dh,
                    auth: subscription.keys.auth,
                },
            },
            { upsert: true, new: true }
        );

        res.status(201).json({
            success: true,
            message: 'Subscription saved successfully',
            subscription: newSubscription,
        });
    } catch (error) {
        console.error('Error saving subscription:', error);
        res.status(500).json({ error: 'Failed to save subscription' });
    }
});

/**
 * DELETE /api/notifications/unsubscribe
 * Unsubscribe from push notifications
 */
router.delete('/unsubscribe',  async (req, res) => {
    try {
        const { endpoint } = req.body;
        const userId = req.userId;

        await Subscription.deleteOne({ userId, endpoint });

        res.json({
            success: true,
            message: 'Unsubscribed successfully',
        });
    } catch (error) {
        console.error('Error unsubscribing:', error);
        res.status(500).json({ error: 'Failed to unsubscribe' });
    }
});

/**
 * POST /api/notifications/test
 * Send a test notification (for testing purposes)
 */
router.post('/test',  async (req, res) => {
    try {
        const userId = req.userId;

        const payload = {
            title: 'Test Notification',
            body: 'This is a test notification from your calendar app!',
            icon: '/icon.png',
            data: {
                url: '/calendar',
            },
        };

        const result = await sendNotificationToUser(userId, payload);

        res.json({
            success: result.success,
            message: 'Test notification sent',
            result,
        });
    } catch (error) {
        console.error('Error sending test notification:', error);
        res.status(500).json({ error: 'Failed to send test notification' });
    }
});

/**
 * POST /api/notifications/broadcast
 * Broadcast a notification payload to all subscribers
 * Body: { title, body, icon?, data? }
 */
router.post('/broadcast', async (req, res) => {
    try {
        const payload = req.body;
        if (!payload || !payload.title || !payload.body) {
            return res.status(400).json({ success: false, message: 'Payload must include title and body' });
        }

        const result = await sendNotificationToAll(payload);
        return res.json({ success: result.success, result });
    } catch (error) {
        console.error('Error broadcasting notification:', error);
        return res.status(500).json({ success: false, error: error.message });
    }
});

module.exports = router;

// services/notificationService.js
const webpush = require('web-push');
const Subscription = require('../model/subscription');
require('dotenv').config();

// Configure web-push with VAPID details
webpush.setVapidDetails(
    process.env.VAPID_EMAIL,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
);

/**
 * Send push notification to a specific user
 * @param {String} userId - The user's MongoDB ID
 * @param {Object} payload - Notification payload
 */
const sendNotificationToUser = async (userId, payload) => {
    try {
        // Find subscriptions for this user in Subscription collection
        const subscriptions = await Subscription.find({ userId }).lean();

        if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
            console.log(`No subscriptions found for user: ${userId}`);
            return { success: false, message: 'No subscriptions found' };
        }

        // Send notification to all user's subscriptions
        const notificationPromises = subscriptions.map(async (sub) => {
            try {
                await webpush.sendNotification(
                    {
                        endpoint: sub.endpoint,
                        keys: {
                            p256dh: sub.keys.p256dh,
                            auth: sub.keys.auth,
                        },
                    },
                    JSON.stringify(payload)
                );
                return { success: true, endpoint: sub.endpoint };
            } catch (error) {
                console.error(`Failed to send to ${sub.endpoint}:`, error);
                
                // Remove invalid subscriptions (410 = Gone, 404 = Not Found)
                if (error.statusCode === 410 || error.statusCode === 404) {
                    console.log(`Subscription expired or not found for endpoint ${sub.endpoint}. Please remove it from DB.`);
                    // If subscriptions are stored as top-level documents, implement deletion here.
                    // Avoid modifying nested arrays in member document automatically to prevent accidental data loss.
                }
                
                return { success: false, endpoint: sub.endpoint, error: error.message };
            }
        });

        const results = await Promise.all(notificationPromises);
        return { success: true, results };
    } catch (error) {
        console.error('Error in sendNotificationToUser:', error);
        return { success: false, error: error.message };
    }
};

/**
 * Send notification to multiple users
 * @param {Array} userIds - Array of user IDs
 * @param {Object} payload - Notification payload
 */
const sendBulkNotifications = async (userIds, payload) => {
    const results = await Promise.all(
        userIds.map(userId => sendNotificationToUser(userId, payload))
    );
    return results;
};

module.exports = {
    sendNotificationToUser,
    sendBulkNotifications,
};

/**
 * Send a notification payload to all stored subscriptions
 * @param {Object} payload - Notification payload
 */
const sendNotificationToAll = async (payload) => {
    try {
        const subscriptions = await Subscription.find({}).lean();

        if (!Array.isArray(subscriptions) || subscriptions.length === 0) {
            console.log('No subscriptions available to broadcast');
            return { success: false, message: 'No subscriptions available' };
        }

        const promises = subscriptions.map(async (sub) => {
            try {
                await webpush.sendNotification(
                    { endpoint: sub.endpoint, keys: { p256dh: sub.keys?.p256dh, auth: sub.keys?.auth } },
                    JSON.stringify(payload)
                );
                return { success: true, endpoint: sub.endpoint };
            } catch (err) {
                console.error(`Broadcast send failed for ${sub.endpoint}:`, err.message || err);
                // Cleanup expired subscriptions
                if (err.statusCode === 410 || err.statusCode === 404) {
                    try {
                        await Subscription.deleteOne({ _id: sub._id });
                        console.log(`Removed expired subscription ${sub._id}`);
                    } catch (delErr) {
                        console.error('Failed to delete expired subscription', delErr);
                    }
                }
                return { success: false, endpoint: sub.endpoint, error: err.message };
            }
        });

        const results = await Promise.all(promises);
        return { success: true, results };
    } catch (error) {
        console.error('Error in sendNotificationToAll:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendNotificationToUser,
    sendBulkNotifications,
    sendNotificationToAll,
};
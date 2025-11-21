// utils/notificationService.js
const admin = require('firebase-admin');
const User = require('../model/member');
const { initializeFirebase } = require('../config/initializeFirebase');

// Initialize Firebase when this module is loaded
initializeFirebase();

class NotificationService {
  static async sendNotificationToAllUsers(title, body, data = {}) {
    console.log('=== Starting sendNotificationToAllUsers ===');
    console.log('Notification details:', { title, body, data });

    try {
      if (!admin.apps.length) {
        console.log('Firebase not initialized, initializing now...');
        initializeFirebase();
      }

      const users = await User.find({
        deviceTokens: { $exists: true, $not: { $size: 0 } },
        active: true
      }).select('deviceTokens firstName lastName');

      console.log(`Found ${users.length} users with device tokens`);
      if (!users || users.length === 0) {
        return { success: true, message: 'No users to notify' };
      }

      const allTokens = [];
      users.forEach(user => {
        if (user.deviceTokens && user.deviceTokens.length > 0) {
          allTokens.push(...user.deviceTokens);
        }
      });

      if (allTokens.length === 0) {
        return { success: true, message: 'No device tokens available' };
      }

      const uniqueTokens = [...new Set(allTokens)];
      const batchSize = 500;
      const results = [];
      let totalSuccess = 0;
      let totalFailure = 0;

      for (let i = 0; i < uniqueTokens.length; i += batchSize) {
        const tokenBatch = uniqueTokens.slice(i, i + batchSize);

        try {
          const message = {
            notification: { title, body },
            data: {
              ...data,
              click_action: data.click_action || 'FLUTTER_NOTIFICATION_CLICK',
            },
            tokens: tokenBatch,
          };

          const response = await admin.messaging().sendEachForMulticast(message);
          totalSuccess += response.successCount;
          totalFailure += response.failureCount;
          results.push({
            batch: Math.floor(i / batchSize) + 1,
            successCount: response.successCount,
            failureCount: response.failureCount,
          });

          if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
              if (!resp.success) failedTokens.push(tokenBatch[idx]);
            });
            if (failedTokens.length > 0) {
              await this.removeInvalidTokens(failedTokens);
            }
          }
        } catch (error) {
          console.error('Error sending notification batch:', error);
          throw error;
        }
      }

      return { success: true, totalSuccess, totalFailure, batches: results };
    } catch (error) {
      console.error('Error sending notifications:', error);
      return { success: false, message: 'Failed to send notifications', error: error.message };
    }
  }

  static async sendNotificationToUser(userId, { title, body, data = {} }) {
    console.log('=== Starting sendNotificationToUser ===');
    console.log('User ID:', userId);

    try {
      if (!admin.apps.length) {
        initializeFirebase();
      }

      const user = await User.findById(userId).select('deviceTokens firstName lastName');

      if (!user) {
        return { success: false, message: 'User not found' };
      }

      if (!user.deviceTokens || user.deviceTokens.length === 0) {
        return { success: false, message: 'No device tokens for this user' };
      }

      const tokens = [...new Set(user.deviceTokens)];

      const message = {
        notification: { title, body },
        data: {
          ...Object.fromEntries(
            Object.entries(data).map(([k, v]) => [k, String(v)])
          ),
          click_action: data.click_action || 'FLUTTER_NOTIFICATION_CLICK',
        },
        tokens: tokens,
      };

      const response = await admin.messaging().sendEachForMulticast(message);

      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) failedTokens.push(tokens[idx]);
        });
        // if (failedTokens.length > 0) {
        //   await this.removeInvalidTokens(failedTokens);
        // }
      }

      return {
        success: response.successCount > 0,
        successCount: response.successCount,
        failureCount: response.failureCount,
      };
    } catch (error) {
      console.error('Error sending notification to user:', error);
      return { success: false, error: error.message };
    }
  }

//   static async removeInvalidTokens(invalidTokens) {
//     try {
//       await User.updateMany(
//         { deviceTokens: { $in: invalidTokens } },
//         { $pullAll: { deviceTokens: invalidTokens } }
//       );
//       console.log(`Removed ${invalidTokens.length} invalid tokens`);
//     } catch (error) {
//       console.error('Error removing invalid tokens:', error);
//     }
//   }

  static async sendEventNotification(event, isUpdate = false) {
    const title = isUpdate
      ? `🔄 Event Updated: ${event.name}`
      : `🎉 New Event Alert: ${event.name}`;

    const body = isUpdate
      ? `The event has been updated. Check out the latest details!`
      : `New event is now available. Register before ${new Date(event.lastDate).toLocaleDateString()}!`;

    const data = {
      type: isUpdate ? 'event_updated' : 'new_event',
      eventId: event._id.toString(),
      eventName: event.name,
      eventDate: event.date,
      lastDate: event.lastDate,
      screen: 'event_details',
      click_action: 'FLUTTER_NOTIFICATION_CLICK',
      timestamp: new Date().toISOString()
    };

    return await this.sendNotificationToAllUsers(title, body, data);
  }
}

module.exports = NotificationService;
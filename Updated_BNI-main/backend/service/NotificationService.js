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
      // Verify Firebase is initialized
      if (!admin.apps.length) {
        console.log('Firebase not initialized, initializing now...');
        initializeFirebase();
      } else {
        console.log('Firebase already initialized');
      }

      // Get all users with device tokens
      console.log('Fetching users with device tokens...');
      const users = await User.find({
        deviceTokens: { $exists: true, $not: { $size: 0 } },
        active: true
      }).select('deviceTokens firstName lastName');

      console.log(`Found ${users.length} users with device tokens`);
      if (!users || users.length === 0) {
        console.log('No users with device tokens found');
        return { success: true, message: 'No users to notify' };
      }

      // Collect all device tokens
      const allTokens = [];
      users.forEach(user => {
        if (user.deviceTokens && user.deviceTokens.length > 0) {
          allTokens.push(...user.deviceTokens);
        }
      });

      if (allTokens.length === 0) {
        console.log('No device tokens found');
        return { success: true, message: 'No device tokens available' };
      }

      // Remove duplicates
      const uniqueTokens = [...new Set(allTokens)];
      console.log(`Sending notifications to ${uniqueTokens.length} devices`);

      // Send notifications in batches (Firebase has a limit of 500 tokens per request)
      const batchSize = 500;
      const results = [];
      let totalSuccess = 0;
      let totalFailure = 0;

      for (let i = 0; i < uniqueTokens.length; i += batchSize) {
        const tokenBatch = uniqueTokens.slice(i, i + batchSize);
        console.log(`Sending batch ${(i / batchSize) + 1} with ${tokenBatch.length} tokens`);

        try {
          const message = {
            notification: {
              title: title,
              body: body,
            },
            data: {
              ...data,
              click_action: data.click_action || 'FLUTTER_NOTIFICATION_CLICK',
            },
            tokens: tokenBatch,
          };

          console.log('Sending message:', JSON.stringify({
            ...message,
            tokens: `[${tokenBatch.length} tokens]` // Don't log actual tokens
          }, null, 2));

          const response = await admin.messaging().sendEachForMulticast(message);
          console.log('Batch response:', {
            batch: (i / batchSize) + 1,
            successCount: response.successCount,
            failureCount: response.failureCount,
            responses: response.responses
          });

          totalSuccess += response.successCount;
          totalFailure += response.failureCount;

          results.push({
            batch: (i / batchSize) + 1,
            successCount: response.successCount,
            failureCount: response.failureCount,
            responses: response.responses,
          });

          console.log(`Batch ${Math.floor(i/batchSize) + 1}: ${response.successCount} successful, ${response.failureCount} failed`);

          // Handle failed tokens (optional - remove invalid tokens)
          if (response.failureCount > 0) {
            const failedTokens = [];
            response.responses.forEach((resp, idx) => {
              if (!resp.success) {
                failedTokens.push(tokenBatch[idx]);
                console.error(`Failed to send to token: ${tokenBatch[idx]}, Error: ${resp.error?.message || resp.error}`);
              }
            });

            // Optionally remove invalid tokens from users
            if (failedTokens.length > 0) {
              await this.removeInvalidTokens(failedTokens);
            }
          }
        } catch (error) {
          console.error(`Error sending notification batch:`, error);
          // Re-throw the error to be caught by the outer try-catch
          throw error;
        }
      }

      console.log(`Notification summary: ${totalSuccess} successful, ${totalFailure} failed`);

      return {
        success: true,
        message: `Notifications sent to ${totalSuccess} devices`,
        totalSuccess,
        totalFailure,
        batches: results
      };

    } catch (error) {
      console.error('Error sending notifications:', error);
      return {
        success: false,
        message: 'Failed to send notifications',
        error: error.message
      };
    }
  }

  static async removeInvalidTokens(invalidTokens) {
    try {
      // Remove invalid tokens from all users
      await User.updateMany(
        { deviceTokens: { $in: invalidTokens } },
        { $pullAll: { deviceTokens: invalidTokens } }
      );
      console.log(`Removed ${invalidTokens.length} invalid tokens`);
    } catch (error) {
      console.error('Error removing invalid tokens:', error);
    }
  }

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
// services/notificationService.js
const admin = require('firebase-admin');
const User = require("../model/user")
// Initialize Firebase Admin SDK (assumes setup in firebaseConfig.js)
const { initializeFirebase } = require('../config/initializeFirebase');
initializeFirebase();
const removeDeviceTokenFromDatabase = async (deviceToken) => {
  console.log(`Removing device token ${deviceToken} from the database...`);
    try {
      await User.updateMany(
        { deviceTokens: deviceToken },
        { $pull: { deviceTokens: deviceToken } }
      );
      console.log(`Device token ${deviceToken} removed successfully from the database.`);
    } catch (error) {
      console.error('Error removing device token from database:', error);
    }
  };
  
  const sendNotification = async (notificationData) => {
    try {
        const response = await admin.messaging().send({
            notification: {
                title: notificationData.title,
                body: notificationData.body,
            },
            token: notificationData.token,
        });
        console.log("Notification sent successfully:", response);
        return response;
    } catch (error) {
        console.error("Error sending notification:", error);
        if (error.code === 'messaging/invalid-argument' || error.code === 'messaging/registration-token-not-registered') {
            // Handle invalid token scenario
            console.error("Invalid FCM token:", notificationData.token);
            // Remove the invalid token from your database
            await removeDeviceTokenFromDatabase(notificationData.token);
        }
    }
};




module.exports = { sendNotification };



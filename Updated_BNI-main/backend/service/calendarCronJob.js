// jobs/calendarCronJob.js
const cron = require('node-cron');
const Calendar = require('../model/calendar');
const NotificationService = require('../utils/notificationService');

/**
 * Check for calendar events matching today and send notifications
 */
const checkCalendarReminders = async () => {
    try {
        console.log('Running calendar reminder check...');

        // Get today's date range (start and end of day)
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
        const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);

        // Find all calendar events for today that haven't been notified (status: false)
        const todaysEvents = await Calendar.find({
            date: {
                $gte: startOfDay,
                $lte: endOfDay,
            },
            status: false, // Only events that haven't been notified
        }); // Populate user details if needed
console.log("todaysEvents",todaysEvents);
        console.log(`Found ${todaysEvents.length} events for today`);

        // Send notification for each event
    for (const event of todaysEvents) {
    if (!event.userId) {
        console.warn(`Skipping calendar event ${event._id}: missing userId`);
        continue;
    }
    
    const payload = {
        title: '📅 Calendar Reminder',
        body: event.message,
        data: {
            eventId: event._id.toString(),
            date: event.date,
            time: event.time,
            url: `/calendar/${event._id}`,
        },
    };

    const targetUserId = (event.userId && event.userId._id) ? event.userId._id : event.userId;
    if (!targetUserId) {
        console.warn(`Skipping event ${event._id}: unable to resolve target user id`);
        continue;
    }

    // Use targetUserId, not todaysEvents[0].userId
    const result = await NotificationService.sendNotificationToUser(targetUserId, payload);

    if (result.success) {
        event.status = true;
        await event.save();
        console.log(`Notification sent for event: ${event._id}`);
    } else {
        console.error(`Failed to send notification for event: ${event._id}`, result.message);
    }
}

        console.log('Calendar reminder check completed');
    } catch (error) {
        console.error('Error in checkCalendarReminders:', error);
    }
};

/**
 * Initialize cron job
 * Runs every hour to check for calendar reminders
 */
const initCalendarCronJob = () => {
    // Run every hour (at minute 0)
    cron.schedule('0 * * * *', () => {
        checkCalendarReminders();
    });

    // You can also run at specific times:
    // Run at 9 AM every day: '0 9 * * *'
    // Run every 30 minutes: '*/30 * * * *'
    // Run every day at midnight: '0 0 * * *'

    console.log('Calendar cron job initialized - Running every hour');

    // Run immediately on startup (optional)
    checkCalendarReminders();
};

module.exports = {
    initCalendarCronJob,
    checkCalendarReminders,
};
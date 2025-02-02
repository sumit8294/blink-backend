const webPush = require("web-push");


const PushSubscription = require('../models/PushSubscription')

const vapidKeys = {
    publicKey: process.env.VAPID_PUBLIC_KEY,
    privateKey: process.env.VAPID_PRIVATE_KEY,
};

webPush.setVapidDetails(
    "mailto:sumitrathore8294@gmail.com",
    vapidKeys.publicKey,
    vapidKeys.privateKey
  );


  const sendPushNotification = async ({ title, body, url, receiver, profile }) => {
    const notificationPayload = {
        title,
        body,
        icon: profile,
        badge: "logo72.png",
        url,
    };

    try {
        const subscribers = await PushSubscription.find({ userId: receiver }).sort({ subscribedAt: -1 });
    
        // Assuming subscriber is an array and you need to send to each one
        if (subscribers.length > 0) {
            const results = await Promise.all(subscribers.map(async (subscriber) => {
                try {
                    // Attempt to send the notification
                    await webPush.sendNotification(subscriber, JSON.stringify(notificationPayload));
                    return { success: true, subscriber };
                } catch (err) {
                    // console.log(`Failed to send notification to ${subscriber.endpoint}`, err);
                    // If notification fails, delete subscription
                    await PushSubscription.deleteOne({ endpoint: subscriber.endpoint });
                    return { success: false, subscriber };
                }
            }));
    
            // Check results and handle success/failure
            const failedSubscriptions = results.filter(result => !result.success);
            if (failedSubscriptions.length > 0) {
                console.log('Failed to notify and deleted these subscriptions:', failedSubscriptions.map(f => f.subscriber.endpoint));
            }
    
            // Return success message only if all notifications were sent successfully
            if (results.every(result => result.success)) {
                return { message: "Notifications sent successfully!" };
            } else {
                return { message: "Some notifications failed, corresponding subscriptions were deleted." };
            }
        } else {
            throw new Error("No subscribers found");
        }
    } catch (err) {
        console.log('Error occurred during notification process', err);
        return { message: "Failed to send notifications." };
    }
    
};

  
  module.exports = {sendPushNotification}
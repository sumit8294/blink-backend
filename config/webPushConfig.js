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


  const sendPushNotification = async ({ title, body, url, receiver }) => {
    const notificationPayload = {
        title,
        body,
        icon: "logo192.png",
        badge: "logo72.png",
        url,
    };

    try {
        const subscriber = await PushSubscription.find({ userId:receiver });
       
        // Assuming subscriber is an array and you need to send to each one
        if (subscriber.length > 0) {
            await webPush.sendNotification(subscriber[0], JSON.stringify(notificationPayload));
            return { message: "Notifications sent!" };
        } else {
            throw new Error("No subscribers found");
        }
    } catch (err) {
        console.log('Failed to send notification', err);
        throw err; // This will propagate the error to the controller
    }
};

  
  module.exports = {sendPushNotification}
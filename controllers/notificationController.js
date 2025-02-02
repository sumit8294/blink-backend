const User = require('../models/User');
const Notification = require('../models/reactionNotification');
const PushSubscription = require('../models/PushSubscription');

const {sendNotification} = require('../config/SocketIOConn');
const { sendPushNotification } = require('../config/webPushConfig');

const createNotification = async (req,res) => {
    const {
        sender,
        receiver,
        type,
    }  = req.body;
    let comment = null;
    let content = null;
    if(type === 'comment') comment = req.body.comment
    if(type !== 'follow') content = req.body.content 
    let {username} = await User.findOne({_id:sender});

    const notification = {
        sender,
        receiver,
        type,
        content,
        comment: { content:comment },
        read: false,
        createdAt: new Date(Date.now()),
        expiresAt: new Date(Date.now() + 72 * 60 * 60 * 1000)
    };
    
    const result = await Notification.updateOne(
        {
            sender,
            receiver,
            type,
            'content.contentId': content?.contentId,
            'comment.content':comment
        },
        { $setOnInsert: notification},
        { upsert:true}
    );

    if(!result) return res.status(400).json({message:"Failed to create Notification"})

    await sendNotification(notification)

    let pushNotification = {
        title:username,
        body: type === 'like' 
        ? `${username} liked your ${type}` 
        : type === 'comment' 
        ? `${username} commented on your ${type}` 
        : type === 'follow' 
        ? `${username} started following you` 
        : 'You have a new notification',
        receiver,
        url: 'notifications'
    }

    await sendPushNotification(pushNotification)
        
    return res.status(200).json({message:"Notification created successfully"});

}

const getNotifications = async (req,res) => {

    const {userId} = req.params;
    
    const result = await Notification.find(
        {
            receiver:userId,
            expiresAt: {$gte:new Date()}
        }
    ).populate({
        path: 'sender',
        model: User,
        select: '_id username profile'
    })
    .sort({createdAt: -1})

    if(!result) return res.status(400).json({message:"No notifications found"})

    return res.status(200).json(result)
}

const getUnreadNotificationCount = async (req,res) => {

    const {userId} = req.params;
    
    const result = await Notification.count(
        {
            receiver:userId,
            read:false,
            expiresAt: {$gte:new Date()}
        }
    )

    if(!result) return res.status(400).json({message:"No notifications found"})

    return res.status(200).json(result)
}

const setNotificationsRead = async (req,res) => {

    const {userId} = req.params;
    try {
    const result = await Notification.updateMany(
        {
            receiver:userId,
        },
        { $set: {read:true} }
    )
    return res.status(200).json(result)

    } catch (error) {
        // Handle any errors that occur during the update operation
        console.error('Error updating notifications:', error);
        return res.status(500).json({ error: 'Failed to update notifications' });
    }
}

const pushSubscription = async (req, res) => {
    const { userId, subscription } = req.body;
  
    try {

        const existingSubscription = await PushSubscription.findOne({endpoint:subscription.endpoint});

        if(existingSubscription){
            existingSubscription.keys = {
                p256dh : subscription.keys.p256dh,
                auth : subscription.keys.auth,
            }
            await existingSubscription.save();
            return res.json({message:"Subscription updated"});

        }else{
            const newSubscription = new PushSubscription({
                keys:{
                    p256dh : subscription.keys.p256dh,
                    auth : subscription.keys.auth
                },
                endpoint: subscription.endpoint,
                userId, 
            })
            await newSubscription.save();
            return res.json({message: "Subscription added"});
        }

    } catch (error) {
      console.error('Error saving subscription:', error);
      res.status(500).json({ error: 'Failed to save subscription' });
    }
};

const checkSubscription = async (req,res) => {
    try{
        const subscription  = await PushSubscription.find({userId:req.params.userId});
        const subscribed = subscription.length > 0;

        res.status(201).json({ subscribed });
    }catch{
        console.error('Error getting subscription status:', error);
        res.status(500).json({ error: 'Failed to get subscription status' });
    }
}


module.exports = {
    createNotification,
    getNotifications,
    getUnreadNotificationCount,
    setNotificationsRead,
    pushSubscription,
    checkSubscription,
}
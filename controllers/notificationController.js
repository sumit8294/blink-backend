const User = require('../models/User');
const Notification = require('../models/reactionNotification');

const {sendNotification} = require('../config/SocketIOConn')

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

module.exports = {
    createNotification,
    getNotifications,
    getUnreadNotificationCount,
    setNotificationsRead
}
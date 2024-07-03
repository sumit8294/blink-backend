const User = require('../models/User');
const Notification = require('../models/reactionNotification');

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
        
    return res.status(200).json({message:"Notification created successfully"});

}

const getNotifications = async (req,res) => {

    const {userId} = req.params;

    const result = await Notification.find(
        {
            'receiver.userId':userId,
            expiresAt: {$gte:new Date()}
        }
    ).populate({
        path: 'receiver sender',
        model: User,
        select: '_id username profile'
    })


    if(!result) return res.status(400).json({message:"No notifications found"})

    return res.status(200).json(result)
}

module.exports = {
    createNotification,
    getNotifications
}
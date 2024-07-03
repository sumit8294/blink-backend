const mongoose = require('mongoose')
const User = require('./User');

const notificationSchema = new mongoose.Schema({
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    receiver:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    type:{
        type: String,
        enum: ['like','comment','follow'],
        required: true,
    },
    content: {
        contentId: {Type:mongoose.Schema.Types.ObjectId},
        type: {
            type: String,
            enum: ['post','reel','story']
        }
    },
    comment: {
        content: {Type:String},
    },
    read: {
        type: Boolean,
        default: false
    },
    expiresAt: {
        type: Date
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
})

notificationSchema.index({'sender.userId': 1})
notificationSchema.index({createdAt: -1})
notificationSchema.index({expiresAt: 1})

const Notification = mongoose.model('notifications',notificationSchema);

module.exports = Notification
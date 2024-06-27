const mongoose = require('mongoose');
const Chat = require('./Chat');
const User = require('./User');

const MessageSchema = new mongoose.Schema({
    chatId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Chat',
        required: true,
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User',
        required: true,
    },
    content: {
        type: String
    },
    contentId: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    sendAt: {
        type: Date,
        default: Date.now
    },
    contentType:{
        type:String,
        enum: ['text','post','reel'],
        required: true,
        default: 'text'

    },
    deletedBy: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        }
    ]
    
})

MessageSchema.index({ chatId: 1 });
MessageSchema.index({ sender: 1 });
MessageSchema.index({ sendAt: -1 });

const Message = mongoose.model('messages',MessageSchema);

module.exports = Message;
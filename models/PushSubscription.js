const mongoose = require('mongoose');

// Define a schema for push subscription
const pushSubscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',  // Reference to the User model
    required: true,
  },
  endpoint: {
    type: String,
    required: true,
  },
  keys: {
    p256dh: {
      type: String,
      required: true,
    },
    auth: {
      type: String,
      required: true,
    },
  },
  // Optionally, you can add a timestamp to track when the user subscribed
  subscribedAt: {
    type: Date,
    default: Date.now,
  },
});

// Create a model from the schema
const PushSubscription = mongoose.model('pushsubscriptions', pushSubscriptionSchema);

module.exports = PushSubscription;

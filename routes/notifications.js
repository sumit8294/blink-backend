const express = require('express')
const notificationController = require('../controllers/notificationController')

const router = express.Router()

router.get('/:userId',notificationController.getNotifications)
router.get('/count/:userId',notificationController.getUnreadNotificationCount)
router.post('/',notificationController.createNotification)
router.put('/read/:userId',notificationController.setNotificationsRead)

module.exports = router
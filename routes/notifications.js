const express = require('express')
const notificationController = require('../controllers/notificationController')

const router = express.Router()

router.post('/',notificationController.createNotification)
router.get('/:userId',notificationController.getNotifications)

module.exports = router
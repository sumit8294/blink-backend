const express = require('express')
const userController = require('../controllers/userController')

const verifyJWT = require('../middleware/verifyJWT')


const router = express.Router()
// router.use(verifyJWT)

router.get('/settings/:userId',userController.getSettings);

router.get('/all/:loggedUserId',userController.getAllUsers)
router.get('/:userId/:loggedUserId',userController.getUser)
router.post('/',userController.createUser)
router.delete('/delete',userController.deleteUser)
router.patch('/update',userController.updateUser)
router.patch('/settings/update/:userId',userController.updateSettings);

module.exports = router

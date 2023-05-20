const express = require('express')
const userController = require('../controllers/userController')

const verifyJWT = require('../middleware/verifyJWT')


const router = express.Router()
router.use(verifyJWT)


router.get('/',userController.getAllUsers)
router.get('/:id',userController.getUser)
router.post('/create',userController.createUser)
router.delete('/delete',userController.deleteUser)
router.patch('/update',userController.updateUser)

module.exports = router

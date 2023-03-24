const authController = require('../controllers/authController')
const middlewareController = require('../controllers/middleWareController')
const router = require('express').Router()

//REGISTER
router.post('/register', authController.registerUser)

// LOGIN
router.post('/login', authController.loginUser)

//REFESH TOKEN
router.post('/refresh', authController.requestRefreshToken)

//LOG OUT 
router.post('/logout', middlewareController.verifyToken, authController.userLogOut)

module.exports = router


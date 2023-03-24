const middlewareController = require('../controllers/middleWareController')
const userController = require('../controllers/userController')

const router = require('express').Router()

//GET ALL USER
router.get('/', middlewareController.verifyToken, userController.getAllUser)

//DELETE
router.delete('/:id', middlewareController.verifyTokenAnAdminAuth, userController.deleteUser)


module.exports = router
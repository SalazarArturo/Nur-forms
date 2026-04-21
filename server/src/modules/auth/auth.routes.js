const { Router } = require('express')
const {login, me, logout } = require('./auth.controller')
const { authenticate } = require('../../middlewares/auth.middleware')

const router = Router()

router.post('/login', login); //check !!!! 
router.get('/me', authenticate, me); //check !!!!
router.post('/logout', authenticate, logout); //check !!!!

module.exports = router;

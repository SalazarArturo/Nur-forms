const { Router } = require('express')
const { register, login, me } = require('./auth.controller')
const { authenticate } = require('../../middlewares/auth.middleware')

const router = Router()

router.post('/login',    login)
//router.post('/register', register) esta ruta es una accion del admin, no deberia estar aqui 
router.get('/me',        authenticate, me)

module.exports = router

const { Router } = require('express')
const { start, saveAnswers, submit, getByForm, getByToken } = require('./submissions.controller')
const { authenticate, authorize } = require('../../middlewares/auth.middleware')

const router = Router()

router.post('/form/:formId/start',           start)
router.patch('/:id/answers',                 saveAnswers)
router.patch('/:id/submit',                  submit)
router.get('/token/:token',                  getByToken)
router.get('/form/:formId',                  authenticate, authorize('admin', 'creator'), getByForm)

module.exports = router

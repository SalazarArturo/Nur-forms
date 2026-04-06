const { Router } = require('express')
const { getByForm, create, remove, validate } = require('./invitations.controller')
const { authenticate, authorize } = require('../../middlewares/auth.middleware')

const router = Router()

router.get('/form/:formId/validate',   validate)
router.get('/form/:formId',            authenticate, authorize('admin', 'creator'), getByForm)
router.post('/form/:formId',           authenticate, authorize('admin', 'creator'), create)
router.delete('/:id',                  authenticate, authorize('admin', 'creator'), remove)

module.exports = router

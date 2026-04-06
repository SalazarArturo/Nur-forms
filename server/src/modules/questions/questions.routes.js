const { Router } = require('express')
const { getByForm, create, update, remove, reorder } = require('./questions.controller')
const { authenticate, authorize } = require('../../middlewares/auth.middleware')

const router = Router()

router.use(authenticate)

router.get('/form/:formId',          authorize('admin', 'creator'), getByForm)
router.post('/form/:formId',         authorize('admin', 'creator'), create)
router.put('/:id',                   authorize('admin', 'creator'), update)
router.delete('/:id',                authorize('admin', 'creator'), remove)
router.patch('/form/:formId/reorder',authorize('admin', 'creator'), reorder)

module.exports = router

const { Router } = require('express')
const { getAll, getById, create, update, remove, duplicate, addMember, removeMember } = require('./campaigns.controller')
const { authenticate, authorize } = require('../../middlewares/auth.middleware')

const router = Router()

router.use(authenticate)

router.get('/',                              authorize('admin', 'creator'), getAll)
router.get('/:id',                           authorize('admin', 'creator'), getById)
router.post('/',                             authorize('admin', 'creator'), create)
router.put('/:id',                           authorize('admin', 'creator'), update)
router.delete('/:id',                        authorize('admin', 'creator'), remove)
router.post('/:id/duplicate',                authorize('admin', 'creator'), duplicate)
router.post('/:id/members',                  authorize('admin', 'creator'), addMember)
router.delete('/:id/members/:memberId',      authorize('admin', 'creator'), removeMember)

module.exports = router

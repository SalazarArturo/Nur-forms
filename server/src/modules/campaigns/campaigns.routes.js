const { Router } = require('express')
const { getAll, getById, create, update, remove, duplicateController, addMemberController, removeMemberController } = require('./campaigns.controller')
const { authenticate, authorize } = require('../../middlewares/auth.middleware')

const router = Router()

router.use(authenticate)

router.get('/',                              authorize('admin', 'creator'), getAll)
router.get('/:id',                           authorize('admin', 'creator'), getById)
router.post('/',                             authorize('creator'), create)
router.put('/:id',                           authorize('admin', 'creator'), update)
router.delete('/:id',                        authorize('admin', 'creator'), remove)
router.post('/:id/duplicate',                authorize('admin', 'creator'), duplicateController)
router.post('/:id/members',                  authorize('admin', 'creator'), addMemberController)
router.delete('/:id/members/:memberId',      authorize('admin', 'creator'), removeMemberController)

module.exports = router

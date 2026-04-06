const { Router } = require('express')
const { getByCampaign, getById, getByToken, create, update, remove, duplicate, publish, close } = require('./forms.controller')
const { authenticate, authorize } = require('../../middlewares/auth.middleware')

const router = Router()

router.get('/public/:id',               getByToken)
router.get('/campaign/:campaignId',     authenticate, authorize('admin', 'creator'), getByCampaign)
router.get('/:id',                      authenticate, authorize('admin', 'creator'), getById)
router.post('/',                        authenticate, authorize('admin', 'creator'), create)
router.put('/:id',                      authenticate, authorize('admin', 'creator'), update)
router.delete('/:id',                   authenticate, authorize('admin', 'creator'), remove)
router.post('/:id/duplicate',           authenticate, authorize('admin', 'creator'), duplicate)
router.patch('/:id/publish',            authenticate, authorize('admin', 'creator'), publish)
router.patch('/:id/close',              authenticate, authorize('admin', 'creator'), close)

module.exports = router

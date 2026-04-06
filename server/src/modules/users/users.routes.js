const { Router } = require('express')
const { getAll, getById, updateRole, toggleActive } = require('./users.controller')
const { authenticate, authorize } = require('../../middlewares/auth.middleware')

const router = Router()

router.use(authenticate)

router.get('/',                    authorize('admin'), getAll)
router.get('/:id',                 authorize('admin'), getById)
router.patch('/:id/role',          authorize('admin'), updateRole)
router.patch('/:id/toggle-active', authorize('admin'), toggleActive)

module.exports = router

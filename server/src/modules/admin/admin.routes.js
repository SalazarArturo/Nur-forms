const { Router } = require('express')
const { getAll, getById, updateRole, toggleActive, registerUser, deleteUser } = require('./admin.controller')
const { authenticate, authorize } = require('../../middlewares/auth.middleware')

const router = Router()

router.use(authenticate);

router.get('/',                    authorize('admin'), getAll);
router.post('/',                   authorize('admin'), registerUser);
router.get('/:id',                 authorize('admin'), getById);
router.patch('/:id/role',          authorize('admin'), updateRole);
router.patch('/:id/toggle-active', authorize('admin'), toggleActive);
router.delete('/:id',              authorize('admin'), deleteUser);                                 

module.exports = router;

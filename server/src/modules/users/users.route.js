const { Router } = require('express');
const { authenticate, authorize } = require('../../middlewares/auth.middleware.js');
const { getAll, getById, search, updateRole, toggleActive } = require('./user.controller.js');
 
const router = Router();
 
router.use(authenticate);
router.use(authorize('admin'));
 
router.get('/',                    getAll);
router.get('/search',              search);         // GET /api/users/search?email=...
router.get('/:id',                 getById);
router.patch('/:id/role',          updateRole);     // PATCH /api/users/:id/role
router.patch('/:id/toggle-active', toggleActive);   // PATCH /api/users/:id/toggle-active
 
module.exports = router;
 
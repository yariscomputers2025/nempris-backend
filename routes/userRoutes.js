const express = require('express');
const { getUsers, updateUserRole, deleteUser } = require('../controllers/userController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateMiddleware');
const { roleUpdateSchema } = require('../validators/userValidators');

const router = express.Router();

router.use(protect);
router.get('/', authorizeRoles('admin'), getUsers);
router.patch('/:id/role', authorizeRoles('admin'), validateRequest(roleUpdateSchema), updateUserRole);
router.delete('/:id', authorizeRoles('admin'), deleteUser);

module.exports = router;

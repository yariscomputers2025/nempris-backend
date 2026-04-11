const express = require('express');
const { createCategory, getCategories, updateCategory, deleteCategory } = require('../controllers/categoryController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateMiddleware');
const { categorySchema } = require('../validators/categoryValidators');

const router = express.Router();

router.get('/', getCategories);
router.post('/', protect, authorizeRoles('admin'), validateRequest(categorySchema), createCategory);
router.patch('/:id', protect, authorizeRoles('admin'), validateRequest(categorySchema), updateCategory);
router.delete('/:id', protect, authorizeRoles('admin'), deleteCategory);

module.exports = router;
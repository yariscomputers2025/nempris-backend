const express = require('express');
const { createBrand, getBrands, updateBrand, deleteBrand } = require('../controllers/brandController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateMiddleware');
const { brandSchema } = require('../validators/brandValidators');

const router = express.Router();

router.get('/', getBrands);
router.post('/', protect, authorizeRoles('admin'), validateRequest(brandSchema), createBrand);
router.patch('/:id', protect, authorizeRoles('admin'), validateRequest(brandSchema), updateBrand);
router.delete('/:id', protect, authorizeRoles('admin'), deleteBrand);

module.exports = router;
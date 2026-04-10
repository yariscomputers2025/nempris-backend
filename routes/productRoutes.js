const express = require('express');
const {
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct
} = require('../controllers/productController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');
const validateRequest = require('../middlewares/validateMiddleware');
const { productCreateSchema, productUpdateSchema } = require('../validators/productValidators');

const router = express.Router();

router.get('/', getProducts);
router.get('/:slug', getProductBySlug);

router.post(
  '/',
  protect,
  authorizeRoles('seller', 'admin'),
  upload.array('images', 10),
  validateRequest(productCreateSchema),
  createProduct
);

router.patch(
  '/:id',
  protect,
  authorizeRoles('seller', 'admin'),
  upload.array('images', 10),
  validateRequest(productUpdateSchema),
  updateProduct
);

router.delete('/:id', protect, authorizeRoles('seller', 'admin'), deleteProduct);

module.exports = router;

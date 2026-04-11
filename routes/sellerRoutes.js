const express = require('express');
const { getSellerProducts, updateSellerProduct, deleteSellerProduct } = require('../controllers/sellerController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const { upload } = require('../middlewares/uploadMiddleware');
const validateRequest = require('../middlewares/validateMiddleware');
const { productUpdateSchema } = require('../validators/productValidators');

const router = express.Router();

router.use(protect);
router.use(authorizeRoles('seller', 'admin'));

router.get('/products', getSellerProducts);
router.patch('/products/:id', upload.array('images', 10), validateRequest(productUpdateSchema), updateSellerProduct);
router.delete('/products/:id', deleteSellerProduct);

module.exports = router;
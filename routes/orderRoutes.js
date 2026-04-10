const express = require('express');
const {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
} = require('../controllers/orderController');
const { protect, authorizeRoles } = require('../middlewares/authMiddleware');
const validateRequest = require('../middlewares/validateMiddleware');
const { orderCreateSchema, orderStatusSchema } = require('../validators/orderValidators');

const router = express.Router();

router.use(protect);

router.post('/', validateRequest(orderCreateSchema), createOrder);
router.get('/', getOrders);
router.get('/:id', getOrderById);
router.patch('/:id/status', authorizeRoles('admin', 'seller'), validateRequest(orderStatusSchema), updateOrderStatus);

module.exports = router;

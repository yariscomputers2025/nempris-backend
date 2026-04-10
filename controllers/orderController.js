const Order = require('../models/Order');
const Product = require('../models/Product');

const createOrder = async (req, res, next) => {
  try {
    const { products, customerName, phone } = req.body;

    const productIds = products.map((item) => item.product);
    const productDocs = await Product.find({ _id: { $in: productIds } });
    if (productDocs.length !== products.length) {
      return next({ statusCode: 400, message: 'One or more products are invalid' });
    }

    const seller = productDocs[0].createdBy;
    const mixedSeller = productDocs.some((product) => product.createdBy.toString() !== seller.toString());
    if (mixedSeller) {
      return next({ statusCode: 400, message: 'Orders must contain products from the same seller' });
    }

    const order = await Order.create({
      products,
      customerName,
      phone,
      seller,
      createdBy: req.user._id
    });

    res.status(201).json({ message: 'Order created successfully', order });
  } catch (error) {
    next(error);
  }
};

const getOrders = async (req, res, next) => {
  try {
    const query = Order.find();
    if (req.user.role === 'seller') {
      query.where('seller').equals(req.user._id);
    }
    if (req.user.role === 'user') {
      query.where('createdBy').equals(req.user._id);
    }

    const orders = await query.populate('products.product', 'name price slug').populate('seller', 'name email');
    res.json({ count: orders.length, orders });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.product', 'name price slug')
      .populate('seller', 'name email');
    if (!order) {
      return next({ statusCode: 404, message: 'Order not found' });
    }
    if (req.user.role === 'user' && order.createdBy.toString() !== req.user._id.toString()) {
      return next({ statusCode: 403, message: 'Forbidden' });
    }
    if (req.user.role === 'seller' && order.seller.toString() !== req.user._id.toString()) {
      return next({ statusCode: 403, message: 'Forbidden' });
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return next({ statusCode: 404, message: 'Order not found' });
    }

    order.status = req.body.status;
    await order.save();
    res.json({ message: 'Order status updated', order });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus
};
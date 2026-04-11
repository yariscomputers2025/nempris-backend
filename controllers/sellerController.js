const Product = require('../models/Product');
const Category = require('../models/Category');
const Brand = require('../models/Brand');
const { processImages } = require('../middlewares/uploadMiddleware');
const { cloudinary } = require('../config/cloudinaryConfig');

const handleCastError = (error, next) => {
  if (error.name === 'CastError') {
    const castError = new Error(`Invalid ${error.path} id`);
    castError.statusCode = 400;
    return next(castError);
  }
  next(error);
};

const getSellerProducts = async (req, res, next) => {
  try {
    const products = await Product.find({ createdBy: req.user._id })
      .populate('category', '_id name slug')
      .populate('brand', '_id name slug');

    res.json({ count: products.length, products });
  } catch (error) {
    next(error);
  }
};

const updateSellerProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next({ statusCode: 404, message: 'Product not found' });
    }

    if (req.user.role === 'seller' && product.createdBy.toString() !== req.user._id.toString()) {
      return next({ statusCode: 403, message: 'Forbidden: cannot update another seller product' });
    }

    if (req.files && req.files.length > 0) {
      const newImages = await processImages(req.files);
      if (product.images && product.images.length > 0) {
        const destroyPromises = product.images.map((image) => cloudinary.uploader.destroy(image.public_id));
        await Promise.all(destroyPromises);
      }
      req.body.images = newImages;
    }

    Object.assign(product, req.body);
    await product.save();

    res.json({ message: 'Product updated successfully', product });
  } catch (error) {
    handleCastError(error, next);
  }
};

const deleteSellerProduct = async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return next({ statusCode: 404, message: 'Product not found' });
    }

    if (req.user.role === 'seller' && product.createdBy.toString() !== req.user._id.toString()) {
      return next({ statusCode: 403, message: 'Forbidden: cannot delete another seller product' });
    }

    if (product.images && product.images.length > 0) {
      const destroyPromises = product.images.map((image) => cloudinary.uploader.destroy(image.public_id));
      await Promise.all(destroyPromises);
    }

    await product.deleteOne();
    res.json({ message: 'Product removed successfully' });
  } catch (error) {
    handleCastError(error, next);
  }
};

module.exports = {
  getSellerProducts,
  updateSellerProduct,
  deleteSellerProduct
};
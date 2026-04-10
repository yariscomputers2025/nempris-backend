const Product = require('../models/Product');
const { processImages } = require('../middlewares/uploadMiddleware');
const { cloudinary } = require('../config/cloudinaryConfig');
const APIFeatures = require('../utils/apiFeatures');

const handleCastError = (error, next) => {
  if (error.name === 'CastError') {
    const castError = new Error(`Invalid ${error.path} id`);
    castError.statusCode = 400;
    return next(castError);
  }
  next(error);
};

const createProduct = async (req, res, next) => {
  try {
    const images = req.files ? await processImages(req.files) : [];
    if (images.length === 0) {
      return next({ statusCode: 400, message: 'At least one image is required' });
    }

    const product = await Product.create({
      ...req.body,
      images,
      createdBy: req.user._id
    });

    res.status(201).json({ message: 'Product created successfully', product });
  } catch (error) {
    handleCastError(error, next);
  }
};

const getProducts = async (req, res, next) => {
  try {
    const features = new APIFeatures(Product.find(), req.query).search().filter();
    const totalProducts = await features.query.clone().countDocuments();
    const products = await features.paginate().query.populate('createdBy', 'name email role');

    res.json({
      count: products.length,
      total: totalProducts,
      page: Number(req.query.page) || 1,
      products
    });
  } catch (error) {
    handleCastError(error, next);
  }
};

const getProductBySlug = async (req, res, next) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug }).populate('createdBy', 'name email role');
    if (!product) {
      return next({ statusCode: 404, message: 'Product not found' });
    }
    res.json(product);
  } catch (error) {
    handleCastError(error, next);
  }
};

const updateProduct = async (req, res, next) => {
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

const deleteProduct = async (req, res, next) => {
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
  createProduct,
  getProducts,
  getProductBySlug,
  updateProduct,
  deleteProduct
};
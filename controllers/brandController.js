const Brand = require('../models/Brand');

const createBrand = async (req, res, next) => {
  try {
    const brand = await Brand.create(req.body);
    res.status(201).json({ message: 'Brand created successfully', brand });
  } catch (error) {
    if (error.code === 11000) {
      return next({ statusCode: 400, message: 'Brand name already exists' });
    }
    next(error);
  }
};

const getBrands = async (req, res, next) => {
  try {
    const brands = await Brand.find();
    res.json({ count: brands.length, brands });
  } catch (error) {
    next(error);
  }
};

const updateBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!brand) {
      return next({ statusCode: 404, message: 'Brand not found' });
    }
    res.json({ message: 'Brand updated successfully', brand });
  } catch (error) {
    if (error.code === 11000) {
      return next({ statusCode: 400, message: 'Brand name already exists' });
    }
    next(error);
  }
};

const deleteBrand = async (req, res, next) => {
  try {
    const brand = await Brand.findByIdAndDelete(req.params.id);
    if (!brand) {
      return next({ statusCode: 404, message: 'Brand not found' });
    }
    res.json({ message: 'Brand deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBrand,
  getBrands,
  updateBrand,
  deleteBrand
};
const Category = require('../models/Category');
const Brand = require('../models/Brand');

const getMeta = async (req, res, next) => {
  try {
    const categories = await Category.find().select('_id name slug');
    const brands = await Brand.find().select('_id name slug');

    res.json({
      categories,
      brands
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMeta
};
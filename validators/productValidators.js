const Joi = require('joi');

const imageSchema = Joi.object({
  url: Joi.string().uri().required(),
  public_id: Joi.string().required()
});

const productCreateSchema = Joi.object({
  name: Joi.string().trim().required(),
  brand: Joi.string().trim().optional().allow(''),
  price: Joi.number().integer().min(0).required(),
  discountPrice: Joi.number().integer().min(0).optional().default(0),
  description: Joi.string().trim().optional().allow(''),
  category: Joi.string().trim().optional().default('smartphone'),
  stock: Joi.number().integer().min(0).optional().default(0),
  specifications: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
  images: Joi.array().items(imageSchema).max(10).optional()
});

const productUpdateSchema = Joi.object({
  name: Joi.string().trim().optional(),
  brand: Joi.string().trim().optional().allow(''),
  price: Joi.number().integer().min(0).optional(),
  discountPrice: Joi.number().integer().min(0).optional(),
  description: Joi.string().trim().optional().allow(''),
  category: Joi.string().trim().optional(),
  stock: Joi.number().integer().min(0).optional(),
  specifications: Joi.object().pattern(Joi.string(), Joi.string()).optional(),
  images: Joi.array().items(imageSchema).max(10).optional()
});

module.exports = {
  productCreateSchema,
  productUpdateSchema
};

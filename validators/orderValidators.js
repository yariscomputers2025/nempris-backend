const Joi = require('joi');

const orderCreateSchema = Joi.object({
  products: Joi.array()
    .items(
      Joi.object({
        product: Joi.string().length(24).hex().required(),
        quantity: Joi.number().integer().min(1).required()
      })
    )
    .min(1)
    .required(),
  customerName: Joi.string().trim().required(),
  phone: Joi.string().trim().required()
});

const orderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'viewed', 'completed').required()
});

module.exports = {
  orderCreateSchema,
  orderStatusSchema
};

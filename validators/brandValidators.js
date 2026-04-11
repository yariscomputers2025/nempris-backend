const Joi = require('joi');

const brandSchema = Joi.object({
  name: Joi.string().trim().required()
});

module.exports = {
  brandSchema
};
const Joi = require('joi');

const roleUpdateSchema = Joi.object({
  role: Joi.string().valid('user', 'seller', 'admin').required()
});

module.exports = {
  roleUpdateSchema
};

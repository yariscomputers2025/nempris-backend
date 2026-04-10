const validateRequest = (schema) => async (req, res, next) => {
  try {
    const validated = await schema.validateAsync(req.body, { abortEarly: false, allowUnknown: false });
    req.body = validated;
    next();
  } catch (error) {
    next({ statusCode: 400, message: error.details.map((d) => d.message).join(', ') });
  }
};

module.exports = validateRequest;

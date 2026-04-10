const tryParseJson = (value) => {
  if (typeof value !== 'string') {
    return value;
  }

  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
};

const validateRequest = (schema) => async (req, res, next) => {
  try {
    const body = { ...req.body };
    if (body.specifications) {
      body.specifications = tryParseJson(body.specifications);
    }
    if (body.products) {
      body.products = tryParseJson(body.products);
    }

    const validated = await schema.validateAsync(body, { abortEarly: false, allowUnknown: false });
    req.body = validated;
    next();
  } catch (error) {
    next({ statusCode: 400, message: error.details.map((d) => d.message).join(', ') });
  }
};

module.exports = validateRequest;

const express = require('express');
const { register, login } = require('../controllers/authController');
const validateRequest = require('../middlewares/validateMiddleware');
const { registerSchema, loginSchema } = require('../validators/authValidators');

const router = express.Router();

router.post('/register', validateRequest(registerSchema), register);
router.post('/login', validateRequest(loginSchema), login);

module.exports = router;

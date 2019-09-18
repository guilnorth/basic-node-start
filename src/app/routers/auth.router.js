const authController = require('../controllers/authController');
const express = require('express');
const router = express.Router();

router.post('/register', authController.register);

router.post('/authenticate', authController.authenticate);

router.post('/forgot_password', authController.forgot_password);

router.post('/reset_password', authController.reset_password);

module.exports = app => app.use('/auth', router);
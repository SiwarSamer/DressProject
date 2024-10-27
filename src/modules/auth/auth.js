const express = require('express');
const { login, signup, logout } = require('./auth.controller.js');
const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.delete('/logout', logout);

module.exports = router;

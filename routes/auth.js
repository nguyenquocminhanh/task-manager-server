var express = require('express');
var router = express.Router();
var authControllers = require('../controllers/auth');

router.post('/signup', authControllers.signup);
router.post('/login', authControllers.login);

module.exports = router;
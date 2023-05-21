var express = require('express');
var router = express.Router();
var taskControllers = require('../controllers/task');
var middleware = require('../utils/middleware');

router.get('/:taskId', middleware.authenticateToken, taskControllers.getOneTask);
router.get('', middleware.authenticateToken, taskControllers.getAllTasks);
router.post('', middleware.authenticateToken, taskControllers.createTask);
router.put('/:taskId', middleware.authenticateToken, taskControllers.updateTask);
router.delete('/:taskId', middleware.authenticateToken, taskControllers.deleteTask);

module.exports = router;
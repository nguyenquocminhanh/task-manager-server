var express = require('express');
var router = express.Router();
var taskControllers = require('../controllers/task');
var middleware = require('../utils/middleware');

router.get('/:taskId', middleware, taskControllers.getOneTask);
router.get('', middleware, taskControllers.getAllTasks);
router.post('', middleware, taskControllers.createTask);
router.put('/:taskId', middleware, taskControllers.updateTask);
router.delete('/:taskId', middleware, taskControllers.deleteTask);

module.exports = router;
var express = require('express');
var router = express.Router();
var teamontrollers = require('../controllers/team');
var middleware = require('../utils/middleware');

router.get('', middleware.authenticateToken, teamontrollers.getAllTeams);
router.get('/:teamId/tasks', middleware.authenticateToken, teamontrollers.getAllTasksByTeam);
router.get('/:teamId/members', middleware.authenticateToken, teamontrollers.getAllMembersByTeam);
router.post('', middleware.authenticateToken, teamontrollers.createTeam);
router.post('/join-team', middleware.authenticateToken, teamontrollers.joinTeam);
router.delete('/:teamId', middleware.authenticateToken, teamontrollers.deleteTeam);
router.delete('/:teamId/leave-team', middleware.authenticateToken, teamontrollers.leaveTeam);

module.exports = router;
const { Task, Team, User } = require('../models/models');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT, // your db port
});


exports.createTask = async (req, res) => {
    const { io } = require('../app');

    try {
        const user_id = req.user.userId;
        const { title, description, team_id, dueDate  } = req.body;
        const completed = false;

        const task = await Task.create({
            title,
            description,
            team_id,
            dueDate,
            completed,
            user_id
        })

         // create team task
        if (team_id) {
            const team = await Team.findByPk(team_id);
            const allTasks = await team.getTasks({
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['name'], // Specify the attributes you want to include
                    },
                ],
            });
            io.to(team_id).emit('taskCreated', allTasks);
        }

        return res.status(201).json({ 
            message: 'Task created successfully',
            task: task
         })
    } catch (err) {  
        console.log(err);
        return res.status(500).json('Something went wrong');
    }
}

exports.getAllTasks = async (req, res) => {
    try {
        const user_id = req.user.userId;

        const allTasks = await Task.findAll({ where: { user_id: user_id } });

        return res.status(200).json({tasks: allTasks});
    } catch (error) {
        console.log(error);
        return res.status(500).json('Something went wrong');
    }
}

exports.getOneTask = async (req, res) => {
    const taskId = req.params.taskId;
    try {
        const task = await Task.findOne({ where: { id: taskId } });

        if(!task) {
            return res.status(404).json('Task not found')
        } return res.status(200).json({task: task});
    } catch (error) {
        console.log(error);
        return res.status(500).json('Something went wrong');
    }
}

exports.deleteTask = async (req, res) => {
    const { io } = require('../app');
    const taskId = req.params.taskId; 
    const teamId = req.body.teamId;
    // model Task from sequelize from Postgresql
    const task = await Task.findOne({ where: { id: taskId } });

    if (!task) {
        return res.status(500).json('Task not found!');
    }

    try {
        await task.destroy();
         // delete team task
        if (teamId) {
            const team = await Team.findByPk(teamId);
            const allTasks = await team.getTasks({
                include: [
                    {
                        model: User,
                        as: 'creator',
                        attributes: ['name'], // Specify the attributes you want to include
                    },
                ],
            });
            io.to(teamId).emit('taskDeleted', allTasks);
        }

        return res.status(200).json({message: `Deleted task successfully`});
    } catch (error) {
        return res.status(500).json('Something went wrong');
    }
}

exports.updateTask = async (req, res) => {
    const { io } = require('../app');
    const taskId = req.params.taskId;
    const { title, description, teamId, dueDate  } = req.body;
   
    // model Task from sequelize from Postgresql
    const task = await Task.findOne({ where: { id: taskId } });

    if (!task) {
        return res.status(500).json('Task not found!');
    }

    if (!title) {       // update completed
        try {
            task.completed = !task.completed;
            await task.save();

            // update team task
            if (teamId) {
                const team = await Team.findByPk(teamId);
                const allTasks = await team.getTasks({
                    include: [
                        {
                            model: User,
                            as: 'creator',
                            attributes: ['name'], // Specify the attributes you want to include
                        },
                    ],
                });
                io.to(teamId).emit('taskCompletedUpdated', allTasks);
            }

            return res.status(200).json({message: `Updated task info successfuilly`})
        } catch (err) {
            console.log(err);
            return res.status(500).json('Something went wrong');
        }
    } else {        // update title, description, dueDate
        try {
            task.title = title;
            task.description = description;
            task.dueDate = dueDate;
            await task.save();

            // update team task
            if (teamId) {
                const team = await Team.findByPk(teamId);
                const allTasks = await team.getTasks({
                    include: [
                        {
                            model: User,
                            as: 'creator',
                            attributes: ['name'], // Specify the attributes you want to include
                        },
                    ],
                });
                io.to(teamId).emit('taskInfoUpdated', allTasks);
            }

            return res.status(200).json({message: `Updated task status successfuilly`});
        } catch (err) {
            console.log(err);
            return res.status(500).json('Something went wrong');
        }
    }
}
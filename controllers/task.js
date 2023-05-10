const Task = require('../models/Task');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT, // your db port
});

exports.createTask = async (req, res) => {
    try {
        const user_id = req.user.userId;
        const { title, description, dueDate  } = req.body;
        const completed = false;

        const task = await Task.create({
            title,
            description,
            dueDate,
            completed,
            user_id
        })

        return res.status(201).json({ 
            message: 'success',
            task: task
         })
    } catch (err) {  
        console.log(err);
        res.status(500).json({error: err});
    }
}

exports.getAllTasks = async (req, res) => {
    try {
        const user_id = req.user.userId;

        const allTasks = await Task.findAll({ where: { user_id: user_id } });

        return res.status(200).json({tasks: allTasks});
    } catch (error) {
        console.log(err);
        return res.status(500).json({error: error});
    }
}

exports.getOneTask = async (req, res) => {
    const taskId = req.params.taskId;
    try {
        const task = await Task.findOne({ where: { id: taskId } });

        if(!task) {
            return res.status(404).json({error: 'Task not found'})
        } return res.status(200).json({task: task});
    } catch (error) {
        console.log(error);
        return res.status(500).json({error: error});
    }
}

exports.deleteTask = async (req, res) => {
    const taskId = req.params.taskId; 
    // model Task from sequelize from Postgresql
    const task = await Task.findOne({ where: { id: taskId } });

    if (!task) {
        return res.status(500).json({error: 'Task not found!'});
    }

    try {
        await task.destroy();
        res.status(204).json({message: `Deleted successfully`});
    } catch (error) {
        return res.status(500).json({error: error});
    }
}

exports.updateTask = async (req, res) => {
    const taskId = req.params.taskId;
    const { title, description, dueDate  } = req.body;
   
    // model Task from sequelize from Postgresql
    const task = await Task.findOne({ where: { id: taskId } });

    if (!task) {
        return res.status(500).json({error: 'Task not found!'});
    }

    if (!title) {       // update completed
        try {
            task.completed = !task.completed;
            await task.save();
            res.status(200).json({message: `Updated task with id ${taskId} successfuilly`})
        } catch (err) {
            console.log(err);
            return res.status(500).json({error: err});
        }
    } else {        // update title, description, dueDate
        try {
            task.title = title;
            task.description = description;
            task.dueDate = dueDate;
            await task.save();
            res.status(200).json({message: `Updated task with id ${taskId} successfuilly`});
        } catch (err) {
            console.log(err);
            return res.status(500).json({error: err});
        }
    }
}
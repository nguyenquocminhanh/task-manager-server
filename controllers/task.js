const Task = require('../models/Task');
const { Pool } = require('pg');

const pool = new Pool({
  user: process.env.USERNAME,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: 5432, // your db port
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
        res.status(500).json({error: 'Something went wrong'});
    }
}

exports.getAllTasks = async (req, res) => {
    try {
        const user_id = req.user.userId;

        const allTasks = await Task.findAll({ where: { user_id: user_id } });

        return res.status(200).json({tasks: allTasks});
    } catch (error) {
        console.log(err);
        return res.status(500).json({error: 'Something  wrong'});
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
        return res.status(500).json({error: 'Something went wrong'});
    }
}

exports.deleteTask = async (req, res) => {
    const taskId = req.params.taskId;

    const query = {
        text: 'DELETE FROM public."Tasks" WHERE id = $1',
        values: [taskId],
    };
    
    try {
        const result = await pool.query(query);
        res.status(204).json({message: `Deleted ${result} row(s) successfully`}); // No Content
    } catch (error) {
        return res.status(500).json({error: error});
    }
}

exports.updateTask = async (req, res) => {
    const taskId = req.params.taskId;
    const { title, description, dueDate  } = req.body;
   
    const task = await Task.findOne({ where: { id: taskId } });

    let query = {};

    // update title, description, dueDate
    if (title) {
        query = {
            text: `UPDATE public."Tasks" SET title = $1, description = $2, "dueDate" = $3 WHERE id = $4`,
            values: [title, description, dueDate, taskId],
        };
    } else {
        query = {
            text: `UPDATE public."Tasks" SET completed = ${!task.completed} WHERE id = $1`,
            values: [taskId],
        };
    }

    try {
        const result = await pool.query(query);
        res.status(200).json({message: `Updated task with id ${taskId} successfuilly`});
    } catch (err) {
        console.log(err);
        return res.status(500).json({error: 'Something went wrong'});
    }
}
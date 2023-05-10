require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./db');
const auth = require('./routes/auth');
const task = require('./routes/task');

const app = express();

app.use(cors());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', 'https://task-manager-minh-nguyen.vercel.app');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});
  
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

////////////////////////////

app.use('/api/auth', auth);
app.use('/api/tasks', task);

// create table into database
// Sync all defined models to the database
sequelize.sync().then(() => {
    console.log('All models were synchronized successfully.');
})
.catch((err) => {
    console.error('An error occurred while synchronizing the models:', err);
});  
  
const port = 3001;

app.listen(port, () => {
    console.log(`Server started on port ${port}`);
})
module.exports = app;

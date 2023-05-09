const sequelize = require('../db');
const { Sequelize } = require('sequelize');

// model Task
const Task = require('./Task');

// define model User
const User = sequelize.define('User', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    email: {
        type: Sequelize.STRING,
        unique: true,
        allowNull: false,
        validate: {
            isEmail: true,
        },
    },
    name: {
        type: Sequelize.STRING
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    }
});

User.associate = function(models) {
    User.hasMany(models.Task, { foreignKey: 'user_id' });
};



// User.create({ name: 'John Doe', email: 'john@example.com', password: 'Minhanh1309'})
//     .then((user) => {
//     console.log(`Created user: ${user.name} (${user.email})`);
// })
// .catch((error) => {
//     console.error('Unable to create user:', error);
// });



module.exports = User;
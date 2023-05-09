const sequelize = require('../db');
const { Sequelize } = require('sequelize');

// model User
const User = require('./User');

const Task = sequelize.define('Task', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    title: {
        type: Sequelize.STRING,
        allowNull: false
    },
    description: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    dueDate: {
        type: Sequelize.DATEONLY,
        allowNull: false
    },
    completed: {
        type: Sequelize.BOOLEAN,
        default: false
    },
    // associate Task model with User model
    user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        reference: {
            model: "User",
            key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    }
});

Task.associate = function(models) {
    Task.belongsTo(models.User, { foreignKey: 'user_id' });
};  

module.exports = Task;
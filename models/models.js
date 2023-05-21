const sequelize = require('../db');
const { Sequelize } = require('sequelize');

// User
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

// Team
const Team = sequelize.define('Team', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false
    },
    // creator
    owner_id: {
        type: Sequelize.UUID,
        allowNull: false,
        reference: {
            model: User,
            key: 'id'
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },
});

// Task
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
    // creator
    user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        reference: {
            model: User,
            key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },
    // associate Task model with User model
    team_id: {
        type: Sequelize.UUID,
        allowNull: true,
        reference: {
            model: Team,
            key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    }
});

// Define the association between User and Task
User.hasMany(Task, { foreignKey: 'user_id', as: 'tasks', onDelete: 'CASCADE'});
Task.belongsTo(User, { foreignKey: 'user_id', as: 'creator' });

// Define the association between Team and Task
Team.hasMany(Task, { foreignKey: 'team_id', onDelete: 'CASCADE' });
Task.belongsTo(Team, { foreignKey: 'team_id' });

// Message
const Message = sequelize.define('Message', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
    },
    content: {
        type: Sequelize.TEXT,
        allowNull: false
    },
    // associate Message model with User model
    // sender
    user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        reference: {
            model: User,
            key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    },
    // associate Message model with Team model
    team_id: {
        type: Sequelize.UUID,
        allowNull: true,
        reference: {
            model: Team,
            key: "id"
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE"
    }
});

// Define the association between User and Message
User.hasMany(Message, { foreignKey: 'user_id', as: 'messages', onDelete: 'CASCADE'});
Message.belongsTo(User, { foreignKey: 'user_id', as: 'sender' });

// Define the association between Team and Message
Team.hasMany(Message, { foreignKey: 'team_id', as: 'messages', onDelete: 'CASCADE' });
Message.belongsTo(Team, { foreignKey: 'team_id' });

// TeamMembership
const TeamMembership = sequelize.define('TeamMembership', {
    user_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: User,
            key: 'id'
        }
    },
    team_id: {
        type: Sequelize.UUID,
        allowNull: false,
        references: {
            model: Team,
            key: 'id'
        }
    }
});

// Associate the join table with User and Team
User.belongsToMany(Team, { through: TeamMembership, as: 'teams',foreignKey: 'user_id' });
Team.belongsToMany(User, { through: TeamMembership, as: 'members', foreignKey: 'team_id' });

// Team Owner
User.hasMany(Team, { as: 'ownedTeams', foreignKey: 'owner_id' });
Team.belongsTo(User, { as: 'owner', foreignKey: 'owner_id' });

module.exports = { User, Task, Team, TeamMembership, Message };
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./db');
const middleware = require('./utils/middleware');
const auth = require('./routes/auth');
const task = require('./routes/task');
const team = require('./routes/team');

const app = express();
const http = require('http');
const { Team, User, Message } = require('./models/models');
const server = http.createServer(app);

// WebSocket
const io = require("socket.io")(server, {
    cors: {
        origin: process.env.CLIENT_APP_URL,
        methods: ["GET", "POST"],
        allowedHeaders: ["my-custom-header"],
        credentials: true
    }
});

io.use(middleware.authenticateSocket);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

//Middleware to handle API requests
app.use(cors());
app.use('/api/auth', auth);
app.use('/api/tasks', task);
app.use('/api/teams', team);

// Initialize the onlineUsers object
const onlineUsers = {};

// WebSocket connection event
io.on('connect', (socket) => {
    console.log('WebSocket client connected');

    socket.on('joinTeamRoom', async ({ teamId }) => {
        socket.join(teamId);

        // Add the user to the onlineUsers object
        if (!onlineUsers[teamId]) {
            onlineUsers[teamId] = new Set();
        }

        // Add the socketId and userId to the Set
        onlineUsers[teamId].add({socketId: socket.id, userId: socket.userId});
        const onlineUsersData = Array.from(onlineUsers[teamId]);

        // Emit the updated onlineUsers object to all clients in the team
        io.to(teamId).emit('onlineUsers', onlineUsersData);
        
        const team = await Team.findByPk(teamId);

        if (!team) {
            socket.emit('getout');
            // break here team not found
            return;
        }

        const allTasks = await team.getTasks({
            include: [
                {
                    model: User,
                    as: 'creator',
                    attributes: ['name'], // Specify the attributes you want to include
                },
            ],
        });   

        const allMessages = await team.getMessages({
            include: [
                {
                    model: User,
                    as: 'sender',
                    attributes: ['name'], // Specify the attributes you want to include
                },
            ],
        });

        const allUsers = await team.getMembers();   
        
        socket.emit('getData', { allTasks: allTasks, teamName: team.name, allUsers: allUsers, owner_id: team.owner_id, allMessages: [...allMessages].reverse() });

        // message
        socket.on('message', async (messageData) => {
            const message = await Message.create({
                content: messageData.content,
                user_id: messageData.user_id,
                team_id: messageData.team_id,
            })

            if (message) {
                const response = await Message.findByPk(message.id, {
                    include: [
                        {
                            model: User,
                            as: 'sender',
                            attributes: ['name'], 
                        },
                    ],
                })
                // send message back to client-side
                io.to(teamId).emit('messageResponse', response);
            }
        });

        // delete message 
        socket.on('delete message', async (messageId) => {
            const message = await Message.findOne({ where: { id: messageId } });

            if (!message) {
                console.log(`Message with ID ${messageId} not found`);
                return;
            }
            const teamId = message.team_id;
            await message.destroy();
            const team = await Team.findByPk(teamId);

            const allMessages = await team.getMessages({
                include: [
                    {
                        model: User,
                        as: 'sender',
                        attributes: ['name'], // Specify the attributes you want to include
                    },
                ],
            });

            io.to(teamId).emit('messages after delete', [...allMessages].reverse());
        })
    });

    socket.on('disconnect', () => {
        for (const teamId in onlineUsers) {
            const onlineUsersSet = onlineUsers[teamId];
            onlineUsersSet.forEach((user) => {
              if (user.socketId === socket.id) {
                // Remove the disconnected socketId from the onlineUsers Set
                onlineUsersSet.delete(user);
              }
            });
      
            // If there are no more users in the onlineUsers Set for a team, remove the team entry
            if (onlineUsersSet.size === 0) {
              delete onlineUsers[teamId];
            }
      
            if (onlineUsers[teamId]) {
                const onlineUsersData = Array.from(onlineUsers[teamId]);
                // Emit the updated onlineUsers data to the clients in the team
                io.to(teamId).emit('onlineUsers', onlineUsersData);
            }
        }
        console.log('WebSocket client disconnected');
    });
});
  

// create table into database
// Sync all defined models to the database
sequelize.sync().then(() => {
    console.log('All models were synchronized successfully.');
})
.catch((err) => {
    console.error('An error occurred while synchronizing the models:', err);
});  
  
const port = 3001;

server.listen(port, () => {
    console.log(`Server started on port ${port}`);
})
module.exports = { server, io };

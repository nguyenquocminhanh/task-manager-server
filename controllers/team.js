const { Team, User, TeamMembership, Message } = require("../models/models");
var bcrypt = require('bcryptjs');

exports.createTeam = async (req, res) => {
    try {
        const user_id = req.user.userId;
        const { teamName, password  } = req.body;

        const checkedTeam = await Team.findOne({ where: {name: teamName} });
        if (checkedTeam) {
            return res.status(409).json('Team name was used');
        }

        const hashedPassword = await bcrypt.hash(password, 10);
     
        // create the team
        const team = await Team.create({
            name: teamName,
            password: hashedPassword,
            owner_id: user_id,
        })

        // Associate the team with the user
        const user = await User.findByPk(user_id);
        await user.addTeam(team);   // create instance in teamMembership

        return res.status(201).json({ 
            message: 'Team created successfully',
            team: {
                ...team.toJSON(),
                owner: {
                    name: user.name,
                }
            }
        });

    } catch (err) {  
        console.log(err);
        return res.status(500).json('Something went wrong');
    }
}

exports.getAllTeams = async (req, res) => {
    try {
        const user_id = req.user.userId;

        const user = await User.findByPk(user_id);

        if (!user) {
            return res.status(404).json('User not found');       
        }

        const teams = await user.getTeams({
            include: [
                {
                    model: User,
                    as: 'owner',
                    attributes: ['name'], // Specify the attributes you want to include
                },
            ],
        });

        return res.status(200).json({teams: teams});
    } catch (error) {
        console.log(error);
        return res.status(500).json('Something went wrong');
    }
};

exports.joinTeam = async (req, res) => {
    try {
        const user_id = req.user.userId;

        const { teamName, password } = req.body;

        const team = await Team.findOne(
            { where: {name: teamName} ,
            include: {
                    model: User,
                    as: 'owner',
                    attributes: ['name'], // Specify the attributes you want to include
                }
            });

        if (!team) {
            return res.status(404).json('Team not found');
        }

        const isPasswordValid = await bcrypt.compare(password, team.password);
        if (!isPasswordValid) {
            return res.status(401).json('Invalid credentials');
        }

        const team_id = team.id;

        const membership = await TeamMembership.findOne({
            where: {
              user_id,
              team_id,
            },
        });

        if (membership) {
            return res.status(409).json('You already a member of the team');
        }

        await TeamMembership.create({ user_id, team_id });
        return res.status(200).json({ message: 'User joined the team successfully', team: team });
    } catch (error) {
        console.log(error);
        return res.status(500).json('Something went wrong');
    }
}

exports.deleteTeam = async (req, res) => {
    const teamId = req.params.teamId; 
    // model Task from sequelize from Postgresql
    const team = await Team.findOne({ where: { id: teamId } });

    if (!team) {
        return res.status(404).json('Team not found!');
    }

    try {
        const deletedCount = await Team.destroy({
            where: { id: teamId },
            include: [
                {   model: TeamMembership,
                    onDelete: 'CASCADE', // Delete associated messages
                },
                {
                    model: Message,
                    onDelete: 'CASCADE', // Delete associated messages
                }],
        });
      
        if (deletedCount === 0) {
            return res.status(404).json('Team not found');
        }
    
        return res.status(200).json({message: `Deleted team successfully`});
    } catch (error) {
        return res.status(500).json('Something went wrong');
    }
}

exports.leaveTeam = async (req, res) => {
    const teamId = req.params.teamId; 
    const user_id = req.user.userId;

    try {
        await TeamMembership.destroy({ where: { user_id: user_id, team_id: teamId } });
      
        return res.status(200).json({message: `Leave team successfully`});
    } catch (error) {
        return res.status(500).json('Something went wrong');
    }
}

exports.getAllTasksByTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const team = await Team.findByPk(teamId);

        if (!team) {
            return res.status(404).json('Team not found');
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

        return res.status(200).json({team: team, tasks: allTasks});
    } catch (error) {
        console.log(error);
        return res.status(500).json('Something went wrong');
    }
}


exports.getAllMembersByTeam = async (req, res) => {
    try {
        const { teamId } = req.params;
        const team = await Team.findByPk(teamId);

        if (!team) {
            return res.status(404).json('Team not found')
        }

        const allMembers = await team.getMembers();

        return res.status(200).json({ members: allMembers });
    } catch (error) {
        console.log(error);
        return res.status(500).json('Something went wrong');
    }
};
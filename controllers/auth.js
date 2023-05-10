const jwt = require('jsonwebtoken');
var bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.signup = async (req, res) => {
    try {
        const { email, name, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            email,
            name,
            password: hashedPassword
        });

        // grant token
        const token = jwt.sign(
        {
            userId: user.id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '30m',
        });

        res.status(200).json({ token })
    } catch (err) {  
        console.log(err);
        res.status(500).json({error: 'Something went wrong'});
    }
}

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({ where: {email} });

        if (!user) {
            return res.status(401).json({error: 'Invalid credentials'});
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign(
        {
            userId: user.id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '30m',
        });
        res.status(200).json({user, token});
    } catch (error) {
        console.log(err);
        res.status(500).json({error: 'Something went wrong'});
    }
}
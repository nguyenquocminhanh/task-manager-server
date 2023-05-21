var bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/models');

exports.signup = async (req, res) => {
    try {
        const { email, name, password } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const existAccount = await User.findOne({ where: { email: email } });
        if (existAccount) {
            return res.status(401).json('Email already associated with an account');
        }

        if (password.length < 6) {
            return res.status(401).json('Password must be at least 6 characters');
        }

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
            expiresIn: '6h',
        });

        res.status(200).json({ token })
    } catch (err) {  
        console.log(err);
        return res.status(500).json('Something went wrong');
    }
}

exports.login = async (req, res) => {
    try {
        const {email, password} = req.body;

        const user = await User.findOne({ where: {email} });

        if (!user) {
            return res.status(401).json('Email not exist');
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json('Invalid credentials');
        }

        const token = jwt.sign(
        {
            userId: user.id
        },
        process.env.JWT_SECRET,
        {
            expiresIn: '6h',
        });
        res.status(200).json({user, token});
    } catch (error) {
        console.log(err);
        res.status(500).json('Something went wrong');
    }
}
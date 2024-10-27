const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../../../db/models/user.model');
require('dotenv').config();

// Register a new user
exports.registerUser = async (req, res) => {
    const { name, email, password, phone, address } = req.body;

    try {
        let user = await User.findOne({ where: { email } });

        if (user) {
            return res.status(400).json({ msg: 'User already exists' });
        }

        user = User.build({
            name,
            email,
            password,
            phone,
            address
        });

        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(password, salt);

        await user.save();

        const payload = {
            user: {
                id: user.user_id,
                email: user.email
            }
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },  
            (err, token) => {
                if (err) throw err;
                res.json({ token });
            }
        );
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};

// Login user
exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        let user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Compare password
        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid credentials' });
        }

        // Create JWT payload
        const payload = {
            user: {
                id: user.user_id,
                email: user.email
            }
        };

        // Sign token
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '1h' },  // Token expiration time
            (err, token) => {
                if (err) throw err;
                
                // Send success message and token to Postman
                res.json({
                    msg: 'Login successfully',  // Success message
                    token                        // JWT token
                });
            }
        );

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
};


// Get user profile
exports.getUserById = async (req, res) => {
    const { id } = req.params; // Capture the user ID from the request parameters
    try {
        const user = await User.findByPk(id); // Find user by ID
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }
        res.json(user); // Respond with user data
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: 'Server error' });
    }
};

// Update user profile
exports.updateUserProfile = async (req, res) => {
    const { name, phone, address, profile_picture } = req.body;
    try {
        const user = await User.findByPk(req.user.user_id);
        if (!user) {
            return res.status(404).json({ msg: 'User not found' });
        }

        user.name = name || user.name;
        user.phone = phone || user.phone;
        user.address = address || user.address;
        user.profile_picture = profile_picture || user.profile_picture;

        await user.save();
        res.json(user);
    } catch (err) {
        res.status(500).json({ msg: 'Server error' });
    }
};

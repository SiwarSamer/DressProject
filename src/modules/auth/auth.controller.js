const express = require('express');
const connection = require("../../../db/connection.js");
const jwt = require('jsonwebtoken');
const bodyParser = require('body-parser');
const app = express(); // Creating an instance of Express application
app.use(bodyParser.json());
const { JWT_SECRET_KEY } = require('./../middleware/middleware.js');
const bcrypt = require('bcrypt');
const User = require('../../../db/models/user.model.js'); // Adjust the path as necessary

const { loginSchema, signupSchema } = require('./../services/validation/validation.js');

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password are required." });
        }
        const user = await User.findOne({ where: { email } });

        if (!user) {
            return res.status(401).json({ message: "Invalid email or password." });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid email or password." });
        }

        // If successful, return a success message and user info (omit sensitive data)
        return res.status(200).json({
            message: "Login successful",
            userId: user.user_id,
            role: user.role,
            email: user.email,
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const signup = async (req, res) => {
    try {
        const { UserName, email, password, phone, address, role } = req.body;

        // Validate input here (ensure you're validating UserName as well)
        if (!UserName || !email || !password) {
            return res.status(400).json({ message: "Username, email, and password are required." });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("Hashed password:", hashedPassword);

        // Create a new user using Sequelize
        const newUser = await User.create({
            name: UserName, // Assuming UserName corresponds to the user's name
            email,
            password: hashedPassword,
            phone,
            address,
            role,
        });

        console.log("User created:", newUser);
        return res.status(201).json({ message: "User created successfully", userId: newUser.user_id });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const logout = async (req, res) => {
    try {
      const token = req.header('Authorization'); 
  console.log(token)
      const sql = `DELETE FROM tokens WHERE token = "${token}"`;
      connection.execute(sql, (error, results) => {
        if (error) {
          console.error(error);
          return res.status(500).json({ error: 'An error occurred while logging out' });
        }
        console.log('Token removed from the database');
      });
  
     return res.status(200).json( {
        "message": "Logout successful...See you soon!"
    })
    } catch (err) {
      console.error(err);
      res.status(500).json(err.stack );
    }
  };
  

module.exports = { login, signup,logout};
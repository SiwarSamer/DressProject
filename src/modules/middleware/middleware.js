const jwt = require('jsonwebtoken');
const JWT_SECRET_KEY = '1234#'; 
const connection = require("../../../db/connection.js");
const authenticateJWT = async (req, res, next) => {
    try {
        const token = req.header('Authorization');

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized. No token provided.' });
        }

        const decoded = jwt.verify(token, JWT_SECRET_KEY);

        const sql = 'SELECT token FROM tokens WHERE token = ?';
        const [results] = await connection.promise().execute(sql, [token]);

        if (results.length === 0) {
            return res.status(403).json({ message: 'Forbidden. Invalid token.' });
        }

        req.user = decoded;
        next();
        
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(403).json({ message: 'Forbidden. Invalid token.' });
        }
        console.error(error);
        res.status(500).json({ error: 'An internal error occurred while verifying token.' });
    }
};

module.exports = { authenticateJWT, JWT_SECRET_KEY };

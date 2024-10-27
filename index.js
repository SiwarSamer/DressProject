const express = require('express');
const sequelize = require('./db/connection.js');
const userRoutes = require('./src/modules/users/user.js');
const authRoutes = require('./src/modules/auth/auth.js'); // Import authentication routes

const app = express();
const cors = require('cors');

app.use(cors());
app.use(express.json());

// Use user routes
app.use('/api/users', userRoutes);

// Use authentication routes
app.use('/api/auth', authRoutes); 
sequelize.sync()
    .then(() => console.log('Database synced'))
    .catch(err => console.log(err));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
